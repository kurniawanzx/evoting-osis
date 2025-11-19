import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Candidate from '@/models/Candidate';
import Student from '@/models/Student';

export async function GET() {
  try {
    await connectDB();
    
    const candidates = await Candidate.find().sort({ nomorUrut: 1 });
    const totalStudents = await Student.countDocuments();
    const votedStudents = await Student.countDocuments({ hasVoted: true });
    
    const results = candidates.map(candidate => ({
      ...candidate.toObject(),
      percentage: votedStudents > 0 ? 
        Math.round((candidate.voteCount / votedStudents) * 100) : 0
    }));
    
    return NextResponse.json({
      candidates: results,
      statistics: {
        totalStudents,
        votedStudents,
        abstain: totalStudents - votedStudents,
        participationRate: Math.round((votedStudents / totalStudents) * 100)
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error fetching results' },
      { status: 500 }
    );
  }
}
