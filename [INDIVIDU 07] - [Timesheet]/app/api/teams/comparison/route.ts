import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { timesheetActivities, teams, teamMembers, projects } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq, and, gte, lte, sql, inArray } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'weekly';

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

    // Get all teams (for now, we'll get teams that the user has access to)
    // In a real application, you might want to implement proper team access control
    const allTeams = await db
      .select()
      .from(teams);

    console.log('All teams found:', allTeams.length);

    const comparisonData = [];

    for (const team of allTeams) {
      // Get team members
      const members = await db
        .select()
        .from(teamMembers)
        .where(eq(teamMembers.teamId, team.id));

      // Get activities for all team members
      const memberIds = members.map(m => m.userId);
      
      if (memberIds.length === 0) {
        continue; // Skip teams with no members
      }

      const activities = await db
        .select()
        .from(timesheetActivities)
        .where(
          and(
            inArray(timesheetActivities.userId, memberIds),
            gte(timesheetActivities.date, startDate.toISOString().split('T')[0])
          )
        );

      // Calculate metrics
      const totalHours = activities.reduce((sum, activity) => {
        const start = new Date(`2000-01-01T${activity.startTime}`);
        const end = new Date(`2000-01-01T${activity.endTime}`);
        const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        return sum + duration;
      }, 0);

      // Calculate average productivity (based on hours per member)
      const avgProductivity = members.length > 0 ? (totalHours / members.length) * 10 : 0; // Scale factor of 10

      // Get top project (most hours)
      const projectHours = activities.reduce((acc, activity) => {
        if (activity.projectId) {
          acc[activity.projectId] = (acc[activity.projectId] || 0) + 
            (new Date(`2000-01-01T${activity.endTime}`).getTime() - new Date(`2000-01-01T${activity.startTime}`).getTime()) / (1000 * 60 * 60);
        }
        return acc;
      }, {} as Record<number, number>);

      const topProjectId = Object.keys(projectHours).length > 0 
        ? Object.keys(projectHours).reduce((a, b) => projectHours[parseInt(a)] > projectHours[parseInt(b)] ? a : b)
        : null;

      // Get project name if available
      let topProject = 'N/A';
      if (topProjectId) {
        const project = await db
          .select({ name: projects.name })
          .from(projects)
          .where(eq(projects.id, parseInt(topProjectId)))
          .limit(1);
        
        if (project.length > 0) {
          topProject = project[0].name;
        }
      }

      comparisonData.push({
        name: team.name,
        totalHours: parseFloat(totalHours.toFixed(1)),
        memberCount: members.length,
        avgProductivity: parseFloat(avgProductivity.toFixed(1)),
        topProject: topProject,
        activitiesCount: activities.length,
        avgHoursPerMember: members.length > 0 ? parseFloat((totalHours / members.length).toFixed(1)) : 0
      });
    }

    // Sort by total hours (descending)
    comparisonData.sort((a, b) => b.totalHours - a.totalHours);

    return NextResponse.json(comparisonData);
  } catch (error) {
    console.error('Error fetching teams comparison data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams comparison data' },
      { status: 500 }
    );
  }
} 