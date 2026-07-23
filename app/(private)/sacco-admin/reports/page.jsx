"use client";

import React, { useState } from "react";
import { useFetchSaccoSummary } from "@/hooks/saccosummary/actions";
import { downloadSaccoSummary } from "@/services/saccosummary";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import MemberLoadingSpinner from "@/components/general/MemberLoadingSpinner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDown, Scale } from "lucide-react";
import toast from "react-hot-toast";

import BalanceSheet from "@/components/reports/BalanceSheet";
import PnLReport from "@/components/reports/PnLReport";
import CashBook from "@/components/reports/CashBook";
import TrialBalance from "@/components/reports/TrialBalance";
import SaccoSummaryOverview from "@/components/reports/SaccoSummaryOverview";
import DebtorsList from "@/components/reports/DebtorsList";

export default function SaccoAdminReports() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [isDownloading, setIsDownloading] = useState(false);

  const token = useAxiosAuth();
  const { data: summary, isLoading, error } = useFetchSaccoSummary(selectedYear);

  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const blob = await downloadSaccoSummary(token, selectedYear);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Sacco_Summary_${selectedYear}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Annual summary downloaded successfully");
    } catch (err) {
      toast.error("Failed to download report");
    } finally {
      setIsDownloading(false);
    }
  };

const SaccoReportsSkeleton = () => (
  <div className="flex flex-col space-y-6 p-4 md:p-8 animate-pulse">
    <div className="flex justify-between items-center">
      <div className="space-y-2">
        <div className="h-6 w-48 bg-slate-200 rounded" />
        <div className="h-4 w-64 bg-slate-200 rounded" />
      </div>
      <div className="h-10 w-48 bg-slate-200 rounded" />
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
      <div className="min-h-screen bg-background">
        <SaccoReportsSkeleton />
      </div>
    );
  }
  if (error) return <div className="p-8 text-center text-red-500">Failed to load reports data</div>;

  return (
    <div className="flex flex-col space-y-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Financial Reports</h1>
          <p className="text-muted-foreground">Real-time SACCO financial position and performance</p>
        </div>

        <div className="flex gap-3">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={handleDownload} disabled={isDownloading}>
            <FileDown className="mr-2 h-4 w-4" />
            {isDownloading ? "Downloading..." : "Download Annual Summary"}
          </Button>
        </div>
      </div>

      {/* Summary Overview Cards */}
      <SaccoSummaryOverview summary={summary} />

      {/* Detailed Statements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" /> Detailed Financial Statements
          </CardTitle>
          <CardDescription>Live reports from the General Ledger system</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="balance_sheet" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 mb-6">
              <TabsTrigger value="balance_sheet">Balance Sheet</TabsTrigger>
              <TabsTrigger value="pnl">Profit &amp; Loss</TabsTrigger>
              <TabsTrigger value="trial_balance">Trial Balance</TabsTrigger>
              <TabsTrigger value="cash_book">Cash Book</TabsTrigger>
              <TabsTrigger value="debtors">Debtors List</TabsTrigger>
            </TabsList>

            <TabsContent value="balance_sheet"><BalanceSheet /></TabsContent>
            <TabsContent value="pnl"><PnLReport /></TabsContent>
            <TabsContent value="trial_balance"><TrialBalance /></TabsContent>
            <TabsContent value="cash_book"><CashBook /></TabsContent>
            <TabsContent value="debtors"><DebtorsList/></TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}