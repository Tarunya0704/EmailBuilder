import { NextResponse } from 'next/server';
import { connectDB } from '@/src/lib/mongodb';
import { Template } from '@/src/models/template';


export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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