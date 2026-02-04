"use client"

import { useState } from "react"
import { User } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { User as UserIcon, Mail, Shield } from "lucide-react"

interface Profile {
  id: string
  email: string
  display_name: string
  is_admin: boolean
}

export function ProfileSection({ user, profile }: { user: User; profile: Profile }) {
  const router = useRouter()
  const [displayName, setDisplayName] = useState(profile.display_name || "")
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  async function updateProfile() {
    setLoading(true)
    const supabase = createClient()

    await supabase
      .from("profiles")
      .update({ display_name: displayName })
      .eq("id", profile.id)

    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    router.refresh()
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Profile Settings
          </CardTitle>
          <CardDescription>Manage your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </Label>
            <Input
              id="email"
              value={user.email || ""}
              disabled
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Email cannot be changed
            </p>
          </div>

          <div>
            <Label htmlFor="display-name">Display Name</Label>
            <Input
              id="display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your name"
              className="mt-1"
            />
          </div>

          <Button onClick={updateProfile} disabled={loading}>
            {saved ? "Saved!" : loading ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Account Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                profile.is_admin
                  ? "bg-amber-100 text-amber-800"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {profile.is_admin ? "Admin" : "Member"}
            </div>
            <p className="text-sm text-muted-foreground">
              {profile.is_admin
                ? "You have admin access to view all teams"
                : "Standard team member access"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
