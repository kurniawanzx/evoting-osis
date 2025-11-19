import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Candidate from '@/models/Candidate';

export async function GET() {
  try {
    await connectDB();
    const candidates = await Candidate.find().sort({ nomorUrut: 1 });
    return NextResponse.json(candidates);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const data = await request.json();
    
    const candidate = new Candidate(data);
    await candidate.save();
    
    return NextResponse.json(candidate);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error creating candidate' },
      { status: 500 }
    );
  }
}
