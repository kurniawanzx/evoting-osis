import { NextApiRequest, NextApiResponse } from 'next'
import { connectToDatabase } from '../../../lib/mongodb'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { ApiResponse, User } from '../../../types'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret-key-2024'

interface LoginRequest {
  username: string
  password: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method === 'POST') {
    try {
      const { db } = await connectToDatabase()
      const { username, password }: LoginRequest = req.body

      console.log('Login attempt for username:', username)

      // Validate input
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          error: 'Username dan password harus diisi'
        })
      }

      // Find user by username (which is NIS for students)
      const user = await db.collection<User>('users').findOne({ 
        username: username.trim()
      })

      if (!user) {
        console.log('User not found:', username)
        return res.status(401).json({
          success: false,
          error: 'NIS atau password salah'
        })
      }

      console.log('User found, checking password...')

      // Check password with error handling
      let isPasswordValid = false
      try {
        isPasswordValid = await bcrypt.compare(password, user.password)
      } catch (bcryptError) {
        console.error('Bcrypt compare error:', bcryptError)
        return res.status(500).json({
          success: false,
          error: 'System error: Password validation failed'
        })
      }

      if (!isPasswordValid) {
        console.log('Invalid password for user:', username)
        return res.status(401).json({
          success: false,
          error: 'NIS atau password salah'
        })
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          error: 'Akun tidak aktif. Silakan hubungi administrator.'
        })
      }

      // Create token
      const token = jwt.sign(
        { 
          userId: user._id?.toString(),
          username: user.username,
          role: user.role,
          name: user.name,
          nis: user.nis
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      )

      console.log('Login successful for:', user.username, 'Role:', user.role)

      // Return user data without password
      const userResponse = {
        id: user._id,
        nis: user.nis,
        name: user.name,
        username: user.username,
        email: user.email,
        class: user.class,
        role: user.role
      }

      res.status(200).json({
        success: true,
        message: 'Login berhasil',
        data: {
          token,
          user: userResponse
        }
      })

    } catch (error: any) {
      console.error('Login system error:', error)
      res.status(500).json({
        success: false,
        error: 'Terjadi kesalahan sistem: ' + error.message
      })
    }
  } else {
    res.status(405).json({ 
      success: false,
      error: 'Method tidak diizinkan' 
    })
  }
}
