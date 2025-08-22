import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from '@/lib/database'
import { createUserSchema, validateData } from '@/lib/validation/schemas'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request data
    const validation = validateData(createUserSchema, body)
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        errors: validation.errors
      }, { status: 400 })
    }

    const { email, password, name, role, department, title, avatar, timezone, language } = validation.data

    // Check if user already exists
    const existingUserQuery = 'SELECT id FROM users WHERE email = $1'
    const existingUserResult = await db.query(existingUserQuery, [email])
    
    if (existingUserResult.rows.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'User already exists with this email'
      }, { status: 409 })
    }

    // Hash password
    const saltRounds = 12
    const password_hash = await bcrypt.hash(password, saltRounds)

    // Create user
    const insertQuery = `
      INSERT INTO users (name, email, password_hash, role, department, title, avatar, timezone, language)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, name, email, role, department, title, avatar, timezone, language, created_at
    `
    const insertResult = await db.query(insertQuery, [
      name, email, password_hash, role, department, title, avatar, timezone, language
    ])
    
    const user = insertResult.rows[0]

    // Create default user settings
    const settingsQuery = `
      INSERT INTO user_settings (user_id) VALUES ($1)
    `
    await db.query(settingsQuery, [user.id])

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

    return NextResponse.json({
      success: true,
      data: {
        user,
        token
      },
      message: 'User registered successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}