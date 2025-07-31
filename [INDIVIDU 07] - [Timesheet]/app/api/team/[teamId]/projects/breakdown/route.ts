import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { teamMembers, projects, timesheetActivities, projectMembers } from '@/lib/db/schema';
import { eq, and, gte, sql } from 'drizzle-orm';
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

    // Get all projects for this team
    const teamProjects = await db
      .select({
        id: projects.id,
        name: projects.name,
        description: projects.description,
      })
      .from(projects)
      .where(eq(projects.teamId, teamId));

    // Calculate project breakdown (last 30 days as default)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const projectBreakdown = await Promise.all(
      teamProjects.map(async (project) => {
        // Get project activities
        const activities = await db
          .select()
          .from(timesheetActivities)
          .where(
            and(
              eq(timesheetActivities.projectId, project.id),
              gte(timesheetActivities.date, thirtyDaysAgo.toISOString().split('T')[0])
            )
          );

        // Calculate total hours for this project
        const totalHours = activities.reduce((sum, activity) => {
          const start = new Date(`2000-01-01T${activity.startTime}`);
          const end = new Date(`2000-01-01T${activity.endTime}`);
          const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
          return sum + duration;
        }, 0);

        // Get member count for this project
        const memberCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(projectMembers)
          .where(eq(projectMembers.projectId, project.id));

        return {
          projectId: project.id,
          projectName: project.name,
          hours: Math.round(totalHours * 100) / 100,
          percentage: 0, // Will be calculated after getting total hours
          memberCount: memberCount[0]?.count || 0
        };
      })
    );

    // Calculate total hours and percentages
    const totalHours = projectBreakdown.reduce((sum, project) => sum + project.hours, 0);
    
    const breakdownWithPercentages = projectBreakdown.map(project => ({
      ...project,
      percentage: totalHours > 0 ? Math.round((project.hours / totalHours) * 1000) / 10 : 0
    }));

    return NextResponse.json({ 
      projects: breakdownWithPercentages,
      totalHours: Math.round(totalHours * 100) / 100,
      period: '30 days'
    });
  } catch (error) {
    console.error('Error fetching project breakdown:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project breakdown' },
      { status: 500 }
    );
  }
} 