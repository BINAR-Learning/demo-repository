import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { projects, teamMembers } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

// GET /api/projects - Get all projects for a team
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');

    if (!teamId) {
      return NextResponse.json(
        { error: 'Team ID is required' },
        { status: 400 }
      );
    }

    const allProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.teamId, parseInt(teamId)))
      .orderBy(projects.createdAt);

    return NextResponse.json(allProjects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, teamId } = body;

    if (!name || !teamId) {
      return NextResponse.json(
        { error: 'Name and team ID are required' },
        { status: 400 }
      );
    }

    // Check if user is a member of the team and has owner role
    const userTeamRole = await db
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.userId, user.id),
          eq(teamMembers.teamId, parseInt(teamId))
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
        { error: 'Only team owners can create projects' },
        { status: 403 }
      );
    }

    const newProject = await db
      .insert(projects)
      .values({
        name,
        description,
        teamId: parseInt(teamId),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json(newProject[0], { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}

// PUT /api/projects - Update a project
export async function PUT(request: NextRequest) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, description } = body;

    if (!id || !name) {
      return NextResponse.json(
        { error: 'Project ID and name are required' },
        { status: 400 }
      );
    }

    // Get the project to check team ownership
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, parseInt(id)))
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
        { error: 'Only team owners can update projects' },
        { status: 403 }
      );
    }

    const updatedProject = await db
      .update(projects)
      .set({
        name,
        description,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedProject[0]);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects - Delete a project
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Get the project to check team ownership
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, parseInt(id)))
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
        { error: 'Only team owners can delete projects' },
        { status: 403 }
      );
    }

    const deletedProject = await db
      .delete(projects)
      .where(eq(projects.id, parseInt(id)))
      .returning();

    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
} 