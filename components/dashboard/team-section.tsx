"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Users, Copy, Check, UserPlus, Plus } from "lucide-react"

interface Profile {
  id: string
  team_id: string | null
  teams: {
    id: string
    name: string
    invite_code: string
  } | null
}

interface TeamMember {
  id: string
  display_name: string
  email: string
}

export function TeamSection({ profile }: { profile: Profile }) {
  const router = useRouter()
  const [teamName, setTeamName] = useState("")
  const [inviteCode, setInviteCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])

  useEffect(() => {
    if (profile.team_id) {
      fetchTeamMembers()
    }
  }, [profile.team_id])

  async function fetchTeamMembers() {
    const supabase = createClient()
    const { data } = await supabase
      .from("profiles")
      .select("id, display_name, email")
      .eq("team_id", profile.team_id)

    if (data) {
      setTeamMembers(data)
    }
  }

  async function createTeam() {
    if (!teamName.trim()) return
    setLoading(true)
    setError("")

    const supabase = createClient()

    // Create team
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .insert({ name: teamName, created_by: profile.id })
      .select()
      .single()

    if (teamError) {
      setError(teamError.message)
      setLoading(false)
      return
    }

    // Update profile with team_id
    await supabase
      .from("profiles")
      .update({ team_id: team.id })
      .eq("id", profile.id)

    setLoading(false)
    router.refresh()
  }

  async function joinTeam() {
    if (!inviteCode.trim()) return
    setLoading(true)
    setError("")

    const supabase = createClient()

    // Find team by invite code
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("id")
      .eq("invite_code", inviteCode.trim())
      .single()

    if (teamError || !team) {
      setError("Invalid invite code. Please check and try again.")
      setLoading(false)
      return
    }

    // Update profile with team_id
    await supabase
      .from("profiles")
      .update({ team_id: team.id })
      .eq("id", profile.id)

    setLoading(false)
    router.refresh()
  }

  async function leaveTeam() {
    setLoading(true)
    const supabase = createClient()

    await supabase
      .from("profiles")
      .update({ team_id: null })
      .eq("id", profile.id)

    setLoading(false)
    router.refresh()
  }

  function copyInviteCode() {
    if (profile.teams?.invite_code) {
      navigator.clipboard.writeText(profile.teams.invite_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (profile.teams) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {profile.teams.name}
            </CardTitle>
            <CardDescription>Your current team</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground">Invite Code</Label>
              <div className="flex items-center gap-2 mt-1">
                <code className="bg-muted px-3 py-2 rounded text-sm font-mono flex-1">
                  {profile.teams.invite_code}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyInviteCode}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Share this code with others to invite them to your team
              </p>
            </div>
            <Button variant="destructive" onClick={leaveTeam} disabled={loading}>
              Leave Team
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>{teamMembers.length} member(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span className="text-emerald-700 font-medium">
                      {(member.display_name || member.email)?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{member.display_name || "Unknown"}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                  {member.id === profile.id && (
                    <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                      You
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create a Team
          </CardTitle>
          <CardDescription>
            Start a new team and invite others to join
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="team-name">Team Name</Label>
            <Input
              id="team-name"
              placeholder="Enter team name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
            />
          </div>
          <Button onClick={createTeam} disabled={loading || !teamName.trim()}>
            Create Team
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Join a Team
          </CardTitle>
          <CardDescription>
            Enter an invite code to join an existing team
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="invite-code">Invite Code</Label>
            <Input
              id="invite-code"
              placeholder="Enter invite code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={joinTeam} disabled={loading || !inviteCode.trim()}>
            Join Team
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
