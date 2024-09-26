import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const savedChats = await req.json();

    const filePath = path.join(process.cwd(), 'data', 'savedChats.json');
    
    await fs.writeFile(filePath, JSON.stringify(savedChats, null, 2));

    return NextResponse.json({ message: 'Chats saved successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save chats' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'savedChats.json');
    
    const fileData = await fs.readFile(filePath, 'utf-8');
    const savedChats = JSON.parse(fileData);

    return NextResponse.json(savedChats);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load chats' }, { status: 500 });
  }
}
