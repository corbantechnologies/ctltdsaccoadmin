"use client";

import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSavingsDepositMpesa } from "@/services/savingsdeposits";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

export default function MpesaCreateDepositForm({
  isOpen,
  onClose,
  savings_account,
}) {
  const [loading, setLoading] = useState(false);
  const token = useAxiosAuth();
  const router = useRouter();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Make mPesa Deposit</DialogTitle>
          <DialogDescription>
            Enter the amount and your M-Pesa phone number to initiate a deposit.
          </DialogDescription>
        </DialogHeader>
        <Formik
          initialValues={{
            savings_account: savings_account?.account_number,
            amount: "",
            phone_number: "",
          }}
          onSubmit={async (values) => {
            setLoading(true);
            try {
              const response = await createSavingsDepositMpesa(values, token);
              toast?.success(
                "Deposit created successfully!🎉 Proceed to make payment"
              );
              router?.push(
                `/member/savings/${savings_account?.reference}/${response?.reference}`
              );
            } catch (error) {
              toast?.error("Failed to create deposit!");
            } finally {
              setLoading(false);
            }
          }}
        >
          {({ errors, touched, setFieldValue }) => (
            <Form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Field
                  as={Input}
                  id="amount"
                  name="amount"
                  type="number"
                  placeholder="Enter amount"
                  className={
                    errors.amount && touched.amount ? "border-red-500" : ""
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Field
                  as={Input}
                  id="phone_number"
                  name="phone_number"
                  type="text"
                  placeholder="2547XXXXXXXX or 2541XXXXXXXX"
                  className={
                    errors.phone_number && touched.phone_number
                      ? "border-red-500"
                      : ""
                  }
                />
                <p className="text-[0.8rem] text-muted-foreground">
                  Format: 2547XXXXXXXX
                </p>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#045e32] hover:bg-[#034625]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Initiate Deposit"
                  )}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
