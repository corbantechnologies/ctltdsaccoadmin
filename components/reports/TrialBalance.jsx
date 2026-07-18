import React, { useState } from "react";
import { useFetchTrialBalance } from "@/hooks/financials/actions";
import MemberLoadingSpinner from "@/components/general/MemberLoadingSpinner";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function TrialBalance() {
    const [asOfDate, setAsOfDate] = useState("");
    const [appliedDate, setAppliedDate] = useState("");
    const { data, isLoading, error } = useFetchTrialBalance(appliedDate);

    const handleApply = () => {
        setAppliedDate(asOfDate);
    };

    if (isLoading) return <MemberLoadingSpinner />;
    if (error || !data) return <div className="p-12 text-center text-muted-foreground">Unable to load Trial Balance</div>;

    const { accounts, totals, as_of } = data;

    return (
        <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <CardTitle>Trial Balance</CardTitle>
                    <CardDescription>As of {new Date(as_of).toLocaleDateString()}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Label htmlFor="asOfDate" className="whitespace-nowrap text-sm text-muted-foreground">As Of Date:</Label>
                    <Input
                        type="date"
                        id="asOfDate"
                        value={asOfDate}
                        onChange={(e) => setAsOfDate(e.target.value)}
                        className="w-auto"
                    />
                    <Button onClick={handleApply} size="sm">Apply</Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Account</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead className="text-right">Total Debit</TableHead>
                            <TableHead className="text-right">Total Credit</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {accounts.map((acc) => (
                            <TableRow key={acc.code}>
                                <TableCell>{acc.name}</TableCell>
                                <TableCell className="font-mono">{acc.code}</TableCell>
                                <TableCell className="text-right text-emerald-600 font-medium">
                                    {formatCurrency(acc.total_debit)}
                                </TableCell>
                                <TableCell className="text-right text-rose-600 font-medium">
                                    {formatCurrency(acc.total_credit)}
                                </TableCell>
                            </TableRow>
                        ))}
                        <TableRow className="font-bold bg-muted/70">
                            <TableCell colSpan={2}>Grand Total</TableCell>
                            <TableCell className="text-right">{formatCurrency(totals.total_debit)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(totals.total_credit)}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}