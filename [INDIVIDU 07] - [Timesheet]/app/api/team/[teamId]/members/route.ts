import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { teamMembers, users, timesheetActivities } from '@/lib/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
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

    // Calculate total hours for each member (last 30 days as default)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const membersWithHours = await Promise.all(
      members.map(async (member) => {
        const activities = await db
          .select()
          .from(timesheetActivities)
          .where(
            and(
              eq(timesheetActivities.userId, member.userId),
              gte(timesheetActivities.date, thirtyDaysAgo.toISOString().split('T')[0])
            )
          );

        const totalHours = activities.reduce((sum, activity) => {
          const start = new Date(`2000-01-01T${activity.startTime}`);
          const end = new Date(`2000-01-01T${activity.endTime}`);
          const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
          return sum + duration;
        }, 0);

        return {
          id: member.id,
          name: member.name || member.email,
          email: member.email,
          role: member.role,
          totalHours: Math.round(totalHours * 100) / 100
        };
      })
    );

    return NextResponse.json({ 
      members: membersWithHours,
      period: '30 days'
    });
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
} 