import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ 
      success: true,
      message: 'Vote recorded successfully'
    });
  }

  try {
    const { default: connectDB } = await import('@/lib/database');
    const { default: Student } = await import('@/models/Student');
    const { default: Candidate } = await import('@/models/Candidate');
    
    await connectDB();
    
    const { nis, candidateId } = await request.json();
    
    const student = await Student.findOne({ nis });
    if (!student || student.hasVoted) {
      return NextResponse.json(
        { error: 'Invalid vote attempt' },
        { status: 400 }
      );
    }
    
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return NextResponse.json(
        { error: 'Kandidat tidak ditemukan' },
        { status: 404 }
      );
    }
    
    await Candidate.findByIdAndUpdate(candidateId, {
      $inc: { voteCount: 1 }
    });
    
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
