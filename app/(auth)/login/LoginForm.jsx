import { SACCO_CONFIG } from "@/lib/sacco-config";
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { getSession, signIn } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";

function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [member_no, setMemberNo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await signIn("credentials", {
        redirect: false,
        member_no,
        password,
      });


      const session = await getSession();
      if (response?.error) {
        toast?.error("Invalid member number or password");
        setLoading(false);
      } else {
        toast?.success("Login successful! Redirecting...");
        if (session?.user?.is_superuser === true) {
          router.push("/superuser/dashboard");
        } else if (session?.user?.is_staff === true) {
          router.push("/superuser/dashboard");
        } else if (session?.user?.is_system_admin === true) {
          router.push("/sacco-admin/dashboard");
        } else if (session?.user?.is_treasurer === true) {
          router.push("/sacco-admin/dashboard");
        } else if (session?.user?.is_bookkeeper === true) {
          router.push("/sacco-admin/dashboard");
        } else if (session?.user?.is_sacco_staff === true) {
          router.push("/sacco-admin/dashboard");
        } else if (session?.user?.is_sacco_admin === true) {
          router.push("/sacco-admin/dashboard");
        } else if (session?.user?.is_member === true) {
          // disabled for now until full migration
          router.push("/");
        } else {
          router.push("/");
        }
      }
    } catch (error) {
      setLoading(false);
      toast?.error("Login failed. Please try again.");
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-2xl border-white/20 bg-white/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 relative z-10 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent"></div>
      <CardHeader className="space-y-2 items-center text-center pb-6">
        <div className="w-20 h-20 relative mb-2 mx-auto">
          <Image
            src={SACCO_CONFIG.logoUrl}
            alt={`${SACCO_CONFIG.name} Logo`}
            fill
            className="object-contain"
          />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
          Welcome Back
        </CardTitle>
        <CardDescription className="text-gray-500 text-base">
          Sign in to access your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label
              htmlFor="member_no"
              className="text-sm font-medium text-gray-700"
            >
              Member Number
            </Label>
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-primary transition-colors" />
              <Input
                type="text"
                id="member_no"
                placeholder="Enter your member number"
                className="h-11 pl-10 border-gray-200 focus:border-primary focus:ring-primary/20 transition-all bg-white/50"
                value={member_no}
                onChange={(e) => setMemberNo(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Password
              </Label>
              <a
                href="/forgot-password"
                className="text-xs text-primary hover:text-accent font-semibold hover:underline transition-colors"
              >
                Forgot Password?
              </a>
            </div>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-primary transition-colors" />
              <Input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Enter your password"
                className="h-11 pl-10 pr-10 border-gray-200 focus:border-primary focus:ring-primary/20 transition-all bg-white/50"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 text-base font-bold bg-gradient-to-r from-primary to-[#045e32] hover:bg-gradient-to-l hover:from-primary hover:to-[#045e32] shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-gray-400">Secure Access • {SACCO_CONFIG.name}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default LoginForm;
