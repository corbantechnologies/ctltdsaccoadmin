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
import { createLoanTopUp, disburseLoanTopUp } from "@/services/loantopups";
import { useFetchPaymentAccounts } from "@/hooks/paymentaccounts/actions";
import toast from "react-hot-toast";

export default function CreateTopUpModal({ isOpen, onClose, refetchLoan, loan }) {
  const [loading, setLoading] = useState(false);
  const token = useAxiosAuth();
  const { data: paymentAccounts } = useFetchPaymentAccounts();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Top Up Loan</DialogTitle>
          <DialogDescription>
            Add extra principal to this loan account. A new consolidated schedule will be generated and a processing fee charged on the top-up amount.
          </DialogDescription>
        </DialogHeader>

        <Formik
          initialValues={{
            loan_account: loan?.reference || "",
            top_up_amount: "",
            new_term_months: "",
            payment_method: "",
            notes: "",
          }}
          onSubmit={async (values) => {
            setLoading(true);
            try {
              // 1. Create Top Up
              const topUpData = await createLoanTopUp({
                loan_account: loan.reference,
                top_up_amount: values.top_up_amount,
                new_term_months: values.new_term_months,
                payment_method: values.payment_method,
                notes: values.notes,
              }, token);

              // 2. Disburse Top Up immediately (admin-initiated bypass)
              await disburseLoanTopUp(topUpData.reference, {
                payment_method: values.payment_method
              }, token);

              toast.success("Loan topped up and disbursed successfully!");
              onClose();
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
              <div className="space-y-2">
                <Label htmlFor="top_up_amount" className="text-black">
                  Top-Up Amount (KES)
                </Label>
                <Field
                  as={Input}
                  type="number"
                  id="top_up_amount"
                  name="top_up_amount"
                  placeholder="Enter additional principal"
                  required
                  className="border-black"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new_term_months" className="text-black">
                  New Consolidated Term (Months)
                </Label>
                <Field
                  as={Input}
                  type="number"
                  id="new_term_months"
                  name="new_term_months"
                  placeholder="Enter total remaining months"
                  required
                  className="border-black"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_method" className="text-black">
                  Disbursement Payment Account
                </Label>
                <select
                  name="payment_method"
                  value={values.payment_method}
                  onChange={(e) => setFieldValue("payment_method", e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select disbursement bank/cash account</option>
                  {paymentAccounts?.map((account) => (
                    <option key={account.reference} value={account.name}>
                      {account.name} ({account.account_number})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-black">
                  Notes / Reason
                </Label>
                <Field
                  as="textarea"
                  id="notes"
                  name="notes"
                  placeholder="Reason for top-up"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                />
              </div>

              <DialogFooter className="pt-4">
                <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="bg-primary hover:bg-[#022007] text-white">
                  {loading ? "Processing..." : "Disburse Top-Up"}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
