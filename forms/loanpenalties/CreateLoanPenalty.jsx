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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, Form, Formik } from "formik";
import { createLoanPenalty } from "@/services/loanpenalties";
import toast from "react-hot-toast";

function CreateLoanPenalty({ isOpen, onClose, refetchLoan, loan_account }) {
  const [loading, setLoading] = useState(false);
  const token = useAxiosAuth();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply Loan Penalty</DialogTitle>
        </DialogHeader>

        <Formik
          initialValues={{
            loan_account: loan_account || "",
          }}
          enableReinitialize={true}
          onSubmit={async (values) => {
            setLoading(true);
            try {
              await createLoanPenalty(values, token);
              toast?.success("Penalty applied successfully!");
              onClose();
              if (refetchLoan) refetchLoan();
            } catch (error) {
              console.error("Create Penalty Error:", error);
              const errorData = error?.response?.data;
              if (typeof errorData === "string") {
                toast.error(errorData);
              } else if (errorData?.detail) {
                toast.error(errorData.detail);
              } else if (errorData) {
                const firstErrorKey = Object.keys(errorData)[0];
                const firstError = errorData[firstErrorKey];
                const errorMessage = Array.isArray(firstError)
                  ? firstError[0]
                  : firstError;
                toast.error(
                  `${firstErrorKey.replace(/_/g, " ")}: ${errorMessage}`
                );
              } else {
                toast.error("Failed to apply penalty! ❌");
              }
            } finally {
              setLoading(false);
            }
          }}
        >
          {() => (
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
                <p className="text-xs text-muted-foreground">
                  A penalty will be automatically calculated based on the loan's overdue status.
                </p>
              </div>

              <DialogFooter>
                <Button
                  type="submit"
                  size="sm"
                  disabled={loading}
                  className="bg-primary hover:bg-[#022007] text-white"
                >
                  {loading ? "Applying..." : "Confirm Apply Penalty"}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}

export default CreateLoanPenalty;