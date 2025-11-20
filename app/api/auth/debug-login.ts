import { NextApiRequest, NextApiResponse } from 'next'
import { connectToDatabase } from '../../../lib/mongodb'
import { ApiResponse, User } from '../../../types'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method === 'POST') {
    try {
      const { db } = await connectToDatabase()
      const { username, password } = req.body

      console.log('Debug login - Username:', username)
      
      // Check database connection
      const usersCount = await db.collection('users').countDocuments()
      console.log('Total users in database:', usersCount)

      // Find user
      const user = await db.collection<User>('users').findOne({ username })
      console.log('User found:', user ? 'Yes' : 'No')
      
      if (user) {
        console.log('User details:', {
          username: user.username,
          role: user.role,
          hasPassword: !!user.password
        })
      }

      res.status(200).json({
        success: true,
        message: 'Debug info',
        data: {
          username,
          totalUsers: usersCount,
          userExists: !!user,
          user: user ? {
            username: user.username,
            role: user.role,
            name: user.name
          } : null
        }
      })

    } catch (error: any) {
      console.error('Debug login error:', error)
      res.status(500).json({
        success: false,
        error: 'Debug failed: ' + error.message
      })
    }
  } else {
    res.status(405).json({ 
      success: false,
      error: 'Method not allowed' 
    })
  }
}
