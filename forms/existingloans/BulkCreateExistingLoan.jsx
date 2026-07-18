"use client";

import React, { useState } from "react";
import Modal from "@/components/general/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBulkCreateExistingLoan } from "@/hooks/existingloans/actions";
import { useFetchMembers } from "@/hooks/members/actions";
import { useFetchGLAccounts } from "@/hooks/glaccounts/actions";
import { useFetchPaymentAccounts } from "@/hooks/paymentaccounts/actions";
import { Plus, Trash2, Save, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function BulkCreateExistingLoan({ isOpen, onClose, isInline = false }) {
    const { mutate: bulkCreate, isLoading: isCreating } = useBulkCreateExistingLoan();
    const { data: members, isLoading: isLoadingMembers } = useFetchMembers();
    const { data: glAccounts, isLoading: isLoadingGL } = useFetchGLAccounts();
    const { data: paymentAccounts, isLoading: isLoadingPayments } = useFetchPaymentAccounts();

    const emptyLoan = {
        member: "",
        principal: "",
        payment_method: "",
        gl_principal_asset: "",
        gl_interest_revenue: "",
        gl_penalty_revenue: "",
    };

    const [loans, setLoans] = useState([{ ...emptyLoan }]);

    const handleInputChange = (index, field, value) => {
        const newLoans = [...loans];
        newLoans[index][field] = value;
        setLoans(newLoans);
    };

    const addLoan = () => {
        setLoans([...loans, { ...emptyLoan }]);
    };

    const removeLoan = (indexToRemove) => {
        setLoans(loans.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic validation
        const invalidRow = loans.find(l => !l.member || !l.principal || !l.gl_principal_asset);
        if (invalidRow) {
            toast.error("Please ensure all rows have a Member, Principal, and Principal GL Account.");
            return;
        }

        bulkCreate({ loans: loans }, {
            onSuccess: () => {
                toast.success("Batch onboarding successful!");
                setLoans([{ ...emptyLoan }]);
                if (onClose) onClose();
            }
        });
    };

    const selectClass = "w-full h-10 px-3 bg-white border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-all appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:18px] bg-[right_10px_center] bg-no-repeat";

    const content = (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                {loans.map((loan, index) => (
                    <div
                        key={index}
                        className="p-5 border border-slate-200 rounded-xl bg-white shadow-sm relative group hover:border-[var(--accent)]/30 transition-all border-t-4 border-t-[var(--accent)]/80"
                    >
                        <div className="flex justify-between items-center mb-4 border-b border-slate-50 pb-2">
                            <span className="text-[10px] items-center flex gap-2 font-semibold px-2 py-0.5 bg-slate-100 rounded text-slate-500 uppercase tracking-widest border border-slate-200">
                                Loan Entry #{index + 1}
                            </span>
                            {loans.length > 1 && (
                                <Button
                                    type="button"
                                    onClick={() => removeLoan(index)}
                                    variant="ghost"
                                    className="text-rose-400 hover:text-rose-600 p-1.5 h-auto transition-colors bg-rose-50/50 rounded"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Member Selection */}
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-semibold text-[var(--accent)] uppercase tracking-tight">Member</Label>
                                <select
                                    className={selectClass}
                                    value={loan.member}
                                    onChange={(e) => handleInputChange(index, "member", e.target.value)}
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
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-semibold text-[var(--accent)] uppercase tracking-tight">Principal Amount</Label>
                                <Input
                                    type="number"
                                    value={loan.principal}
                                    onChange={(e) => handleInputChange(index, "principal", e.target.value)}
                                    className="h-10 border-slate-200 focus:border-[var(--accent)] font-medium"
                                    placeholder="0.00"
                                />
                            </div>

                            {/* Payment Method */}
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-semibold text-[var(--accent)] uppercase tracking-tight">Initial Payment Method</Label>
                                <select
                                    className={selectClass}
                                    value={loan.payment_method}
                                    onChange={(e) => handleInputChange(index, "payment_method", e.target.value)}
                                >
                                    <option value="">{isLoadingPayments ? "Loading..." : "Select Method"}</option>
                                    {paymentAccounts?.map((pa) => (
                                        <option key={pa.reference} value={pa.name}>{pa.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-50">
                            <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">GL Mapping</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-bold text-slate-500 italic">Principal Asset GL</Label>
                                    <select
                                        value={loan.gl_principal_asset}
                                        onChange={(e) => handleInputChange(index, "gl_principal_asset", e.target.value)}
                                        className={selectClass}
                                        disabled={isLoadingGL}
                                    >
                                        <option value="">-- Select GL --</option>
                                        {glAccounts?.map(gl => <option key={gl.reference} value={gl.name}>{gl.name} ({gl.code})</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-bold text-slate-500 italic">Interest Revenue GL</Label>
                                    <select
                                        value={loan.gl_interest_revenue}
                                        onChange={(e) => handleInputChange(index, "gl_interest_revenue", e.target.value)}
                                        className={selectClass}
                                        disabled={isLoadingGL}
                                    >
                                        <option value="">-- Select GL --</option>
                                        {glAccounts?.map(gl => <option key={gl.reference} value={gl.name}>{gl.name} ({gl.code})</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] font-bold text-slate-500 italic">Penalty Revenue GL</Label>
                                    <select
                                        value={loan.gl_penalty_revenue}
                                        onChange={(e) => handleInputChange(index, "gl_penalty_revenue", e.target.value)}
                                        className={selectClass}
                                        disabled={isLoadingGL}
                                    >
                                        <option value="">-- Select GL --</option>
                                        {glAccounts?.map(gl => <option key={gl.reference} value={gl.name}>{gl.name} ({gl.code})</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                <Button
                    type="button"
                    variant="outline"
                    onClick={addLoan}
                    className="w-full border-dashed border-2 border-slate-200 text-slate-400 hover:text-[var(--accent)] hover:border-[var(--accent)] hover:bg-slate-50 flex items-center justify-center gap-2 py-6 text-sm font-semibold transition-all rounded-xl"
                >
                    <Plus className="w-5 h-5" /> Add Another Loan Record
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
                            Registering Batch...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            Register Batch
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
            title="Batch Loan Onboarding"
            description="Quickly migrate multiple legacy loans at once using our simplified card system."
            maxWidth="max-w-6xl"
        >
            <div className="max-h-[70vh] overflow-y-auto px-1 pr-2">
                {content}
            </div>
        </Modal>
    );
}

