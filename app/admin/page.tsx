import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export default async function AdminPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!profile?.is_admin) {
    redirect("/dashboard")
  }

  // Fetch all teams with member counts
  const { data: teams } = await supabase
    .from("teams")
    .select("*")

  // Fetch all profiles
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")

  // Fetch all usage data
  const { data: usage } = await supabase
    .from("ai_usage")
    .select("*")

  return (
    <AdminDashboard 
      user={user} 
      profile={profile}
      teams={teams || []} 
      profiles={profiles || []}
      usage={usage || []}
    />
  )
}
