import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Admin from '@/models/Admin';

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Admin login API called');
    
    await connectDB();
    console.log('✅ Database connected successfully');

    const { username, password } = await request.json();
    console.log('📧 Login attempt for username:', username);
    
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username dan password harus diisi' },
        { status: 400 }
      );
    }

    // Cari admin di database
    console.log('🔍 Searching for admin:', username);
    const admin = await Admin.findOne({ 
      username: username, 
      password: password 
    });

    console.log('📊 Admin query result:', admin ? 'FOUND' : 'NOT FOUND');

    if (!admin) {
      console.log('❌ Admin not found or password incorrect');
      return NextResponse.json(
        { error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    console.log('✅ Login successful for:', admin.username);
    
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
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
