import { NextRequest, NextResponse } from 'next/server';
import { IssueService } from '@/server/services/task-oper-service/issue.service';

function getUserId(request: NextRequest): string | null {
  return request.headers.get('x-user-id');
}

export async function POST(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ projectId: string; issueId: string; labelId: string }>;
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

    const { projectId, issueId, labelId } = await params;
    const result = await IssueService.attachLabel(
      userId,
      projectId,
      issueId,
      labelId
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
    params: Promise<{ projectId: string; issueId: string; labelId: string }>;
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

    const { projectId, issueId, labelId } = await params;
    const result = await IssueService.detachLabel(
      userId,
      projectId,
      issueId,
      labelId
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
