import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();
  
  // Simple hardcoded login for initial deploy
  if (username === 'kurniawan' && password === '1234456') {
    return NextResponse.json({
      success: true,
      admin: {
        id: '1',
        username: 'kurniawan',
        name: 'Kurniawan Admin',
        role: 'superadmin'
      }
    });
  } else {
    return NextResponse.json(
      { error: 'Username atau password salah' },
      { status: 401 }
    );
  }
}
