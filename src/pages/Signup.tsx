import { useState } from "react";
import { Link, Navigate } from "react-router-dom";

import { CheckSquare, Eye, EyeOff } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useToast } from "@/hooks/use-toast";

import { isValidEmail, isValidPassword } from "@/utils/validation";

export default function Signup() {
  const { toast } = useToast();
  const { signup, isLoading } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!isValidEmail(email))
        return toast({
          title: "Invalid input",
          description: "Email is invalid.",
          variant: "destructive",
        });

      if (!isValidPassword(password))
        return toast({
          title: "Invalid Password",
          description:
            "Password must include at least one uppercase letter, one lowercase letter, and one special character.",
          variant: "destructive",
        });

      await signup(name, email, password);
      toast({
        title: "Account created!",
        description: "Welcome to TaskManager. You can now manage your tasks.",
      });
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.response?.data?.message || "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 text-primary mb-4">
            <CheckSquare className="h-8 w-8" />
            <span className="text-2xl font-bold">TaskManager</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Create an account
          </h1>
          <p className="text-muted-foreground mt-2">
            Get started with TaskManager today
          </p>
        </div>

        {/* Signup Card */}
        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>
              Create your account to start managing tasks
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2 relative">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">
                Already have an account?{" "}
              </span>
              <Link
                to="/login"
                className="font-medium text-primary hover:underline"
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
