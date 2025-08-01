import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { timesheetActivities } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq, and, gte, lte } from 'drizzle-orm';

// GET - Fetch timesheet activities for the current user
export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const projectId = searchParams.get('projectId');

    // Build query conditions
    const conditions = [eq(timesheetActivities.userId, user.id)];

    if (startDate) {
      conditions.push(gte(timesheetActivities.date, startDate));
    }

    if (endDate) {
      conditions.push(lte(timesheetActivities.date, endDate));
    }

    if (projectId && projectId !== 'all') {
      conditions.push(eq(timesheetActivities.projectId, parseInt(projectId)));
    }

    const activities = await db
      .select()
      .from(timesheetActivities)
      .where(and(...conditions))
      .orderBy(timesheetActivities.date, timesheetActivities.startTime);

    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error fetching timesheet activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch timesheet activities' },
      { status: 500 }
    );
  }
}

// POST - Create a new timesheet activity
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { date, startTime, endTime, category, projectId, description } = body;

    // Validate required fields
    if (!date || !startTime || !endTime || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new activity
    const newActivity = await db
      .insert(timesheetActivities)
      .values({
        userId: user.id,
        projectId: projectId || null,
        date,
        startTime,
        endTime,
        category,
        description: description || null,
      })
      .returning();

    return NextResponse.json(newActivity[0], { status: 201 });
  } catch (error) {
    console.error('Error creating timesheet activity:', error);
    return NextResponse.json(
      { error: 'Failed to create timesheet activity' },
      { status: 500 }
    );
  }
} 