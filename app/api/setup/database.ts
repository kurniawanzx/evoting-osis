import { NextApiRequest, NextApiResponse } from 'next'
import { connectToDatabase } from '../../../lib/mongodb'
import { ApiResponse } from '../../../types'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method === 'POST') {
    try {
      const { db } = await connectToDatabase()

      // Buat collections jika belum ada
      const collections = ['users', 'candidates', 'votes', 'settings']
      
      const existingCollections = await db.listCollections().toArray()
      const existingCollectionNames = existingCollections.map(col => col.name)

      for (const collectionName of collections) {
        if (!existingCollectionNames.includes(collectionName)) {
          await db.createCollection(collectionName)
          console.log(`Collection ${collectionName} created`)
        }
      }

      // Buat indexes untuk performance
      await db.collection('users').createIndex({ username: 1 }, { unique: true })
      await db.collection('candidates').createIndex({ number: 1 }, { unique: true })
      await db.collection('votes').createIndex({ userId: 1 }, { unique: true })

      // Buat setting untuk menandai setup completed
      await db.collection('settings').updateOne(
        { key: 'database_setup' },
        { 
          $set: { 
            value: true,
            completedAt: new Date()
          } 
        },
        { upsert: true }
      )

      res.status(200).json({
        success: true,
        message: 'Database setup completed successfully',
        data: {
          collections: collections,
          setupCompleted: true
        }
      })

    } catch (error: any) {
      console.error('Database setup error:', error)
      res.status(500).json({
        success: false,
        error: 'Database setup failed: ' + error.message
      })
    }
  } else {
    res.status(405).json({ 
      success: false,
      error: 'Method not allowed' 
    })
  }
}
