"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import {
  PiggyBank,
  CreditCard,
  CircleDollarSign,
} from "lucide-react";

import { downloadMemberSummary } from "@/services/membersummary";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { Download, Loader2 } from "lucide-react";

export default function MemberFinancialSummary({ summary, memberNo, summaryYear, setSummaryYear }) {
  const token = useAxiosAuth();
  const [isDownloading, setIsDownloading] = useState(false);
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const handleDownload = async () => {
    if (!memberNo) return;
    setIsDownloading(true);
    try {
      const blob = await downloadMemberSummary(memberNo, summary.year, token);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Financial_Summary_${summary.year}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success("Download started");
    } catch (error) {
      console.error(error);
      toast.error("Failed to download summary");
    } finally {
      setIsDownloading(false);
    }
  };

  if (!summary) return null;

  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <CardTitle className="text-xl">Financial Summary</CardTitle>
          <CardDescription>
            Yearly breakdown of your financial activities
          </CardDescription>
        </div>

        <div className="flex items-center gap-3">
          {summaryYear && setSummaryYear && (
            <Select 
              value={summaryYear.toString()} 
              onValueChange={(val) => setSummaryYear(parseInt(val))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map(y => (
                  <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {memberNo && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Download PDF
          </Button>
        )}
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="savings" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 h-auto p-1 bg-muted">
            <TabsTrigger
              value="savings"
              className="flex items-center justify-center gap-2 py-3 text-sm"
            >
              <PiggyBank className="h-4 w-4" />
              <span className="xs:inline">Savings</span>
            </TabsTrigger>
            <TabsTrigger
              value="loans"
              className="flex items-center justify-center gap-2 py-3 text-sm"
            >
              <CreditCard className="h-4 w-4" />
              <span className="xs:inline">Loans</span>
            </TabsTrigger>
            <TabsTrigger
              value="fees"
              className="flex items-center justify-center gap-2 py-3 text-sm"
            >
              <CircleDollarSign className="h-4 w-4" />
              <span className="xs:inline">Fees</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="savings" className="mt-0">
            <SummaryTabContent
              data={summary.savings}
              type="savings"
              emptyMessage="No savings account activity found for this year."
            />
          </TabsContent>

          <TabsContent value="loans" className="mt-0">
            <SummaryTabContent
              data={summary.loans}
              type="loans"
              emptyMessage="No loan activity found for this year."
            />
          </TabsContent>

          <TabsContent value="fees" className="mt-0">
            <SummaryTabContent
              data={summary.fees}
              type="fees"
              emptyMessage="No fee activity found for this year."
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function SummaryTabContent({ data, type, emptyMessage }) {
  const [selectedAccountIndex, setSelectedAccountIndex] = useState(0);

  if (!data || data.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground border rounded-lg bg-muted/30">
        {emptyMessage}
      </div>
    );
  }

  const selectedAccount = data[selectedAccountIndex];

  useEffect(() => {
    if (selectedAccountIndex >= data.length) {
      setSelectedAccountIndex(0);
    }
  }, [data, selectedAccountIndex]);

  const getAccountLabel = (account) => {
    if (type === "savings")
      return `${account.type} - ${account.account_number}`;
    if (type === "loans")
      return `${account.product} - ${account.account_number}`;
    if (type === "fees")
      return `${account.fee_type} - ${account.account_number}`;
    return account.account_number;
  };

  return (
    <div className="space-y-6">
      {/* Account Selector */}
      {data.length > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            Select Account:
          </span>
          <Select
            value={selectedAccountIndex.toString()}
            onValueChange={(val) => setSelectedAccountIndex(parseInt(val))}
          >
            <SelectTrigger className="w-full sm:w-[320px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {data.map((acc, idx) => (
                <SelectItem key={idx} value={idx.toString()}>
                  {getAccountLabel(acc)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Totals Summary Cards */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${type === 'savings' ? 4 : 5} gap-4`}>
        {type === "savings" && (() => {
          const openingBalance = selectedAccount.monthly_summary?.[0]?.opening_balance || 0;
          const closingBalance = selectedAccount.monthly_summary?.[11]?.closing_balance || 0;
          const totalWithdrawals = selectedAccount.monthly_summary?.reduce((sum, m) => sum + parseFloat(m.withdrawals || 0), 0) || 0;
          
          return (
            <>
              <div className="bg-secondary/30 p-5 rounded-xl border">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Opening Balance
                </p>
                <p className="font-bold text-2xl">
                  {formatCurrency(openingBalance)}
                </p>
              </div>
              <div className="bg-secondary/30 p-5 rounded-xl border">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Total Deposits
                </p>
                <p className="font-bold text-2xl text-green-700">
                  {formatCurrency(selectedAccount.totals?.total_deposits || 0)}
                </p>
              </div>
              <div className="bg-secondary/30 p-5 rounded-xl border">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Total Withdrawals
                </p>
                <p className="font-bold text-2xl text-red-700">
                  {formatCurrency(totalWithdrawals)}
                </p>
              </div>
              <div className="bg-secondary/30 p-5 rounded-xl border">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Closing Balance
                </p>
                <p className="font-bold text-2xl text-blue-700">
                  {formatCurrency(closingBalance)}
                </p>
              </div>
            </>
          );
        })()}

        {type === "loans" && (() => {
          const openingBalance = selectedAccount.monthly_summary?.[0]?.opening_balance || 0;
          const closingBalance = selectedAccount.monthly_summary?.[11]?.closing_balance || 0;
          
          return (
          <>
            <div className="bg-secondary/30 p-5 rounded-xl border">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Opening Balance
              </p>
              <p className="font-bold text-2xl">
                {formatCurrency(openingBalance)}
              </p>
            </div>
            <div className="bg-secondary/30 p-5 rounded-xl border">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Principal
              </p>
              <p className="font-bold text-2xl">
                {formatCurrency(selectedAccount.initial_principal || 0)}
              </p>
            </div>
            <div className="bg-secondary/30 p-5 rounded-xl border">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Disbursed
              </p>
              <p className="font-bold text-2xl text-blue-700">
                {formatCurrency(selectedAccount.totals?.total_disbursed || 0)}
              </p>
            </div>
            <div className="bg-secondary/30 p-5 rounded-xl border">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Repaid
              </p>
              <p className="font-bold text-2xl text-green-700">
                {formatCurrency(selectedAccount.totals?.total_repaid || 0)}
              </p>
            </div>
            <div className="bg-secondary/30 p-5 rounded-xl border">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Closing Balance
              </p>
              <p className="font-bold text-2xl text-red-700">
                {formatCurrency(closingBalance)}
              </p>
            </div>
          </>
          );
        })()}

        {type === "fees" && (() => {
          const openingBalance = selectedAccount.monthly_summary?.[0]?.opening_balance || 0;
          return (
          <>
            <div className="bg-secondary/30 p-5 rounded-xl border">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Opening Balance
              </p>
              <p className="font-bold text-2xl">
                {formatCurrency(openingBalance)}
              </p>
            </div>
            <div className="bg-secondary/30 p-5 rounded-xl border">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Target Amount
              </p>
              <p className="font-bold text-2xl">
                {formatCurrency(selectedAccount.totals?.target_amount || 0)}
              </p>
            </div>
            <div className="bg-secondary/30 p-5 rounded-xl border">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Paid (Year)
              </p>
              <p className="font-bold text-2xl text-green-700">
                {formatCurrency(selectedAccount.totals?.total_paid_yearly || 0)}
              </p>
            </div>
            <div className="bg-secondary/30 p-5 rounded-xl border">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Total Paid
              </p>
              <p className="font-bold text-2xl text-green-700">
                {formatCurrency(selectedAccount.totals?.total_paid_to_date || 0)}
              </p>
            </div>
            <div className="bg-secondary/30 p-5 rounded-xl border">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Remaining
              </p>
              <p className="font-bold text-2xl text-red-700">
                {formatCurrency(selectedAccount.totals?.balance_remaining || 0)}
              </p>
            </div>
          </>
          );
        })()}
      </div>

      {/* Monthly Table - Horizontal Scroll on Mobile */}
      <div className="rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead className="w-[110px] sticky left-0 bg-muted z-10">Month</TableHead>
                <TableHead className="text-right">Opening</TableHead>

                {type === "savings" && (
                  <>
                    <TableHead className="text-right text-green-600">Deposits</TableHead>
                    <TableHead className="text-right text-red-600">Withdrawals</TableHead>
                  </>
                )}

                {type === "loans" && (
                  <>
                    <TableHead className="text-right text-blue-600">Disbursed</TableHead>
                    <TableHead className="text-right text-green-600">Paid</TableHead>
                  </>
                )}

                {type === "fees" && (
                  <TableHead className="text-right text-green-600">Payments</TableHead>
                )}

                <TableHead className="text-right font-bold bg-muted/80">Closing</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedAccount.monthly_summary.map((month, index) => (
                <TableRow key={index} className="hover:bg-muted/50">
                  <TableCell className="font-medium sticky left-0 bg-background z-10 border-r">
                    {month.month}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatCurrency(month.opening_balance)}
                  </TableCell>

                  {type === "savings" && (
                    <>
                      <TableCell className="text-right font-medium">
                        {month.deposits > 0 ? (
                          <span className="text-green-700">+{formatCurrency(month.deposits)}</span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {month.withdrawals > 0 ? (
                          <span className="text-red-700">-{formatCurrency(month.withdrawals)}</span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    </>
                  )}

                  {type === "loans" && (
                    <>
                      <TableCell className="text-right font-medium">
                        {month.disbursed > 0 ? (
                          <span className="text-blue-700">+{formatCurrency(month.disbursed)}</span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {month.paid > 0 ? (
                          <span className="text-green-700">-{formatCurrency(month.paid)}</span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    </>
                  )}

                  {type === "fees" && (
                    <TableCell className="text-right font-medium">
                      {month.payments > 0 ? (
                        <span className="text-green-700">-{formatCurrency(month.payments)}</span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                  )}

                  <TableCell className="text-right font-bold bg-muted/30">
                    {formatCurrency(month.closing_balance)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}