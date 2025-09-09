import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Since we're using App Router, the socket server initialization happens 
    // through the custom server setup or client-side initialization
    return NextResponse.json({ 
      message: 'Socket.IO endpoint for App Router',
      path: '/api/socket',
      status: 'available',
      note: 'Socket.IO server runs alongside Next.js app'
    });
  } catch (error) {
    console.error('Error with socket endpoint:', error);
    return NextResponse.json(
      { error: 'Socket endpoint error' },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}