import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const layoutPath = path.join(process.cwd(), 'src/templates/layout.html');
    const layout = await fs.readFile(layoutPath, 'utf-8');
    return NextResponse.json({ layout });
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to load template' }, { status: 500 });
  }
}