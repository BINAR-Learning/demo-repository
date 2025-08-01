import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { teamMembers, users, timesheetActivities } from '@/lib/db/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const resolvedParams = await params;
    const teamId = parseInt(resolvedParams.teamId);
    
    if (isNaN(teamId)) {
      return NextResponse.json({ error: 'Invalid team ID' }, { status: 400 });
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'weekly'; // weekly, monthly, yearly
    const projectId = searchParams.get('projectId');

    // Get current user
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is part of this team
    const userTeamMember = await db
      .select()
      .from(teamMembers)
      .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, user.id)))
      .limit(1);

    if (userTeamMember.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
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

    // Get all team members
    const members = await db
      .select({
        id: teamMembers.id,
        userId: teamMembers.userId,
        role: teamMembers.role,
        name: users.name,
        email: users.email,
      })
      .from(teamMembers)
      .leftJoin(users, eq(teamMembers.userId, users.id))
      .where(eq(teamMembers.teamId, teamId));

    console.log('Team members found:', members.length);

    // Get detailed statistics for each member
    const membersWithStats = await Promise.all(
      members.map(async (member) => {
        // Build base conditions
        const baseConditions = [
          eq(timesheetActivities.userId, member.userId),
          gte(timesheetActivities.date, startDate.toISOString().split('T')[0])
        ];

        // Add project filter if specified
        if (projectId && projectId !== 'all') {
          baseConditions.push(eq(timesheetActivities.projectId, parseInt(projectId)));
        }

        // Build activity query with all conditions
        const activities = await db
          .select()
          .from(timesheetActivities)
          .where(and(...baseConditions));
        console.log('activities', activities);

        // Calculate statistics
        let totalHours = 0;
        const categoryMap = new Map<string, number>();
        const uniqueDates = new Set<string>();

        activities.forEach(activity => {
          const start = new Date(`2000-01-01T${activity.startTime}`);
          const end = new Date(`2000-01-01T${activity.endTime}`);
          const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
          
          totalHours += duration;
          uniqueDates.add(activity.date);
          
          // Category breakdown
          const currentCategoryHours = categoryMap.get(activity.category) || 0;
          categoryMap.set(activity.category, currentCategoryHours + duration);
        });

        // Find top category
        let topCategory = 'N/A';
        let topCategoryHours = 0;
        categoryMap.forEach((hours, category) => {
          if (hours > topCategoryHours) {
            topCategory = category;
            topCategoryHours = hours;
          }
        });

        // Calculate averages
        const daysWorked = uniqueDates.size;
        const avgHoursPerDay = daysWorked > 0 ? totalHours / daysWorked : 0;
        const avgHoursPerActivity = activities.length > 0 ? totalHours / activities.length : 0;

        // Calculate productivity score (0-100)
        let productivityScore = 0;
        if (totalHours > 0) {
          // Base score on hours worked, with diminishing returns
          const baseScore = Math.min(totalHours / 40 * 50, 50); // Max 50 points for hours
          const consistencyBonus = daysWorked > 0 ? Math.min((daysWorked / 7) * 30, 30) : 0; // Max 30 points for consistency
          const efficiencyBonus = avgHoursPerActivity > 0 ? Math.min((avgHoursPerActivity / 2) * 20, 20) : 0; // Max 20 points for efficiency
          productivityScore = Math.round(baseScore + consistencyBonus + efficiencyBonus);
        }

        // Performance indicator (1-5 stars)
        const performanceStars = Math.min(Math.ceil(productivityScore / 20), 5);

        return {
          id: member.id,
          name: member.name || member.email,
          email: member.email,
          role: member.role,
          totalHours: Math.round(totalHours * 100) / 100,
          activitiesCount: activities.length,
          daysWorked,
          topCategory,
          topCategoryHours: Math.round(topCategoryHours * 100) / 100,
          avgHoursPerDay: Math.round(avgHoursPerDay * 100) / 100,
          avgHoursPerActivity: Math.round(avgHoursPerActivity * 100) / 100,
          productivityScore,
          performanceStars,
          categoryBreakdown: Object.fromEntries(categoryMap),
          period,
          projectId: projectId || 'all'
        };
      })
    );

    // Calculate team averages for comparison
    const totalTeamHours = membersWithStats.reduce((sum, member) => sum + member.totalHours, 0);
    const avgTeamHours = membersWithStats.length > 0 ? totalTeamHours / membersWithStats.length : 0;
    const totalTeamActivities = membersWithStats.reduce((sum, member) => sum + member.activitiesCount, 0);
    const avgTeamActivities = membersWithStats.length > 0 ? totalTeamActivities / membersWithStats.length : 0;

    return NextResponse.json({ 
      members: membersWithStats,
      teamStats: {
        totalMembers: membersWithStats.length,
        avgTeamHours: Math.round(avgTeamHours * 100) / 100,
        avgTeamActivities: Math.round(avgTeamActivities * 100) / 100,
        totalTeamHours: Math.round(totalTeamHours * 100) / 100,
        totalTeamActivities
      },
      period,
      projectId: projectId || 'all'
    });
  } catch (error) {
    console.error('Error fetching team member comparison data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team member comparison data' },
      { status: 500 }
    );
  }
} 