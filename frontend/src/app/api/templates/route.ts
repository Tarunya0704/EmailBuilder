import { NextResponse } from 'next/server';
import { connectDB } from '@/src/lib/mongodb';
import { Template } from '@/src/models/template';
import Handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    await connectDB();
    const data = await request.json();
    const template = await Template.create(data);
    return NextResponse.json(template);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const templates = await Template.find().sort({ createdAt: -1 });
    return NextResponse.json(templates);
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}