import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardContent } from "@/components/dashboard/dashboard-content"

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, teams(*)")
    .eq("id", user.id)
    .single()

  // If user has no profile, create one
  if (!profile) {
    await supabase.from("profiles").insert({
      id: user.id,
      email: user.email,
      display_name: user.email?.split("@")[0] || "User",
    })
    redirect("/dashboard")
  }

  return <DashboardContent user={user} profile={profile} />
}
