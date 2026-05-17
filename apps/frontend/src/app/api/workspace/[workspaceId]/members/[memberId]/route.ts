import { NextRequest, NextResponse } from 'next/server';
import { WorkspaceService } from '@/server/services/task-oper-service/workspace.service';
import { UpdateMemberDto } from '@/features/workspace/types/workspace.interface';

function getUserId(request: NextRequest): string | null {
  return request.headers.get('x-user-id');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; memberId: string }> }
) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { workspaceId, memberId } = await params;
    const body: UpdateMemberDto = await request.json();
    const result = await WorkspaceService.updateMember(
      userId,
      workspaceId,
      memberId,
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
  { params }: { params: Promise<{ workspaceId: string; memberId: string }> }
) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { workspaceId, memberId } = await params;
    const result = await WorkspaceService.removeMember(
      userId,
      workspaceId,
      memberId
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
