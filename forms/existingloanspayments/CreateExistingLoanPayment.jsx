"use client";

import React from "react";
import { Formik, Form, Field } from "formik";
import Modal from "@/components/general/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateExistingLoanPayment } from "@/hooks/existingloanpayments/actions";
import { useFetchExistingLoans } from "@/hooks/existingloans/actions";
import { useFetchPaymentAccounts } from "@/hooks/paymentaccounts/actions";
import { Save, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function CreateExistingLoanPayment({ isOpen, onClose, initialLoanAcc = "" }) {
    const { mutate: createPayment, isLoading: isCreating } = useCreateExistingLoanPayment();
    const { data: existingLoans, isLoading: isLoadingLoans } = useFetchExistingLoans();
    const { data: paymentAccounts, isLoading: isLoadingPayments } = useFetchPaymentAccounts();

    const handleSubmit = (values, { setSubmitting }) => {
        if (!values.existing_loan || !values.amount || !values.payment_method) {
            toast.error("Please fill in all required fields.");
            setSubmitting(false);
            return;
        }

        createPayment(values, {
            onSuccess: () => {
                toast.success("Payment recorded successfully!");
                onClose();
                setSubmitting(false);
            },
            onError: () => {
                setSubmitting(false);
            }
        });
    };

    const selectClass = "w-full h-10 px-3 bg-white border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-all appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_10px_center] bg-no-repeat";

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Record Historical Payment"
            description="Manually record a payment made towards an existing loan."
            maxWidth="max-w-lg"
        >
            <Formik
                initialValues={{
                    existing_loan: initialLoanAcc,
                    payment_method: "",
                    repayment_type: "Regular Repayment",
                    amount: "",
                    transaction_status: "Completed",
                }}
                enableReinitialize={true}
                onSubmit={handleSubmit}
            >
                {({ values, setFieldValue, isSubmitting }) => (
                    <Form className="space-y-4">
                        {/* Loan Selection */}
                        <div className="space-y-2">
                            <Label className="text-[var(--accent)] font-semibold uppercase text-[11px] tracking-wider">Loan (Account Number)</Label>
                            <select
                                className={selectClass}
                                value={values.existing_loan}
                                onChange={(e) => setFieldValue("existing_loan", e.target.value)}
                            >
                                <option value="">{isLoadingLoans ? "Loading..." : "Select Loan"}</option>
                                {existingLoans?.map((loan) => (
                                    <option key={loan.reference} value={loan.account_number}>
                                        {loan.account_number} - {loan.member_name} (KES {loan.outstanding_balance})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Payment Method */}
                        <div className="space-y-2">
                            <Label className="text-[var(--accent)] font-semibold uppercase text-[11px] tracking-wider">Payment Method</Label>
                            <select
                                className={selectClass}
                                value={values.payment_method}
                                onChange={(e) => setFieldValue("payment_method", e.target.value)}
                            >
                                <option value="">{isLoadingPayments ? "Loading..." : "Select Method"}</option>
                                {paymentAccounts?.map((pa) => (
                                    <option key={pa.reference} value={pa.name}>{pa.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Amount */}
                        <div className="space-y-2">
                            <Label className="text-[var(--accent)] font-semibold uppercase text-[11px] tracking-wider">Paid Amount</Label>
                            <Field
                                as={Input}
                                type="number"
                                name="amount"
                                className="h-10 border-slate-300 rounded focus-visible:ring-1 focus-visible:ring-[var(--accent)] shadow-none"
                                placeholder="0.00"
                            />
                        </div>

                        {/* Repayment Type */}
                        <div className="space-y-2">
                            <Label className="text-[var(--accent)] font-semibold uppercase text-[11px] tracking-wider">Repayment Type</Label>
                            <select
                                className={selectClass}
                                value={values.repayment_type}
                                onChange={(e) => setFieldValue("repayment_type", e.target.value)}
                            >
                                <option value="Regular Repayment">Regular Repayment</option>
                                <option value="Partial Payment">Partial Payment</option>
                                <option value="Early Settlement">Early Settlement</option>
                                <option value="Penalty Payment">Penalty Payment</option>
                                <option value="Loan Clearance">Loan Clearance</option>
                                <option value="Interest Only">Interest Only</option>
                            </select>
                        </div>

                        {/* Transaction Status */}
                        <div className="space-y-2">
                            <Label className="text-[var(--accent)] font-semibold uppercase text-[11px] tracking-wider">Status</Label>
                            <select
                                className={selectClass}
                                value={values.transaction_status}
                                onChange={(e) => setFieldValue("transaction_status", e.target.value)}
                            >
                                <option value="Completed">Completed</option>
                                <option value="Pending">Pending</option>
                                <option value="Failed">Failed</option>
                            </select>
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="border-slate-200 text-slate-600 font-semibold px-6 h-10 rounded hover:bg-slate-50"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting || isCreating}
                                className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold px-10 h-10 flex items-center gap-2 shadow-sm rounded"
                            >
                                {isSubmitting || isCreating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Record Payment
                                    </>
                                )}
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
}
