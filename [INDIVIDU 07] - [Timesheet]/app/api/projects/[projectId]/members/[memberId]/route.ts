import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { projectMembers, projects, teamMembers } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

// DELETE /api/projects/[projectId]/members/[memberId] - Remove project member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; memberId: string }> }
) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const projectId = parseInt(resolvedParams.projectId);
    const memberId = parseInt(resolvedParams.memberId);

    if (isNaN(projectId) || isNaN(memberId)) {
      return NextResponse.json(
        { error: 'Invalid project ID or member ID' },
        { status: 400 }
      );
    }

    // Get the project to check team ownership
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check if user is a member of the team and has owner role
    const userTeamRole = await db
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.userId, user.id),
          eq(teamMembers.teamId, project.teamId)
        )
      )
      .limit(1);

    if (userTeamRole.length === 0) {
      return NextResponse.json(
        { error: 'You are not a member of this team' },
        { status: 403 }
      );
    }

    if (userTeamRole[0].role !== 'owner') {
      return NextResponse.json(
        { error: 'Only team owners can remove project members' },
        { status: 403 }
      );
    }

    // Remove the project member
    const deletedMember = await db
      .delete(projectMembers)
      .where(
        and(
          eq(projectMembers.id, memberId),
          eq(projectMembers.projectId, projectId)
        )
      )
      .returning();

    if (deletedMember.length === 0) {
      return NextResponse.json(
        { error: 'Project member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Project member removed successfully' });
  } catch (error) {
    console.error('Error removing project member:', error);
    return NextResponse.json(
      { error: 'Failed to remove project member' },
      { status: 500 }
    );
  }
} 