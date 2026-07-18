"use client";

import { Button } from "@/components/ui/button";
import { Plus, Trash2, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { bulkCreateLoanDisbursements } from "@/services/loandisbursements";
import { useFetchLoans } from "@/hooks/loans/actions";
import { useFetchPaymentAccounts } from "@/hooks/paymentaccounts/actions";
import React, { useState, useMemo } from "react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function BulkLoanDisbursementCreate({ onBatchSuccess }) {
    const [loading, setLoading] = useState(false);
    const token = useAxiosAuth();

    const { data: loans, isLoading: isLoadingLoans } = useFetchLoans();
    const { data: paymentAccounts, isLoading: isLoadingPayments } = useFetchPaymentAccounts();

    // Filter for Approved but not yet Disbursed loans
    const approvedLoans = useMemo(() => {
        return loans?.filter(loan => loan.application?.status === "Approved") || [];
    }, [loans]);

    const emptyDisbursement = {
        loan_account: "", // reference/account number
        amount: "",
        transaction_date: new Date().toISOString().split('T')[0],
        payment_method: "", // payment account name
    };

    const [disbursements, setDisbursements] = useState([{ ...emptyDisbursement }]);

    const handleInputChange = (index, field, value) => {
        const newDisbursements = [...disbursements];
        newDisbursements[index][field] = value;

        // If loan_account changes, pre-fill amount with loan principal
        if (field === "loan_account") {
            const selectedLoan = approvedLoans.find(l => l.account_number === value);
            if (selectedLoan) {
                newDisbursements[index].amount = selectedLoan.principal;
            }
        }

        setDisbursements(newDisbursements);
    };

    const addDisbursement = () => {
        if (disbursements.length < 15) {
            setDisbursements([...disbursements, { ...emptyDisbursement }]);
        }
    };

    const removeDisbursement = (indexToRemove) => {
        setDisbursements(disbursements.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            // Validate all fields present
            const invalidRow = disbursements.find(d => !d.loan_account || !d.amount || !d.payment_method);
            if (invalidRow) {
                toast.error("All rows must have a Loan Account, Amount, and Payment Method.");
                setLoading(false);
                return;
            }

            // Duplicate check
            const loanRefs = disbursements.map(d => d.loan_account);
            if (new Set(loanRefs).size !== loanRefs.length) {
                toast.error("Duplicate loan accounts found in the batch. Please remove duplicates.");
                setLoading(false);
                return;
            }

            await bulkCreateLoanDisbursements({ disbursements }, token);
            toast.success("Disbursements processed successfully!");

            // Persistence: Reset state
            setDisbursements([{ ...emptyDisbursement }]);

            if (onBatchSuccess) onBatchSuccess();
        } catch (error) {
            console.error("Bulk disbursement error: ", error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Failed to process disbursements!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Manual Batch Disbursement</h2>
                    <p className="text-sm text-slate-500">Fund up to 15 approved loans in a single batch.</p>
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setDisbursements([{ ...emptyDisbursement }])}
                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-medium"
                >
                    Clear All
                </Button>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        {disbursements.map((disb, index) => (
                            <div
                                key={index}
                                className="p-4 border border-gray-200 rounded bg-white shadow-sm relative group transition-all hover:border-gray-300"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h4 className="font-semibold text-lg text-gray-800">
                                        Disbursement #{index + 1}
                                    </h4>
                                    {disbursements.length > 1 && (
                                        <Button
                                            type="button"
                                            onClick={() => removeDisbursement(index)}
                                            variant="ghost"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 h-auto"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </Button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                    {/* Loan Account Selector */}
                                    <div className="md:col-span-4 space-y-2">
                                        <Label className="text-base text-black">Target Loan Account</Label>
                                        <select
                                            value={disb.loan_account}
                                            onChange={(e) => handleInputChange(index, "loan_account", e.target.value)}
                                            className="w-full border border-black rounded px-3 py-2 text-base focus:ring-2 transition-colors bg-white h-12 focus:outline-none"
                                            disabled={isLoadingLoans}
                                        >
                                            <option value="">Select Approved Loan</option>
                                            {approvedLoans.map(loan => (
                                                <option key={loan.reference} value={loan.account_number}>
                                                    {loan.member?.first_name} {loan.member?.last_name} ({loan.account_number})
                                                </option>
                                            ))}
                                        </select>
                                        {approvedLoans.length === 0 && !isLoadingLoans && (
                                            <p className="text-xs text-amber-600 italic">No pending approved loans found.</p>
                                        )}
                                    </div>

                                    {/* Amount */}
                                    <div className="md:col-span-2 space-y-2">
                                        <Label className="text-base text-black font-medium">Amount (KES)</Label>
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            value={disb.amount}
                                            onChange={(e) => handleInputChange(index, "amount", e.target.value)}
                                            className="h-12 border-black rounded text-base py-2 focus:ring-2 font-semibold"
                                        />
                                    </div>

                                    {/* Transaction Date */}
                                    <div className="md:col-span-3 space-y-2">
                                        <Label className="text-base text-black font-medium">Transaction Date</Label>
                                        <Input
                                            type="date"
                                            value={disb.transaction_date}
                                            onChange={(e) => handleInputChange(index, "transaction_date", e.target.value)}
                                            className="h-12 border-black rounded text-base py-2 focus:ring-2 font-semibold"
                                        />
                                    </div>

                                    {/* Payment Account Selector */}
                                    <div className="md:col-span-3 space-y-2">
                                        <Label className="text-base text-black font-medium">Payment Source</Label>
                                        <select
                                            value={disb.payment_method}
                                            onChange={(e) => handleInputChange(index, "payment_method", e.target.value)}
                                            className="w-full border border-black rounded px-3 py-2 text-base focus:ring-2 transition-colors bg-white h-12 focus:outline-none"
                                            disabled={isLoadingPayments}
                                        >
                                            <option value="">Select Source Account</option>
                                            {paymentAccounts?.map(acc => (
                                                <option key={acc.reference} value={acc.name}>
                                                    {acc.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {disbursements.length < 15 && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={addDisbursement}
                                className="w-full border-dashed border-2 border-gray-300 text-gray-500 hover:text-black hover:border-black hover:bg-gray-50 flex items-center justify-center gap-3 text-base transition-all rounded"
                            >
                                <Plus className="w-5 h-5" /> Add Another Disbursement
                            </Button>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            type="submit"
                            className="bg-[#ea1315] hover:bg-[#c71012] text-white text-base p-4 w-full sm:w-auto font-bold shadow-xl shadow-rose-100 transition-all rounded"
                            disabled={loading || isLoadingLoans || isLoadingPayments}
                        >
                            {loading ? "Processing..." : "Execute Batch Disbursement"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

export default BulkLoanDisbursementCreate;
