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
import { reverseLoanTopUp } from "@/services/loantopups";
import { formatCurrency } from "@/lib/utils";
import { AlertTriangle, ArrowLeftRight, Loader2, Undo2 } from "lucide-react";
import toast from "react-hot-toast";

export default function ReverseTopUpModal({ isOpen, onClose, refetchLoan, topUp }) {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");
  const token = useAxiosAuth();

  const handleReverse = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error("A reason is mandatory for reversing this top-up.");
      return;
    }

    setLoading(true);
    try {
      await reverseLoanTopUp(topUp.reference, reason.trim(), token);
      toast.success(`Top-up ${topUp.reference} successfully reversed!`);
      onClose();
      if (refetchLoan) refetchLoan();
      window.location.reload();
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Failed to reverse top-up!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-amber-600 mb-1">
            <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <Undo2 className="h-4 w-4 text-amber-700" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                Reverse Loan Top-Up
              </DialogTitle>
              <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">
                Ref: {topUp?.reference}
              </span>
            </div>
          </div>
          <DialogDescription className="text-xs text-slate-500 pt-1">
            Reverses this specific top-up disbursement and posts contra-entries to the General Ledger.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleReverse} className="space-y-4 pt-1">
          {/* Summary Box */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>Top-Up Amount:</span>
              <strong className="text-slate-900">{formatCurrency(topUp?.top_up_amount)}</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Disbursed Date:</span>
              <strong className="text-slate-900">{topUp?.top_up_date || "N/A"}</strong>
            </div>
            {topUp?.new_processing_fee > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Top-Up Processing Fee:</span>
                <strong className="text-slate-900">{formatCurrency(topUp.new_processing_fee)} (will be cancelled)</strong>
              </div>
            )}
          </div>

          <div className="flex items-start gap-2 text-[11px] bg-amber-50/70 border border-amber-200/80 rounded-lg p-2.5 text-amber-900">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              A contra-entry will be posted to the GL (<strong>Dr Bank, Cr Loans Receivable</strong>). The loan schedule will be rolled back to its pre-topup state.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rev_reason" className="text-xs font-semibold text-slate-700">
              Reversal Reason <span className="text-red-500">*</span>
            </Label>
            <textarea
              id="rev_reason"
              required
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Disbursed in error, wrong payment account selected..."
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
              className="h-9 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white gap-1.5 shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Reversing Top-Up...
                </>
              ) : (
                <>
                  <ArrowLeftRight className="h-3.5 w-3.5" />
                  Confirm Reversal
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
