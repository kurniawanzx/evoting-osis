import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Student from '@/models/Student';
import Candidate from '@/models/Candidate';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    console.log('🔄 Starting voting reset...');
    
    // Reset semua siswa: set hasVoted = false, clear votedFor dan votedAt
    const studentReset = await Student.updateMany(
      { hasVoted: true },
      { 
        $set: { 
          hasVoted: false,
          votedFor: null,
          votedAt: null
        } 
      }
    );
    
    console.log(`✅ Reset ${studentReset.modifiedCount} students`);
    
    // Reset semua kandidat: set voteCount = 0
    const candidateReset = await Candidate.updateMany(
      { voteCount: { $gt: 0 } },
      { $set: { voteCount: 0 } }
    );
    
    console.log(`✅ Reset ${candidateReset.modifiedCount} candidates`);
    
    return NextResponse.json({
      success: true,
      message: `Pemilihan berhasil direset! ${studentReset.modifiedCount} siswa dan ${candidateReset.modifiedCount} kandidat telah direset.`,
      stats: {
        studentsReset: studentReset.modifiedCount,
        candidatesReset: candidateReset.modifiedCount
      }
    });
    
  } catch (error: any) {
    console.error('❌ Reset voting error:', error);
    return NextResponse.json(
      { error: 'Gagal mereset pemilihan: ' + error.message },
      { status: 500 }
    );
  }
}
