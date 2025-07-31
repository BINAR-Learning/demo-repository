import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { activityLogs, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

// GET /api/team/activity - Get team activity logs
export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's team ID
    const userTeam = await db
      .select({
        teamId: activityLogs.teamId
      })
      .from(activityLogs)
      .where(eq(activityLogs.userId, user.id))
      .limit(1);

    if (userTeam.length === 0) {
      return NextResponse.json([]);
    }

    const teamId = userTeam[0].teamId;

    // Get activity logs for the team
    const logs = await db
      .select({
        id: activityLogs.id,
        action: activityLogs.action,
        timestamp: activityLogs.timestamp,
        ipAddress: activityLogs.ipAddress,
        userName: users.name
      })
      .from(activityLogs)
      .leftJoin(users, eq(activityLogs.userId, users.id))
      .where(eq(activityLogs.teamId, teamId))
      .orderBy(desc(activityLogs.timestamp))
      .limit(50);

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity logs' },
      { status: 500 }
    );
  }
} 