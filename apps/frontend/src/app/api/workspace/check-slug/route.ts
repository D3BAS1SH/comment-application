import { NextRequest, NextResponse } from 'next/server';
import { WorkspaceService } from '@/server/services/workspace.service';

export async function GET(request: NextRequest) {
  try {
    const slug = request.nextUrl.searchParams.get('slug');
    if (!slug) {
      return NextResponse.json(
        { success: false, message: 'Slug query parameter is required' },
        { status: 400 }
      );
    }

    const result = await WorkspaceService.checkSlug(slug);

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
