import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Admin from '@/models/Admin';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    console.log('✅ Database connected for setup');
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: 'kurniawan' });
    
    if (existingAdmin) {
      return NextResponse.json({
        success: true,
        message: 'Admin user already exists',
        admin: {
          username: existingAdmin.username,
          name: existingAdmin.name,
          role: existingAdmin.role
        }
      });
    }

    // Create new admin
    const admin = new Admin({
      username: 'kurniawan',
      password: '1234456',
      name: 'Kurniawan Admin',
      role: 'superadmin'
    });

    await admin.save();

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      admin: {
        username: admin.username,
        name: admin.name,
        role: admin.role
      }
    });
    
  } catch (error: any) {
    console.error('❌ Setup error:', error);
    return NextResponse.json(
      { error: 'Setup failed: ' + error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    
    const admins = await Admin.find({});
    
    return NextResponse.json({
      success: true,
      admins: admins.map(admin => ({
        username: admin.username,
        name: admin.name,
        role: admin.role
      }))
    });
    
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error fetching admins: ' + error.message },
      { status: 500 }
    );
  }
}
