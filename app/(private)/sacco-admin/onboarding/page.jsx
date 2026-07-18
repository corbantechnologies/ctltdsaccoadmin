"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { 
    CheckCircle2, 
    ArrowRight, 
    Building2, 
    Wallet, 
    BadgePercent, 
    PiggyBank, 
    HandCoins,
    HelpCircle,
    Download,
    Users,
    FileSpreadsheet,
    ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { generateMigrationChecklist } from "@/lib/pdf-generator";

export default function MigrationHub() {
    const router = useRouter();

    const handleDownloadChecklist = () => {
        generateMigrationChecklist();
    };


    const phases = [
        {
            id: "foundation",
            title: "Phase 1: Foundation",
            description: "System configuration and financial rules.",
            icon: Building2,
            steps: [
                { title: "General Ledger", icon: Building2, href: "/sacco-admin/setup/gl-accounts", desc: "Define your Chart of Accounts." },
                { title: "Payment Accounts", icon: Wallet, href: "/sacco-admin/setup/payment-accounts", desc: "Link Bank & M-Pesa accounts." },
                { title: "Fee Types", icon: BadgePercent, href: "/sacco-admin/setup/feetypes", desc: "Registration & service charges." },
                { title: "Loan Products", icon: HandCoins, href: "/sacco-admin/setup/loan-products", desc: "Lending rules & interest methods." },
                { title: "Saving Products", icon: PiggyBank, href: "/sacco-admin/setup/saving-types", desc: "Deposit schemes & collateral rules." },
            ]
        },
        {
            id: "data",
            title: "Phase 2: Member Migration",
            description: "Bringing your member register into the system.",
            icon: Users,
            steps: [
                { title: "Member Import", icon: Users, href: "/sacco-admin/members", desc: "Invite single members, use the 15-member bulk form, or upload a CSV." },
            ]
        },
        {
            id: "balances",
            title: "Phase 3: Savings & Fees",
            description: "Migrating opening savings and unpaid fees.",
            icon: PiggyBank,
            steps: [
                { title: "Savings Migration", icon: PiggyBank, href: "/sacco-admin/saving-deposits", desc: "Post single deposits, batch forms, or bulk CSV uploads." },
                { title: "Fee Migration", icon: BadgePercent, href: "/sacco-admin/fee-payments", desc: "Record single fees, batch forms, or bulk CSV uploads." },
            ]
        },

        {
            id: "loans",
            title: "Phase 4: Loan Migration",
            description: "Moving active loans into the system.",
            icon: HandCoins,
            steps: [
                { title: "Bulk Loan Apps", icon: HandCoins, href: "/sacco-admin/loan-applications", desc: "Best for automation and member tracking." },
                { title: "Legacy Migration", icon: HelpCircle, href: "/sacco-admin/onboarding/existing-loans", desc: "Manual records for non-standard loans." },
            ]
        },
        {
            id: "reports",
            title: "Phase 5: Validation",
            description: "Verifying your migration with reports.",
            icon: ShieldCheck,
            steps: [
                { title: "Sacco Reports", icon: ShieldCheck, href: "/sacco-admin/reports", desc: "Balance Sheets, P&L, and Portfolio summaries." },
                { title: "Member Audit", icon: Users, href: "/sacco-admin/members", desc: "Verify individual statements and history." },
            ]
        }
    ];



    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 space-y-8 mx-auto">
            {/* Header Section */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-[var(--accent)] font-semibold text-sm uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4" />
                    Admin Onboarding Center
                </div>
                <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                    System Migration Hub
                </h1>
                <p className="text-slate-600 text-lg max-w-2xl">
                    Follow this structured path to move your SACCO from manual records or old software to Sprout.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Roadmap */}
                <div className="lg:col-span-2 space-y-8">
                    {phases.map((phase) => (
                        <Card key={phase.id} className="border-none shadow-sm overflow-hidden bg-white">
                            <CardHeader className="bg-slate-50/50 border-b pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded shadow-sm">
                                        <phase.icon className="w-6 h-6 text-[var(--accent)]" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl">{phase.title}</CardTitle>
                                        <CardDescription>{phase.description}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-slate-100">
                                    {phase.steps.map((step, idx) => (
                                        <div 
                                            key={idx} 
                                            className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group cursor-pointer"
                                            onClick={() => router.push(step.href)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="flex-shrink-0 flex flex-col items-center justify-center w-8 h-8 rounded bg-slate-100 text-slate-500 text-xs font-semibold">
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                                        {step.title}
                                                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 hidden sm:inline" />
                                                    </h3>
                                                    <p className="text-sm text-slate-500">{step.desc}</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" className="text-[var(--accent)] group-hover:bg-white group-hover:shadow-sm w-full sm:w-auto">
                                                Configure
                                            </Button>
                                        </div>

                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Sidebar Resources */}
                <div className="space-y-6">
                    <Card className="border-[var(--accent)]/20 bg-[var(--accent)]/5">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <HelpCircle className="w-5 h-5 text-[var(--accent)]" />
                                Need Help?
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-slate-600">
                                Migration can be complex. We recommend cleaning your data in Excel before attempting a bulk upload.
                            </p>
                            <Button 
                                className="w-full bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white gap-2 font-semibold"
                                onClick={handleDownloadChecklist}
                            >
                                <Download className="w-4 h-4" /> Download Migration Checklist
                            </Button>

                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Import Templates</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div 
                                className="flex items-center justify-between p-3 rounded border hover:bg-slate-50 cursor-pointer transition-colors"
                                onClick={async () => {
                                    try {
                                        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/auth/new-members/bulk-create/template/download/`);
                                        const blob = await response.blob();
                                        const url = window.URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = 'member_migration_template.csv';
                                        document.body.appendChild(a);
                                        a.click();
                                        window.URL.revokeObjectURL(url);
                                    } catch (error) {
                                        console.error("Failed to download template", error);
                                    }
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <FileSpreadsheet className="w-5 h-5 text-green-600" />
                                    <span className="text-sm font-medium">Member Register</span>
                                </div>
                                <Download className="w-4 h-4 text-slate-400" />
                            </div>
                            <div 
                                className="flex items-center justify-between p-3 rounded border hover:bg-slate-50 cursor-pointer transition-colors"
                                onClick={async () => {
                                    try {
                                        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/savingsdeposits/bulk/template/`);
                                        const blob = await response.blob();
                                        const url = window.URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = 'savings_migration_template.csv';
                                        document.body.appendChild(a);
                                        a.click();
                                        window.URL.revokeObjectURL(url);
                                    } catch (error) {
                                        console.error("Failed to download template", error);
                                    }
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <FileSpreadsheet className="w-5 h-5 text-green-600" />
                                    <span className="text-sm font-medium">Savings Balances</span>
                                </div>
                                <Download className="w-4 h-4 text-slate-400" />
                            </div>
                            <div 
                                className="flex items-center justify-between p-3 rounded border hover:bg-slate-50 cursor-pointer transition-colors"
                                onClick={async () => {
                                    try {
                                        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/feepayments/bulk/template/`);
                                        const blob = await response.blob();
                                        const url = window.URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = 'fee_migration_template.csv';
                                        document.body.appendChild(a);
                                        a.click();
                                        window.URL.revokeObjectURL(url);
                                    } catch (error) {
                                        console.error("Failed to download template", error);
                                    }
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <FileSpreadsheet className="w-5 h-5 text-green-600" />
                                    <span className="text-sm font-medium">Fee Payments</span>
                                </div>
                                <Download className="w-4 h-4 text-slate-400" />
                            </div>
                            <div 
                                className="flex items-center justify-between p-3 rounded border hover:bg-slate-50 cursor-pointer transition-colors"
                                onClick={async () => {
                                    try {
                                        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/loanapplications/admin/bulk/template/`);
                                        const blob = await response.blob();
                                        const url = window.URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = 'loan_applications_bulk_template.csv';
                                        document.body.appendChild(a);
                                        a.click();
                                        window.URL.revokeObjectURL(url);
                                    } catch (error) {
                                        console.error("Failed to download template", error);
                                    }
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <FileSpreadsheet className="w-5 h-5 text-green-600" />
                                    <span className="text-sm font-medium">Bulk Loan Apps</span>
                                </div>
                                <Download className="w-4 h-4 text-slate-400" />
                            </div>
                            <div 
                                className="flex items-center justify-between p-3 rounded border hover:bg-slate-50 cursor-pointer transition-colors"
                                onClick={async () => {
                                    try {
                                        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/existingloans/bulk/template/`);
                                        const blob = await response.blob();
                                        const url = window.URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = 'existing_loans_bulk_template.csv';
                                        document.body.appendChild(a);
                                        a.click();
                                        window.URL.revokeObjectURL(url);
                                    } catch (error) {
                                        console.error("Failed to download template", error);
                                    }
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <FileSpreadsheet className="w-5 h-5 text-green-600" />
                                    <span className="text-sm font-medium">Legacy Loans</span>
                                </div>
                                <Download className="w-4 h-4 text-slate-400" />
                            </div>


                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
