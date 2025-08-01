import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { invitations, teams, users, teamMembers } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

// GET /api/invitations - Get pending invitations for the current user
export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get pending invitations for the user's email
    const pendingInvitations = await db
      .select({
        id: invitations.id,
        teamId: invitations.teamId,
        email: invitations.email,
        role: invitations.role,
        invitedAt: invitations.invitedAt,
        status: invitations.status,
        team: {
          id: teams.id,
          name: teams.name,
        },
        invitedBy: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(invitations)
      .innerJoin(teams, eq(invitations.teamId, teams.id))
      .innerJoin(users, eq(invitations.invitedBy, users.id))
      .where(
        and(
          eq(invitations.email, user.email),
          eq(invitations.status, 'pending')
        )
      );

    return NextResponse.json(pendingInvitations);
  } catch (error) {
    console.error('Error fetching invitations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invitations' },
      { status: 500 }
    );
  }
}

// POST /api/invitations - Accept an invitation
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { invitationId } = await request.json();

    if (!invitationId) {
      return NextResponse.json({ error: 'Invitation ID is required' }, { status: 400 });
    }

    // Get the invitation
    const [invitation] = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.id, invitationId),
          eq(invitations.email, user.email),
          eq(invitations.status, 'pending')
        )
      )
      .limit(1);

    if (!invitation) {
      return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 404 });
    }

    // Check if user is already a member of this team
    const existingMember = await db
      .select()
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.userId, user.id),
          eq(teamMembers.teamId, invitation.teamId)
        )
      )
      .limit(1);

    if (existingMember.length > 0) {
      return NextResponse.json({ error: 'You are already a member of this team' }, { status: 409 });
    }

    // Add user to team
    await db.insert(teamMembers).values({
      userId: user.id,
      teamId: invitation.teamId,
      role: invitation.role,
    });

    // Update invitation status
    await db
      .update(invitations)
      .set({ status: 'accepted' })
      .where(eq(invitations.id, invitationId));

    return NextResponse.json({ success: 'Invitation accepted successfully' });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json(
      { error: 'Failed to accept invitation' },
      { status: 500 }
    );
  }
}

// DELETE /api/invitations - Decline an invitation
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const invitationId = searchParams.get('invitationId');

    if (!invitationId) {
      return NextResponse.json({ error: 'Invitation ID is required' }, { status: 400 });
    }

    // Update invitation status to declined
    await db
      .update(invitations)
      .set({ status: 'declined' })
      .where(
        and(
          eq(invitations.id, parseInt(invitationId)),
          eq(invitations.email, user.email),
          eq(invitations.status, 'pending')
        )
      );

    return NextResponse.json({ success: 'Invitation declined successfully' });
  } catch (error) {
    console.error('Error declining invitation:', error);
    return NextResponse.json(
      { error: 'Failed to decline invitation' },
      { status: 500 }
    );
  }
} 