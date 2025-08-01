import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { teamMembers, teams } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const user = await getUser();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's team membership with detailed team information
    const userTeamData = await db
      .select({
        teamId: teamMembers.teamId,
        role: teamMembers.role,
        joinedAt: teamMembers.joinedAt,
        team: {
          id: teams.id,
          name: teams.name,
          createdAt: teams.createdAt,
          updatedAt: teams.updatedAt
        }
      })
      .from(teamMembers)
      .leftJoin(teams, eq(teamMembers.teamId, teams.id))
      .where(eq(teamMembers.userId, user.id))
      .limit(1);

    if (userTeamData.length === 0) {
      return Response.json({ 
        hasTeam: false,
        message: 'User is not part of any team'
      });
    }

    const teamInfo = userTeamData[0];

    return Response.json({
      hasTeam: true,
      teamId: teamInfo.teamId,
      role: teamInfo.role,
      joinedAt: teamInfo.joinedAt,
      team: teamInfo.team
    });
  } catch (error) {
    console.error('Error fetching user team data:', error);
    return Response.json({ error: 'Failed to fetch team data' }, { status: 500 });
  }
} 