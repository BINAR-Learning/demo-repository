import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { teams, teamMembers } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

// PUT /api/team/settings - Update team settings
export async function PUT(request: NextRequest) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, visibility, allowMemberInvites, requireApproval, maxMembers } = body;

    // Get user's team and role
    const userTeam = await db
      .select({
        teamId: teamMembers.teamId,
        role: teamMembers.role
      })
      .from(teamMembers)
      .where(eq(teamMembers.userId, user.id))
      .limit(1);

    if (userTeam.length === 0) {
      return NextResponse.json(
        { error: 'User is not part of a team' },
        { status: 403 }
      );
    }

    // Check if user is an owner
    if (userTeam[0].role !== 'owner') {
      return NextResponse.json(
        { error: 'Only team owners can update team settings' },
        { status: 403 }
      );
    }

    // Update team settings
    const updatedTeam = await db
      .update(teams)
      .set({
        name: name || undefined,
        // Note: Additional fields like description, visibility, etc. would need to be added to the teams table schema
        // For now, we'll just update the basic fields
        updatedAt: new Date(),
      })
      .where(eq(teams.id, userTeam[0].teamId))
      .returning();

    if (updatedTeam.length === 0) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      team: updatedTeam[0]
    });
  } catch (error) {
    console.error('Error updating team settings:', error);
    return NextResponse.json(
      { error: 'Failed to update team settings' },
      { status: 500 }
    );
  }
}

// GET /api/team/settings - Get team settings
export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's team
    const userTeam = await db
      .select({
        teamId: teamMembers.teamId,
        role: teamMembers.role
      })
      .from(teamMembers)
      .where(eq(teamMembers.userId, user.id))
      .limit(1);

    if (userTeam.length === 0) {
      return NextResponse.json(
        { error: 'User is not part of a team' },
        { status: 403 }
      );
    }

    // Get team details
    const team = await db
      .select()
      .from(teams)
      .where(eq(teams.id, userTeam[0].teamId))
      .limit(1);

    if (team.length === 0) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      team: team[0],
      userRole: userTeam[0].role
    });
  } catch (error) {
    console.error('Error fetching team settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team settings' },
      { status: 500 }
    );
  }
} 