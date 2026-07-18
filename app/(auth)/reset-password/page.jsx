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
import { passwordReset } from "@/services/members";
import { PasswordSetupSchema } from "@/validation";
import { ArrowLeft, Eye, EyeOff, Lock, Hash, Mail, KeyRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function ResetPassword() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        code: "",
        new_password: "",
        confirm_password: "",
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const router = useRouter();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
        // Clear error when user types
        if (errors[e.target.id]) {
            setErrors({ ...errors, [e.target.id]: "" });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        // Validate using the schema
        try {
            await PasswordSetupSchema.validate(
                {
                    password: formData.new_password,
                    confirmPassword: formData.confirm_password,
                },
                { abortEarly: false }
            );
        } catch (err) {
            const validationErrors = {};
            if (err.inner) {
                err.inner.forEach((error) => {
                    // Map schema keys to form keys if necessary
                    if (error.path === "password") validationErrors.new_password = error.message;
                    if (error.path === "confirmPassword") validationErrors.confirm_password = error.message;
                });
            }
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        try {
            await passwordReset({
                email: formData.email,
                code: formData.code,
                password: formData.new_password,
                confirm_password: formData.confirm_password,
            });
            toast.success("Password reset successful! You can now login.");
            router.push("/login");
        } catch (error) {
            console.error(error);
            toast.error(
                error?.response?.data?.message ||
                "Failed to reset password. Please check your code."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
            <Card className="w-full max-w-md mx-auto shadow-2xl border-white/20 bg-white/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 relative z-10">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent"></div>
                <CardHeader className="space-y-1 items-center text-center pb-2">
                    <div className="w-16 h-16 bg-primary/10 rounded flex items-center justify-center mb-4 text-primary mx-auto">
                        <KeyRound className="w-8 h-8" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
                        Reset Password
                    </CardTitle>
                    <CardDescription className="text-gray-500 text-base max-w-[85%] mx-auto">
                        Enter the code sent to your email and your new password
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-primary transition-colors" />
                                <Input
                                    type="email"
                                    id="email"
                                    placeholder="Enter your email"
                                    className="h-11 pl-10 border-gray-200 focus:border-primary focus:ring-primary/20 transition-all bg-white/50"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="code" className="text-sm font-medium text-gray-700">Reset Code (OTP)</Label>
                            <div className="relative group">
                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-primary transition-colors" />
                                <Input
                                    type="text"
                                    id="code"
                                    placeholder="Enter the 6-digit code"
                                    className="h-11 pl-10 tracking-widest border-gray-200 focus:border-primary focus:ring-primary/20 transition-all bg-white/50"
                                    value={formData.code}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="new_password" className="text-sm font-medium text-gray-700">New Password</Label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-primary transition-colors" />
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    id="new_password"
                                    placeholder="Enter new password"
                                    className={`h-11 pl-10 pr-10 border-gray-200 focus:border-primary focus:ring-primary/20 transition-all bg-white/50 ${errors.new_password ? "border-red-500" : ""}`}
                                    value={formData.new_password}
                                    onChange={handleChange}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            {errors.new_password && (
                                <p className="text-sm text-red-500 mt-1">{errors.new_password}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirm_password" className="text-sm font-medium text-gray-700">Confirm New Password</Label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-primary transition-colors" />
                                <Input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirm_password"
                                    placeholder="Confirm new password"
                                    className={`h-11 pl-10 pr-10 border-gray-200 focus:border-primary focus:ring-primary/20 transition-all bg-white/50 ${errors.confirm_password ? "border-red-500" : ""}`}
                                    value={formData.confirm_password}
                                    onChange={handleChange}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:bg-transparent"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            {errors.confirm_password && (
                                <p className="text-sm text-red-500 mt-1">{errors.confirm_password}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 text-base font-bold bg-primary hover:bg-[#045e32] shadow-lg shadow-primary/20 transition-all mt-2"
                            disabled={loading}
                        >
                            {loading ? "Resetting..." : "Reset Password"}
                        </Button>
                    </form>

                    <div className="text-center pt-2">
                        <Link
                            href="/login"
                            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-primary transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Login
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}