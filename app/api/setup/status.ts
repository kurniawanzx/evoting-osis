import { NextApiRequest, NextApiResponse } from 'next'
import { connectToDatabase } from '../../../lib/mongodb'
import { ApiResponse } from '../../../types'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method === 'GET') {
    try {
      const { db } = await connectToDatabase()

      // Check if database setup is completed
      const setupStatus = await db.collection('settings').findOne({ 
        key: 'database_setup' 
      })

      // Check if all required collections exist
      const collections = await db.listCollections().toArray()
      const collectionNames = collections.map(col => col.name)
      
      const requiredCollections = ['users', 'candidates', 'votes', 'settings']
      const missingCollections = requiredCollections.filter(
        col => !collectionNames.includes(col)
      )

      const isSetupCompleted = setupStatus?.value === true && missingCollections.length === 0

      res.status(200).json({
        success: true,
        data: {
          isSetupCompleted,
          setupStatus: setupStatus?.value || false,
          collections: {
            existing: collectionNames,
            missing: missingCollections,
            required: requiredCollections
          },
          lastSetup: setupStatus?.completedAt || null
        }
      })

    } catch (error: any) {
      console.error('Status check error:', error)
      res.status(500).json({
        success: false,
        error: 'Status check failed: ' + error.message
      })
    }
  } else {
    res.status(405).json({ 
      success: false,
      error: 'Method not allowed' 
    })
  }
}
