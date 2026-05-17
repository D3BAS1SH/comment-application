import { NextRequest, NextResponse } from 'next/server';
import { StatusService } from '@/server/services/task-oper-service/status.service';
import { UpdateStatusDto } from '@/features/status/types/status.interface';

function getUserId(request: NextRequest): string | null {
  return request.headers.get('x-user-id');
}

export async function PATCH(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      workspaceId: string;
      projectId: string;
      statusId: string;
    }>;
  }
) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { workspaceId, projectId, statusId } = await params;
    const body: UpdateStatusDto = await request.json();
    const result = await StatusService.updateStatus(
      userId,
      workspaceId,
      projectId,
      statusId,
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

export async function DELETE(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      workspaceId: string;
      projectId: string;
      statusId: string;
    }>;
  }
) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { workspaceId, projectId, statusId } = await params;
    const result = await StatusService.deleteStatus(
      userId,
      workspaceId,
      projectId,
      statusId
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
