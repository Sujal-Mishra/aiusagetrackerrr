"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { BarChart3, Leaf, Zap, TrendingUp } from "lucide-react"

interface Profile {
  id: string
  team_id: string | null
  teams: {
    id: string
    name: string
  } | null
}

interface UsageData {
  total_requests: number
  total_co2: number
  by_service: { ai_service: string; requests: number; co2: number }[]
  daily_usage: { date: string; requests: number; co2: number }[]
}

export function AnalyticsSection({ profile }: { profile: Profile }) {
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUsage() {
      const supabase = createClient()
      
      let query = supabase.from("ai_usage").select("*")
      
      if (profile.team_id) {
        query = query.eq("team_id", profile.team_id)
      } else {
        query = query.eq("user_id", profile.id)
      }

      const { data } = await query

      if (data) {
        const totalRequests = data.reduce((sum, d) => sum + (d.requests || 0), 0)
        const totalCo2 = data.reduce((sum, d) => sum + parseFloat(d.co2_grams || 0), 0)

        // Group by service
        const serviceMap = new Map<string, { requests: number; co2: number }>()
        data.forEach((d) => {
          const service = d.ai_service || "Unknown"
          const existing = serviceMap.get(service) || { requests: 0, co2: 0 }
          serviceMap.set(service, {
            requests: existing.requests + (d.requests || 0),
            co2: existing.co2 + parseFloat(d.co2_grams || 0),
          })
        })

        // Group by date
        const dateMap = new Map<string, { requests: number; co2: number }>()
        data.forEach((d) => {
          const date = d.recorded_at
          const existing = dateMap.get(date) || { requests: 0, co2: 0 }
          dateMap.set(date, {
            requests: existing.requests + (d.requests || 0),
            co2: existing.co2 + parseFloat(d.co2_grams || 0),
          })
        })

        setUsage({
          total_requests: totalRequests,
          total_co2: totalCo2,
          by_service: Array.from(serviceMap.entries()).map(([ai_service, stats]) => ({
            ai_service,
            ...stats,
          })),
          daily_usage: Array.from(dateMap.entries())
            .map(([date, stats]) => ({ date, ...stats }))
            .sort((a, b) => a.date.localeCompare(b.date)),
        })
      }

      setLoading(false)
    }

    fetchUsage()
  }, [profile.id, profile.team_id])

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-24" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const hasData = usage && (usage.total_requests > 0 || usage.total_co2 > 0)

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usage?.total_requests || 0}</div>
            <p className="text-xs text-muted-foreground">
              {profile.teams ? "Team total" : "Your total"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">CO2 Impact</CardTitle>
            <Leaf className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(usage?.total_co2 || 0).toFixed(2)}g
            </div>
            <p className="text-xs text-muted-foreground">Estimated emissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">AI Services</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usage?.by_service.length || 0}</div>
            <p className="text-xs text-muted-foreground">Services used</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg per Request</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usage && usage.total_requests > 0
                ? (usage.total_co2 / usage.total_requests).toFixed(3)
                : 0}g
            </div>
            <p className="text-xs text-muted-foreground">CO2 per request</p>
          </CardContent>
        </Card>
      </div>

      {!hasData ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Usage Data Yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Install the browser extension to start tracking your AI usage. Your data will appear here automatically.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Usage by Service</CardTitle>
              <CardDescription>Breakdown of requests by AI service</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usage?.by_service.map((service) => (
                  <div key={service.ai_service} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{service.ai_service}</p>
                      <p className="text-sm text-muted-foreground">
                        {service.co2.toFixed(2)}g CO2
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{service.requests}</p>
                      <p className="text-sm text-muted-foreground">requests</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Daily usage over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usage?.daily_usage.slice(-7).map((day) => (
                  <div key={day.date} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{new Date(day.date).toLocaleDateString()}</p>
                      <p className="text-sm text-muted-foreground">
                        {day.co2.toFixed(2)}g CO2
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{day.requests}</p>
                      <p className="text-sm text-muted-foreground">requests</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
