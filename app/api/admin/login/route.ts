import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';

// Import model Admin dengan error handling
let Admin;
try {
  Admin = require('@/models/Admin').default;
  console.log('✅ Admin model loaded successfully');
} catch (error) {
  console.error('❌ Error loading Admin model:', error);
}

export async function POST(request: NextRequest) {
  console.log('�� POST /api/admin/login called');
  
  try {
    // Test database connection first
    console.log('🔗 Testing database connection...');
    await connectDB();
    console.log('✅ Database connected successfully');

    // Parse request body
    console.log('📦 Parsing request body...');
    const body = await request.json();
    console.log('📧 Login data:', body);
    
    const { username, password } = body;

    if (!username || !password) {
      console.log('❌ Missing credentials');
      return NextResponse.json(
        { error: 'Username dan password harus diisi' },
        { status: 400 }
      );
    }

    // Check if Admin model is available
    if (!Admin) {
      console.log('❌ Admin model not available');
      return NextResponse.json(
        { error: 'Admin model not available' },
        { status: 500 }
      );
    }

    // Cari admin di database
    console.log('🔍 Searching for admin:', username);
    const admin = await Admin.findOne({ 
      username: username, 
      password: password 
    });

    console.log('📊 Admin query result:', admin);

    if (!admin) {
      console.log('❌ Admin not found or password incorrect');
      
      // List all admins for debugging
      const allAdmins = await Admin.find({});
      console.log('👥 All admins in database:', allAdmins);
      
      return NextResponse.json(
        { error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    console.log('✅ Login successful for:', admin.username);
    
    return NextResponse.json({
      success: true,
      admin: {
        id: admin._id,
        username: admin.username,
        name: admin.name,
        role: admin.role
      }
    });
    
  } catch (error: any) {
    console.error('💥 CRITICAL ERROR in login API:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
