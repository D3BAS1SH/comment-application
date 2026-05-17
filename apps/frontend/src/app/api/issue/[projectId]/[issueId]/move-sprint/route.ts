import { NextRequest, NextResponse } from 'next/server';
import { IssueService } from '@/server/services/task-oper-service/issue.service';
import { MoveSprintDto } from '@/features/issue/types/issue.interface';

function getUserId(request: NextRequest): string | null {
  return request.headers.get('x-user-id');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; issueId: string }> }
) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { projectId, issueId } = await params;
    const body: MoveSprintDto = await request.json();
    const result = await IssueService.moveToSprint(
      userId,
      projectId,
      issueId,
      body
    );

    if (result.error) {
      return NextResponse.json(
        { success: false, message: result.error.message },
        { status: result.error.statusCode }
      );
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
