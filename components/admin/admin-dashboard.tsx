"use client"

import { useState } from "react"
import { User } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Leaf, BarChart3, Users, Shield, LogOut, ArrowLeft, Building2 } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Team {
  id: string
  name: string
  invite_code: string
  created_at: string
}

interface Profile {
  id: string
  email: string
  display_name: string
  team_id: string | null
  is_admin: boolean
}

interface Usage {
  id: string
  user_id: string
  team_id: string
  requests: number
  co2_grams: string
  ai_service: string
  recorded_at: string
}

interface AdminDashboardProps {
  user: User
  profile: Profile
  teams: Team[]
  profiles: Profile[]
  usage: Usage[]
}

export function AdminDashboard({ user, profile, teams, profiles, usage }: AdminDashboardProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  // Calculate stats
  const totalRequests = usage.reduce((sum, u) => sum + (u.requests || 0), 0)
  const totalCo2 = usage.reduce((sum, u) => sum + parseFloat(u.co2_grams || "0"), 0)
  const totalUsers = profiles.length
  const totalTeams = teams.length

  // Team stats
  const teamStats = teams.map(team => {
    const teamMembers = profiles.filter(p => p.team_id === team.id)
    const teamUsage = usage.filter(u => u.team_id === team.id)
    const teamRequests = teamUsage.reduce((sum, u) => sum + (u.requests || 0), 0)
    const teamCo2 = teamUsage.reduce((sum, u) => sum + parseFloat(u.co2_grams || "0"), 0)
    
    return {
      ...team,
      memberCount: teamMembers.length,
      requests: teamRequests,
      co2: teamCo2,
    }
  }).sort((a, b) => b.requests - a.requests)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-amber-600" />
              <span className="text-xl font-semibold text-foreground">Admin Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              Admin
            </Badge>
            <span className="text-sm text-muted-foreground">
              {profile.display_name || user.email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Organization Overview</h1>
          <p className="text-muted-foreground">Monitor all teams and their AI usage</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="teams" className="gap-2">
              <Building2 className="h-4 w-4" />
              Teams
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalTeams}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalUsers}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalRequests.toLocaleString()}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total CO2</CardTitle>
                    <Leaf className="h-4 w-4 text-emerald-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalCo2.toFixed(2)}g</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Top Teams by Usage</CardTitle>
                  <CardDescription>Teams ranked by total AI requests</CardDescription>
                </CardHeader>
                <CardContent>
                  {teamStats.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No teams yet</p>
                  ) : (
                    <div className="space-y-4">
                      {teamStats.slice(0, 10).map((team, index) => (
                        <div
                          key={team.id}
                          className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-lg font-bold text-muted-foreground w-6">
                              {index + 1}
                            </span>
                            <div>
                              <p className="font-medium">{team.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {team.memberCount} member(s)
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{team.requests.toLocaleString()} requests</p>
                            <p className="text-sm text-emerald-600">{team.co2.toFixed(2)}g CO2</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="teams">
            <Card>
              <CardHeader>
                <CardTitle>All Teams</CardTitle>
                <CardDescription>{teams.length} total teams</CardDescription>
              </CardHeader>
              <CardContent>
                {teams.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No teams created yet</p>
                ) : (
                  <div className="space-y-4">
                    {teamStats.map((team) => (
                      <div
                        key={team.id}
                        className="flex items-center justify-between p-4 rounded-lg border"
                      >
                        <div>
                          <p className="font-medium">{team.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Invite code: <code className="bg-muted px-1 rounded">{team.invite_code}</code>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Created: {new Date(team.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary">{team.memberCount} members</Badge>
                          <p className="text-sm mt-1">{team.requests} requests</p>
                          <p className="text-xs text-emerald-600">{team.co2.toFixed(2)}g CO2</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>{profiles.length} total users</CardDescription>
              </CardHeader>
              <CardContent>
                {profiles.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No users yet</p>
                ) : (
                  <div className="space-y-3">
                    {profiles.map((p) => {
                      const team = teams.find(t => t.id === p.team_id)
                      return (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-4 rounded-lg border"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                              <span className="text-emerald-700 font-medium">
                                {(p.display_name || p.email)?.[0]?.toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{p.display_name || "Unknown"}</p>
                              <p className="text-sm text-muted-foreground">{p.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {p.is_admin && (
                              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                                Admin
                              </Badge>
                            )}
                            {team ? (
                              <Badge variant="outline">{team.name}</Badge>
                            ) : (
                              <Badge variant="secondary">No team</Badge>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
