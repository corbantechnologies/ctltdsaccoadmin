"use client";

import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, Form, Formik } from "formik";
import { createSavingsDeposit } from "@/services/savingsdeposits";
import { useFetchPaymentAccounts } from "@/hooks/paymentaccounts/actions";
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

function CreateDepositAdmin({ isOpen, onClose, refetchMember, accounts }) {
  const [loading, setLoading] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const token = useAxiosAuth();
  const { data: paymentAccounts, isLoading: isLoadingPayment } = useFetchPaymentAccounts();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="">
            Create New Savings Deposit
          </DialogTitle>
        </DialogHeader>

        <Formik
          initialValues={{
            savings_account: accounts?.savings_account || "",
            amount: 0,
            description: "",
            payment_method: "",
            deposit_type: "",
            transaction_status: "Completed",
            transaction_date: "",
            is_active: true,
          }}
          onSubmit={async (values) => {
            setLoading(true);
            try {
              await createSavingsDeposit(values, token);
              toast?.success("Deposit created successfully!");
              onClose();
              refetchMember();
            } catch (error) {
              toast?.error("Failed to create deposit!");
            } finally {
              setLoading(false);
            }
          }}
        >
          {({ values, setFieldValue }) => (
            <Form className="space-y-4">
              <div className="space-y-2 flex flex-col">
                <Label htmlFor="savings_account" className="text-black">
                  Member Savings Account
                </Label>
                <Popover open={accountOpen} onOpenChange={setAccountOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={accountOpen}
                      className={cn(
                        "w-full justify-between border-black font-normal",
                        !values.savings_account && "text-muted-foreground"
                      )}
                    >
                      {values.savings_account
                        ? (() => {
                            const selected = accounts?.find(
                              (a) => a.account_number === values.savings_account
                            );
                            return selected ? (
                              <span className="truncate">
                                {selected.member_name} - {selected.account_number} ({selected.account_type})
                              </span>
                            ) : (
                              "Select account"
                            );
                          })()
                        : "Select account..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
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
                                setFieldValue("savings_account", account.account_number);
                                setAccountOpen(false);
                              }}
                            >
                              <span>
                                {account.member_name} - {account.account_number} ({account.account_type})
                              </span>
                              {values.savings_account === account.account_number && (
                                <Check className="h-4 w-4 shrink-0" />
                              )}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-black">
                  Amount
                </Label>
                <Field
                  as={Input}
                  type="number"
                  id="amount"
                  name="amount"
                  className="border-black "
                  placeholder="Enter deposit amount"
                  required
                  min="0.01"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transaction_date" className="text-black">
                  Transaction Date
                </Label>
                <Field
                  as={Input}
                  type="date"
                  id="transaction_date"
                  name="transaction_date"
                  className="border-black "
                  placeholder="Enter transaction date"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_method" className="text-black">
                  Payment Method
                </Label>
                <Select
                  value={values.payment_method}
                  onValueChange={(value) => setFieldValue("payment_method", value)}
                  disabled={isLoadingPayment}
                  required
                >
                  <SelectTrigger className="border-black w-full">
                    <SelectValue
                      placeholder={
                        isLoadingPayment ? "Loading..." : "Select payment method"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentAccounts?.map((method) => (
                      <SelectItem key={method.id || method.reference} value={method.name}>
                        {method.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deposit_type" className="text-black">
                  Deposit Type
                </Label>
                <Select
                  value={values.deposit_type}
                  onValueChange={(value) => setFieldValue("deposit_type", value)}
                  required
                >
                  <SelectTrigger className="border-black w-full">
                    <SelectValue placeholder="Select deposit type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Opening Balance">Opening Balance</SelectItem>
                    <SelectItem value="Payroll Deduction">Payroll Deduction</SelectItem>
                    <SelectItem value="Individual Deposit">Individual Deposit</SelectItem>
                    <SelectItem value="Dividend Deposit">Dividend Deposit</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button
                  type="submit"
                  size={"sm"}
                  disabled={loading}
                  className="bg-primary hover:bg-[#022007] text-white text-sm sm:text-base py-2 px-3 sm:px-4 flex-1 sm:flex-none"
                >
                  {loading ? "Depositing..." : "Deposit"}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}

export default CreateDepositAdmin;
