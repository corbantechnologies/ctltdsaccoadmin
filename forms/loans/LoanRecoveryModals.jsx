"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Loader2, ShieldAlert, Users, FileX, HandCoins } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { useFetchPaymentAccounts } from "@/hooks/paymentaccounts/actions";
import {
  getGuarantorRecoveryPlan,
  recordWrittenOffRecovery,
  recoverFromGuarantors,
  writeOffLoan,
} from "@/services/loanaccounts";
import { formatCurrency } from "@/lib/utils";

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]";
const today = () => new Date().toISOString().slice(0, 10);
const apiError = (err, fallback) => err?.response?.data?.detail || fallback;

// Takes what a defaulted loan still needs from the guarantors' savings. The
// plan is shown first; nothing moves until the admin confirms.
export function GuarantorRecoveryModal({ isOpen, onClose, loan, onDone }) {
  const token = useAxiosAuth();
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [date, setDate] = useState(today());
  const authHeader = token?.headers?.Authorization;

  useEffect(() => {
    if (!isOpen || !loan?.reference || !authHeader || authHeader.endsWith("undefined")) return;
    let cancelled = false;
    setPlan(null);
    setError("");
    getGuarantorRecoveryPlan(loan.reference, { headers: { Authorization: authHeader } })
      .then((data) => !cancelled && setPlan(data))
      .catch((err) => !cancelled && setError(apiError(err, "Could not work out the recovery.")));
    return () => {
      cancelled = true;
    };
  }, [isOpen, loan?.reference, authHeader]);

  const total = Number(plan?.total_recoverable || 0);

  const confirm = async () => {
    setBusy(true);
    try {
      await recoverFromGuarantors(loan.reference, { date }, token);
      toast.success(`${formatCurrency(total)} recovered from guarantors.`);
      onClose();
      onDone?.();
    } catch (err) {
      toast.error(apiError(err, "Recovery failed. Nothing was changed."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-[var(--primary)]" /> Recover from guarantors
          </DialogTitle>
          <DialogDescription>
            Takes what this loan still owes from the savings each guarantor pledged, up to the amount
            they guaranteed. The borrower&apos;s own pledged savings are used first. Each guarantor sees a
            withdrawal on their savings statement, and the loan gets one repayment.
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>
        ) : !plan ? (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Working out what each guarantor would pay...
          </div>
        ) : (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-md bg-slate-50 p-2">
                <p className="text-xs text-slate-500">Loan needs</p>
                <p className="font-semibold">{formatCurrency(plan.amount_needed)}</p>
              </div>
              <div className="rounded-md bg-emerald-50 p-2">
                <p className="text-xs text-slate-500">Guarantors can cover</p>
                <p className="font-semibold">{formatCurrency(plan.total_recoverable)}</p>
              </div>
              <div className="rounded-md bg-amber-50 p-2">
                <p className="text-xs text-slate-500">Still short</p>
                <p className="font-semibold">{formatCurrency(plan.shortfall)}</p>
              </div>
            </div>
            {plan.guarantors.length === 0 ? (
              <p className="text-slate-500">This loan has no accepted guarantees.</p>
            ) : (
              <div className="divide-y rounded-md border">
                {plan.guarantors.map((g) => (
                  <div key={g.guarantee_reference} className="flex items-center justify-between gap-3 p-2">
                    <div className="min-w-0">
                      <p className="font-medium truncate">
                        {g.member_name} {g.is_borrower && <span className="text-xs text-slate-500">(borrower)</span>}
                      </p>
                      <p className="text-xs text-slate-500">
                        {g.member_no} · guaranteed {formatCurrency(g.guaranteed_amount)} · savings{" "}
                        {formatCurrency(g.savings_available)}
                      </p>
                    </div>
                    <p className="font-semibold shrink-0">{formatCurrency(g.amount)}</p>
                  </div>
                ))}
              </div>
            )}
            <label className="block">
              <span className="text-xs font-medium text-slate-600">Recovery date</span>
              <input type="date" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} />
            </label>
            {Number(plan.shortfall) > 0 && (
              <p className="text-xs text-slate-500">
                Whatever is still short stays on the loan. You can write it off afterwards.
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            onClick={confirm}
            disabled={busy || !plan || total <= 0}
            className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white"
          >
            {busy ? "Recovering..." : `Recover ${formatCurrency(total)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Removes the unpaid principal from the books against the loan loss
// provision. Needs a reason, such as the board minute that approved it.
export function WriteOffModal({ isOpen, onClose, loan, onDone }) {
  const token = useAxiosAuth();
  const [reason, setReason] = useState("");
  const [date, setDate] = useState(today());
  const [busy, setBusy] = useState(false);
  const principal = Math.max(0, Number(loan?.principal || 0) - Number(loan?.total_principal_paid || 0));

  const submit = async () => {
    if (!reason.trim()) {
      toast.error("Give a reason, such as the board minute reference.");
      return;
    }
    setBusy(true);
    try {
      await writeOffLoan(loan.reference, { reason: reason.trim(), date }, token);
      toast.success("Loan written off.");
      onClose();
      onDone?.();
    } catch (err) {
      toast.error(apiError(err, "Write-off failed. Nothing was changed."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-700">
            <FileX className="h-5 w-5" /> Write off loan
          </DialogTitle>
          <DialogDescription>
            Use this only when the board has agreed the loan cannot be collected, and after recovering what you can
            from guarantors.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="rounded-md border border-red-200 bg-red-50 p-3 space-y-1">
            <p>
              <span className="font-semibold">{formatCurrency(principal)}</span> of unpaid principal leaves the
              loan book.
            </p>
            <p className="text-xs text-red-800">
              It is charged first to the loan loss provision, and any amount the provision does not cover goes to
              provision expense. Unpaid penalties and fees are waived, interest accrued but never paid is reversed,
              and guarantors are released.
            </p>
          </div>
          <label className="block">
            <span className="text-xs font-medium text-slate-600">Reason (required)</span>
            <textarea
              rows={3}
              className={inputClass}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Board minute 14/2026: member deceased, estate has no assets"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-600">Write-off date</span>
            <input type="date" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={busy} className="bg-red-600 hover:bg-red-700 text-white">
            {busy ? "Writing off..." : "Write off"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Money received later on a written-off loan is income (Bad Debts Recovered).
export function WrittenOffRecoveryModal({ isOpen, onClose, loan, onDone }) {
  const token = useAxiosAuth();
  const { data: paymentAccounts } = useFetchPaymentAccounts();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(today());
  const [busy, setBusy] = useState(false);
  const left = Math.max(0, Number(loan?.written_off_amount || 0) - Number(loan?.recovered_after_write_off || 0));
  const accounts = (paymentAccounts || []).filter(
    (p) => p.is_active !== false && !String(p.name || "").startsWith("[System]")
  );

  const submit = async () => {
    if (!Number(amount) || Number(amount) <= 0) {
      toast.error("Enter an amount greater than zero.");
      return;
    }
    if (!method) {
      toast.error("Choose the account the money was received into.");
      return;
    }
    setBusy(true);
    try {
      await recordWrittenOffRecovery(loan.reference, { amount, payment_method: method, note, date }, token);
      toast.success("Recovery recorded.");
      setAmount("");
      setNote("");
      onClose();
      onDone?.();
    } catch (err) {
      toast.error(apiError(err, "Could not record the recovery."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HandCoins className="h-5 w-5 text-[var(--primary)]" /> Record recovery
          </DialogTitle>
          <DialogDescription>
            Money received on this written-off loan. It is booked as Bad Debts Recovered income.{" "}
            {formatCurrency(left)} is still unrecovered.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <label className="block">
            <span className="text-xs font-medium text-slate-600">Amount (KES)</span>
            <input type="number" min="1" step="0.01" className={inputClass} value={amount} onChange={(e) => setAmount(e.target.value)} />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-600">Received into</span>
            <select className={inputClass} value={method} onChange={(e) => setMethod(e.target.value)}>
              <option value="">Select payment account</option>
              {accounts.map((p) => (
                <option key={p.reference || p.name} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-600">Date</span>
            <input type="date" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-600">Note (optional)</span>
            <input className={inputClass} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Auctioneer proceeds" />
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={busy}
            className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white"
          >
            {busy ? "Saving..." : "Record recovery"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ArrearsBadge({ loan }) {
  if (!loan || !["Active", "Funded"].includes(loan.status)) return null;
  const stage = loan.arrears_stage || "Current";
  if (stage === "Current") return null;
  const style =
    stage === "Defaulted"
      ? "bg-red-100 text-red-700 border-red-200"
      : "bg-amber-100 text-amber-800 border-amber-200";
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${style}`}>
      <ShieldAlert className="h-3 w-3" />
      {stage} · {loan.days_in_arrears} days
    </span>
  );
}
