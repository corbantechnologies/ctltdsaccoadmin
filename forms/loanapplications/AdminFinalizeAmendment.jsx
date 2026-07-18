"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { finalizeLoanAmendment } from "@/services/loanapplications";
import toast from "react-hot-toast";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const FinalizeAmendmentSchema = Yup.object().shape({
  amendment_note: Yup.string()
    .required("Amendment note is required to explain the finalized terms."),
});

export function AdminFinalizeAmendment({
  closeModal,
  reference,
  loanApplication,
  onSuccess,
}) {
  const token = useAxiosAuth();

  return (
    <Formik
      initialValues={{
        amendment_note: "",
      }}
      validationSchema={FinalizeAmendmentSchema}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          // Finalizing uses the finalize-amendment endpoint
          await finalizeLoanAmendment(reference, values, token);
          toast.success("Loan application finalized successfully! 🎊");
          if (onSuccess) onSuccess();
          closeModal();
        } catch (error) {
          console.error("Finalization failed", error);
          toast.error("Failed to finalize loan application. ❌");
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting, errors, touched }) => (
        <Form className="space-y-6">
          <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-3">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#045e32]" /> Finalizing Terms
            </h3>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Requested Amount:</span>
              <span className="font-bold text-slate-900">
                {formatCurrency(loanApplication?.requested_amount)}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 italic">
              The amount above is what will be committed upon finalization. If you need to change it, use the update draft action first.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amendment_note" className="text-sm font-semibold">
              Amendment Note <span className="text-red-500">*</span>
            </Label>
            <Field
              as="textarea"
              id="amendment_note"
              name="amendment_note"
              placeholder="Provide a reason for the final terms or any relevant notes..."
              className={`flex min-h-[100px] w-full rounded border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#045e32] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.amendment_note && touched.amendment_note
                ? "border-red-500"
                : "border-slate-300"
                }`}
            />
            <ErrorMessage
              name="amendment_note"
              component="div"
              className="text-red-500 text-xs mt-1 font-medium"
            />
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
                  Finalizing...
                </>
              ) : (
                "Finalize Amendment"
              )}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
