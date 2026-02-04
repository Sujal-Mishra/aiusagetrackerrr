"use client"

import { useState } from "react"
import { User } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Leaf, BarChart3, Users, Settings, LogOut, Shield } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { TeamSection } from "@/components/dashboard/team-section"
import { AnalyticsSection } from "@/components/dashboard/analytics-section"
import { ProfileSection } from "@/components/dashboard/profile-section"

interface Profile {
  id: string
  email: string
  display_name: string
  team_id: string | null
  is_admin: boolean
  teams: {
    id: string
    name: string
    invite_code: string
  } | null
}

interface DashboardContentProps {
  user: User
  profile: Profile
}

export function DashboardContent({ user, profile }: DashboardContentProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("analytics")

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-emerald-600" />
            <span className="text-xl font-semibold text-foreground">AI Usage Tracker</span>
          </div>
          <div className="flex items-center gap-4">
            {profile.is_admin && (
              <Link href="/admin">
                <Button variant="outline" size="sm" className="gap-2">
                  <Shield className="h-4 w-4" />
                  Admin
                </Button>
              </Link>
            )}
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
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            {profile.teams 
              ? `Team: ${profile.teams.name}` 
              : "Not part of a team yet"}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-2">
              <Users className="h-4 w-4" />
              Team
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2">
              <Settings className="h-4 w-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <AnalyticsSection profile={profile} />
          </TabsContent>

          <TabsContent value="team">
            <TeamSection profile={profile} />
          </TabsContent>

          <TabsContent value="profile">
            <ProfileSection user={user} profile={profile} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
