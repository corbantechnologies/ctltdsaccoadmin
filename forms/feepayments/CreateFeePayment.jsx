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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, Form, Formik } from "formik";
import { createFeePayment } from "@/services/feepayments";
import { useFetchPaymentAccounts } from "@/hooks/paymentaccounts/actions";
import toast from "react-hot-toast";

function CreateFeePayment({ isOpen, onClose, refetchMember, accounts }) {
  const [loading, setLoading] = useState(false);
  const token = useAxiosAuth();
  const { data: paymentAccounts, isLoading: isLoadingPayment } = useFetchPaymentAccounts();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="">
            Pay Member Fee
          </DialogTitle>
        </DialogHeader>

        <Formik
          initialValues={{
            fee_account: "",
            amount: 0,
            payment_method: "",
            transaction_status: "Completed",
            transaction_date: new Date().toISOString().split('T')[0],
            notes: "",
          }}
          onSubmit={async (values) => {
            setLoading(true);
            try {
              await createFeePayment(values, token);
              toast?.success("Fee payment logged successfully!");
              onClose();
              refetchMember();
            } catch (error) {
              toast?.error("Failed to log fee payment!");
            } finally {
              setLoading(false);
            }
          }}
        >
          {({ values, setFieldValue }) => {
            const selectedAccount = accounts?.find(a => a.account_number === values.fee_account);
            const isFullyPaid = selectedAccount ? parseFloat(selectedAccount.outstanding_balance) <= 0 : false;

            return (
            <Form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fee_account" className="text-black">
                  Select Fee Account
                </Label>
                <Select
                  value={values.fee_account}
                  onValueChange={(value) => {
                    setFieldValue("fee_account", value);
                    const selected = accounts?.find(a => a.account_number === value);
                    if (selected) {
                      setFieldValue("amount", parseFloat(selected.outstanding_balance));
                    }
                  }}
                  required
                >
                  <SelectTrigger className="border-black w-full">
                    <SelectValue placeholder="Select fee account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts?.filter(account => {
                      const balance = parseFloat(account.outstanding_balance) || 0;
                      const canExceed = account.can_exceed_limit || account.fee_type_details?.can_exceed_limit;
                      return balance > 0 || canExceed;
                    }).map((account) => (
                      <SelectItem
                        key={account.id || account.reference}
                        value={account.account_number}
                      >
                        {account.fee_type} ({account.account_number}) - {account.outstanding_balance} KES
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-black">
                  Amount to Pay
                </Label>
                <Field
                  as={Input}
                  type="number"
                  id="amount"
                  name="amount"
                  className="border-black "
                  placeholder="Enter amount"
                  required
                  min="0"
                  step="0.01"
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

              <div className="space-y-2">
                <Label htmlFor="transaction_date" className="text-black">
                  Transaction Date
                </Label>
                <Field
                  as={Input}
                  type="date"
                  id="transaction_date"
                  name="transaction_date"
                  className="border-black "
                  placeholder="Enter transaction date"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-black">
                  Notes {isFullyPaid && <span className="text-red-500">*</span>}
                </Label>
                <Field
                  as={Textarea}
                  id="notes"
                  name="notes"
                  className="border-black min-h-[80px]"
                  placeholder="Enter notes (Required when exceeding fully paid amount)"
                  required={isFullyPaid}
                />
              </div>

              <DialogFooter>
                <Button
                  type="submit"
                  size={"sm"}
                  disabled={loading}
                  className="bg-primary hover:bg-[#022007] text-white text-sm sm:text-base py-2 px-3 sm:px-4 flex-1 sm:flex-none"
                >
                  {loading ? "Logging Payment..." : "Log Payment"}
                </Button>
              </DialogFooter>
            </Form>
            );
          }}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}

export default CreateFeePayment;