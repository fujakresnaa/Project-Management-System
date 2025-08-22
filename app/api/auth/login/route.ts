import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from '@/lib/database'
import { loginSchema, validateData } from '@/lib/validation/schemas'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request data
    const validation = validateData(loginSchema, body)
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        errors: validation.errors
      }, { status: 400 })
    }

    const { email, password } = validation.data

    // Find user by email
    const userQuery = 'SELECT * FROM users WHERE email = $1 AND is_active = true'
    const userResult = await db.query(userQuery, [email])
    
    if (userResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Invalid credentials'
      }, { status: 401 })
    }

    const user = userResult.rows[0]

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return NextResponse.json({
        success: false,
        error: 'Invalid credentials'
      }, { status: 401 })
    }

    // Update last login
    await db.query('UPDATE users SET last_login = NOW(), status = $1 WHERE id = $2', ['online', user.id])

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    // Remove password hash from response
    const { password_hash, ...userResponse } = user

    return NextResponse.json({
      success: true,
      data: {
        user: userResponse,
        token
      },
      message: 'Login successful'
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}