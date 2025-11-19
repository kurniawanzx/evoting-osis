import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Student from '@/models/Student';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { nis, password } = await request.json();
    
    // Cari siswa
    const student = await Student.findOne({ nis, password });
    
    if (!student) {
      return NextResponse.json(
        { error: 'NIS atau password salah' },
        { status: 401 }
      );
    }
    
    if (student.hasVoted) {
      return NextResponse.json(
        { error: 'Anda sudah menggunakan hak pilih' },
        { status: 400 }
      );
    }
    
    // Success response
    return NextResponse.json({
      success: true,
      student: {
        nis: student.nis,
        nama: student.nama,
        kelas: student.kelas
      }
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
