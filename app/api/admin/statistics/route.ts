import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Candidate from '@/models/Candidate';
import Student from '@/models/Student';

export async function GET() {
  try {
    await connectDB();
    
    const [candidates, students, totalStudents, votedStudents] = await Promise.all([
      Candidate.find().sort({ nomorUrut: 1 }),
      Student.find().sort({ kelas: 1, nama: 1 }),
      Student.countDocuments(),
      Student.countDocuments({ hasVoted: true })
    ]);
    
    const classStats = await Student.aggregate([
      {
        $group: {
          _id: '$kelas',
          total: { $sum: 1 },
          voted: { $sum: { $cond: ['$hasVoted', 1, 0] } }
        }
      },
      {
        $project: {
          kelas: '$_id',
          total: 1,
          voted: 1,
          percentage: { $multiply: [{ $divide: ['$voted', '$total'] }, 100] }
        }
      },
      { $sort: { kelas: 1 } }
    ]);
    
    return NextResponse.json({
      statistics: {
        totalStudents,
        votedStudents,
        abstain: totalStudents - votedStudents,
        participationRate: Math.round((votedStudents / totalStudents) * 100)
      },
      candidates: candidates.map(candidate => ({
        ...candidate.toObject(),
        percentage: votedStudents > 0 ? 
          Math.round((candidate.voteCount / votedStudents) * 100) : 0
      })),
      classStats,
      students: students.map(student => ({
        nis: student.nis,
        nama: student.nama,
        kelas: student.kelas,
        hasVoted: student.hasVoted,
        votedAt: student.votedAt
      }))
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error fetching statistics' },
      { status: 500 }
    );
  }
}
