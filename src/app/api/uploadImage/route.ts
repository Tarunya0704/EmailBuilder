// src/app/api/uploadImage/route.ts
import { writeFile } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Ensure the uploads directory exists
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    
    // Generate a unique filename
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9-.]/g, '')}`;
    const filePath = path.join(uploadDir, fileName);
    
    await writeFile(filePath, buffer);
    
    return NextResponse.json({ 
      url: `/uploads/${fileName}`
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}