import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Student from '@/models/Student';
import Candidate from '@/models/Candidate';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { nis, candidateId } = await request.json();
    
    // Check if student exists and hasn't voted
    const student = await Student.findOne({ nis });
    if (!student || student.hasVoted) {
      return NextResponse.json(
        { error: 'Invalid vote attempt' },
        { status: 400 }
      );
    }
    
    // Get candidate
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return NextResponse.json(
        { error: 'Kandidat tidak ditemukan' },
        { status: 404 }
      );
    }
    
    // Update candidate vote count
    await Candidate.findByIdAndUpdate(candidateId, {
      $inc: { voteCount: 1 }
    });
    
    // Mark student as voted
    await Student.findOneAndUpdate(
      { nis },
      { 
        hasVoted: true,
        votedFor: candidateId,
        votedAt: new Date()
      }
    );
    
    return NextResponse.json({ 
      success: true,
      message: 'Vote berhasil dicatat'
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Voting failed' },
      { status: 500 }
    );
  }
}
