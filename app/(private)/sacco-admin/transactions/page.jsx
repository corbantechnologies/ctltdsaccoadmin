"use client";

import React, { useState } from "react";
import LoadingSpinner from "@/components/general/LoadingSpinner";
import AccountsListTable from "@/components/transactions/AccountsListTable";
import StatsCard from "@/components/saccoadmin/StatsCard";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useFetchAccountsList } from "@/hooks/transactions/actions";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { downloadAccountsListCSV } from "@/services/transactions";
import BulkAccountsUpload from "@/forms/transactions/BulkAccountsUpload";
import { Users, Wallet, CreditCard, ChevronDown, FileDown, FileUp } from "lucide-react";
import toast from "react-hot-toast";

const TableSkeleton = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="space-y-4 w-full animate-pulse p-4">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex gap-4 items-center py-2 border-b border-slate-100 last:border-0">
          {[...Array(cols)].map((_, j) => (
            <div key={j} className="h-6 bg-slate-100 rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
};

function TransactionsPage() {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const token = useAxiosAuth();

  const {
    isLoading: isLoadingAccounts,
    data: accountsList,
    refetch: refetchAccounts,
  } = useFetchAccountsList();

  const accounts = accountsList?.results || accountsList || [];

  // Calculate stats
  const totalAccounts = accounts.length;

  const totalSavings = accounts.reduce((acc, user) => {
    const userSavings = user.savings_accounts?.reduce(
      (sum, [_, __, balance]) => sum + parseFloat(balance || 0),
      0
    ) || 0;
    return acc + userSavings;
  }, 0);

  const totalLoans = accounts.reduce((acc, user) => {
    const userLoans = user.loan_accounts?.reduce(
      (sum, [_, __, balance]) => sum + parseFloat(balance || 0),
      0
    ) || 0;
    return acc + userLoans;
  }, 0);

  const formatCurrencyValue = (val) => {
    return `KES ${val.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto p-4 sm:p-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-xl lg:text-xl font-semibold ">
              Accounts List
            </h1>
            <p className="text-gray-500 mt-1">Manage member account balances</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button className="bg-primary hover:bg-[#022007] text-white text-sm sm:text-base py-2 px-3 sm:px-4 flex-1 sm:flex-none">
                  <FileDown className="h-4 w-4 mr-2" /> Download <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2" align="end">
                <div className="flex flex-col space-y-1">
                  <Button
                    variant="ghost"
                    className="justify-start font-normal w-full"
                    onClick={() => {
                      setUploadModalOpen(true);
                      setPopoverOpen(false);
                    }}
                  >
                    <FileUp className="mr-2 h-4 w-4" /> Bulk CSV Upload
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start font-normal w-full"
                    onClick={async () => {
                      try {
                        await downloadAccountsListCSV(token);
                        setPopoverOpen(false);
                        toast.success("Accounts list download started");
                      } catch (error) {
                        toast.error("Download failed");
                      }
                    }}
                  >
                    <FileDown className="mr-2 h-4 w-4" /> Download Accounts List
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Stats Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <StatsCard
            title="Total Registered Accounts"
            value={totalAccounts}
            Icon={Users}
            description="Active members with accounts"
          />
          <StatsCard
            title="Total Savings Portfolio"
            value={formatCurrencyValue(totalSavings)}
            Icon={Wallet}
            description="Aggregated savings balance"
          />
          <StatsCard
            title="Total Loans Outstanding"
            value={formatCurrencyValue(totalLoans)}
            Icon={CreditCard}
            description="Aggregated outstanding loans"
          />
        </div>

        {/* Accounts List Table */}
        {isLoadingAccounts ? (
          <TableSkeleton rows={8} cols={5} />
        ) : (
          <AccountsListTable accountsList={accountsList} />
        )}

        {/* Bulk Upload Modal */}
        <BulkAccountsUpload
          openModal={uploadModalOpen}
          closeModal={() => setUploadModalOpen(false)}
          onSuccess={() => refetchAccounts()}
        />
      </div>
    </div>
  );
}

export default TransactionsPage;