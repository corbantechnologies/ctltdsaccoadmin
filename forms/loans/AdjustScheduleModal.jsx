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
import { adjustSchedule } from "@/services/loanaccounts";
import toast from "react-hot-toast";

export default function AdjustScheduleModal({ isOpen, onClose, refetchLoan, loan }) {
  const [loading, setLoading] = useState(false);
  const token = useAxiosAuth();
  
  const isReducing = loan?.product_details?.interest_method === "Reducing";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adjust Repayment Schedule</DialogTitle>
          <DialogDescription>
            {isReducing 
              ? "Reducing balance loans are fixed term only. Adjusting will regenerate the remaining schedule based on the new term months."
              : "Flat rate loans allow adjusting the term months or setting a new monthly payment."}
          </DialogDescription>
        </DialogHeader>

        <Formik
          initialValues={{
            mode: "term",
            new_term_months: "",
            new_monthly_payment: "",
          }}
          onSubmit={async (values) => {
            setLoading(true);
            const payload = {};
            if (isReducing || values.mode === "term") {
              payload.new_term_months = values.new_term_months;
            } else {
              payload.new_monthly_payment = values.new_monthly_payment;
            }

            try {
              await adjustSchedule(loan.reference, payload, token);
              toast.success("Schedule adjusted successfully!");
              onClose();
              if (refetchLoan) refetchLoan();
              window.location.reload();
            } catch (error) {
              toast.error(error?.response?.data?.detail || "Failed to adjust schedule!");
            } finally {
              setLoading(false);
            }
          }}
        >
          {({ values, setFieldValue }) => (
            <Form className="space-y-4">
              {!isReducing && (
                <div className="space-y-2">
                  <Label className="text-black">Adjustment Mode</Label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={values.mode}
                    onChange={(e) => setFieldValue("mode", e.target.value)}
                  >
                    <option value="term">Fixed Term (Change Months)</option>
                    <option value="payment">Fixed Payment (Change Monthly Amount)</option>
                  </select>
                </div>
              )}

              {(isReducing || values.mode === "term") ? (
                <div className="space-y-2">
                  <Label htmlFor="new_term_months" className="text-black">
                    New Term (Months)
                  </Label>
                  <Field
                    as={Input}
                    type="number"
                    id="new_term_months"
                    name="new_term_months"
                    placeholder="Enter new term in months"
                    required
                    className="border-black"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="new_monthly_payment" className="text-black">
                    New Monthly Payment (KES)
                  </Label>
                  <Field
                    as={Input}
                    type="number"
                    id="new_monthly_payment"
                    name="new_monthly_payment"
                    placeholder="Enter new target monthly payment"
                    required
                    className="border-black"
                  />
                </div>
              )}

              <DialogFooter className="pt-4">
                <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="bg-primary hover:bg-[#022007] text-white">
                  {loading ? "Adjusting..." : "Adjust Schedule"}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
