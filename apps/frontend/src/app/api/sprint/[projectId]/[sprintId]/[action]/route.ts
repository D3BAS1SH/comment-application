import { NextRequest, NextResponse } from 'next/server';
import { SprintService } from '@/server/services/task-oper-service/sprint.service';
import {
  StartSprintDto,
  CompleteSprintDto,
} from '@/features/sprint/types/sprint.interface';

function getUserId(request: NextRequest): string | null {
  return request.headers.get('x-user-id');
}

export async function POST(
  request: NextRequest,
  {
    params,
  }: { params: { projectId: string; sprintId: string; action: string } }
) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { projectId, sprintId, action } = params;

    if (action === 'start') {
      const body: StartSprintDto = await request.json();
      const result = await SprintService.startSprint(
        userId,
        projectId,
        sprintId,
        body
      );
      if (result.error) {
        return NextResponse.json(
          { success: false, message: result.error.message },
          { status: result.error.statusCode }
        );
      }
      return NextResponse.json(result.data, { status: 200 });
    }

    if (action === 'complete') {
      const body: CompleteSprintDto = await request.json();
      const result = await SprintService.completeSprint(
        userId,
        projectId,
        sprintId,
        body
      );
      if (result.error) {
        return NextResponse.json(
          { success: false, message: result.error.message },
          { status: result.error.statusCode }
        );
      }
      return NextResponse.json(result.data, { status: 200 });
    }

    return NextResponse.json(
      { success: false, message: `Unknown action: ${action}` },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
