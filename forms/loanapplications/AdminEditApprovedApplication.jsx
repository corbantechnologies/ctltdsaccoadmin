"use client";

import { Formik, Form, Field } from "formik";
import { adminEditApprovedApplication } from "@/services/loanapplications";
import toast from "react-hot-toast";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function AdminEditApprovedApplication({
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
                monthly_payment: loanApplication?.monthly_payment || "",
                start_date: loanApplication?.start_date || "",
                calculation_mode: loanApplication?.calculation_mode || "fixed_term",
                repayment_frequency: loanApplication?.repayment_frequency || "monthly",
            }}
            enableReinitialize={true}
            onSubmit={async (values, { setSubmitting }) => {
                try {
                    await adminEditApprovedApplication(reference, values, token);
                    toast.success("Application updated successfully! ??");
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
                        toast.error("Application update failed! ??");
                    }
                } finally {
                    setSubmitting(false);
                }
            }}
        >
            {({ isSubmitting, setFieldValue, values }) => (
                <Form className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="requested_amount" className="text-black">
                            Amount
                        </Label>
                        <Field
                            as={Input}
                            id="requested_amount"
                            name="requested_amount"
                            type="number"
                            min="1"
                            step="0.01"
                            placeholder="Enter amount"
                            className="border-black bg-white"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="calculation_mode" className="text-black">
                            Calculation Mode
                        </Label>
                        <Select
                            value={values.calculation_mode}
                            onValueChange={(value) => setFieldValue("calculation_mode", value)}
                        >
                            <SelectTrigger className="w-full border-black bg-white text-black">
                                <SelectValue placeholder="Select calculation mode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="fixed_term">Fixed Term (Months)</SelectItem>
                                <SelectItem value="fixed_payment">Fixed Monthly Payment</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {values.calculation_mode === "fixed_term" ? (
                        <div className="space-y-2">
                            <Label htmlFor="term_months" className="text-black">
                                Term (Months)
                            </Label>
                            <Field
                                as={Input}
                                id="term_months"
                                name="term_months"
                                type="number"
                                min="1"
                                placeholder="Enter term in months"
                                className="border-black bg-white"
                                required={values.calculation_mode === "fixed_term"}
                            />
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Label htmlFor="monthly_payment" className="text-black">
                                Monthly Payment
                            </Label>
                            <Field
                                as={Input}
                                id="monthly_payment"
                                name="monthly_payment"
                                type="number"
                                min="1"
                                step="0.01"
                                placeholder="Enter fixed payment"
                                className="border-black bg-white"
                                required={values.calculation_mode === "fixed_payment"}
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="start_date" className="text-black">
                            Start Date
                        </Label>
                        <Field
                            as={Input}
                            id="start_date"
                            name="start_date"
                            type="date"
                            className="border-black bg-white"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={closeModal}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-[#045e32] hover:bg-[#034625]"
                        >
                            {isSubmitting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="mr-2 h-4 w-4" />
                            )}
                            Update Application
                        </Button>
                    </div>
                </Form>
            )}
        </Formik>
    );
}
