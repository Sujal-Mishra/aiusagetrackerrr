import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Users, Shield, Leaf } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-emerald-600" />
            <span className="text-xl font-semibold text-foreground">AI Usage Tracker</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="py-20 px-4">
          <div className="container mx-auto text-center max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
              Track Your Team's AI Usage & Carbon Footprint
            </h1>
            <p className="text-lg text-muted-foreground mb-8 text-pretty">
              Monitor AI usage across your team, visualize carbon impact, and make informed decisions about your organization's AI consumption.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/sign-up">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Tracking Free
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Sign In to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-muted/50">
          <div className="container mx-auto">
            <h2 className="text-2xl font-bold text-center mb-12 text-foreground">Key Features</h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <Card>
                <CardHeader>
                  <Users className="h-10 w-10 text-emerald-600 mb-2" />
                  <CardTitle>Team Analytics</CardTitle>
                  <CardDescription>
                    Create or join a team and view shared AI usage analytics with all team members.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <BarChart3 className="h-10 w-10 text-emerald-600 mb-2" />
                  <CardTitle>Usage Insights</CardTitle>
                  <CardDescription>
                    Track requests, monitor trends, and see detailed breakdowns by AI service.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Shield className="h-10 w-10 text-emerald-600 mb-2" />
                  <CardTitle>Admin Dashboard</CardTitle>
                  <CardDescription>
                    Admins can monitor all teams, view organization-wide stats, and manage users.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="container mx-auto text-center">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <Leaf className="h-12 w-12 text-emerald-600 mx-auto mb-2" />
                <CardTitle>Environmental Impact</CardTitle>
                <CardDescription>
                  Every AI request has a carbon footprint. We help you track and reduce it.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Our browser extension automatically tracks your AI usage and calculates the estimated CO2 emissions, helping you make more sustainable choices.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground text-sm">
          <p>AI Usage Tracker - Monitor your AI consumption and environmental impact</p>
        </div>
      </footer>
    </div>
  )
}
