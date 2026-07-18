import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { PiggyBank, CreditCard, TrendingUp, Users, CircleDollarSign } from "lucide-react";

const SummaryCard = ({ title, amount, count, icon: Icon, color }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className={`h-5 w-5 ${color}`} />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(amount || 0)}</div>
            {count !== undefined && (
                <p className="text-xs text-muted-foreground mt-1">{count} transactions</p>
            )}
        </CardContent>
    </Card>
);

export default function SaccoSummaryOverview({ summary }) {
    if (!summary) return null;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <SummaryCard
                title="Total Savings"
                amount={summary?.totals?.savings_deposits}
                count={summary?.totals?.counts?.savings_deposits}
                icon={PiggyBank}
                color="text-green-600"
            />
            <SummaryCard
                title="Loans Disbursed"
                amount={summary?.totals?.loan_disbursements}
                count={summary?.totals?.counts?.loan_disbursements}
                icon={CreditCard}
                color="text-blue-600"
            />
            <SummaryCard
                title="Loan Repayments"
                amount={summary?.totals?.loan_repayments}
                count={summary?.totals?.counts?.loan_repayments}
                icon={TrendingUp}
                color="text-indigo-600"
            />
            <SummaryCard
                title="Fee Payments"
                amount={summary?.totals?.fee_payments}
                count={summary?.totals?.counts?.fee_payments}
                icon={CircleDollarSign}
                color="text-purple-600"
            />
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">New Members</CardTitle>
                    <Users className="h-5 w-5 text-orange-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{summary?.totals?.total_new_members || 0}</div>
                    <p className="text-xs text-muted-foreground">Joined this year</p>
                </CardContent>
            </Card>
        </div>
    );
}