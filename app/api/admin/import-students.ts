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

      console.log('=== IMPORT DEBUG ===')
      console.log('Request body:', req.body)
      
      const { users, data, students } = req.body
      
      // Handle different data formats
      let userData = users || data || students || []
      
      console.log('Raw data length:', userData.length)
      console.log('First item:', userData[0])

      if (!userData || !Array.isArray(userData) || userData.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No valid student data found. Please check Excel format.'
        })
      }

      const results: ImportResult = {
        success: true,
        message: '',
        imported: 0,
        failed: 0,
        errors: []
      }

      // Process each student
      for (const studentData of userData) {
        try {
          // Extract data with different possible column names
          const nis = studentData.nis || studentData.NIS || studentData.nomor_induk || studentData.id || ''
          const nama = studentData.nama || studentData.Nama || studentData.name || studentData.nama_lengkap || ''
          const kelas = studentData.kelas || studentData.Kelas || studentData.class || studentData.class_name || ''
          
          console.log('Processing student:', { nis, nama, kelas })

          // Validation - required fields
          if (!nis || !nama) {
            results.failed++
            results.errors.push(`Missing NIS or Name: ${nis || 'unknown'}`)
            continue
          }

          // Check if student already exists
          const existingUser = await db.collection<User>('users').findOne({ 
            $or: [
              { nis: nis.toString() },
              { username: nis.toString() }
            ] 
          })

          if (existingUser) {
            results.failed++
            results.errors.push(`Student already exists: ${nama} (NIS: ${nis})`)
            continue
          }

          // Hash password (using NIS as password)
          const hashedPassword = await bcrypt.hash(nis.toString(), 12)

          // Create student user
          await db.collection<User>('users').insertOne({
            nis: nis.toString(),
            name: nama,
            username: nis.toString(), // Username = NIS
            email: `${nis}@school.com`, // Auto-generate email
            password: hashedPassword, // Password = NIS (hashed)
            class: kelas,
            role: 'voter',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          } as any)

          results.imported++
          console.log(`Imported: ${nama} (NIS: ${nis})`)

        } catch (error: any) {
          results.failed++
          results.errors.push(`Error processing ${studentData.nis}: ${error.message}`)
          console.error(`Import error for ${studentData.nis}:`, error)
        }
      }

      results.message = `Berhasil mengimport ${results.imported} siswa, ${results.failed} gagal`
      results.success = results.imported > 0

      console.log('=== IMPORT RESULTS ===')
      console.log('Imported:', results.imported)
      console.log('Failed:', results.failed)

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
