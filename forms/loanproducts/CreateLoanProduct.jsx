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
      <DialogContent className="w-[95vw] sm:max-w-4xl max-h-[92vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
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
            min_principal_amount: "",
            max_principal_amount: "",
            min_term_months: "",
            max_term_months: "",
            rule_savings_multiplier_enabled: false,
            max_savings_multiplier: 3.0,
            rule_first_time_applicant_enabled: false,
            first_time_max_savings_percent: 80.0,
            first_time_max_principal: "",
            first_time_min_membership_days: 0,
            rule_min_membership_days_enabled: false,
            min_membership_days: 0,
            rule_max_active_loans_enabled: false,
            max_active_loans: 1,
          }}
          onSubmit={async (values) => {
            try {
              setLoading(true);
              const payload = { ...values };
              const optionalNumeric = [
                "min_principal_amount",
                "max_principal_amount",
                "min_term_months",
                "max_term_months",
                "first_time_max_principal",
              ];
              optionalNumeric.forEach((field) => {
                if (payload[field] === "" || payload[field] === undefined) {
                  payload[field] = null;
                } else if (payload[field] !== null) {
                  payload[field] = Number(payload[field]);
                }
              });
              await createLoanProduct(payload, token);
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
            <Form className="space-y-6">
              {/* Top 2-Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Column 1: Basic Information */}
                <div className="space-y-4 bg-slate-50/60 p-4 border border-slate-200 rounded-lg">
                  <h3 className="text-sm font-bold text-slate-800 border-b pb-2">
                    1. Basic Product Information
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-black font-medium">
                      Product Name
                    </Label>
                    <Field
                      as={Input}
                      id="name"
                      name="name"
                      type="text"
                      placeholder="e.g. Normal Loan"
                      required
                      className="border-slate-300 bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="interest_method" className="text-black font-medium">
                        Interest Method
                      </Label>
                      <Select
                        value={values.interest_method}
                        onValueChange={(value) => setFieldValue("interest_method", value)}
                        required
                      >
                        <SelectTrigger className="border-slate-300 bg-white w-full">
                          <SelectValue placeholder="Select Method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Flat">Flat-rate</SelectItem>
                          <SelectItem value="Reducing">Reducing Balance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="interest_rate" className="text-black font-medium">
                        Interest Rate (%)
                      </Label>
                      <Field
                        as={Input}
                        type="number"
                        id="interest_rate"
                        name="interest_rate"
                        className="border-slate-300 bg-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="processing_fee_type" className="text-black font-medium">
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
                        <SelectTrigger className={`border-slate-300 bg-white w-full ${values.is_onboarding_only ? "opacity-60 cursor-not-allowed" : ""}`}>
                          <SelectValue placeholder="Select Fee Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Percentage">Percentage of Principal (%)</SelectItem>
                          <SelectItem value="Fixed">Fixed Amount (KES)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {values.processing_fee_type === "Percentage" ? (
                      <div className="space-y-2">
                        <Label htmlFor="processing_fee" className="text-black font-medium">
                          Processing Fee (%)
                        </Label>
                        <Field
                          as={Input}
                          type="number"
                          id="processing_fee"
                          name="processing_fee"
                          className="border-slate-300 bg-white"
                          required
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor="processing_fee_fixed_amount" className="text-black font-medium">
                          Processing Fee (KES)
                        </Label>
                        <Field
                          as={Input}
                          type="number"
                          id="processing_fee_fixed_amount"
                          name="processing_fee_fixed_amount"
                          className="border-slate-300 bg-white"
                          required
                        />
                      </div>
                    )}
                  </div>

                  {/* Onboarding Flag */}
                  <div className="flex items-center gap-3 p-3 border border-amber-200 bg-amber-50 rounded mt-2">
                    <input
                      type="checkbox"
                      id="is_onboarding_only"
                      checked={values.is_onboarding_only}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFieldValue("is_onboarding_only", checked);
                        if (checked) {
                          setFieldValue("processing_fee_type", "Fixed");
                          setFieldValue("processing_fee", 0);
                        }
                      }}
                      className="h-4 w-4 accent-amber-600"
                    />
                    <div>
                      <Label htmlFor="is_onboarding_only" className="text-amber-800 font-semibold cursor-pointer text-xs">
                        Onboarding Only Product
                      </Label>
                      <p className="text-[11px] text-amber-600">Reserved for legacy loan onboarding.</p>
                    </div>
                  </div>
                </div>

                {/* Column 2: GL Account Mapping */}
                <div className="space-y-4 bg-slate-50/60 p-4 border border-slate-200 rounded-lg">
                  <h3 className="text-sm font-bold text-slate-800 border-b pb-2">
                    2. General Ledger (GL) Mapping
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="gl_principal_asset" className="text-black font-medium">
                      Principal GL Account (Asset)
                    </Label>
                    <Select
                      value={values.gl_principal_asset}
                      onValueChange={(value) => setFieldValue("gl_principal_asset", value)}
                      disabled={isLoadingGL}
                    >
                      <SelectTrigger className="border-slate-300 bg-white w-full">
                        <SelectValue placeholder={isLoadingGL ? "Loading..." : "Select Principal Account"} />
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

                  <div className="space-y-2">
                    <Label htmlFor="gl_interest_revenue" className="text-black font-medium">
                      Interest GL Account (Revenue)
                    </Label>
                    <Select
                      value={values.gl_interest_revenue}
                      onValueChange={(value) => setFieldValue("gl_interest_revenue", value)}
                      disabled={isLoadingGL}
                    >
                      <SelectTrigger className="border-slate-300 bg-white w-full">
                        <SelectValue placeholder={isLoadingGL ? "Loading..." : "Select Interest Account"} />
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

                  <div className="space-y-2">
                    <Label htmlFor="gl_penalty_revenue" className="text-black font-medium">
                      Penalty GL Account (Revenue)
                    </Label>
                    <Select
                      value={values.gl_penalty_revenue}
                      onValueChange={(value) => setFieldValue("gl_penalty_revenue", value)}
                      disabled={isLoadingGL}
                    >
                      <SelectTrigger className="border-slate-300 bg-white w-full">
                        <SelectValue placeholder={isLoadingGL ? "Loading..." : "Select Penalty Account"} />
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

                  <div className="space-y-2">
                    <Label htmlFor="gl_processing_fee_revenue" className="text-black font-medium">
                      Processing Fee GL Account (Revenue)
                    </Label>
                    <Select
                      value={values.gl_processing_fee_revenue}
                      onValueChange={(value) => setFieldValue("gl_processing_fee_revenue", value)}
                      disabled={isLoadingGL}
                    >
                      <SelectTrigger className="border-slate-300 bg-white w-full">
                        <SelectValue placeholder={isLoadingGL ? "Loading..." : "Select Fee Account"} />
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
                </div>
              </div>

              {/* Bottom Full-Width Section: Rules & Limits */}
              <div className="bg-slate-50/60 p-4 border border-slate-200 rounded-lg space-y-4">
                <h3 className="text-sm font-bold text-slate-800 border-b pb-2">
                  3. Product Rules & Limits (Optional)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Rules Column */}
                  <div className="space-y-4">
                    {/* Principal Bounds */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="min_principal_amount" className="text-xs text-slate-700 font-medium">
                          Min Principal (KES)
                        </Label>
                        <Field
                          as={Input}
                          type="number"
                          id="min_principal_amount"
                          name="min_principal_amount"
                          placeholder="e.g. 1000"
                          className="border-slate-300 bg-white text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="max_principal_amount" className="text-xs text-slate-700 font-medium">
                          Max Principal (KES)
                        </Label>
                        <Field
                          as={Input}
                          type="number"
                          id="max_principal_amount"
                          name="max_principal_amount"
                          placeholder="e.g. 50000"
                          className="border-slate-300 bg-white text-sm"
                        />
                      </div>
                    </div>

                    {/* Term Bounds */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="min_term_months" className="text-xs text-slate-700 font-medium">
                          Min Term (Months)
                        </Label>
                        <Field
                          as={Input}
                          type="number"
                          id="min_term_months"
                          name="min_term_months"
                          placeholder="e.g. 1"
                          className="border-slate-300 bg-white text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="max_term_months" className="text-xs text-slate-700 font-medium">
                          Max Term (Months)
                        </Label>
                        <Field
                          as={Input}
                          type="number"
                          id="max_term_months"
                          name="max_term_months"
                          placeholder="e.g. 36"
                          className="border-slate-300 bg-white text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Rules Column */}
                  <div className="space-y-3">
                    {/* Savings Multiplier Rule */}
                    <div className="space-y-2 p-3 bg-white border border-slate-200 rounded">
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
                          <Label htmlFor="max_savings_multiplier" className="text-[11px] text-slate-600">
                            Max Multiplier (e.g. 3.0 = 3x savings)
                          </Label>
                          <Field
                            as={Input}
                            type="number"
                            step="0.1"
                            id="max_savings_multiplier"
                            name="max_savings_multiplier"
                            className="border-slate-300 text-sm"
                          />
                        </div>
                      )}
                    </div>

                    {/* First-Time Applicant Rule */}
                    <div className="space-y-2 p-3 bg-white border border-slate-200 rounded">
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
                            <Label htmlFor="first_time_max_savings_percent" className="text-[11px] text-slate-600">
                              Max Savings % (e.g. 80.0%)
                            </Label>
                            <Field
                              as={Input}
                              type="number"
                              step="1"
                              id="first_time_max_savings_percent"
                              name="first_time_max_savings_percent"
                              className="border-slate-300 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="first_time_max_principal" className="text-[11px] text-slate-600">
                              Principal Cap (KES)
                            </Label>
                            <Field
                              as={Input}
                              type="number"
                              id="first_time_max_principal"
                              name="first_time_max_principal"
                              placeholder="e.g. 20000"
                              className="border-slate-300 text-sm"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="border-slate-300 text-slate-700 hover:bg-slate-100 px-6"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primary hover:opacity-90 text-white px-8"
                  disabled={loading || isLoadingGL}
                >
                  {loading ? "Creating..." : "Create Product"}
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
