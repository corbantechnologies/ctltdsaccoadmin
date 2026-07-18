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
import { adminCreateLoanForMember } from "@/services/loanaccounts";

function CreateLoanAccountAdmin({
  isOpen,
  onClose,
  refetchMember,
  loanProducts,
  member,
}) {
  const [loading, setLoading] = useState(false);
  const token = useAxiosAuth();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="">Create New Loan</DialogTitle>
        </DialogHeader>

        <Formik
          initialValues={{
            product: loanProducts?.name || "",
            member: member?.member_no || "",
            principal: 0,
          }}
          onSubmit={async (values) => {
            setLoading(true);
            try {
              await adminCreateLoanForMember(values, token);
              toast?.success("Loan created successfully!");
              setLoading(false);
              onClose();
              refetchMember();
            } catch (error) {
              toast?.error("Failed to create loan!");
            } finally {
              setLoading(false);
            }
          }}
        >
          {({ values }) => (
            <Form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="member" className="text-black">
                  Member
                </Label>
                <Field
                  as={Input}
                  type="text"
                  name="member"
                  placeholder={`${member?.member_no}`}
                  value={`${member?.member_no}`}
                  disabled
                  className="w-full border border-black rounded px-3 py-2 text-base focus:ring-2   transition-colors bg-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product" className="text-black">
                  Loan Type
                </Label>
                <Field
                  as="select"
                  name="product"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" label="Select loan type" />
                  {loanProducts?.map((type) => (
                    <option key={type?.reference} value={type?.name}>
                      {type?.name} - {type?.interest_method}
                    </option>
                  ))}
                </Field>
              </div>

              <div className="space-y-2">
                <Label htmlFor="principal" className="text-black">
                  Loan Amount
                </Label>
                <Field
                  as={Input}
                  type="number"
                  name="principal"
                  className="w-full border border-black rounded px-3 py-2 text-base focus:ring-2   transition-colors"
                />
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  className="bg-[#ea1315] text-white hover:bg-[#ea1315] disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Loan"}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}

export default CreateLoanAccountAdmin;
