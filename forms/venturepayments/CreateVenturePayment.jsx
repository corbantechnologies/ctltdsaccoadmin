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
import toast from "react-hot-toast";
import { createVenturePayment } from "@/services/venturepayments";

function CreateVenturePayment({ isOpen, onClose, refetchMember, ventures }) {
  const [loading, setLoading] = useState(false);
  const token = useAxiosAuth();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="">
            Create New Venture Payment
          </DialogTitle>
        </DialogHeader>

        <Formik
          initialValues={{
            venture_account: ventures?.venture_account || "",
            amount: 0,
            payment_method: "",
          }}
          onSubmit={async (values) => {
            setLoading(true);
            try {
              await createVenturePayment(values, token);
              toast?.success("Venture Payment created successfully!");
              onClose();
              refetchMember();
            } catch (error) {
              toast?.error("Failed to create Venture Payment!");
            } finally {
              setLoading(false);
            }
          }}
        >
          {({ values }) => (
            <Form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="venture_account" className="text-black">
                  Venture Account
                </Label>
                <Field
                  as="select"
                  name="venture_account"
                  className="w-full border border-black rounded px-3 py-2 text-base focus:ring-2   transition-colors"
                >
                  <option value="" label="Select account" />
                  {ventures?.map((venture) => (
                    <option
                      key={venture?.reference}
                      value={venture?.account_number}
                    >
                      {venture?.account_number} - {venture?.venture_type}
                    </option>
                  ))}
                </Field>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-black">
                  Amount
                </Label>
                <Field
                  type="number"
                  name="amount"
                  className="w-full border border-black rounded px-3 py-2 text-base focus:ring-2   transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_method" className="text-black">
                  Payment Method
                </Label>
                <Field
                  as="select"
                  name="payment_method"
                  className="w-full border border-black rounded px-3 py-2 text-base focus:ring-2   transition-colors"
                >
                  <option value="" label="Select payment method" />
                  <option value="Cash">Cash</option>
                  <option value="Mpesa">Mpesa</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Mobile Banking">Mobile Banking</option>
                  <option value="Standing Order">Standing Order</option>
                </Field>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="border-black text-black hover:bg-gray-100"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size={"sm"}
                  disabled={loading}
                  className="bg-primary hover:bg-[#022007] text-white text-sm sm:text-base py-2 px-3 sm:px-4 flex-1 sm:flex-none"
                >
                  {loading ? "Processing..." : "Pay"}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}

export default CreateVenturePayment;
