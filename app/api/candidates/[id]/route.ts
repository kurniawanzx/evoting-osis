import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Candidate from '@/models/Candidate';

interface Params {
  params: {
    id: string;
  };
}

// GET candidate by ID
export async function GET(request: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const candidate = await Candidate.findById(params.id);
    
    if (!candidate) {
      return NextResponse.json(
        { error: 'Kandidat tidak ditemukan' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(candidate);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE candidate
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    await connectDB();
    
    console.log('🗑️ Deleting candidate:', params.id);
    
    const candidate = await Candidate.findByIdAndDelete(params.id);
    
    if (!candidate) {
      return NextResponse.json(
        { error: 'Kandidat tidak ditemukan' },
        { status: 404 }
      );
    }
    
    console.log('✅ Candidate deleted:', candidate.nomorUrut);
    
    return NextResponse.json({
      success: true,
      message: `Kandidat #${candidate.nomorUrut} berhasil dihapus`,
      candidate: candidate
    });
    
  } catch (error: any) {
    console.error('❌ Delete candidate error:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus kandidat: ' + error.message },
      { status: 500 }
    );
  }
}

// UPDATE candidate
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await connectDB();
    
    const data = await request.json();
    const candidate = await Candidate.findByIdAndUpdate(
      params.id,
      data,
      { new: true, runValidators: true }
    );
    
    if (!candidate) {
      return NextResponse.json(
        { error: 'Kandidat tidak ditemukan' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(candidate);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error updating candidate: ' + error.message },
      { status: 500 }
    );
  }
}
