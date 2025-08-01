import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { teamMembers, users, projects, projectMembers } from '@/lib/db/schema';
import { eq, and, notInArray } from 'drizzle-orm';

// GET /api/projects/[projectId]/available-members - Get team members not in this project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const resolvedParams = await params;
    const projectId = parseInt(resolvedParams.projectId);
    
    if (isNaN(projectId)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
    }

    // First, get the project to find its team
    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (project.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const teamId = project[0].teamId;

    // Get all team members
    const allTeamMembers = await db
      .select({
        id: teamMembers.id,
        userId: teamMembers.userId,
        teamId: teamMembers.teamId,
        role: teamMembers.role,
        joinedAt: teamMembers.joinedAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(teamMembers)
      .innerJoin(users, eq(teamMembers.userId, users.id))
      .where(eq(teamMembers.teamId, teamId));

    // Get current project members
    const currentProjectMembers = await db
      .select({ userId: projectMembers.userId })
      .from(projectMembers)
      .where(eq(projectMembers.projectId, projectId));

    const currentMemberIds = currentProjectMembers.map(member => member.userId);

    // Filter out team members who are already in the project
    const availableMembers = allTeamMembers.filter(
      member => !currentMemberIds.includes(member.userId)
    );

    return NextResponse.json(availableMembers);
  } catch (error) {
    console.error('Error fetching available members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available members' },
      { status: 500 }
    );
  }
} 