"use client";

import { Formik, Form, Field } from "formik";
import { amendLoanApplication } from "@/services/loanapplications";
import toast from "react-hot-toast";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";

export function AdminUpdateLoanApplication({
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
      }}
      enableReinitialize={true}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          await amendLoanApplication(reference, values, token);
          toast.success("Application draft updated successfully! 🎊");
          if (onSuccess) onSuccess();
          closeModal();
        } catch (error) {
          console.error("Update Error:", error);
          const errorData = error?.response?.data;
          if (errorData) {
            const firstErrorKey = Object.keys(errorData)[0];
            const firstError = errorData[firstErrorKey];
            const errorMessage = Array.isArray(firstError)
              ? firstError[0]
              : firstError;
            toast.error(`${firstErrorKey.replace(/_/g, " ")}: ${errorMessage}`);
          } else {
            toast.error("Draft update failed! ❌");
          }
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting }) => (
        <Form className="space-y-6">
          <div className="space-y-4">
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
                className="h-11 border-slate-300 focus:border-[#045e32] focus:ring-[#045e32]"
              />
              <p className="text-xs text-muted-foreground italic">
                Updating the amount here allows you to preview the new repayment schedule before finalizing.
              </p>
            </div>
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
                  Updating Draft...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Update Draft
                </>
              )}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
