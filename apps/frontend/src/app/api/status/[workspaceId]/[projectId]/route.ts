import { NextRequest, NextResponse } from 'next/server';
import { StatusService } from '@/server/services/task-oper-service/status.service';
import { CreateStatusDto } from '@/features/status/types/status.interface';

function getUserId(request: NextRequest): string | null {
  return request.headers.get('x-user-id');
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; projectId: string }> }
) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { workspaceId, projectId } = await params;
    const result = await StatusService.getAllStatuses(
      userId,
      workspaceId,
      projectId
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; projectId: string }> }
) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { workspaceId, projectId } = await params;
    const body: CreateStatusDto = await request.json();
    const result = await StatusService.createStatus(
      userId,
      workspaceId,
      projectId,
      body
    );

    if (result.error) {
      return NextResponse.json(
        { success: false, message: result.error.message },
        { status: result.error.statusCode }
      );
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
