"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Github, Mail, Building2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"

export default function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    team: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast({ title: "Signup failed", description: err?.error || "Please try again.", variant: "destructive" })
        throw new Error("Signup failed")
      }
      toast({ title: "Account created", description: "Signing you in..." })
      // Auto sign-in after signup
      const signin = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })
      if (signin?.ok) {
        toast({ title: "Signed in", description: "Welcome!" })
        router.push("/dashboard")
      } else {
        toast({ title: "Sign-in failed", description: "Please log in manually.", variant: "destructive" })
      }
    } catch (err) {
      // Error toast already shown above where possible
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignup = (provider: string) => {
    setIsLoading(true)
    // Simulate OAuth flow
    setTimeout(() => {
      setIsLoading(false)
      router.push("/dashboard")
    }, 2000)
  }

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-border backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-primary mr-2" />
            <span className="text-2xl font-bold text-foreground">H8M</span>
          </div>
          <CardTitle className="text-foreground">Create your account</CardTitle>
          <CardDescription className="text-muted-foreground">Join your team's developer dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-foreground">
                  First name
                </Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => updateFormData("firstName", e.target.value)}
                  className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-foreground">
                  Last name
                </Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => updateFormData("lastName", e.target.value)}
                  className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@company.com"
                value={formData.email}
                onChange={(e) => updateFormData("email", e.target.value)}
                className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="role" className="text-foreground">
                  Role
                </Label>
                <Select onValueChange={(value) => updateFormData("role", value)}>
                  <SelectTrigger className="bg-background/50 border-border text-foreground">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    <SelectItem value="developer">Developer</SelectItem>
                    <SelectItem value="devops">DevOps</SelectItem>
                    <SelectItem value="pm">Product Manager</SelectItem>
                    <SelectItem value="qa">QA Engineer</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="team" className="text-foreground">
                  Team
                </Label>
                <Select onValueChange={(value) => updateFormData("team", value)}>
                  <SelectTrigger className="bg-background/50 border-border text-foreground">
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    <SelectItem value="frontend">Frontend</SelectItem>
                    <SelectItem value="backend">Backend</SelectItem>
                    <SelectItem value="mobile">Mobile</SelectItem>
                    <SelectItem value="infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => updateFormData("password", e.target.value)}
                className="bg-background/50 border-border text-foreground"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground">
                Confirm password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                className="bg-background/50 border-border text-foreground"
                required
              />
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create account"}
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
              onClick={() => handleOAuthSignup("github")}
              disabled={isLoading}
              className="bg-background/50 border-border text-foreground hover:bg-muted"
            >
              <Github className="h-4 w-4 mr-2" />
              GitHub
            </Button>
            <Button
              variant="outline"
              onClick={() => handleOAuthSignup("google")}
              disabled={isLoading}
              className="bg-background/50 border-border text-foreground hover:bg-muted"
            >
              <Mail className="h-4 w-4 mr-2" />
              Google
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary hover:opacity-90">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
