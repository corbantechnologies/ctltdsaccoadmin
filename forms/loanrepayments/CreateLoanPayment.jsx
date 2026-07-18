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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, Form, Formik } from "formik";
import { createLoanRepayment } from "@/services/loanrepayments";
import { useFetchPaymentAccounts } from "@/hooks/paymentaccounts/actions";
import toast from "react-hot-toast";

const REPAYMENT_TYPE_CHOICES = [
  { value: "Regular Repayment", label: "Regular Repayment" }, //initialize so it picks the amount to be paid that month in the schedule
  { value: "Partial Payment", label: "Partial Payment" },
  { value: "Loan Clearance", label: "Loan Clearance" },
];

function CreateLoanPayment({ isOpen, onClose, refetchLoan, loan_account, maxAmount, loanData, exactClearanceAmount }) {
  const [loading, setLoading] = useState(false);
  const token = useAxiosAuth();
  const { data: paymentAccounts, isLoading: isLoadingPayment } = useFetchPaymentAccounts();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log Loan Repayment</DialogTitle>
          <DialogDescription className="hidden">Log Loan Repayment</DialogDescription>
        </DialogHeader>

        <Formik
          initialValues={{
            loan_account: loan_account || "",
            amount: (() => {
              if (loanData?.projection_snapshot?.schedule?.length > 0) {
                const nextUnpaid = loanData.projection_snapshot.schedule.find(item => !item.is_paid);
                const targetItem = nextUnpaid || loanData.projection_snapshot.schedule[0];
                if (targetItem) {
                  return parseFloat(targetItem.total_due) || "";
                }
              }
              return "";
            })(),
            transaction_date: new Date().toISOString().split('T')[0],
            payment_method: "",
            repayment_type: "Regular Repayment",
            transaction_status: "Completed",
          }}
          enableReinitialize={true}
          onSubmit={async (values) => {
            const isLoanClearance = values.repayment_type === "Loan Clearance";
            // For standard types, cap at outstanding balance; clearance amounts are validated server-side
            if (!isLoanClearance && values.amount > maxAmount) {
              toast.error(`Amount cannot exceed the remaining balance of ${maxAmount.toLocaleString()}`);
              return;
            }
            setLoading(true);
            try {
              await createLoanRepayment(values, token);
              toast?.success("Repayment logged successfully!");
              onClose();
              if (typeof refetchLoan === "function") refetchLoan();
              window.location.reload();
            } catch (error) {
              console.log(error);
              toast?.error("Failed to log repayment!");
            } finally {
              setLoading(false);
            }
          }}
        >
          {({ values, setFieldValue }) => (
            <Form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="loan_account" className="text-black">
                  Loan Account
                </Label>
                <Field
                  as={Input}
                  id="loan_account"
                  name="loan_account"
                  className="border-black bg-gray-50"
                  readOnly
                  required
                />
              </div>

              {/* Very important as it determines the amount */}
              <div className="space-y-2">
                <Label htmlFor="repayment_type" className="text-black">
                  Repayment Type
                </Label>
                <Select
                  value={values.repayment_type}
                  onValueChange={(value) => {
                    setFieldValue("repayment_type", value);
                    if (value === "Loan Clearance") {
                      // Prefer exact server-calculated figure; fall back to model estimate
                      const fillAmount = exactClearanceAmount ?? parseFloat(loanData?.total_clearance_amount ?? 0);
                      if (fillAmount > 0) setFieldValue("amount", fillAmount);
                    } else if (value === "Regular Repayment") {
                      if (loanData?.projection_snapshot?.schedule?.length > 0) {
                        const nextUnpaid = loanData.projection_snapshot.schedule.find(item => !item.is_paid);
                        const targetItem = nextUnpaid || loanData.projection_snapshot.schedule[0];
                        if (targetItem) {
                          setFieldValue("amount", parseFloat(targetItem.total_due));
                        }
                      }
                    }
                  }}
                  required
                >
                  <SelectTrigger className="border-black w-full">
                    <SelectValue placeholder="Select repayment type" />
                  </SelectTrigger>
                  <SelectContent>
                    {REPAYMENT_TYPE_CHOICES.map((choice) => (
                      <SelectItem key={choice.value} value={choice.value}>
                        {choice.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="amount" className="text-black">
                  Amount
                </Label>
                <Field
                  as={Input}
                  type="number"
                  id="amount"
                  name="amount"
                  className="border-black"
                  placeholder="Enter repayment amount"
                  autoComplete="off"
                  required
                  min="0.01"
                  step="0.01"
                />
                {/* Contextual hints per repayment type */}
                {values.repayment_type === "Loan Clearance" && (
                  <p className="text-[11px] text-amber-600 font-medium">
                    ⚡ Includes loan balance. Amount is pre-filled from the account estimate — the server will validate the exact figure.
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="transaction_date" className="text-black">
                  Transaction Date
                </Label>
                <Field
                  as={Input}
                  type="date"
                  id="transaction_date"
                  name="transaction_date"
                  className="border-black"
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



              <DialogFooter>
                <Button
                  type="submit"
                  size="sm"
                  disabled={loading}
                  className="bg-primary hover:bg-[#022007] text-white"
                >
                  {loading ? "Logging..." : "Log Repayment"}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}

export default CreateLoanPayment;