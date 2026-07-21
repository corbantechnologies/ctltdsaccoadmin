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
import { createLoanProduct } from "@/services/loanproducts";
import { useFetchGLAccounts } from "@/hooks/glaccounts/actions";
import toast from "react-hot-toast";

function CreateLoanProduct({ isOpen, onClose, refetchLoanTypes }) {
  const [loading, setLoading] = useState(false);
  const token = useAxiosAuth();
  const { data: glAccounts, isLoading: isLoadingGL } = useFetchGLAccounts();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="">
            Create New Loan Type
          </DialogTitle>
        </DialogHeader>
        <Formik
          initialValues={{
            name: "",
            interest_method: "",
            interest_rate: 0,
            processing_fee_type: "Percentage",
            processing_fee: 0,
            processing_fee_fixed_amount: 0,
            is_onboarding_only: false,
            gl_principal_asset: "",
            gl_penalty_revenue: "",
            gl_interest_revenue: "",
            gl_processing_fee_revenue: "",
          }}
          onSubmit={async (values) => {
            try {
              setLoading(true);
              await createLoanProduct(values, token);
              toast?.success("Loan product created successfully!");
              onClose();
              refetchLoanTypes();
            } catch (error) {
              toast?.error("Failed to create loan product!");
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
                <Label htmlFor="interest_method" className="text-black">
                  Interest Method
                </Label>
                <Select
                  value={values.interest_method}
                  onValueChange={(value) => setFieldValue("interest_method", value)}
                  required
                >
                  <SelectTrigger className="border-black w-full">
                    <SelectValue placeholder="Select Interest Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Flat">Flat-rate</SelectItem>
                    <SelectItem value="Reducing">
                      Reducing (Diminishing) Balance
                    </SelectItem>
                  </SelectContent>
                </Select>
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
                    // Reset amounts when switching type
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
                  disabled={isLoadingGL}
                >
                  <SelectTrigger className="border-black w-full">
                    <SelectValue
                      placeholder={
                        isLoadingGL ? "Loading..." : "Select Principal Account"
                      }
                    />
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
                  disabled={isLoadingGL}
                >
                  <SelectTrigger className="border-black w-full">
                    <SelectValue
                      placeholder={
                        isLoadingGL ? "Loading..." : "Select Interest Account"
                      }
                    />
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
                  disabled={isLoadingGL}
                >
                  <SelectTrigger className="border-black w-full">
                    <SelectValue
                      placeholder={
                        isLoadingGL ? "Loading..." : "Select Penalty Account"
                      }
                    />
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
                  disabled={isLoadingGL}
                >
                  <SelectTrigger className="border-black w-full">
                    <SelectValue
                      placeholder={
                        isLoadingGL ? "Loading..." : "Select Processing Fee Account"
                      }
                    />
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

              {/* Product Rules & Limits Configuration */}
              <div className="space-y-4 pt-3 border-t">
                <h4 className="text-sm font-semibold text-slate-800">
                  Product Rules & Limits (Optional)
                </h4>

                {/* Principal Bounds */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="min_principal_amount" className="text-xs text-slate-700">
                      Min Principal (KES)
                    </Label>
                    <Field
                      as={Input}
                      type="number"
                      id="min_principal_amount"
                      name="min_principal_amount"
                      placeholder="e.g. 1000"
                      className="border-black text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="max_principal_amount" className="text-xs text-slate-700">
                      Max Principal (KES)
                    </Label>
                    <Field
                      as={Input}
                      type="number"
                      id="max_principal_amount"
                      name="max_principal_amount"
                      placeholder="e.g. 50000"
                      className="border-black text-sm"
                    />
                  </div>
                </div>

                {/* Term Bounds */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="min_term_months" className="text-xs text-slate-700">
                      Min Term (Months)
                    </Label>
                    <Field
                      as={Input}
                      type="number"
                      id="min_term_months"
                      name="min_term_months"
                      placeholder="e.g. 1"
                      className="border-black text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="max_term_months" className="text-xs text-slate-700">
                      Max Term (Months)
                    </Label>
                    <Field
                      as={Input}
                      type="number"
                      id="max_term_months"
                      name="max_term_months"
                      placeholder="e.g. 36"
                      className="border-black text-sm"
                    />
                  </div>
                </div>

                {/* Savings Multiplier Rule */}
                <div className="space-y-2 p-3 bg-slate-50 border rounded">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="rule_savings_multiplier_enabled"
                      checked={values.rule_savings_multiplier_enabled}
                      onChange={(e) => setFieldValue("rule_savings_multiplier_enabled", e.target.checked)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="rule_savings_multiplier_enabled" className="text-xs font-semibold text-slate-800 cursor-pointer">
                      Enable Savings Multiplier Rule
                    </Label>
                  </div>
                  {values.rule_savings_multiplier_enabled && (
                    <div className="space-y-1 pt-1">
                      <Label htmlFor="max_savings_multiplier" className="text-xs text-slate-600">
                        Max Multiplier against Savings (e.g. 3.0 = 3x savings)
                      </Label>
                      <Field
                        as={Input}
                        type="number"
                        step="0.1"
                        id="max_savings_multiplier"
                        name="max_savings_multiplier"
                        className="border-black text-sm"
                      />
                    </div>
                  )}
                </div>

                {/* First-Time Applicant Rule */}
                <div className="space-y-2 p-3 bg-slate-50 border rounded">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="rule_first_time_applicant_enabled"
                      checked={values.rule_first_time_applicant_enabled}
                      onChange={(e) => setFieldValue("rule_first_time_applicant_enabled", e.target.checked)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="rule_first_time_applicant_enabled" className="text-xs font-semibold text-slate-800 cursor-pointer">
                      Enable First-Time Applicant Rule
                    </Label>
                  </div>
                  {values.rule_first_time_applicant_enabled && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="space-y-1">
                        <Label htmlFor="first_time_max_savings_percent" className="text-xs text-slate-600">
                          Max Savings % (e.g. 80.0%)
                        </Label>
                        <Field
                          as={Input}
                          type="number"
                          step="1"
                          id="first_time_max_savings_percent"
                          name="first_time_max_savings_percent"
                          className="border-black text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="first_time_max_principal" className="text-xs text-slate-600">
                          Max Principal Cap (KES)
                        </Label>
                        <Field
                          as={Input}
                          type="number"
                          id="first_time_max_principal"
                          name="first_time_max_principal"
                          placeholder="e.g. 20000"
                          className="border-black text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
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
                  disabled={loading || isLoadingGL}
                >
                  {loading ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}

export default CreateLoanProduct;
