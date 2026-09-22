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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, Form, Formik } from "formik";
import { createLoanTopUp, disburseLoanTopUp, previewLoanTopUp } from "@/services/loantopups";
import { useFetchPaymentAccounts } from "@/hooks/paymentaccounts/actions";
import { formatCurrency } from "@/lib/utils";
import { Calculator, CheckCircle2, ChevronDown, ChevronUp, Info, Loader2, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

export default function CreateTopUpModal({ isOpen, onClose, refetchLoan, loan }) {
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const token = useAxiosAuth();
  const { data: paymentAccounts } = useFetchPaymentAccounts();

  const handleCalculatePreview = async (values) => {
    if (!values.top_up_amount || Number(values.top_up_amount) <= 0) {
      toast.error("Please enter a valid top-up amount.");
      return;
    }
    if (!values.new_term_months || Number(values.new_term_months) < 1) {
      toast.error("Please enter the new term in months.");
      return;
    }

    setPreviewLoading(true);
    try {
      const data = await previewLoanTopUp(
        {
          loan_account: loan.reference,
          top_up_amount: values.top_up_amount,
          new_term_months: values.new_term_months,
          top_up_date: values.top_up_date || undefined,
        },
        token
      );
      setPreview(data);
      toast.success("Schedule preview calculated!");
    } catch (err) {
      setPreview(null);
      toast.error(err?.response?.data?.detail || "Failed to calculate preview.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleClose = () => {
    setPreview(null);
    setShowSchedule(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[620px] max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Calculator className="h-5 w-5 text-primary" />
            Top Up Loan & Preview Schedule
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Add extra principal to this active loan. You can preview the consolidated principal, monthly installment, separate processing fee, and full amortization schedule before confirming disbursement.
          </DialogDescription>
        </DialogHeader>

        <Formik
          initialValues={{
            loan_account: loan?.reference || "",
            top_up_amount: "",
            new_term_months: "",
            payment_method: "",
            top_up_date: loan?.last_payment_date || new Date().toISOString().split("T")[0],
            notes: "",
          }}
          onSubmit={async (values) => {
            if (!values.payment_method) {
              toast.error("Please select a disbursement payment account.");
              return;
            }
            setLoading(true);
            try {
              // 1. Create Top Up
              const topUpData = await createLoanTopUp(
                {
                  loan_account: loan.reference,
                  top_up_amount: values.top_up_amount,
                  new_term_months: values.new_term_months,
                  payment_method: values.payment_method,
                  top_up_date: values.top_up_date || undefined,
                  notes: values.notes,
                },
                token
              );

              // 2. Disburse Top Up immediately
              await disburseLoanTopUp(
                topUpData.reference,
                {
                  payment_method: values.payment_method,
                  top_up_date: values.top_up_date || undefined,
                },
                token
              );

              toast.success("Loan topped up and disbursed successfully!");
              handleClose();
              if (refetchLoan) refetchLoan();
              window.location.reload();
            } catch (error) {
              toast.error(error?.response?.data?.detail || "Failed to process top-up!");
            } finally {
              setLoading(false);
            }
          }}
        >
          {({ values, setFieldValue }) => (
            <Form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="top_up_amount" className="text-xs font-semibold text-slate-700">
                    Top-Up Amount (KES) <span className="text-red-500">*</span>
                  </Label>
                  <Field
                    as={Input}
                    type="number"
                    id="top_up_amount"
                    name="top_up_amount"
                    placeholder="e.g. 10000"
                    required
                    className="h-9 border-slate-300 text-sm"
                    onChange={(e) => {
                      setFieldValue("top_up_amount", e.target.value);
                      setPreview(null);
                    }}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="new_term_months" className="text-xs font-semibold text-slate-700">
                    New Consolidated Term (Months) <span className="text-red-500">*</span>
                  </Label>
                  <Field
                    as={Input}
                    type="number"
                    id="new_term_months"
                    name="new_term_months"
                    placeholder="e.g. 6"
                    required
                    className="h-9 border-slate-300 text-sm"
                    onChange={(e) => {
                      setFieldValue("new_term_months", e.target.value);
                      setPreview(null);
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="top_up_date" className="text-xs font-semibold text-slate-700">
                    Effective Date (Start of New Schedule)
                  </Label>
                  <Field
                    as={Input}
                    type="date"
                    id="top_up_date"
                    name="top_up_date"
                    className="h-9 border-slate-300 text-sm"
                    onChange={(e) => {
                      setFieldValue("top_up_date", e.target.value);
                      setPreview(null);
                    }}
                  />
                  <p className="text-[10px] text-slate-500">
                    First new installment due 1 month after this date
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="payment_method" className="text-xs font-semibold text-slate-700">
                    Disbursement Account <span className="text-red-500">*</span>
                  </Label>
                  <select
                    name="payment_method"
                    value={values.payment_method}
                    onChange={(e) => setFieldValue("payment_method", e.target.value)}
                    required
                    className="w-full h-9 px-3 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Select bank/cash account</option>
                    {paymentAccounts?.map((account) => (
                      <option key={account.reference} value={account.name}>
                        {account.name} ({account.account_number})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Preview Button */}
              <div className="flex justify-end pt-1">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => handleCalculatePreview(values)}
                  disabled={previewLoading || !values.top_up_amount || !values.new_term_months}
                  className="h-8 px-3 text-xs gap-1.5 font-medium border border-slate-200 hover:bg-slate-100"
                >
                  {previewLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                  )}
                  {preview ? "Recalculate Preview" : "Generate Schedule Preview"}
                </Button>
              </div>

              {/* Live Preview Panel */}
              {preview && (
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-3 shadow-inner">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      Consolidated Loan Preview ({preview.interest_method})
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      Rate: {preview.interest_rate}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                    <div className="bg-white p-2 rounded-lg border border-slate-200/80 shadow-xs">
                      <span className="text-slate-500 text-[11px]">Remaining Old Debt</span>
                      <p className="font-semibold text-slate-800 text-sm mt-0.5">
                        {formatCurrency(preview.current_remaining_debt)}
                      </p>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200/80 shadow-xs">
                      <span className="text-slate-500 text-[11px]">Top-Up Cash</span>
                      <p className="font-semibold text-emerald-700 text-sm mt-0.5">
                        +{formatCurrency(preview.top_up_amount)}
                      </p>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-amber-200 shadow-xs bg-amber-50/40">
                      <span className="text-amber-800 font-medium text-[11px]">Separate Processing Fee</span>
                      <p className="font-bold text-amber-900 text-sm mt-0.5">
                        {formatCurrency(preview.processing_fee)}
                      </p>
                    </div>

                    <div className="bg-white p-2 rounded-lg border border-emerald-200 shadow-xs bg-emerald-50/30">
                      <span className="text-emerald-800 font-medium text-[11px]">New Principal Base</span>
                      <p className="font-bold text-emerald-900 text-sm mt-0.5">
                        {formatCurrency(preview.new_consolidated_principal)}
                      </p>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200/80 shadow-xs">
                      <span className="text-slate-500 text-[11px]">New Monthly Due</span>
                      <p className="font-bold text-primary text-sm mt-0.5">
                        {formatCurrency(preview.new_monthly_payment)}
                      </p>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200/80 shadow-xs">
                      <span className="text-slate-500 text-[11px]">Total Future Interest</span>
                      <p className="font-semibold text-slate-800 text-sm mt-0.5">
                        {formatCurrency(preview.new_total_interest)}
                      </p>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200/80 shadow-xs col-span-2 sm:col-span-1">
                      <span className="text-slate-500 text-[11px]">Total Repayable</span>
                      <p className="font-semibold text-slate-800 text-sm mt-0.5">
                        {formatCurrency(preview.new_total_repayable)}
                      </p>
                    </div>
                  </div>

                  {/* Processing Fee Notice */}
                  <div className="flex items-start gap-2 text-[11px] bg-amber-50/70 border border-amber-200/80 rounded-lg p-2.5 text-amber-900">
                    <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">
                        Separate Processing Fee: {formatCurrency(preview.processing_fee)}
                      </span>
                      <p className="text-amber-800 text-[11px] mt-0.5">
                        {preview.processing_fee_note}. Tracked strictly in Loan Processing Fees and payable separately.
                      </p>
                    </div>
                  </div>

                  {/* Schedule Accordion */}
                  <div className="pt-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSchedule(!showSchedule)}
                      className="w-full justify-between text-xs font-semibold text-slate-700 h-8 hover:bg-slate-200/60"
                    >
                      <span>New Installments Breakdown ({preview.schedule?.length} periods)</span>
                      {showSchedule ? (
                        <ChevronUp className="h-3.5 w-3.5 text-slate-500" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                      )}
                    </Button>

                    {showSchedule && (
                      <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white">
                        <table className="w-full text-[11px] text-left">
                          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 sticky top-0">
                            <tr>
                              <th className="py-1.5 px-2">#</th>
                              <th className="py-1.5 px-2">Due Date</th>
                              <th className="py-1.5 px-2 text-right">Principal</th>
                              <th className="py-1.5 px-2 text-right">Interest</th>
                              <th className="py-1.5 px-2 text-right">Total Due</th>
                              <th className="py-1.5 px-2 text-right">Balance</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-mono">
                            {preview.schedule?.map((row, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/50">
                                <td className="py-1 px-2 font-sans text-slate-500">{idx + 1}</td>
                                <td className="py-1 px-2 font-sans text-slate-700">{row.due_date}</td>
                                <td className="py-1 px-2 text-right text-slate-800 font-medium">
                                  {formatCurrency(row.principal_due)}
                                </td>
                                <td className="py-1 px-2 text-right text-slate-600">
                                  {formatCurrency(row.interest_due)}
                                </td>
                                <td className="py-1 px-2 text-right font-bold text-slate-900">
                                  {formatCurrency(row.total_due)}
                                </td>
                                <td className="py-1 px-2 text-right text-slate-600">
                                  {formatCurrency(row.balance_after)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-xs font-semibold text-slate-700">
                  Notes / Reason
                </Label>
                <Field
                  as="textarea"
                  id="notes"
                  name="notes"
                  placeholder="Optional audit reason for this top-up..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[55px]"
                />
              </div>

              <DialogFooter className="pt-3 border-t border-slate-100 gap-2 sm:gap-0">
                <Button variant="outline" type="button" onClick={handleClose} disabled={loading} className="h-9 text-xs">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !values.top_up_amount || !values.new_term_months || !values.payment_method}
                  className="h-9 text-xs font-semibold bg-primary hover:bg-[#022007] text-white gap-1.5 shadow-sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Disbursing Top-Up...
                    </>
                  ) : (
                    "Confirm & Disburse Top-Up"
                  )}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
