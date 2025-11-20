import { connectToDatabase } from '../../../lib/mongodb'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { db } = await connectToDatabase()

      const requiredCollections = ['users', 'candidates', 'votes', 'settings']
      
      const existingCollections = await db.listCollections().toArray()
      const existingCollectionNames = existingCollections.map(col => col.name)

      // Create missing collections
      for (const collectionName of requiredCollections) {
        if (!existingCollectionNames.includes(collectionName)) {
          await db.createCollection(collectionName)
        }
      }

      // Create indexes
      await db.collection('users').createIndex({ username: 1 }, { unique: true })
      await db.collection('users').createIndex({ nis: 1 }, { unique: true })

      // Mark setup as completed
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
        message: 'Database setup completed',
        data: {
          collections: requiredCollections,
          setupCompleted: true
        }
      })

    } catch (error) {
      console.error('Database setup error:', error)
      res.status(500).json({
        success: false,
        error: 'Database setup failed: ' + error.message
      })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}
