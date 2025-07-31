import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { timesheetActivities, projects } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq, and, gte, lte, sql } from 'drizzle-orm';

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

    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'weekly';
    const projectId = searchParams.get('projectId');

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

    // Get all projects for the team
    const teamProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.teamId, teamId));

    console.log('Team projects found:', teamProjects.length);

    const comparisonData = [];

    for (const project of teamProjects) {
      // Build query conditions for this project
      const conditions = [
        eq(timesheetActivities.projectId, project.id),
        gte(timesheetActivities.date, startDate.toISOString().split('T')[0])
      ];

      // Get activities for this project
      const activities = await db
        .select()
        .from(timesheetActivities)
        .where(and(...conditions));

      // Calculate metrics
      const totalHours = activities.reduce((sum, activity) => {
        const start = new Date(`2000-01-01T${activity.startTime}`);
        const end = new Date(`2000-01-01T${activity.endTime}`);
        const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        return sum + duration;
      }, 0);

      // Get unique members working on this project
      const uniqueMembers = new Set(activities.map(a => a.userId)).size;

      // Calculate completion rate (mock calculation - you might want to add actual project completion tracking)
      const completionRate = Math.min(100, Math.max(0, (totalHours / 40) * 100)); // Assuming 40 hours is full completion

      // Calculate average hours per day
      const daysWorked = new Set(activities.map(a => a.date)).size;
      const avgHoursPerDay = daysWorked > 0 ? totalHours / daysWorked : 0;

      comparisonData.push({
        name: project.name,
        totalHours: parseFloat(totalHours.toFixed(1)),
        memberCount: uniqueMembers,
        completionRate: parseFloat(completionRate.toFixed(1)),
        avgHoursPerDay: parseFloat(avgHoursPerDay.toFixed(1)),
        activitiesCount: activities.length,
        daysWorked: daysWorked
      });
    }

    // Sort by total hours (descending)
    comparisonData.sort((a, b) => b.totalHours - a.totalHours);

    return NextResponse.json(comparisonData);
  } catch (error) {
    console.error('Error fetching project comparison data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project comparison data' },
      { status: 500 }
    );
  }
} 