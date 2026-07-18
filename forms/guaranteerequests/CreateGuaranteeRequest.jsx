"use client";

import { createGuaranteeRequest } from "@/services/guaranteerequests";
import { Form, Formik, Field } from "formik";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { useState } from "react";
import Link from "next/link";
import { useFetchGuarantorProfiles } from "@/hooks/guarantors/actions";
import toast from "react-hot-toast";
import useUserMemberNo from "@/hooks/authentication/useUserMemberNo";

export default function CreateGuaranteeRequest({ loanApplication, onSuccess }) {
  const token = useAxiosAuth();
  const [loading, setLoading] = useState(false);
  const { data: guarantorProfiles } = useFetchGuarantorProfiles();
  const userMemberNo = useUserMemberNo();

  const filteredGuarantorProfiles = guarantorProfiles?.filter(
    (profile) => profile.member !== userMemberNo
  );

  return (
    <Formik
      initialValues={{
        guarantor: "",
        loan_application: loanApplication?.reference,
      }}
      onSubmit={async (values) => {
        setLoading(true);
        try {
          await createGuaranteeRequest(values, token);
          toast.success("Guarantee request created successfully");
          if (onSuccess) onSuccess();
        } catch (error) {
          toast.error("Failed to create guarantee request");
        } finally {
          setLoading(false);
        }
      }}
    >
      {({ values, handleChange, setFieldValue, isSubmitting }) => (
        <Form className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="guarantor" className="text-sm font-medium mb-2">
              Select Guarantor
            </label>
            <Field
              as="select"
              name="guarantor"
              className="flex h-10 w-full rounded border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select a guarantor</option>
              {filteredGuarantorProfiles?.map((profile) => (
                <option key={profile.reference} value={profile.member}>
                  {profile.member} - {profile.member_name}
                </option>
              ))}
            </Field>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading || isSubmitting}
              className="inline-flex items-center justify-center rounded text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-[#045e32] text-primary-foreground hover:bg-[#045e32]/90 h-10 px-4 py-2 w-full sm:w-auto"
            >
              {loading ? "Submitting..." : "Send Request"}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
