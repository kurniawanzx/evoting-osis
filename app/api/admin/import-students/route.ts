import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  // Skip database operations during build
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ 
      success: true,
      message: 'API is available'
    });
  }

  try {
    const { default: connectDB } = await import('@/lib/database');
    const { default: Student } = await import('@/models/Student');
    
    await connectDB();
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'File tidak ditemukan' },
        { status: 400 }
      );
    }
    
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    const students = data.map((row: any) => ({
      nis: row.nis.toString(),
      nama: row.nama,
      kelas: row.kelas,
      password: row.nis.toString(),
      hasVoted: false
    }));
    
    await Student.deleteMany({});
    await Student.insertMany(students);
    
    return NextResponse.json({
      success: true,
      message: `${students.length} siswa berhasil diimport`,
      data: students
    });
    
  } catch (error: any) {
    console.error('Error processing file:', error);
    return NextResponse.json(
      { error: 'Error processing file: ' + error.message },
      { status: 500 }
    );
  }
}
