import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { PiggyBank, CreditCard, TrendingUp, Users, CircleDollarSign } from "lucide-react";

const SummaryCard = ({ title, amount, count, year, icon: Icon, color }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className={`h-5 w-5 ${color}`} />
        </CardHeader>
        <CardContent>
            <div className="text-xl sm:text-xl font-semibold">
                {formatCurrency(amount || 0)}
            </div>
            {count !== undefined && (
                <p className="text-xs text-muted-foreground mt-1">{count} transactions dated in {year}</p>
            )}
        </CardContent>
    </Card>
);

// Activity for the chosen year (by transaction date), not balances.
// Balances are in the statements below (balance sheet, trial balance).
export default function SaccoSummaryOverview({ summary, year }) {
    if (!summary) return null;

    return (
        <div className="space-y-2">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <SummaryCard
                title={`Savings deposits received in ${year}`}
                year={year}
                amount={summary?.totals?.savings_deposits}
                count={summary?.totals?.counts?.savings_deposits}
                icon={PiggyBank}
                color="text-green-600"
            />
            <SummaryCard
                title={`Loans disbursed in ${year}`}
                year={year}
                amount={summary?.totals?.loan_disbursements}
                count={summary?.totals?.counts?.loan_disbursements}
                icon={CreditCard}
                color="text-blue-600"
            />
            <SummaryCard
                title={`Loan repayments received in ${year}`}
                year={year}
                amount={summary?.totals?.loan_repayments}
                count={summary?.totals?.counts?.loan_repayments}
                icon={TrendingUp}
                color="text-indigo-600"
            />
            <SummaryCard
                title={`Fee payments received in ${year}`}
                year={year}
                amount={summary?.totals?.fee_payments}
                count={summary?.totals?.counts?.fee_payments}
                icon={CircleDollarSign}
                color="text-purple-600"
            />
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">New members in {year}</CardTitle>
                    <Users className="h-5 w-5 text-orange-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-xl sm:text-xl font-semibold">
                        {summary?.totals?.total_new_members || 0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Joined in {year}</p>
                </CardContent>
            </Card>
        </div>
        <p className="text-xs text-muted-foreground">
            These cards count transactions dated in {year}. Change the year at the top to see other years.
            For balances to date, see the Balance Sheet and Trial Balance below.
        </p>
        </div>
    );
}
