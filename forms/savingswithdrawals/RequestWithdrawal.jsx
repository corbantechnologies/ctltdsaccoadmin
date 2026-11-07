"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, Form, Formik } from "formik";
import toast from "react-hot-toast";
import {
  createSavingsWithdrawals,
  getWithdrawableAmount,
} from "@/services/savingswithdrawals";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";

const formatKES = (value) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(
    Number(value || 0)
  );

// An admin requests a withdrawal from their OWN savings here, as a member.
// Another admin must approve it on the Withdrawals page; the API refuses self-approval.
function RequestWithdrawal({ isOpen, onClose, account, refetchAccount }) {
  const [loading, setLoading] = useState(false);
  const [available, setAvailable] = useState(null);
  const token = useAxiosAuth();
  const authHeader = token?.headers?.Authorization;
  const accountNumber = account?.account_number;

  useEffect(() => {
    if (!isOpen || !accountNumber || !authHeader || authHeader.endsWith("undefined")) return;
    let cancelled = false;
    setAvailable(null);
    getWithdrawableAmount(accountNumber, { headers: { Authorization: authHeader } })
      .then((data) => {
        if (!cancelled) setAvailable(Number(data?.withdrawable ?? 0));
      })
      .catch(() => {
        if (!cancelled) setAvailable(null);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, accountNumber, authHeader]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request a withdrawal</DialogTitle>
          <DialogDescription>
            This is a request from your own savings, as a member. Another
            admin must approve it on the Withdrawals page; you cannot approve
            your own.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
          <p className="text-slate-500">Available to withdraw</p>
          <p className="text-lg font-semibold text-slate-900">
            {available === null ? "Checking..." : formatKES(available)}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            This excludes pending requests and any savings held as guarantee
            for other members&apos; loans.
          </p>
        </div>

        <Formik
          enableReinitialize
          initialValues={{
            savings_account: accountNumber,
            amount: "",
            description: "",
          }}
          onSubmit={async (values, { resetForm }) => {
            const amount = Number(values.amount);
            if (!amount || amount <= 0) {
              toast.error("Enter an amount greater than zero.");
              return;
            }
            if (available !== null && amount > available) {
              toast.error(`You can withdraw at most ${formatKES(available)}.`);
              return;
            }
            setLoading(true);
            try {
              await createSavingsWithdrawals(
                {
                  savings_account: values.savings_account,
                  amount: amount.toFixed(2),
                  description: values.description || undefined,
                },
                token
              );
              toast.success("Withdrawal request sent. You'll see it as Pending until it's approved.");
              resetForm();
              onClose();
              refetchAccount?.();
            } catch (error) {
              const data = error?.response?.data;
              toast.error(
                data?.amount?.[0] ||
                  data?.detail ||
                  data?.savings_account?.[0] ||
                  "Could not send the withdrawal request."
              );
            } finally {
              setLoading(false);
            }
          }}
        >
          {() => (
            <Form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-black">
                  Amount (KES)
                </Label>
                <Field
                  as={Input}
                  type="number"
                  id="amount"
                  name="amount"
                  className="border-black"
                  placeholder="Enter amount"
                  required
                  min="1"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-black">
                  Reason or payout details (optional)
                </Label>
                <Field
                  as="textarea"
                  id="description"
                  name="description"
                  rows={3}
                  className="w-full border border-black rounded px-3 py-2 text-base"
                  placeholder="e.g. School fees. Send to M-Pesa 07XX XXX XXX"
                />
              </div>

              <DialogFooter>
                <Button
                  type="submit"
                  size="sm"
                  disabled={loading || available === 0}
                  className="bg-primary hover:bg-[var(--primary-hover)] text-white text-sm sm:text-base py-2 px-3 sm:px-4 w-full sm:w-auto"
                >
                  {loading ? "Sending..." : "Send request"}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}

export default RequestWithdrawal;
