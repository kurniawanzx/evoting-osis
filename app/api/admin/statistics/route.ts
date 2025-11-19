import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  // Skip database operations during build
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({
      statistics: {
        totalStudents: 0,
        votedStudents: 0,
        abstain: 0,
        participationRate: 0
      },
      candidates: [],
      classStats: [],
      students: []
    });
  }

  try {
    const { default: connectDB } = await import('@/lib/database');
    const { default: Candidate } = await import('@/models/Candidate');
    const { default: Student } = await import('@/models/Student');
    
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
