"use client";

import { Button } from "@/components/ui/button";
import { Plus, Trash2, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { bulkCreateSavingsDeposits } from "@/services/savingsdeposits";
import { useFetchSavings } from "@/hooks/savings/actions";
import { useFetchPaymentAccounts } from "@/hooks/paymentaccounts/actions";
import React, { useState, useMemo } from "react";
import toast from "react-hot-toast";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function AccountSelect({ value, onChange, accounts, disabled }) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal h-10 text-sm border-slate-200 hover:bg-white focus:ring-1 focus:ring-emerald-600",
            !value && "text-muted-foreground"
          )}
        >
          {value
            ? (() => {
                const selected = accounts?.find(
                  (a) => a.account_number === value
                );
                return selected
                  ? `${selected.member_name} - ${selected.account_number} (${selected.account_type})`
                  : "-- Select Member Account --";
              })()
            : "-- Select Member Account --"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search name or account..." />
          <CommandList>
            <CommandEmpty>No account found.</CommandEmpty>
            <CommandGroup>
              {accounts?.map((account) => (
                <CommandItem
                  key={account.id || account.reference}
                  value={`${account.member_name} ${account.account_number}`}
                  className="flex justify-between"
                  onSelect={() => {
                    onChange(account.account_number);
                    setOpen(false);
                  }}
                >
                  <span>
                    {account.member_name} - {account.account_number} ({account.account_type})
                  </span>
                  {value === account.account_number && (
                    <Check className="h-4 w-4 shrink-0" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Manual Bulk Entry for Savings Deposits
function BulkSavingDepositCreate({ onBatchSuccess }) {
    const [loading, setLoading] = useState(false);
    const token = useAxiosAuth();

    // I need a hook that fetches ALL savings accounts for the sacco
    // I'll check if it exists, if not I'll just use a generic fetch or implement it
    const { data: savingsAccounts, isLoading: isLoadingSavings } = useFetchSavings();
    const { data: paymentAccounts, isLoading: isLoadingPayments } = useFetchPaymentAccounts();

    const emptyDeposit = {
        savings_account: "", // reference
        amount: "",
        transaction_date: new Date().toISOString().split('T')[0],
        payment_method: "", // payment account name
    };

    const [deposits, setDeposits] = useState([{ ...emptyDeposit }]);

    const handleInputChange = (index, field, value) => {
        const newDeposits = [...deposits];
        newDeposits[index][field] = value;
        setDeposits(newDeposits);
    };

    const addDeposit = () => {
        if (deposits.length < 15) {
            setDeposits([...deposits, { ...emptyDeposit }]);
        }
    };

    const removeDeposit = (indexToRemove) => {
        setDeposits(deposits.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            const invalidRow = deposits.find(d => !d.savings_account || !d.amount || !d.payment_method);
            if (invalidRow) {
                toast.error("Please fill all required fields in each row.");
                setLoading(false);
                return;
            }

            await bulkCreateSavingsDeposits({ deposits }, token);
            toast.success("Deposits processed successfully!");
            setDeposits([{ ...emptyDeposit }]);
            if (onBatchSuccess) onBatchSuccess();
        } catch (error) {
            console.error("Bulk deposit error:", error.response?.data);
            toast.error(error.response?.data?.message || "Failed to process deposits.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-[var(--accent)]">Batch Savings Deposit</h2>
                    <p className="text-sm text-gray-500 font-medium">Record multiple member savings deposits manually (max 15).</p>
                </div>
                <Button variant="outline" onClick={() => setDeposits([{ ...emptyDeposit }])} className="text-xs h-8">Clear All</Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    {deposits.map((dep, index) => (
                        <div key={index} className="p-4 border border-slate-100 rounded bg-white shadow-sm hover:shadow-md transition-all relative group border-l-4 border-l-emerald-600">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-50 rounded text-emerald-600 uppercase tracking-widest">Deposit #{index + 1}</span>
                                {deposits.length > 1 && (
                                    <Button type="button" onClick={() => removeDeposit(index)} variant="ghost" className="text-rose-400 hover:text-rose-600 p-1 h-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                <div className="md:col-span-4 space-y-1">
                                    <Label className="text-[10px] uppercase font-bold text-slate-400">Target Savings Account</Label>
                                    <AccountSelect
                                        value={dep.savings_account}
                                        onChange={(val) => handleInputChange(index, "savings_account", val)}
                                        accounts={savingsAccounts?.results}
                                        disabled={isLoadingSavings}
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-1">
                                    <Label className="text-[10px] uppercase font-bold text-slate-400">Amount</Label>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        value={dep.amount}
                                        onChange={(e) => handleInputChange(index, "amount", e.target.value)}
                                        className="h-10 text-sm font-bold border-slate-200 focus:border-emerald-600"
                                    />
                                </div>
                                <div className="md:col-span-3 space-y-1">
                                    <Label className="text-[10px] uppercase font-bold text-slate-400">Transaction Date</Label>
                                    <Input
                                        type="date"
                                        value={dep.transaction_date}
                                        onChange={(e) => handleInputChange(index, "transaction_date", e.target.value)}
                                        className="h-10 text-sm font-bold border-slate-200 focus:border-emerald-600"
                                    />
                                </div>
                                <div className="md:col-span-3 space-y-1">
                                    <Label className="text-[10px] uppercase font-bold text-slate-400">Payment Account</Label>
                                    <select
                                        value={dep.payment_method}
                                        onChange={(e) => handleInputChange(index, "payment_method", e.target.value)}
                                        className="w-full border border-slate-200 rounded px-3 h-10 text-sm focus:ring-1 focus:ring-emerald-600 outline-none"
                                        disabled={isLoadingPayments}
                                    >
                                        <option value="">-- Received To --</option>
                                        {paymentAccounts?.map(acc => (
                                            <option key={acc.reference} value={acc.name}>{acc.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    ))}

                    {deposits.length < 15 && (
                        <Button type="button" variant="outline" onClick={addDeposit} className="w-full border-dashed border-2 border-slate-200 py-4 text-slate-400 hover:text-emerald-600 hover:border-emerald-600 text-xs font-bold transition-all">
                            <Plus className="w-4 h-4 mr-2" /> Add Another Row
                        </Button>
                    )}
                </div>

                <div className="flex justify-end pt-2">
                    <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 px-12 rounded shadow-lg shadow-emerald-50" disabled={loading}>
                        {loading ? "Processing..." : "Commit Deposits"}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default BulkSavingDepositCreate;
