import { SACCO_CONFIG } from "@/lib/sacco-config";
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { activateAccount } from "@/services/members";
import { PasswordSetupSchema } from "@/validation";
import { Field, Form, Formik } from "formik";
import { Eye, EyeOff, ShieldCheck, Lock } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

function AccountActivation() {
  const { uid, token } = useParams();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      <Card className="w-full max-w-md mx-auto shadow-2xl border-white/20 bg-white/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 relative z-10">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent"></div>
        <CardHeader className="space-y-1 items-center text-center pb-2">
          <div className="w-16 h-16 bg-primary/10 rounded flex items-center justify-center mb-4 text-primary mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
            Activate Account
          </CardTitle>
          <CardDescription className="text-gray-500 text-base max-w-[90%] mx-auto">
            Set your password to activate your {SACCO_CONFIG.name} account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Formik
            initialValues={{
              uidb64: uid,
              token: token,
              password: "",
              confirmPassword: "",
            }}
            validationSchema={PasswordSetupSchema}
            onSubmit={async (values) => {
              setLoading(true);
              try {
                await activateAccount(values);
                toast?.success("Account Activated Successfully!");
                router.push("/login");
              } catch (error) {
                toast?.error("Failed to activate account!");
              } finally {
                setLoading(false);
              }
            }}
          >
            {({ values, errors, touched }) => (
              <Form className="space-y-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-700"
                  >
                    Password
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-primary transition-colors" />
                    <Field
                      as={Input}
                      type={showPassword ? "text" : "password"}
                      name="password"
                      id="password"
                      placeholder="Enter your password"
                      className="h-11 pl-10 pr-10 border-gray-200 focus:border-primary focus:ring-primary/20 transition-all bg-white/50"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {touched.password && errors.password && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-gray-700"
                  >
                    Confirm Password
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-primary transition-colors" />
                    <Field
                      as={Input}
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      id="confirmPassword"
                      placeholder="Confirm your password"
                      className="h-11 pl-10 pr-10 border-gray-200 focus:border-primary focus:ring-primary/20 transition-all bg-white/50"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {touched.confirmPassword && errors.confirmPassword && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-base font-bold bg-primary hover:bg-[#045e32] shadow-lg shadow-primary/20 transition-all mt-2"
                  disabled={loading}
                >
                  {loading ? "Activating..." : "Activate Account"}
                </Button>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </div>
  );
}

export default AccountActivation;
