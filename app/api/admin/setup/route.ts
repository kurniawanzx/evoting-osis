import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '../../../../lib/mongodb'
import { ApiResponse } from '../../../../types'

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()

    // Check if any admin exists
    const adminExists = await db.collection('users').findOne({ role: 'admin' })
    
    // Get all admins
    const admins = await db.collection('users')
      .find({ role: 'admin' })
      .project({ password: 0 })
      .toArray()

    const response: ApiResponse = {
      success: true,
      data: {
        hasAdmin: !!adminExists,
        admins: admins,
        total: admins.length
      }
    }

    return NextResponse.json(response)

  } catch (error: any) {
    console.error('Error fetching admins:', error)
    
    const response: ApiResponse = {
      success: false,
      error: 'Error fetching admins: ' + error.message
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}
