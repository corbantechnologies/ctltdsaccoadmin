"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useFetchSavingDetail } from "@/hooks/savings/actions";
import { useUpdateSavingsDeposit } from "@/hooks/savingsdeposits/actions";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import LoadingSpinner from "@/components/general/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
    ArrowLeft, 
    PiggyBank, 
    Calendar, 
    User, 
    CreditCard, 
    Activity,
    ArrowDownLeft,
    FileText,
    Receipt,
    Wallet,
    Edit
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function SavingAccountReferencePage() {
    const params = useParams();
    const router = useRouter();
    const reference = params?.["accounts-reference"];
    
    const { data: account, isLoading } = useFetchSavingDetail(reference);
    const queryClient = useQueryClient();
    const updateDepositMutation = useUpdateSavingsDeposit();

    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedDeposit, setSelectedDeposit] = useState(null);
    const [newDate, setNewDate] = useState("");

    const handleEditClick = (deposit) => {
        setSelectedDeposit(deposit);
        const dateStr = deposit.transaction_date || deposit.created_at;
        setNewDate(dateStr ? dateStr.split("T")[0] : "");
        setIsEditDialogOpen(true);
    };
    
    const handleUpdateDate = () => {
        if (!selectedDeposit || !newDate) return;
        updateDepositMutation.mutate({
            reference: selectedDeposit.reference,
            values: { transaction_date: newDate }
        }, {
            onSuccess: () => {
                toast.success("Date updated successfully!");
                setIsEditDialogOpen(false);
                queryClient.invalidateQueries({ queryKey: ["savingDetail", reference] });
            },
            onError: (err) => {
                toast.error(err?.response?.data?.detail || "Failed to update date");
            }
        });
    };

const SavingAccountDetailSkeleton = () => (
  <div className="mx-auto p-4 sm:p-6 space-y-6 animate-pulse">
    <div className="h-4 w-48 bg-slate-200 rounded" />
    <div className="flex justify-between items-center">
      <div className="space-y-2">
        <div className="h-6 w-64 bg-slate-200 rounded" />
        <div className="h-4 w-40 bg-slate-200 rounded" />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="h-24 bg-slate-200 rounded-lg" />
      <div className="h-24 bg-slate-200 rounded-lg" />
      <div className="h-24 bg-slate-200 rounded-lg" />
      <div className="h-24 bg-slate-200 rounded-lg" />
    </div>
    <div className="h-96 bg-slate-200 rounded-lg" />
  </div>
);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50/50">
                <SavingAccountDetailSkeleton />
            </div>
        );
    }
    if (!account) return <div className="p-8 text-center text-slate-500">Account not found.</div>;

    const deposits = account?.deposits || [];

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="rounded hover:bg-white border"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                                Account Reference
                            </h1>
                            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider">
                                {account.is_active ? "Active" : "Inactive"}
                            </span>
                        </div>
                        <p className="text-slate-500 text-sm font-medium">
                            Viewing transaction history and master record for <span className="text-[var(--accent)] font-semibold">{account.account_number}</span>
                        </p>
                    </div>
                </div>

            </div>

            {/* Account Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-none shadow-sm bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 rounded">
                                <Wallet className="w-6 h-6 text-[var(--accent)]" />
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Current Balance</p>
                                <p className="text-xl font-semibold text-slate-900 font-mono tracking-tighter">
                                    KES {parseFloat(account.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-50 rounded">
                                <User className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Member Owner</p>
                                <Link 
                                    href={`/sacco-admin/members/${account.member}`}
                                    className="text-sm font-semibold text-slate-900 uppercase tracking-tight truncate max-w-[150px] hover:text-[var(--accent)] hover:underline block"
                                >
                                    {account.member_name}
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-50 rounded">
                                <PiggyBank className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Product Type</p>
                                <p className="text-sm font-semibold text-slate-900 line-clamp-1">
                                    {account.account_type}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-orange-50 rounded">
                                <Calendar className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Created On</p>
                                <p className="text-sm font-semibold text-slate-900 tracking-tight">
                                    {new Date(account.created_at).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Transactions Section */}
            <Card className="border-none shadow-sm">
                <CardHeader className="bg-white border-b px-6 py-4 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <Activity className="w-5 h-5 text-[var(--accent)]" /> Transaction History
                        </CardTitle>
                        <CardDescription className="text-xs font-medium">Record of all deposits processed for this account.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/50">
                                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 pl-6 py-3">Reference</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 py-3">Date</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 py-3">Type</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 py-3">Payment Method</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 text-right pr-6 py-3">Amount</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 text-right pr-6 py-3">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {deposits.length > 0 ? (
                                    [...deposits].reverse().map((dep, index) => (
                                        <TableRow key={dep.reference || index} className="hover:bg-slate-50 transition-colors border-b border-slate-50">
                                            <TableCell className="pl-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-semibold text-[var(--accent)] font-mono">{dep.identity || dep.reference}</span>
                                                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-tighter">System ID</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-semibold text-slate-700">
                                                        {new Date(dep.created_at).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-medium">
                                                        {new Date(dep.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex items-center gap-1.5">
                                                    <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500" />
                                                    <span className="text-xs font-semibold text-slate-600 uppercase tracking-tight">{dep.deposit_type}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 text-xs font-medium text-slate-600">
                                                <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-semibold uppercase">
                                                    {dep.payment_method}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right pr-6 py-4">
                                                <span className="text-sm font-semibold text-emerald-600 font-mono tracking-tighter">
                                                    + {parseFloat(dep.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right pr-6 py-4">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={() => handleEditClick(dep)}
                                                    className="text-[var(--accent)] hover:text-[var(--accent)]/80 hover:bg-[var(--accent)]/10"
                                                >
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit Date
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-48 text-slate-400 text-sm font-medium italic">
                                            No deposits or transactions recorded for this account.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>



            {/* Edit Date Modal */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Deposit Date</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="newDate" className="mb-2 block">Transaction Date</Label>
                        <input
                            type="date"
                            id="newDate"
                            value={newDate}
                            onChange={(e) => setNewDate(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-colors"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                            Note: Updating this date will automatically update the General Ledger posting date.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={updateDepositMutation.isPending}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateDate} disabled={updateDepositMutation.isPending || !newDate} className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white">
                            {updateDepositMutation.isPending ? "Updating..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}