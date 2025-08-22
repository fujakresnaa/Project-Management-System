import { NextRequest, NextResponse } from 'next/server'
import { UserRepository } from '@/lib/repositories/UserRepository'
import { authMiddleware } from '@/lib/middleware/auth'
import { queryFiltersSchema, validateData } from '@/lib/validation/schemas'

const userRepo = new UserRepository()

export async function GET(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request)
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filters = {
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 20,
      search: searchParams.get('search') || undefined,
      status: searchParams.get('status') || undefined,
      department: searchParams.get('department') || undefined,
      sort_by: searchParams.get('sort_by') || 'created_at',
      sort_order: (searchParams.get('sort_order') as 'asc' | 'desc') || 'desc'
    }

    const validation = validateData(queryFiltersSchema, filters)
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Invalid filters',
        errors: validation.errors
      }, { status: 400 })
    }

    const result = await userRepo.getTeamMembersWithStats()
    
    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}