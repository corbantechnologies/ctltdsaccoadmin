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
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { resetLoanAccount } from "@/services/loanaccounts";
import { AlertOctagon, AlertTriangle, Loader2, RotateCcw, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

export default function ResetLoanModal({ isOpen, onClose, refetchLoan, loan }) {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [mode, setMode] = useState("keep_payments");
  const token = useAxiosAuth();

  const handleReset = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error("A reason is mandatory for resetting this loan account.");
      return;
    }

    setLoading(true);
    try {
      await resetLoanAccount(
        loan.account_number,
        {
          reason: reason.trim(),
          mode: mode,
        },
        token
      );

      toast.success("Loan account successfully reset to initial state!");
      onClose();
      if (refetchLoan) refetchLoan();
      window.location.reload();
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Failed to reset loan account!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <RotateCcw className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                Reset Loan Account to Initial State
              </DialogTitle>
              <span className="text-[11px] font-semibold text-red-600 uppercase tracking-wider">
                Account: {loan?.account_number}
              </span>
            </div>
          </div>
          <DialogDescription className="text-xs text-slate-500 pt-1">
            Restores this loan account back to its initial approved contract terms (original principal, term, and interest).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleReset} className="space-y-4 pt-1">
          {/* Accounting Impact Card */}
          <div className="rounded-xl border border-amber-200/80 bg-amber-50/70 p-3 text-xs text-amber-950 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <ShieldCheck className="h-4 w-4 text-amber-700 shrink-0" />
              General Ledger (GL) Impact & Audit Trail
            </div>
            <p className="text-[11px] text-amber-900 leading-relaxed">
              Any disbursed top-ups on this account will have their GL disbursements contra-posted (<strong>Dr Bank, Cr Loans to Members</strong>) without deleting historical records. Top-up processing fees will be cancelled.
            </p>
          </div>

          {/* Mode Selector */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700">Select Reset Mode</Label>
            <div className="space-y-2">
              <label
                className={`flex items-start gap-2.5 p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                  mode === "keep_payments"
                    ? "border-primary bg-primary/5 text-slate-900"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="reset_mode"
                  value="keep_payments"
                  checked={mode === "keep_payments"}
                  onChange={() => setMode("keep_payments")}
                  className="mt-0.5"
                />
                <div>
                  <span className="font-semibold block text-slate-900">
                    Restore Initial Schedule & Re-apply Payments (Recommended)
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Reverses top-ups and rewinds schedule to day 1, then cleanly replays all completed repayments through the waterfall.
                  </span>
                </div>
              </label>

              <label
                className={`flex items-start gap-2.5 p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                  mode === "wipe_all"
                    ? "border-red-500 bg-red-50/20 text-slate-900"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="reset_mode"
                  value="wipe_all"
                  checked={mode === "wipe_all"}
                  onChange={() => setMode("wipe_all")}
                  className="mt-0.5"
                />
                <div>
                  <span className="font-semibold block text-red-700 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 text-red-600" /> Complete Day 0 Wipe
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Reverses all top-ups AND all payment transactions in the GL. Returns the loan to freshly-disbursed (KES 0 paid).
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Reason Input */}
          <div className="space-y-1.5">
            <Label htmlFor="reset_reason" className="text-xs font-semibold text-slate-700">
              Reason for Reset <span className="text-red-500">*</span>
            </Label>
            <textarea
              id="reset_reason"
              required
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Contract correction, test rerun, or reversal of accidental top-up..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[60px]"
            />
          </div>

          <DialogFooter className="pt-2 border-t border-slate-100 gap-2 sm:gap-0">
            <Button variant="outline" type="button" onClick={onClose} disabled={loading} className="h-9 text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !reason.trim()}
              className="h-9 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white gap-1.5 shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Resetting Loan Account...
                </>
              ) : (
                <>
                  <RotateCcw className="h-3.5 w-3.5" />
                  Confirm Loan Reset
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
