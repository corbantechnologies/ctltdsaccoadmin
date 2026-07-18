"use client";

import React, { useState } from "react";
import { Formik, Form, Field } from "formik";
import Modal from "@/components/general/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateExistingLoan } from "@/hooks/existingloans/actions";
import { useFetchMembers } from "@/hooks/members/actions";
import { useFetchGLAccounts } from "@/hooks/glaccounts/actions";
import { useFetchPaymentAccounts } from "@/hooks/paymentaccounts/actions";
import toast from "react-hot-toast";

export default function CreateExistingLoan({ isOpen, onClose }) {
    const { mutate: createLoan, isLoading: isCreating } = useCreateExistingLoan();
    const { data: members, isLoading: isLoadingMembers } = useFetchMembers();
    const { data: glAccounts, isLoading: isLoadingGL } = useFetchGLAccounts();
    const { data: paymentAccounts, isLoading: isLoadingPayments } = useFetchPaymentAccounts();

    const handleSubmit = (values, { setSubmitting }) => {
        createLoan(values, {
            onSuccess: () => {
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
            title="Onboard Existing Loan"
            description="Manually add a single loan from a legacy system."
            maxWidth="max-w-lg" 
        >
            <Formik
                initialValues={{
                    member: "",
                    payment_method: "",
                    principal: "",
                    gl_principal_asset: "",
                    gl_interest_revenue: "",
                    gl_penalty_revenue: "",
                }}
                onSubmit={handleSubmit}
            >
                {({ values, setFieldValue, errors, touched, isSubmitting }) => {
                    return (
                        <Form className="space-y-4">
                            {/* Member Selection */}
                            <div className="space-y-2">
                                <Label className="text-[var(--accent)] font-semibold">Member (Member No)</Label>
                                <select
                                    className={selectClass}
                                    value={values.member}
                                    onChange={(e) => setFieldValue("member", e.target.value)}
                                >
                                    <option value="">{isLoadingMembers ? "Loading..." : "Select Member"}</option>
                                    {members?.map((m) => (
                                        <option key={m.member_no} value={m.member_no}>
                                            {m.first_name} {m.last_name} ({m.member_no})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Principal */}
                            <div className="space-y-2">
                                <Label className="text-[var(--accent)] font-semibold">Principal Amount</Label>
                                <Field
                                    as={Input}
                                    type="number"
                                    name="principal"
                                    className="border-slate-300 h-10 rounded shadow-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                                    placeholder="Enter principal amount"
                                />
                            </div>

                            {/* Payment Method */}
                            <div className="space-y-2">
                                <Label className="text-[var(--accent)] font-semibold">Initial Payment Method</Label>
                                <select
                                    className={selectClass}
                                    value={values.payment_method}
                                    onChange={(e) => setFieldValue("payment_method", e.target.value)}
                                >
                                    <option value="">{isLoadingPayments ? "Loading..." : "Select Method"}</option>
                                    {paymentAccounts?.map((pa) => (
                                        <option key={pa.reference} value={pa.name}>
                                            {pa.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <hr className="border-slate-100 my-2" />
                            <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest text-center">GL Account Mapping</h3>

                            {/* GL Principal Asset */}
                            <div className="space-y-2">
                                <Label className="text-[var(--accent)] font-semibold">GL Principal Asset</Label>
                                <select
                                    className={selectClass}
                                    value={values.gl_principal_asset}
                                    onChange={(e) => setFieldValue("gl_principal_asset", e.target.value)}
                                >
                                    <option value="">Select GL</option>
                                    {glAccounts?.map((acc) => (
                                        <option key={acc.reference} value={acc.name}>
                                            {acc.name} ({acc.code})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* GL Interest Revenue */}
                            <div className="space-y-2">
                                <Label className="text-[var(--accent)] font-semibold">GL Interest Revenue</Label>
                                <select
                                    className={selectClass}
                                    value={values.gl_interest_revenue}
                                    onChange={(e) => setFieldValue("gl_interest_revenue", e.target.value)}
                                >
                                    <option value="">Select GL</option>
                                    {glAccounts?.map((acc) => (
                                        <option key={acc.reference} value={acc.name}>
                                            {acc.name} ({acc.code})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* GL Penalty Revenue */}
                            <div className="space-y-2">
                                <Label className="text-[var(--accent)] font-semibold">GL Penalty Revenue</Label>
                                <select
                                    className={selectClass}
                                    value={values.gl_penalty_revenue}
                                    onChange={(e) => setFieldValue("gl_penalty_revenue", e.target.value)}
                                >
                                    <option value="">Select GL</option>
                                    {glAccounts?.map((acc) => (
                                        <option key={acc.reference} value={acc.name}>
                                            {acc.name} ({acc.code})
                                        </option>
                                    ))}
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
                                    className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold px-8 h-10 shadow-sm rounded"
                                >
                                    {isSubmitting || isCreating ? "Saving..." : "Onboard Loan"}
                                </Button>
                            </div>
                        </Form>
                    );
                }}
            </Formik>
        </Modal>
    );
}
