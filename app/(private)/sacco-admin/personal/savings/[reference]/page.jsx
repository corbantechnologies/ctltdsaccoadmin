"use client";

import React, { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { useParams } from "next/navigation";
import { useFetchSavingDetail } from "@/hooks/savings/actions";
import { useFetchMember } from "@/hooks/members/actions";
import MemberLoadingSpinner from "@/components/general/MemberLoadingSpinner";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import MpesaCreateDepositForm from "@/forms/savingsdeposits/MpesaCreateDepositForm";

function SavingsDetail() {
  const { reference } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [monthFilter, setMonthFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const itemsPerPage = 50;

  const {
    isLoading: isLoadingSaving,
    data: saving,
    refetch: refetchSaving,
  } = useFetchSavingDetail(reference);

  const {
    isLoading: isLoadingMember,
    data: member,
    refetch: refetchMember,
  } = useFetchMember();

  // --- Computed Data ---
  const allTransactions = useMemo(() => {
    if (!saving) return [];
    const deposits = (saving.deposits || []).map((deposit) => ({
      ...deposit,
      type: "Deposit",
      balance: saving.balance, // Note: History balance might need backend support, usage current balance for now or individual transaction balance if available
      method: deposit.payment_method || "N/A",
      status: deposit.transaction_status || "Completed",
      date: deposit.created_at,
    }));
    const withdrawals = (saving.withdrawals || []).map((withdrawal) => ({
      ...withdrawal,
      type: "Withdrawal",
      balance: saving.balance,
      method: withdrawal.payment_method || "N/A",
      status: withdrawal.transaction_status || "Completed",
      date: withdrawal.created_at,
    }));
    return [...deposits, ...withdrawals].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
  }, [saving]);

  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((t) => {
      const tDate = new Date(t.date);
      if (monthFilter) {
        const [year, month] = monthFilter.split("-").map(Number);
        const start = startOfMonth(new Date(year, month - 1));
        const end = endOfMonth(new Date(year, month - 1));
        if (!isWithinInterval(tDate, { start, end })) return false;
      }
      if (statusFilter && t.status !== statusFilter) return false;
      return true;
    });
  }, [allTransactions, monthFilter, statusFilter]);

  // Pagination
  const totalItems = filteredTransactions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // --- Helpers ---
  const formatCurrency = (amount) =>
    `KES ${parseFloat(amount || 0).toFixed(2)}`;
  const formatDate = (dateStr) =>
    dateStr ? format(new Date(dateStr), "MMM dd, yyyy") : "N/A";

  // --- PDF Generator ---
  const generateTransactionPDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    let y = 20;

    doc.setFontSize(18);
    doc.setTextColor(4, 94, 50);
    doc.text("Savings Transaction Report", margin, y);
    y += 10;

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${format(new Date(), "PPpp")}`, margin, y);
    y += 15;

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Member: ${member.first_name} ${member.last_name}`, margin, y);
    y += 6;
    doc.text(`Account Type: ${saving.account_type}`, margin, y);
    y += 6;
    doc.text(`Account Number: ${saving.account_number}`, margin, y);
    y += 15;

    autoTable(doc, {
      startY: y,
      head: [["Date", "Type", "Amount", "Method", "Status"]],
      body: filteredTransactions.map((t) => [
        formatDate(t.date),
        t.type,
        formatCurrency(t.amount),
        t.method,
        t.status,
      ]),
      theme: "striped",
      headStyles: { fillColor: [4, 94, 50] },
    });

    doc.save(`savings_report_${saving.account_number}.pdf`);
  };

const PersonalSavingDetailSkeleton = () => (
  <div className="mx-auto p-4 sm:p-6 space-y-6 animate-pulse">
    <div className="h-4 w-48 bg-slate-200 rounded" />
    <div className="flex justify-between items-center">
      <div className="space-y-2">
        <div className="h-6 w-64 bg-slate-200 rounded" />
        <div className="h-4 w-40 bg-slate-200 rounded" />
      </div>
      <div className="h-10 w-32 bg-slate-200 rounded" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="h-24 bg-slate-200 rounded-lg" />
          <div className="h-24 bg-slate-200 rounded-lg" />
        </div>
        <div className="h-96 bg-slate-200 rounded-lg" />
      </div>
      <div className="h-96 bg-slate-200 rounded-lg" />
    </div>
  </div>
);

  if (isLoadingSaving || isLoadingMember) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <PersonalSavingDetailSkeleton />
      </div>
    );
  }
  if (!saving || !member)
    return (
      <div className="p-8 text-center text-muted-foreground">
        Savings account not found.
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="mx-auto p-4 sm:p-6  space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/sacco-admin/personal">
                Personal Profile
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbPage>{saving.account_type}</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-semibold text-gray-900">
                {saving.account_type}
              </h1>
              <Badge
                variant={saving.is_active ? "default" : "secondary"}
                className={saving.is_active ? "bg-[#045e32]" : ""}
              >
                {saving.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-muted-foreground font-mono">
              {saving.account_number}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              className="bg-[#045e32] hover:bg-[#034625]"
              onClick={() => setDepositModalOpen(true)}
            >
              Deposit
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 rounded bg-gray-200 p-1 w-fit">
          {["overview", "transactions"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                                w-full rounded py-2.5 px-6 text-sm font-medium leading-5 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2
                                ${activeTab === tab
                  ? "bg-white text-[#045e32] shadow"
                  : "text-gray-600 hover:bg-white/[0.12] hover:text-gray-800"
                }
                            `}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#045e32]">
                    Account Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">
                      Available Balance
                    </span>
                    <span className="font-semibold text-xl text-[#045e32]">
                      {formatCurrency(saving.balance)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Interest Rate</span>
                    <span className="font-semibold">
                      {saving.account_type_details?.interest_rate}% p.a
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Currency</span>
                    <span className="font-semibold">
                      {saving.deposits?.[0]?.currency || "KES"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-[#045e32]">
                    Account Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Account Name</span>
                    <span className="font-semibold">
                      {saving.account_type_details?.name}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Date Opened</span>
                    <span className="font-semibold">
                      {formatDate(saving.created_at)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Last Updated</span>
                    <span className="font-semibold">
                      {formatDate(saving.updated_at)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "transactions" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>
                    Recent deposits and withdrawals
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <select
                    className="h-9 w-[150px] rounded border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={monthFilter}
                    onChange={(e) => setMonthFilter(e.target.value)}
                  >
                    <option value="">All Months</option>
                    {/* Can populate months dynamically if needed */}
                  </select>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={generateTransactionPDF}
                  >
                    Download PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedTransactions.map((t, i) => (
                        <TableRow key={i}>
                          <TableCell>{formatDate(t.date)}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium 
                                                        ${t.type ===
                                  "Withdrawal"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-green-100 text-green-800"
                                }`}
                            >
                              {t.type}
                            </span>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(t.amount)}
                          </TableCell>
                          <TableCell>{t.method}</TableCell>
                          <TableCell>{t.status}</TableCell>
                        </TableRow>
                      ))}
                      {paginatedTransactions.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center h-24 text-muted-foreground"
                          >
                            No transactions found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-end space-x-2 py-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <MpesaCreateDepositForm
        isOpen={depositModalOpen}
        onClose={() => setDepositModalOpen(false)}
        savings_account={saving}
      />
    </div>
  );
}

export default SavingsDetail;
