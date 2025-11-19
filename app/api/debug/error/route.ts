import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing database connection...');
    await connectDB();
    console.log('✅ Database connection successful');
    
    // Test if we can query
    const { default: Admin } = await import('@/models/Admin');
    const admins = await Admin.find({});
    
    return NextResponse.json({
      success: true,
      message: 'Database connection and query successful',
      adminCount: admins.length,
      admins: admins
    });
    
  } catch (error: any) {
    console.error('❌ Debug error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
