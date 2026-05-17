import { NextRequest, NextResponse } from 'next/server';
import { IssueService } from '@/server/services/task-oper-service/issue.service';
import {
  CreateIssueDto,
  IssueFiltersDto,
  IssuePriority,
} from '@/features/issue/types/issue.interface';

function getUserId(request: NextRequest): string | null {
  return request.headers.get('x-user-id');
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { projectId } = await params;
    const { searchParams } = new URL(request.url);
    const filters: IssueFiltersDto = {};
    const sprintId = searchParams.get('sprintId');
    const epicId = searchParams.get('epicId');
    const assigneeId = searchParams.get('assigneeId');
    const statusId = searchParams.get('statusId');
    const priority = searchParams.get('priority');

    if (sprintId) filters.sprintId = sprintId;
    if (epicId) filters.epicId = epicId;
    if (assigneeId) filters.assigneeId = assigneeId;
    if (statusId) filters.statusId = statusId;
    if (priority) filters.priority = priority as IssuePriority;

    const result = await IssueService.getAllIssues(userId, projectId, filters);

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
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { projectId } = await params;
    const body: CreateIssueDto = await request.json();
    const result = await IssueService.createIssue(userId, projectId, body);

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
