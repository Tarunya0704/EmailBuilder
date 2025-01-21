import { NextRequest, NextResponse } from 'next/server'
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const template = await Template.findById(params.id);
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    return NextResponse.json(template);
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to fetch template' }, { status: 500 });
  }
}