"use client";

import { Formik, Form, Field } from "formik";
import { useFetchLoanProducts } from "@/hooks/loanproducts/actions";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { adminCreateLoanApplication } from "@/services/loanapplications";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Send } from "lucide-react";
import { useFetchMembers } from "@/hooks/members/actions";

export const AdminCreatesLoanApplicationForm = ({ onSuccess }) => {
    const { data: loanProducts, isLoading: productsLoading } = useFetchLoanProducts();
    const { data: members, isLoading: membersLoading } = useFetchMembers();
    const token = useAxiosAuth();
    const router = useRouter();

    if (productsLoading || membersLoading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#045e32]" />
            </div>
        );
    }

    const availableProducts = Array.isArray(loanProducts) ? loanProducts : [];
    const availableMembers = Array.isArray(members) ? members : [];

    return (
        <Formik
            initialValues={{
                member: "",
                product: "",
                requested_amount: "",
                start_date: "",
                calculation_mode: "",
                term_months: "",
                monthly_payment: "",
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

                    const response = await adminCreateLoanApplication(payload, token);
                    toast.success("Loan application submitted successfully! 🎊");

                    if (onSuccess) onSuccess();

                    router.push(`/sacco-admin/loan-applications/${response?.reference}`);

                } catch (error) {
                    console.log("Loan Application Error:", error);
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
                        toast.error("Process failed. Please try again.");
                    }
                } finally {
                    setSubmitting(false);
                }
            }}
        >
            {({ isSubmitting, values, setFieldValue }) => (
                <Form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Loan Product Selection */}
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="product" className="text-sm font-semibold">
                                Loan Product
                            </Label>
                            <Field name="product">
                                {({ field }) => (
                                    <select
                                        {...field}
                                        id="product"
                                        className="flex h-11 w-full items-center justify-between rounded border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus:outline-none focus:ring-2 focus:ring-[#045e32] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        onChange={(e) => {
                                            field.onChange(e);
                                            const selectedProd = availableProducts.find(
                                                (p) => p.name === e.target.value
                                            );
                                            if (selectedProd?.interest_method === "Flat") {
                                                setFieldValue("calculation_mode", "fixed_term");
                                                setFieldValue("monthly_payment", "");
                                            }
                                        }}
                                    >
                                        <option value="" disabled>
                                            Select a loan product
                                        </option>
                                        {availableProducts.map((product) => (
                                            <option key={product?.reference} value={product?.name}>
                                                {product?.name} - {product?.interest_method} ({product?.interest_rate}% p.a) {product?.processing_fee}% processing fee
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </Field>
                        </div>

                        {/* Amount */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="requested_amount"
                                className="text-sm font-semibold"
                            >
                                Amount (KES)
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
                                    const selectedProd = availableProducts.find(
                                        (p) => p.name === values.product
                                    );
                                    const isFlatRate = selectedProd?.interest_method === "Flat";

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

                        {/* Term Months (Conditional) */}
                        {values.calculation_mode === "fixed_term" && (
                            <div className="space-y-2">
                                <Label
                                    htmlFor="term_months"
                                    className="text-sm font-semibold"
                                >
                                    Term (Months)
                                </Label>
                                <Field
                                    as={Input}
                                    id="term_months"
                                    name="term_months"
                                    type="number"
                                    placeholder="e.g. 12"
                                    className="h-11 w-full"
                                />
                            </div>
                        )}

                        {/* Monthly Payment (Conditional) */}
                        {values.calculation_mode === "fixed_payment" && (
                            <div className="space-y-2">
                                <Label
                                    htmlFor="monthly_payment"
                                    className="text-sm font-semibold"
                                >
                                    Monthly Payment (KES)
                                </Label>
                                <Field
                                    as={Input}
                                    id="monthly_payment"
                                    name="monthly_payment"
                                    type="number"
                                    placeholder="e.g. 5000"
                                    className="h-11 w-full"
                                />
                            </div>
                        )}

                        {/* Member Selection */}
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="member" className="text-sm font-semibold">
                                Member
                            </Label>
                            <Field
                                as="select"
                                name="member"
                                id="member"
                                className="flex h-11 w-full items-center justify-between rounded border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus:outline-none focus:ring-2 focus:ring-[#045e32] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="" disabled>
                                    Select a member
                                </option>
                                {availableMembers.map((member) => (
                                    <option key={member?.reference} value={member?.member_no}>
                                        {member?.first_name} {member?.last_name} - {member?.member_no}
                                    </option>
                                ))}
                            </Field>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-[#045e32] hover:bg-[#045e32]/90 text-white h-11 px-6 rounded-lg font-semibold transition-all duration-200"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4
                                    w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Submit Application
                                </>
                            )}
                        </Button>
                    </div>
                </Form>
            )}
        </Formik>
    )
}