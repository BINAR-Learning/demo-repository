import { getCurrentUserWithTeam } from '@/lib/db/queries';

export async function GET() {
  try {
    const userData = await getCurrentUserWithTeam();
    
    if (!userData) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return user data with team information if available
    const response = {
      id: userData.user.id,
      name: userData.user.name,
      email: userData.user.email,
      role: userData.user.role,
      createdAt: userData.user.createdAt,
      updatedAt: userData.user.updatedAt,
      team: userData.team
    };

    return Response.json(response);
  } catch (error) {
    console.error('Error fetching user data:', error);
    return Response.json({ error: 'Failed to fetch user data' }, { status: 500 });
  }
}
