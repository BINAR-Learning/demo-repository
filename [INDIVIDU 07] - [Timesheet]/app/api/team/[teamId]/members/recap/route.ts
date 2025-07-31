import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { timesheetActivities, users, teams, teamMembers } from '@/lib/db/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'weekly';
    const projectId = searchParams.get('projectId');
    const userId = searchParams.get('userId');

    const resolvedParams = await params;
    // Check if user is part of the team
    const userTeam = await db.query.teamMembers.findFirst({
      where: and(
        eq(teamMembers.userId, user.id),
        eq(teamMembers.teamId, parseInt(resolvedParams.teamId))
      ),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!userTeam) {
      return NextResponse.json({ error: 'Not a member of this team' }, { status: 403 });
    }

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'yearly':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get team members based on user role
    let teamMembersList;
    if (userTeam.role === 'owner') {
      const { teamId } = await params;
      // Owner can see all team members
      teamMembersList = await db.query.teamMembers.findMany({
        //get params should be awaited before using its properties , params.teamId
        where: eq(teamMembers.teamId, parseInt(teamId)),
        with: {
          user: {
            columns: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
    } else {
      // Regular members can only see their own data
      teamMembersList = [userTeam];
    }

    // Filter by userId if specified (only allowed for owners), but authorize if userId = auth user id
    if (userId && userTeam.role !== 'owner' && userId !== user.id.toString()) {
      return NextResponse.json({ error: 'Unauthorized to filter by user ID' }, { status: 403 });
    }

    if (userId) {
      teamMembersList = teamMembersList.filter(member => member.userId === parseInt(userId));
    }

    const recaps = [];

    for (const member of teamMembersList) {
      // Build query conditions
      const conditions = [
        eq(timesheetActivities.userId, member.userId),
        gte(timesheetActivities.date, startDate.toISOString().split('T')[0]),
        lte(timesheetActivities.date, now.toISOString().split('T')[0])
      ];

      if (projectId && projectId !== 'all') {
        conditions.push(eq(timesheetActivities.projectId, parseInt(projectId)));
      }

      // Get activities for this member
      const activities = await db.query.timesheetActivities.findMany({
        where: and(...conditions),
        orderBy: [desc(timesheetActivities.date)]
      });

      if (activities.length === 0) continue;

      // Calculate statistics
      const totalHours = activities.reduce((sum, activity) => {
        const start = new Date(`2000-01-01T${activity.startTime}`);
        const end = new Date(`2000-01-01T${activity.endTime}`);
        const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        return sum + duration;
      }, 0);

      // Calculate category breakdown
      const categoryMap = new Map<string, number>();
      activities.forEach(activity => {
        const start = new Date(`2000-01-01T${activity.startTime}`);
        const end = new Date(`2000-01-01T${activity.endTime}`);
        const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        
        categoryMap.set(activity.category, (categoryMap.get(activity.category) || 0) + duration);
      });

      const categoryBreakdown = Array.from(categoryMap.entries())
        .map(([category, hours]) => ({
          category,
          hours,
          percentage: (hours / totalHours) * 100
        }))
        .sort((a, b) => b.hours - a.hours);

      // Calculate unique days worked
      const uniqueDays = new Set(activities.map(activity => activity.date)).size;

      // Calculate productivity score (simplified)
      const productiveCategories = ['Development', 'Design', 'Coding', 'Programming', 'Building'];
      const productiveHours = activities.reduce((sum, activity) => {
        const start = new Date(`2000-01-01T${activity.startTime}`);
        const end = new Date(`2000-01-01T${activity.endTime}`);
        const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        
        if (productiveCategories.some(cat => activity.category.toLowerCase().includes(cat.toLowerCase()))) {
          return sum + duration;
        }
        return sum;
      }, 0);

      const productivityScore = Math.round((productiveHours / totalHours) * 100);

      const recap = {
        memberId: member.userId,
        memberName: member.user.name || member.user.email,
        memberEmail: member.user.email,
        memberRole: member.role,
        period,
        totalHours,
        activitiesCount: activities.length,
        daysWorked: uniqueDays,
        avgHoursPerDay: totalHours / uniqueDays,
        topCategory: categoryBreakdown[0]?.category || 'Unknown',
        topCategoryHours: categoryBreakdown[0]?.hours || 0,
        categoryBreakdown,
        activities,
        productivityScore
      };

      recaps.push(recap);
    }

    return NextResponse.json(recaps);
  } catch (error) {
    console.error('Error fetching member recaps:', error);
    return NextResponse.json(
      { error: 'Failed to fetch member recaps' },
      { status: 500 }
    );
  }
} 