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
import { Label } from "@/components/ui/label";
import { Field, Form, Formik } from "formik";
import { createSavingAccount } from "@/services/savings";
import toast from "react-hot-toast";

function CreateSavingsAccount({
  isOpen,
  onClose,
  refetchSavings,
  savingTypes,
}) {
  const [loading, setLoading] = useState(false);
  const token = useAxiosAuth();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="">
            Create New Saving Account
          </DialogTitle>
        </DialogHeader>

        <Formik
          initialValues={{
            account_type: "",
          }}
          onSubmit={async (values) => {
            try {
              setLoading(true);
              await createSavingAccount(values, token);
              toast?.success("Savings account created successfully!");
              onClose();
              refetchSavings();
            } catch (error) {
              toast?.error("Failed to create savings account!");
            } finally {
              setLoading(false);
            }
          }}
        >
          {({ values }) => (
            <Form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="account_type" className="text-black">
                  Saving Type
                </Label>
                <Field
                  as="select"
                  name="account_type"
                  className="w-full border border-black rounded px-3 py-2 text-base focus:ring-2   transition-colors"
                >
                  <option value="">Select Saving Type</option>
                  {savingTypes?.map((savingType) => (
                    <option key={savingType.reference} value={savingType.name}>
                      {savingType.name}
                    </option>
                  ))}
                </Field>
              </div>

              <DialogFooter>
                <Button
                  type="submit"
                  size={"sm"}
                  disabled={loading}
                  className="bg-primary hover:bg-[#022007] text-white text-sm sm:text-base py-2 px-3 sm:px-4 flex-1 sm:flex-none"
                >
                  {loading ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}

export default CreateSavingsAccount;
