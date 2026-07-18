"use client";

import { Formik, Form, Field } from "formik";
import { updateLoanApplication } from "@/services/loanapplications";
import toast from "react-hot-toast";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";

export function MemberUpdateLoanApplication({
  closeModal,
  reference,
  loanApplication,
  onSuccess,
}) {
  const token = useAxiosAuth();

  return (
    <Formik
      initialValues={{
        requested_amount: loanApplication?.requested_amount || "",
        term_months: loanApplication?.term_months || "",
        start_date: loanApplication?.start_date || "",
        calculation_mode: loanApplication?.calculation_mode || "",
        monthly_payment: loanApplication?.monthly_payment || "",
      }}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          // Clean payload based on calculation mode
          const payload = { ...values };
          if (values.calculation_mode === "fixed_term") {
            payload.monthly_payment = null;
          } else if (values.calculation_mode === "fixed_payment") {
            payload.term_months = null;
          }

          await updateLoanApplication(reference, payload, token);
          toast.success("Loan application updated successfully! 🎊");
          if (onSuccess) onSuccess();
          closeModal();
        } catch (error) {
          console.error("Update Error:", error);
          const errorData = error?.response?.data;
          if (errorData) {
            // Handle nested error objects or arrays from backend
            const firstErrorKey = Object.keys(errorData)[0];
            const firstError = errorData[firstErrorKey];
            const errorMessage = Array.isArray(firstError)
              ? firstError[0]
              : firstError;
            toast.error(`${firstErrorKey.replace(/_/g, " ")}: ${errorMessage}`);
          } else {
            toast.error("Loan application update failed! ❌");
          }
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting, values, setFieldValue }) => (
        <Form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Amount */}
            <div className="space-y-2">
              <Label
                htmlFor="requested_amount"
                className="text-sm font-semibold"
              >
                Requested Amount (KES)
              </Label>
              <Field
                as={Input}
                id="requested_amount"
                name="requested_amount"
                type="number"
                placeholder="e.g. 50000"
                className="h-11"
              />
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="start_date" className="text-sm font-semibold">
                Start Date
              </Label>
              <Field
                as={Input}
                id="start_date"
                name="start_date"
                type="date"
                className="h-11"
              />
            </div>

            {/* Calculation Mode */}
            <div className="space-y-2 md:col-span-2">
              <Label
                htmlFor="calculation_mode"
                className="text-sm font-semibold"
              >
                Calculation Mode
              </Label>
              <Field name="calculation_mode">
                {({ field }) => {
                  const isFlatRate =
                    loanApplication?.product_details?.interest_method === "Flat" ||
                    loanApplication?.interest_method === "Flat";

                  return (
                    <div>
                      <select
                        {...field}
                        id="calculation_mode"
                        onChange={(e) => {
                          field.onChange(e);
                          // Clear complementary fields when mode changes
                          if (e.target.value === "fixed_term") {
                            setFieldValue("monthly_payment", "");
                          } else if (e.target.value === "fixed_payment") {
                            setFieldValue("term_months", "");
                          }
                        }}
                        className="flex h-11 w-full rounded border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus:outline-none focus:ring-2 focus:ring-[#045e32] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Select mode</option>
                        <option value="fixed_term">Fixed Term</option>
                        <option value="fixed_payment" disabled={isFlatRate}>
                          Fixed Payment {isFlatRate && "(Not available for Flat Rate)"}
                        </option>
                      </select>
                      {isFlatRate && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Flat-rate loans require a fixed term.
                        </p>
                      )}
                    </div>
                  );
                }}
              </Field>
            </div>

            {/* Conditional: Term Months */}
            {values.calculation_mode === "fixed_term" && (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="term_months" className="text-sm font-semibold">
                  Term (Months)
                </Label>
                <Field
                  as={Input}
                  id="term_months"
                  name="term_months"
                  type="number"
                  placeholder="e.g. 12"
                  className="h-11"
                />
              </div>
            )}

            {/* Conditional: Monthly Payment */}
            {values.calculation_mode === "fixed_payment" && (
              <div className="space-y-2 md:col-span-2">
                <Label
                  htmlFor="monthly_payment"
                  className="text-sm font-semibold"
                >
                  Monthly Payment
                </Label>
                <Field
                  as={Input}
                  id="monthly_payment"
                  name="monthly_payment"
                  type="number"
                  placeholder="e.g. 10000"
                  className="h-11"
                />
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={closeModal}
              disabled={isSubmitting}
              className="h-11 px-6 font-medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#045e32] hover:bg-[#034625] h-11 px-8 text-white font-medium transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Update Application
                </>
              )}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
