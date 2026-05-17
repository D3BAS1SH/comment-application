import { NextRequest, NextResponse } from 'next/server';
import { ProjectService } from '@/server/services/task-oper-service/project.service';
import { UpdateProjectLeadDto } from '@/features/projects/types/project.interface';

function getUserId(request: NextRequest): string | null {
  return request.headers.get('x-user-id');
}

export async function PATCH(
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
    const body: UpdateProjectLeadDto = await request.json();
    const result = await ProjectService.updateProjectLead(
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

    return NextResponse.json(result.data, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
