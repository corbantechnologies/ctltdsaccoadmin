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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, Form, Formik } from "formik";
import { updateLoanProduct } from "@/services/loanproducts";
import { useFetchGLAccounts } from "@/hooks/glaccounts/actions";
import toast from "react-hot-toast";

function UpdateLoanProduct({ isOpen, onClose, refetchLoanTypes, loanProduct }) {
  const [loading, setLoading] = useState(false);
  const token = useAxiosAuth();
  const { data: glAccounts, isLoading: isLoadingGL } = useFetchGLAccounts();

  if (!loanProduct) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose} >
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Loan Product: {loanProduct?.name}</DialogTitle>
        </DialogHeader>
        <Formik
          initialValues={{
            name: loanProduct?.name || "",
            interest_rate: loanProduct?.interest_rate || 0,
            processing_fee_type: loanProduct?.processing_fee_type || "Percentage",
            processing_fee: loanProduct?.processing_fee || 0,
            processing_fee_fixed_amount: loanProduct?.processing_fee_fixed_amount || 0,
            is_onboarding_only: loanProduct?.is_onboarding_only || false,
            gl_principal_asset: loanProduct?.gl_principal_asset || "",
            gl_penalty_revenue: loanProduct?.gl_penalty_revenue || "",
            gl_interest_revenue: loanProduct?.gl_interest_revenue || "",
            gl_processing_fee_revenue: loanProduct?.gl_processing_fee_revenue || "",
          }}
          enableReinitialize={true}
          onSubmit={async (values) => {
            try {
              setLoading(true);
              await updateLoanProduct(loanProduct?.reference, values, token);
              toast?.success("Loan product updated successfully!");
              onClose();
              refetchLoanTypes();
            } catch (error) {
              toast?.error("Failed to update loan product!");
            } finally {
              setLoading(false);
            }
          }}
        >
          {({ values, setFieldValue }) => (
            <Form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-black">
                  Name
                </Label>
                <Field
                  as={Input}
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="border-black "
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interest_rate" className="text-black">
                  Interest Rate (%)
                </Label>
                <Field
                  as={Input}
                  type="number"
                  id="interest_rate"
                  name="interest_rate"
                  className="border-black "
                  required
                />
              </div>

              {/* Processing Fee Type Toggle */}
              <div className="space-y-2">
                <Label htmlFor="processing_fee_type" className="text-black">
                  Processing Fee Type
                </Label>
                <Select
                  value={values.processing_fee_type}
                  disabled={values.is_onboarding_only}
                  onValueChange={(value) => {
                    setFieldValue("processing_fee_type", value);
                    setFieldValue("processing_fee", 0);
                    setFieldValue("processing_fee_fixed_amount", 0);
                  }}
                >
                  <SelectTrigger className={`border-black w-full ${values.is_onboarding_only ? "opacity-60 cursor-not-allowed bg-gray-50" : ""}`}>
                    <SelectValue placeholder="Select Fee Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Percentage">Percentage of Principal (%)</SelectItem>
                    <SelectItem value="Fixed">Fixed Amount (KES)</SelectItem>
                  </SelectContent>
                </Select>
                {values.is_onboarding_only && (
                  <p className="text-xs text-amber-600">Fee type is locked to Fixed for onboarding-only products.</p>
                )}
              </div>

              {/* Conditional Processing Fee Input */}
              {values.processing_fee_type === "Percentage" ? (
                <div className="space-y-2">
                  <Label htmlFor="processing_fee" className="text-black">
                    Processing Fee (%)
                  </Label>
                  <Field
                    as={Input}
                    type="number"
                    id="processing_fee"
                    name="processing_fee"
                    className="border-black"
                    required
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="processing_fee_fixed_amount" className="text-black">
                    Processing Fee Amount (KES)
                  </Label>
                  <Field
                    as={Input}
                    type="number"
                    id="processing_fee_fixed_amount"
                    name="processing_fee_fixed_amount"
                    className="border-black"
                    required
                  />
                </div>
              )}

              {/* Onboarding Only Flag */}
              <div className="flex items-center gap-3 p-3 border border-amber-200 bg-amber-50 rounded">
                <input
                  type="checkbox"
                  id="is_onboarding_only"
                  checked={values.is_onboarding_only}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setFieldValue("is_onboarding_only", checked);
                    if (checked) {
                      // Enforce Fixed fee type and clear the percentage field
                      setFieldValue("processing_fee_type", "Fixed");
                      setFieldValue("processing_fee", 0);
                    }
                  }}
                  className="h-4 w-4 accent-amber-600"
                />
                <div>
                  <Label htmlFor="is_onboarding_only" className="text-amber-800 font-semibold cursor-pointer text-sm">
                    Onboarding Only Product
                  </Label>
                  <p className="text-xs text-amber-600 mt-0.5">Members cannot apply for new loans using this product. Use for legacy loan onboarding.</p>
                </div>
              </div>

              {/* GL Principal Account (Asset) */}
              <div className="space-y-2">
                <Label htmlFor="gl_principal_asset" className="text-black">
                  Principal GL Account (Asset)
                </Label>
                <Select
                  value={values.gl_principal_asset}
                  onValueChange={(value) => setFieldValue("gl_principal_asset", value)}
                  // disabled={true}
                >
                  <SelectTrigger className="border-black w-full bg-gray-50">
                    <SelectValue placeholder="Principal Account" />
                  </SelectTrigger>
                  <SelectContent>
                    {glAccounts?.map((acc) => (
                      <SelectItem key={acc.id || acc.reference} value={acc.name}>
                        {acc.name} ({acc.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* GL Interest Account (Revenue) */}
              <div className="space-y-2">
                <Label htmlFor="gl_interest_revenue" className="text-black">
                  Interest GL Account (Revenue)
                </Label>
                <Select
                  value={values.gl_interest_revenue}
                  onValueChange={(value) => setFieldValue("gl_interest_revenue", value)}
                  // disabled={true}
                >
                  <SelectTrigger className="border-black w-full bg-gray-50">
                    <SelectValue placeholder="Interest Account" />
                  </SelectTrigger>
                  <SelectContent>
                    {glAccounts?.map((acc) => (
                      <SelectItem key={acc.id || acc.reference} value={acc.name}>
                        {acc.name} ({acc.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* GL Penalty Account (Revenue) */}
              <div className="space-y-2">
                <Label htmlFor="gl_penalty_revenue" className="text-black">
                  Penalty GL Account (Revenue)
                </Label>
                <Select
                  value={values.gl_penalty_revenue}
                  onValueChange={(value) => setFieldValue("gl_penalty_revenue", value)}
                  // disabled={true}
                >
                  <SelectTrigger className="border-black w-full bg-gray-50">
                    <SelectValue placeholder="Penalty Account" />
                  </SelectTrigger>
                  <SelectContent>
                    {glAccounts?.map((acc) => (
                      <SelectItem key={acc.id || acc.reference} value={acc.name}>
                        {acc.name} ({acc.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* GL Processing Fee Account (Revenue) */}
              <div className="space-y-2">
                <Label htmlFor="gl_processing_fee_revenue" className="text-black">
                  Processing Fee GL Account (Revenue)
                </Label>
                <Select
                  value={values.gl_processing_fee_revenue}
                  onValueChange={(value) => setFieldValue("gl_processing_fee_revenue", value)}
                  // disabled={true}
                >
                  <SelectTrigger className="border-black w-full bg-gray-50">
                    <SelectValue placeholder="Processing Fee Account" />
                  </SelectTrigger>
                  <SelectContent>
                    {glAccounts?.map((acc) => (
                      <SelectItem key={acc.id || acc.reference} value={acc.name}>
                        {acc.name} ({acc.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  className="bg-[#ea1315] hover:bg-[#c71012] text-white"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update"}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}

export default UpdateLoanProduct;
