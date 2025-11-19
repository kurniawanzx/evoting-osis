import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json([]);
  }

  try {
    const { default: connectDB } = await import('@/lib/database');
    const { default: Candidate } = await import('@/models/Candidate');
    
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
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ _id: 'build-time-mock' });
  }

  try {
    const { default: connectDB } = await import('@/lib/database');
    const { default: Candidate } = await import('@/models/Candidate');
    
    await connectDB();
    const data = await request.json();
    
    const candidate = new Candidate(data);
    await candidate.save();
    
    return NextResponse.json(candidate);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error creating candidate: ' + error.message },
      { status: 500 }
    );
  }
}
