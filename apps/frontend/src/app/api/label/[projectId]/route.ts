import { NextRequest, NextResponse } from 'next/server';
import { LabelService } from '@/server/services/task-oper-service/label.service';
import { CreateLabelDto } from '@/features/label/types/label.interface';

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
    const result = await LabelService.getAllLabels(userId, projectId);

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
    const body: CreateLabelDto = await request.json();
    const result = await LabelService.createLabel(userId, projectId, body);

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
