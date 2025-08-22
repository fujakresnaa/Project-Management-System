import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

interface AuthUser {
  userId: string
  email: string
  role: string
}

interface AuthResult {
  success: boolean
  user?: AuthUser
  error?: string
}

export async function authMiddleware(request: NextRequest): Promise<AuthResult> {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, error: 'No token provided' }
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not configured')
      return { success: false, error: 'Server configuration error' }
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as any
      
      return {
        success: true,
        user: {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role
        }
      }
    } catch (jwtError) {
      return { success: false, error: 'Invalid token' }
    }

  } catch (error) {
    console.error('Auth middleware error:', error)
    return { success: false, error: 'Authentication failed' }
  }
}

export function requireAuth(requiredRole?: string) {
  return async function(request: NextRequest) {
    const authResult = await authMiddleware(request)
    
    if (!authResult.success) {
      return authResult
    }

    if (requiredRole && authResult.user?.role !== requiredRole) {
      return { success: false, error: 'Insufficient permissions' }
    }

    return authResult
  }
}