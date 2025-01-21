import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/src/lib/mongodb'; // Ensure this path is correct
import { Template } from '@/src/models/template'; // Ensure this path is correct

interface RequestParams {
  params: {
    id: string;
  }
}

export async function GET(
  request: NextRequest,
  { params }: RequestParams
) {
  try {
    await connectDB();
    const template = await Template.findById(params.id);
    
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json(template);
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to fetch template' }, 
      { status: 500 }
    );
  }
}