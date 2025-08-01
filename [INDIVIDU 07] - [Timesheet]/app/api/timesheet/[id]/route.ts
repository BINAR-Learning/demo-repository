import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { timesheetActivities } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq, and } from 'drizzle-orm';

// DELETE - Delete a timesheet activity
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const activityId = parseInt(resolvedParams.id);

    if (isNaN(activityId)) {
      return NextResponse.json({ error: 'Invalid activity ID' }, { status: 400 });
    }

    // Delete the activity (only if it belongs to the current user)
    const deletedActivity = await db
      .delete(timesheetActivities)
      .where(
        and(
          eq(timesheetActivities.id, activityId),
          eq(timesheetActivities.userId, user.id)
        )
      )
      .returning();

    if (deletedActivity.length === 0) {
      return NextResponse.json(
        { error: 'Activity not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error('Error deleting timesheet activity:', error);
    return NextResponse.json(
      { error: 'Failed to delete timesheet activity' },
      { status: 500 }
    );
  }
} 