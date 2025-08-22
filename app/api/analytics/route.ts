import { NextRequest, NextResponse } from 'next/server'
import { DashboardService } from '@/lib/services/DashboardService'
import { authMiddleware } from '@/lib/middleware/auth'

const dashboardService = new DashboardService()

export async function GET(request: NextRequest) {
  try {
    const authResult = await authMiddleware(request)
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'overview'

    let result
    if (type === 'overview') {
      result = await dashboardService.getAnalyticsData(authResult.user!.userId)
    } else if (type === 'summary') {
      result = await dashboardService.getSummaryStats()
    } else {
      result = await dashboardService.getDashboardData(authResult.user!.userId)
    }
    
    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Get analytics error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}