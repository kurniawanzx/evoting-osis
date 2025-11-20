import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '../../../../lib/mongodb'
import { ApiResponse } from '../../../../types'

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()

    console.log('Starting database setup...')

    // Daftar collections yang diperlukan
    const requiredCollections = ['users', 'candidates', 'votes', 'settings']
    
    // Cek collections yang sudah ada
    const existingCollections = await db.listCollections().toArray()
    const existingCollectionNames = existingCollections.map(col => col.name)

    console.log('Existing collections:', existingCollectionNames)

    // Buat collections yang belum ada
    for (const collectionName of requiredCollections) {
      if (!existingCollectionNames.includes(collectionName)) {
        await db.createCollection(collectionName)
        console.log(`Created collection: ${collectionName}`)
      } else {
        console.log(`Collection already exists: ${collectionName}`)
      }
    }

    // Buat indexes untuk performance
    try {
      await db.collection('users').createIndex({ username: 1 }, { unique: true })
      await db.collection('users').createIndex({ nis: 1 }, { unique: true })
      await db.collection('candidates').createIndex({ number: 1 }, { unique: true })
      await db.collection('votes').createIndex({ userId: 1 }, { unique: true })
      console.log('Database indexes created')
    } catch (indexError) {
      console.log('Indexes may already exist:', indexError)
    }

    // Tandai setup sebagai completed
    await db.collection('settings').updateOne(
      { key: 'database_setup' },
      { 
        $set: { 
          value: true,
          completedAt: new Date(),
          version: '1.0'
        } 
      },
      { upsert: true }
    )

    console.log('Database setup completed successfully')

    const response: ApiResponse = {
      success: true,
      message: 'Database setup completed successfully',
      data: {
        collections: requiredCollections,
        setupCompleted: true,
        timestamp: new Date().toISOString()
      }
    }

    return NextResponse.json(response)

  } catch (error: any) {
    console.error('Database setup error:', error)
    
    const response: ApiResponse = {
      success: false,
      error: 'Database setup failed: ' + error.message
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}
