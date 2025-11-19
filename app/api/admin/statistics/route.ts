import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
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
