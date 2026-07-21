"use client";
import { SACCO_CONFIG } from "@/lib/sacco-config";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Home, ArrowRight } from "lucide-react";

function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      <Card className="w-full max-w-lg bg-white/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 shadow-2xl border-white/20 relative z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-primary"></div>
        <CardContent className="p-8 sm:p-10">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-24 h-24 rounded bg-green-50 flex items-center justify-center mb-2 animate-in fade-in zoom-in duration-500">
              <CheckCircle2
                className="w-16 h-16 text-green-500"
                aria-hidden="true"
              />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                Application Received!
              </h1>
              <p className="text-gray-500 text-lg leading-relaxed max-w-[90%] mx-auto">
                Your application has been received and is currently being
                reviewed by our team.
              </p>
            </div>

            <div className="bg-green-50/50 rounded p-4 w-full border border-green-100">
              <p className="text-green-800 text-sm font-medium">
                You will receive an email notification once your account has
                been approved.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full pt-4">
              <Button
                asChild
                variant="outline"
                className="w-full h-12 text-base font-semibold border-gray-200 hover:bg-gray-50 hover:text-primary transition-colors"
              >
                <Link href="/" aria-label="Return to home page">
                  <Home className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              <Button
                asChild
                className="w-full h-12 text-base font-bold bg-primary hover:bg-[#045e32] shadow-lg shadow-primary/20 transition-all"
              >
                <Link href="/login" aria-label="Go to login">
                  Login Page
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>

            <div className="pt-6 border-t border-gray-100 w-full">
              <div className="flex justify-center items-center gap-2 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                <Image
                  src={SACCO_CONFIG.logoUrl}
                  width={40}
                  height={40}
                  alt={`${SACCO_CONFIG.name} Logo`}
                  className="object-contain"
                />
                <span className="font-semibold text-sm text-gray-400">
                  {SACCO_CONFIG.name}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SuccessPage;
