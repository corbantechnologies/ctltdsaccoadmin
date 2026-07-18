"use client";

import React, { useState } from "react";
import Modal from "@/components/general/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBulkCreateExistingLoanPayment } from "@/hooks/existingloanpayments/actions";
import { useFetchExistingLoans } from "@/hooks/existingloans/actions";
import { useFetchPaymentAccounts } from "@/hooks/paymentaccounts/actions";
import { Plus, Trash2, Save, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function BulkCreateExistingLoanPayment({ isOpen, onClose, isInline = false }) {
    const { mutate: bulkCreate, isLoading: isCreating } = useBulkCreateExistingLoanPayment();
    const { data: existingLoans, isLoading: isLoadingLoans } = useFetchExistingLoans();
    const { data: paymentAccounts, isLoading: isLoadingPayments } = useFetchPaymentAccounts();

    const emptyPayment = {
        existing_loan: "",
        payment_method: "",
        repayment_type: "Regular Repayment",
        amount: "",
        transaction_status: "Completed",
    };

    const [payments, setPayments] = useState([{ ...emptyPayment }]);

    const handleInputChange = (index, field, value) => {
        const newPayments = [...payments];
        newPayments[index][field] = value;
        setPayments(newPayments);
    };

    const addPayment = () => {
        setPayments([...payments, { ...emptyPayment }]);
    };

    const removePayment = (indexToRemove) => {
        setPayments(payments.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic validation
        const invalidRow = payments.find(p => !p.existing_loan || !p.amount || !p.payment_method);
        if (invalidRow) {
            toast.error("Please ensure all rows have a Loan, Amount, and Payment Method.");
            return;
        }

        bulkCreate({ payments: payments }, {
            onSuccess: () => {
                toast.success("Batch payments recorded successfully!");
                setPayments([{ ...emptyPayment }]);
                if (onClose) onClose();
            }
        });
    };

    const selectClass = "w-full h-10 px-3 bg-white border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-all appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:18px] bg-[right_10px_center] bg-no-repeat";

    const content = (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                {payments.map((payment, index) => (
                    <div
                        key={index}
                        className="p-5 border border-slate-200 rounded-xl bg-white shadow-sm relative group hover:border-[var(--accent)]/30 transition-all border-t-4 border-t-[var(--accent)]/80"
                    >
                        <div className="flex justify-between items-center mb-4 border-b border-slate-50 pb-2">
                            <span className="text-[10px] items-center flex gap-2 font-semibold px-2 py-0.5 bg-slate-100 rounded text-slate-500 uppercase tracking-widest border border-slate-200">
                                Payment Entry #{index + 1}
                            </span>
                            {payments.length > 1 && (
                                <Button
                                    type="button"
                                    onClick={() => removePayment(index)}
                                    variant="ghost"
                                    className="text-rose-400 hover:text-rose-600 p-1.5 h-auto transition-colors bg-rose-50/50 rounded"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Loan Selection */}
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-semibold text-[var(--accent)] uppercase tracking-tight">Loan (Account Number)</Label>
                                <select
                                    className={selectClass}
                                    value={payment.existing_loan}
                                    onChange={(e) => handleInputChange(index, "existing_loan", e.target.value)}
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
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-semibold text-[var(--accent)] uppercase tracking-tight">Payment Method</Label>
                                <select
                                    className={selectClass}
                                    value={payment.payment_method}
                                    onChange={(e) => handleInputChange(index, "payment_method", e.target.value)}
                                >
                                    <option value="">{isLoadingPayments ? "Loading..." : "Select Method"}</option>
                                    {paymentAccounts?.map((pa) => (
                                        <option key={pa.reference} value={pa.name}>{pa.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-50 grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Amount */}
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-semibold text-[var(--accent)] uppercase tracking-tight">Paid Amount</Label>
                                <Input
                                    type="number"
                                    value={payment.amount}
                                    onChange={(e) => handleInputChange(index, "amount", e.target.value)}
                                    className="h-10 border-slate-200 focus:border-[var(--accent)] font-medium"
                                    placeholder="0.00"
                                />
                            </div>

                            {/* Repayment Type */}
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-semibold text-[var(--accent)] uppercase tracking-tight">Repayment Type</Label>
                                <select
                                    className={selectClass}
                                    value={payment.repayment_type}
                                    onChange={(e) => handleInputChange(index, "repayment_type", e.target.value)}
                                >
                                    <option value="Regular Repayment">Regular Repayment</option>
                                    <option value="Partial Payment">Partial Payment</option>
                                    <option value="Early Settlement">Early Settlement</option>
                                    <option value="Penalty Payment">Penalty Payment</option>
                                    <option value="Loan Clearance">Loan Clearance</option>
                                    <option value="Interest Only">Interest Only</option>
                                </select>
                            </div>

                            {/* Status */}
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-semibold text-[var(--accent)] uppercase tracking-tight">Status</Label>
                                <select
                                    className={selectClass}
                                    value={payment.transaction_status}
                                    onChange={(e) => handleInputChange(index, "transaction_status", e.target.value)}
                                >
                                    <option value="Completed">Completed</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Failed">Failed</option>
                                </select>
                            </div>
                        </div>
                    </div>
                ))}

                <Button
                    type="button"
                    variant="outline"
                    onClick={addPayment}
                    className="w-full border-dashed border-2 border-slate-200 text-slate-400 hover:text-[var(--accent)] hover:border-[var(--accent)] hover:bg-slate-50 flex items-center justify-center gap-2 py-6 text-sm font-semibold transition-all rounded-xl"
                >
                    <Plus className="w-5 h-5" /> Add Another Payment Record
                </Button>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
                {!isInline && (
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        className="font-semibold px-8 h-12 text-slate-500 hover:bg-slate-100 rounded"
                    >
                        Cancel
                    </Button>
                )}
                <Button
                    type="submit"
                    disabled={isCreating}
                    className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold px-12 h-12 flex items-center gap-2 shadow-sm rounded transition-all"
                >
                    {isCreating ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Recording Batch...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" /> Register Batch
                        </>
                    )}
                </Button>
            </div>
        </form>
    );

    if (isInline) return content;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Batch Payment Onboarding"
            description="Quickly migrate multiple historical payments at once using our simplified card system."
            maxWidth="max-w-6xl"
        >
            <div className="max-h-[70vh] overflow-y-auto px-1 pr-2">
                {content}
            </div>
        </Modal>
    );
}
