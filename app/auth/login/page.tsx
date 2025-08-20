"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Github, Mail, Building2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const res = await signIn("credentials", { email, password, redirect: false })
    setIsLoading(false)
    if (res?.ok) {
      toast({ title: "Signed in", description: "Welcome back!" })
      router.push("/dashboard")
    } else {
      toast({ title: "Invalid credentials", description: "Check your email or password.", variant: "destructive" })
    }
  }

  const handleOAuthLogin = (provider: string) => {}

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-border backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-primary mr-2" />
            <span className="text-2xl font-bold text-foreground">DevMemory</span>
          </div>
          <CardTitle className="text-foreground">Welcome back</CardTitle>
          <CardDescription className="text-muted-foreground">Sign in to access your developer dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="developer@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background/50 border-border text-foreground"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full bg-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => handleOAuthLogin("github")}
              disabled={isLoading}
              className="bg-background/50 border-border text-foreground hover:bg-muted"
            >
              <Github className="h-4 w-4 mr-2" />
              GitHub
            </Button>
            <Button
              variant="outline"
              onClick={() => handleOAuthLogin("google")}
              disabled={isLoading}
              className="bg-background/50 border-border text-foreground hover:bg-muted"
            >
              <Mail className="h-4 w-4 mr-2" />
              Google
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-primary hover:opacity-90">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
