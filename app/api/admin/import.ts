import { NextApiRequest, NextApiResponse } from 'next'
import { connectToDatabase } from '../../../lib/mongodb'
import bcrypt from 'bcryptjs'
import { ApiResponse, User, ImportResult } from '../../../types'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method === 'POST') {
    try {
      const { db } = await connectToDatabase()

      // Check if database setup is completed
      const setupStatus = await db.collection('settings').findOne({ 
        key: 'database_setup' 
      })

      if (!setupStatus?.value) {
        return res.status(400).json({
          success: false,
          error: 'Import feature will be available after database setup. Please complete database setup first.'
        })
      }

      const { users } = req.body

      if (!users || !Array.isArray(users)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid data format'
        })
      }

      const results: ImportResult = {
        success: true,
        message: '',
        imported: 0,
        failed: 0,
        errors: []
      }

      // Process each user
      for (const userData of users) {
        try {
          const { name, username, email, password, class: className } = userData

          // Validation
          if (!name || !username || !email || !password) {
            results.failed++
            results.errors.push(`Missing required fields for user: ${username}`)
            continue
          }

          // Check if user already exists
          const existingUser = await db.collection<User>('users').findOne({ 
            $or: [{ username }, { email }] 
          })

          if (existingUser) {
            results.failed++
            results.errors.push(`User already exists: ${username}`)
            continue
          }

          // Hash password
          const hashedPassword = await bcrypt.hash(password, 12)

          // Create user
          await db.collection<User>('users').insertOne({
            name,
            username,
            email,
            password: hashedPassword,
            class: className || '',
            role: 'voter',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          } as User)

          results.imported++

        } catch (error: any) {
          results.failed++
          results.errors.push(`Error processing ${userData.username}: ${error.message}`)
        }
      }

      results.message = `Imported ${results.imported} users, ${results.failed} failed`
      results.success = results.imported > 0

      res.status(results.imported > 0 ? 200 : 400).json({
        success: results.success,
        message: results.message,
        data: results
      })

    } catch (error: any) {
      console.error('Import error:', error)
      res.status(500).json({
        success: false,
        error: 'Import failed: ' + error.message
      })
    }
  } else {
    res.status(405).json({ 
      success: false,
      error: 'Method not allowed' 
    })
  }
}
