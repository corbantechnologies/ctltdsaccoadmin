import React, { useState } from "react";
import { useFetchPnL } from "@/hooks/financials/actions";
import MemberLoadingSpinner from "@/components/general/MemberLoadingSpinner";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function PnLReport() {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [appliedStartDate, setAppliedStartDate] = useState("");
    const [appliedEndDate, setAppliedEndDate] = useState("");
    const { data, isLoading, error } = useFetchPnL(appliedStartDate, appliedEndDate);

    const handleApply = () => {
        setAppliedStartDate(startDate);
        setAppliedEndDate(endDate);
    };

    if (isLoading) return <MemberLoadingSpinner />;
    if (error || !data) return <div className="p-12 text-center text-muted-foreground">Unable to load Profit & Loss</div>;

    const { revenue, expenses, net_income, period } = data;

    return (
        <Card>
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <CardTitle>Profit & Loss Statement</CardTitle>
                    <CardDescription>
                        {new Date(period.start).toLocaleDateString()} — {new Date(period.end).toLocaleDateString()}
                    </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="startDate" className="whitespace-nowrap text-sm text-muted-foreground">Start Date:</Label>
                        <Input
                            type="date"
                            id="startDate"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-auto"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Label htmlFor="endDate" className="whitespace-nowrap text-sm text-muted-foreground">End Date:</Label>
                        <Input
                            type="date"
                            id="endDate"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-auto"
                        />
                    </div>
                    <Button onClick={handleApply} size="sm">Apply</Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow><TableHead>Item</TableHead><TableHead className="text-right">Amount</TableHead></TableRow>
                    </TableHeader>
                    <TableBody>
                        {/* Revenue */}
                        <TableRow className="bg-muted/30"><TableCell colSpan={2} className="font-semibold text-green-700">Revenue</TableCell></TableRow>
                        {revenue.accounts.map((acc) => (
                            <TableRow key={acc.id}>
                                <TableCell>{acc.name} ({acc.code})</TableCell>
                                <TableCell className="text-right">{formatCurrency(acc.balance)}</TableCell>
                            </TableRow>
                        ))}
                        <TableRow className="font-bold bg-muted/70">
                            <TableCell>Total Revenue</TableCell>
                            <TableCell className="text-right">{formatCurrency(revenue.total)}</TableCell>
                        </TableRow>

                        {/* Expenses */}
                        <TableRow className="bg-muted/30"><TableCell colSpan={2} className="font-semibold text-red-700 pt-6">Expenses</TableCell></TableRow>
                        {expenses.accounts.map((acc) => (
                            <TableRow key={acc.id}>
                                <TableCell>{acc.name} ({acc.code})</TableCell>
                                <TableCell className="text-right">{formatCurrency(acc.balance)}</TableCell>
                            </TableRow>
                        ))}
                        <TableRow className="font-bold bg-muted/70">
                            <TableCell>Total Expenses</TableCell>
                            <TableCell className="text-right">{formatCurrency(expenses.total)}</TableCell>
                        </TableRow>

                        {/* Net Income */}
                        <TableRow className="bg-primary/5 border-t-2 border-primary">
                            <TableCell className="font-bold text-lg">Net Income / (Loss)</TableCell>
                            <TableCell className={`text-right font-bold text-lg ${net_income >= 0 ? "text-green-600" : "text-red-600"}`}>
                                {formatCurrency(net_income)}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}