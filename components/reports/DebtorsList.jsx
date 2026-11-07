"use client";

import React, { useMemo, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFetchDebtors } from "@/hooks/financials/actions";
import MemberLoadingSpinner from "../general/MemberLoadingSpinner";

const VIEWS = [
    { value: "all", label: "All debtors" },
    { value: "Defaulted", label: "Defaulters" },
    { value: "In Arrears", label: "In arrears" },
    { value: "Current", label: "Up to date" },
];

const STAGE_STYLES = {
    Defaulted: "bg-red-100 text-red-700 border-red-200",
    "In Arrears": "bg-amber-100 text-amber-800 border-amber-200",
    Current: "bg-green-50 text-green-700 border-green-200",
};

function downloadCsv(rows, view) {
    const header = [
        "Member",
        "Member No",
        "Account No",
        "Loan Product",
        "Principal",
        "Interest",
        "Processing Fee",
        "Outstanding",
        "Status",
        "Arrears Stage",
        "Days Overdue",
        "Last Payment",
    ];
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = rows.map((d) =>
        [
            d.member_name,
            d.member_no,
            d.account_number,
            d.loan_product,
            d.principal,
            d.total_interest,
            d.processing_fee,
            d.outstanding_balance,
            d.status,
            d.arrears_stage || "Current",
            d.days_in_arrears || 0,
            d.last_payment_date || "",
        ]
            .map(esc)
            .join(",")
    );
    const blob = new Blob([[header.map(esc).join(","), ...lines].join("\n")], {
        type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = view === "Defaulted" ? "defaulters.csv" : "debtors.csv";
    a.click();
    URL.revokeObjectURL(url);
}

export default function DebtorsList() {
    const { data, isLoading, error } = useFetchDebtors();
    const [view, setView] = useState("all");

    const debtors = data?.debtors || [];
    const rows = useMemo(
        () =>
            view === "all"
                ? debtors
                : debtors.filter((d) => (d.arrears_stage || "Current") === view),
        [debtors, view]
    );
    const rowsTotal = rows.reduce((t, d) => t + parseFloat(d.outstanding_balance || 0), 0);

    if (isLoading) return <MemberLoadingSpinner />;
    if (error) return <div className="p-8 text-center text-red-500">Failed to load debtors list.</div>;

    const { total_outstanding, generated_at } = data;
    const defaultedCount =
        data.defaulted_count ?? debtors.filter((d) => d.arrears_stage === "Defaulted").length;
    const arrearsCount =
        data.arrears_count ?? debtors.filter((d) => d.arrears_stage === "In Arrears").length;

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <CardTitle>{view === "Defaulted" ? "Defaulters List" : "Debtors Report"}</CardTitle>
                        <CardDescription>
                            As of {new Date(generated_at).toLocaleString()}
                        </CardDescription>
                    </div>
                    <div className="text-left sm:text-right">
                        <p className="text-sm text-muted-foreground">Total Outstanding</p>
                        <p className="text-xl font-bold text-red-600">
                            {formatCurrency(total_outstanding)}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    <div className="rounded border border-red-200 bg-red-50 p-3">
                        <p className="text-xs text-red-700">Defaulted loans</p>
                        <p className="text-lg font-semibold text-red-700">
                            {defaultedCount} · {formatCurrency(data.defaulted_outstanding || 0)}
                        </p>
                    </div>
                    <div className="rounded border border-amber-200 bg-amber-50 p-3">
                        <p className="text-xs text-amber-800">In arrears (not yet defaulted)</p>
                        <p className="text-lg font-semibold text-amber-800">
                            {arrearsCount} · {formatCurrency(data.arrears_outstanding || 0)}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-4">
                    {VIEWS.map((v) => (
                        <Button
                            key={v.value}
                            size="sm"
                            variant={view === v.value ? "default" : "outline"}
                            className={view === v.value ? "bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white" : ""}
                            onClick={() => setView(v.value)}
                        >
                            {v.label}
                        </Button>
                    ))}
                    <Button
                        size="sm"
                        variant="outline"
                        className="ml-auto"
                        disabled={rows.length === 0}
                        onClick={() => downloadCsv(rows, view)}
                    >
                        Download CSV
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                    Showing {rows.length} loan{rows.length === 1 ? "" : "s"}, {formatCurrency(rowsTotal)} outstanding.
                    Stages update daily; the day limits are in Accounting → Settings.
                </p>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Member</TableHead>
                                <TableHead>Account No</TableHead>
                                <TableHead>Loan Product</TableHead>
                                <TableHead>Principal</TableHead>
                                <TableHead>Interest</TableHead>
                                <TableHead>Pro. Fees</TableHead>
                                <TableHead>Outstanding</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Days Overdue</TableHead>
                                <TableHead>Last Payment</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {rows.map((debtor) => {
                                const stage = debtor.arrears_stage || "Current";
                                return (
                                    <TableRow key={debtor.account_number}>
                                        <TableCell className="font-medium">
                                            <div>{debtor.member_name}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {debtor.member_no}
                                            </div>
                                        </TableCell>
                                        <TableCell>{debtor.account_number}</TableCell>
                                        <TableCell>{debtor.loan_product}</TableCell>
                                        <TableCell>{formatCurrency(debtor.principal)}</TableCell>
                                        <TableCell>{formatCurrency(debtor.total_interest)}</TableCell>
                                        <TableCell>{formatCurrency(debtor.processing_fee)}</TableCell>
                                        <TableCell>{formatCurrency(debtor.outstanding_balance)}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1 items-start">
                                                <Badge variant="outline">{debtor.status}</Badge>
                                                <Badge variant="outline" className={STAGE_STYLES[stage] || ""}>
                                                    {stage}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell>{debtor.days_in_arrears || 0}</TableCell>
                                        <TableCell>
                                            {debtor.last_payment_date
                                                ? new Date(debtor.last_payment_date).toLocaleDateString()
                                                : "None"}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {rows.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={10} className="text-center h-24 text-muted-foreground">
                                        {view === "Defaulted" ? "No defaulted loans." : "No debtors found."}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
