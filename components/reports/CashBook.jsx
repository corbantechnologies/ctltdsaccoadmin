import React, { useState } from "react";
import { useFetchCashBook } from "@/hooks/financials/actions";
import MemberLoadingSpinner from "@/components/general/MemberLoadingSpinner";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function CashBook() {
    const [asOfDate, setAsOfDate] = useState("");
    const [appliedDate, setAppliedDate] = useState("");
    const { data, isLoading, error } = useFetchCashBook(appliedDate);

    const handleApply = () => {
        setAppliedDate(asOfDate);
    };

    if (isLoading) return <MemberLoadingSpinner />;
    if (error || !data) return <div className="p-12 text-center text-muted-foreground">Unable to load Cash Book</div>;

    const { accounts, total_cash, as_of, note } = data; 

    return (
        <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <CardTitle>Cash Book</CardTitle>
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
                <div className="text-right mb-4">
                    <p className="text-sm text-muted-foreground">Total Cash & Bank</p>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(total_cash)}</p>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Account</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-right">Balance</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {accounts.map((acc) => (
                            <TableRow key={acc.id}>
                                <TableCell>{acc.name}</TableCell>
                                <TableCell className="font-mono">{acc.code}</TableCell>
                                <TableCell>{acc.category}</TableCell>
                                <TableCell className="text-right font-medium">{formatCurrency(Math.abs(acc.balance))}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {note && <p className="text-xs text-muted-foreground mt-4 italic">{note}</p>}
            </CardContent>
        </Card>
    );
}