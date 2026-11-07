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
  updateWithdrawal,
} from "@/services/savingswithdrawals";
import { useFetchPaymentAccounts } from "@/hooks/paymentaccounts/actions";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";

const formatKES = (value) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(
    Number(value || 0)
  );

// An admin records a withdrawal that is being paid out to a member now. The
// request is created and approved in one step, which reduces the savings
// balance and posts DR member savings / CR the chosen payment account.
function CreateWithdrawal({ isOpen, onClose, account, refetchAccount }) {
  const [loading, setLoading] = useState(false);
  const [available, setAvailable] = useState(null);
  const token = useAxiosAuth();
  const authHeader = token?.headers?.Authorization;
  const accountNumber = account?.account_number;
  const { data: paymentAccounts, isLoading: isLoadingPayment } = useFetchPaymentAccounts();
  const payoutAccounts = (paymentAccounts || []).filter(
    (p) => p.is_active !== false && !String(p.name || "").startsWith("[System]")
  );

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
      <DialogContent className="sm:max-w-[440px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record withdrawal</DialogTitle>
          <DialogDescription>
            Use this when the member is being paid out now. The balance drops
            and the GL is posted as soon as you save. Member requests still
            go to the Withdrawals page for approval.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
          <p className="text-slate-500">
            Available to withdraw from {accountNumber}
          </p>
          <p className="text-lg font-semibold text-slate-900">
            {available === null ? "Checking..." : formatKES(available)}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Excludes pending requests, savings held as loan guarantees, and
            saving types marked non-withdrawable in Accounting settings.
          </p>
        </div>

        <Formik
          enableReinitialize
          initialValues={{ amount: "", payment_method: "", description: "" }}
          onSubmit={async (values, { resetForm }) => {
            const amount = Number(values.amount);
            if (!amount || amount <= 0) {
              toast.error("Enter an amount greater than zero.");
              return;
            }
            if (!values.payment_method) {
              toast.error("Choose the account the money is paid from.");
              return;
            }
            if (available !== null && amount > available) {
              toast.error(`At most ${formatKES(available)} can be withdrawn.`);
              return;
            }
            setLoading(true);
            let created = null;
            try {
              created = await createSavingsWithdrawals(
                {
                  savings_account: accountNumber,
                  amount: amount.toFixed(2),
                  payment_method: values.payment_method,
                  description: values.description || undefined,
                },
                token
              );
              await updateWithdrawal(
                created.identity,
                { transaction_status: "Approved", payment_method: values.payment_method },
                token
              );
              toast.success("Withdrawal recorded and paid out.");
              resetForm();
              onClose();
              refetchAccount?.();
            } catch (error) {
              const data = error?.response?.data;
              const message =
                data?.amount?.[0] ||
                data?.payment_method?.[0] ||
                data?.detail ||
                "Could not record the withdrawal.";
              toast.error(
                created
                  ? `Saved as Pending but not paid out: ${message} Approve it from the Withdrawals page.`
                  : message
              );
              if (created) refetchAccount?.();
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
                <Label htmlFor="payment_method" className="text-black">
                  Paid from
                </Label>
                <Field
                  as="select"
                  id="payment_method"
                  name="payment_method"
                  className="w-full border border-black rounded px-3 py-2 text-base bg-white"
                  disabled={isLoadingPayment}
                  required
                >
                  <option value="">
                    {isLoadingPayment ? "Loading..." : "Select payment account"}
                  </option>
                  {payoutAccounts.map((p) => (
                    <option key={p.reference || p.id || p.name} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </Field>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-black">
                  Note (optional)
                </Label>
                <Field
                  as="textarea"
                  id="description"
                  name="description"
                  rows={2}
                  className="w-full border border-black rounded px-3 py-2 text-base"
                  placeholder="e.g. Cheque no. 1042"
                />
              </div>

              <DialogFooter>
                <Button
                  type="submit"
                  size="sm"
                  disabled={loading || available === 0}
                  className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm sm:text-base py-2 px-3 sm:px-4 w-full sm:w-auto"
                >
                  {loading ? "Saving..." : "Record withdrawal"}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}

export default CreateWithdrawal;
