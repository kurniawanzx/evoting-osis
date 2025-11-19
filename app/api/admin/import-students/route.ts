import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import connectDB from '@/lib/database';
import Student from '@/models/Student';

export async function POST(request: NextRequest) {
  try {
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
      password: row.nis.toString(), // Default password = NIS
      hasVoted: false
    }));
    
    // Clear existing students and insert new ones
    await Student.deleteMany({});
    await Student.insertMany(students);
    
    return NextResponse.json({
      success: true,
      message: `${students.length} siswa berhasil diimport`,
      data: students
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Error processing file' },
      { status: 500 }
    );
  }
}
