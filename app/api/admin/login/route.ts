import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // For build time, return a mock response
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({
      success: true,
      admin: {
        id: 'build-time-mock',
        username: 'kurniawan',
        name: 'Kurniawan Admin',
        role: 'superadmin'
      }
    });
  }

  try {
    const { default: connectDB } = await import('@/lib/database');
    const { default: Admin } = await import('@/models/Admin');
    
    await connectDB();

    const { username, password } = await request.json();
    
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username dan password harus diisi' },
        { status: 400 }
      );
    }

    const admin = await Admin.findOne({ 
      username: username, 
      password: password 
    });

    if (!admin) {
      return NextResponse.json(
        { error: 'Username atau password salah' },
        { status: 401 }
      );
    }
    
    return NextResponse.json({
      success: true,
      admin: {
        id: admin._id.toString(),
        username: admin.username,
        name: admin.name,
        role: admin.role
      }
    });
    
  } catch (error: any) {
    console.error('💥 Login error:', error);
    return NextResponse.json(
      { 
        error: 'Database connection failed',
        details: error.message
      },
      { status: 500 }
    );
  }
}
