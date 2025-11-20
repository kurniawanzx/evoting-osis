import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '../../../../lib/mongodb'
import bcrypt from 'bcryptjs'
import { ApiResponse, User, ImportResult } from '../../../../types'

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const body = await request.json()

    console.log('=== IMPORT STARTED ===')
    console.log('Request body received')
    
    const { users, data, students } = body
    
    // Handle different data formats
    let userData = users || data || students || []
    
    console.log('Raw data length:', userData.length)

    if (!userData || !Array.isArray(userData) || userData.length === 0) {
      const response: ApiResponse = {
        success: false,
        error: 'Tidak ada data siswa yang ditemukan. Periksa format file Excel.'
      }
      return NextResponse.json(response, { status: 400 })
    }

    console.log('First student sample:', userData[0])

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
        
        console.log('Processing:', { nis, nama, kelas })

        // Validation - required fields
        if (!nis || !nama) {
          results.failed++
          results.errors.push(`Data tidak lengkap: NIS atau Nama kosong (${nis || 'unknown'})`)
          continue
        }

        // Check if student already exists
        const existingUser = await db.collection<User>('users').findOne({ 
          $or: [
            { nis: nis.toString().trim() },
            { username: nis.toString().trim() }
          ] 
        })

        if (existingUser) {
          results.failed++
          results.errors.push(`Siswa sudah terdaftar: ${nama} (NIS: ${nis})`)
          continue
        }

        // Hash password (using NIS as password)
        const hashedPassword = await bcrypt.hash(nis.toString().trim(), 12)

        // Create student user
        await db.collection<User>('users').insertOne({
          nis: nis.toString().trim(),
          name: nama.trim(),
          username: nis.toString().trim(), // Username = NIS
          email: `${nis.toString().trim()}@school.com`,
          password: hashedPassword, // Password = NIS (hashed)
          class: kelas.trim(),
          role: 'voter',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        } as any)

        results.imported++
        console.log(`✓ Imported: ${nama} (${nis})`)

      } catch (error: any) {
        results.failed++
        results.errors.push(`Error: ${studentData.nis} - ${error.message}`)
        console.error(`✗ Import error for ${studentData.nis}:`, error)
      }
    }

    results.message = `Berhasil mengimport ${results.imported} siswa, ${results.failed} gagal`
    results.success = results.imported > 0

    console.log('=== IMPORT COMPLETED ===')
    console.log('Results:', results)

    const response: ApiResponse = {
      success: results.success,
      message: results.message,
      data: results
    }

    return NextResponse.json(response, { 
      status: results.imported > 0 ? 200 : 400 
    })

  } catch (error: any) {
    console.error('Import system error:', error)
    
    const response: ApiResponse = {
      success: false,
      error: 'Sistem error: ' + error.message
    }
    
    return NextResponse.json(response, { status: 500 })
  }
}
