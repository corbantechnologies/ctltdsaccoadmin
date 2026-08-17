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
import { Field, Form, Formik } from "formik";
import { reverseLoanPayment, reverseSavingsDeposit, reverseFeePayment } from "@/services/reversals";
import toast from "react-hot-toast";

export default function ReversePaymentModal({ isOpen, onClose, refetch, paymentRef, type }) {
  const [loading, setLoading] = useState(false);
  const token = useAxiosAuth();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-red-600">Reverse Transaction</DialogTitle>
          <DialogDescription>
            This will post mirror contra-entries to the general ledger to reverse the transaction {paymentRef}. This action is permanent.
          </DialogDescription>
        </DialogHeader>

        <Formik
          initialValues={{
            reason: "",
          }}
          onSubmit={async (values) => {
            if (!values.reason.trim()) {
              toast.error("Please enter a reason for the reversal.");
              return;
            }
            setLoading(true);
            try {
              if (type === "SavingsDeposit") {
                await reverseSavingsDeposit(paymentRef, { reason: values.reason }, token);
              } else if (type === "FeePayment") {
                await reverseFeePayment(paymentRef, { reason: values.reason }, token);
              } else {
                await reverseLoanPayment(paymentRef, { reason: values.reason }, token);
              }
              toast.success("Transaction reversed successfully!");
              onClose();
              if (refetch) refetch();
              window.location.reload();
            } catch (error) {
              toast.error(error?.response?.data?.detail || "Failed to reverse transaction!");
            } finally {
              setLoading(false);
            }
          }}
        >
          {({ loading: formikLoading }) => (
            <Form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reason" className="text-black">
                  Reason for Reversal
                </Label>
                <Field
                  as="textarea"
                  id="reason"
                  name="reason"
                  placeholder="Enter mandatory reason"
                  required
                  className="w-full px-3 py-2 border border-red-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[80px]"
                />
              </div>

              <DialogFooter className="pt-4">
                <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700 text-white">
                  {loading ? "Reversing..." : "Confirm Reversal"}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
