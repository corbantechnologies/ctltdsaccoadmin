"use client";

import { Button } from "@/components/ui/button";
import { Plus, Trash2, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { bulkCreateFeeTypes } from "@/services/feetypes";
import { useFetchGLAccounts } from "@/hooks/glaccounts/actions";
import React, { useState } from "react";
import toast from "react-hot-toast";

function BulkFeeTypeCreate({ onBatchSuccess }) {
    const [loading, setLoading] = useState(false);
    const token = useAxiosAuth();
    const { data: glAccounts, isLoading: isLoadingGL } = useFetchGLAccounts();

    const emptyFee = {
        name: "",
        amount: "",
        gl_account: "",
        is_everyone: false,
        can_exceed_limit: false,
        is_active: true,
    };

    const [fees, setFees] = useState([{ ...emptyFee }]);

    const handleInputChange = (index, field, value) => {
        const newFees = [...fees];
        newFees[index][field] = value;
        setFees(newFees);
    };

    const addFee = () => {
        if (fees.length < 15) {
            setFees([...fees, { ...emptyFee }]);
        }
    };

    const removeFee = (indexToRemove) => {
        setFees(fees.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            // Validate names, amounts, and GL selections
            const invalidRow = fees.find(fee => !fee.name || !fee.amount || !fee.gl_account);
            if (invalidRow) {
                toast.error("All rows must have a Name, Amount, and GL Account.");
                setLoading(false);
                return;
            }

            await bulkCreateFeeTypes({ fee_types: fees }, token);
            toast.success("Fee Types created successfully!");

            // Persistence: Reset state but stay on page
            setFees([{ ...emptyFee }]);

            if (onBatchSuccess) onBatchSuccess();
        } catch (error) {
            console.error("Bulk creation error: ", error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Failed to create fee types!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-[var(--accent)]">Batch Create Fee Types</h2>
                    <p className="text-sm text-gray-500">Define multiple SACCO fees (Registration, Account Opening, etc.) in one go.</p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFees([{ ...emptyFee }])}
                    className="text-xs h-8 border-slate-200"
                >
                    Reset Grid
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    {fees.map((fee, index) => (
                        <div
                            key={index}
                            className="p-5 border border-slate-100 rounded bg-white shadow-sm hover:shadow-md transition-all relative group border-l-4 border-l-[var(--accent)]"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 rounded text-black uppercase tracking-widest">
                                    Entry #{index + 1}
                                </span>
                                {fees.length > 1 && (
                                    <Button
                                        type="button"
                                        onClick={() => removeFee(index)}
                                        variant="ghost"
                                        className="text-rose-400 hover:text-rose-600 p-1 h-auto opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                <div className="md:col-span-3 space-y-1.5">
                                    <Label className="text-[10px] font-semibold text-black">Fee Name</Label>
                                    <Input
                                        placeholder="e.g. Registration Fee"
                                        value={fee.name}
                                        onChange={(e) => handleInputChange(index, "name", e.target.value)}
                                        className="h-10 text-sm border-slate-200 focus:border-[var(--accent)] font-medium"
                                    />
                                </div>

                                <div className="md:col-span-2 space-y-1.5">
                                    <Label className="text-[10px] font-semibold text-black">Amount (KES)</Label>
                                    <Input
                                        type="number"
                                        placeholder=""
                                        value={fee.amount}
                                        onChange={(e) => handleInputChange(index, "amount", e.target.value)}
                                        className="h-10 text-sm border-slate-200 focus:border-[var(--accent)] font-semibold text-[#ea1315]"
                                    />
                                </div>

                                <div className="md:col-span-3 space-y-1.5">
                                    <Label className="text-[10px] font-semibold text-black">Revenue GL Account</Label>
                                    <select
                                        value={fee.gl_account}
                                        onChange={(e) => handleInputChange(index, "gl_account", e.target.value)}
                                        className="w-full border border-slate-200 rounded px-3 py-1.5 text-sm transition-colors bg-white h-10 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                                        disabled={isLoadingGL}
                                    >
                                        <option value="">-- Select GL --</option>
                                        {glAccounts?.map(gl => (
                                            <option key={gl.reference} value={gl.name}>
                                                {gl.name} ({gl.code})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-4 grid grid-cols-2 gap-2 pt-6">
                                    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-100">
                                        <input
                                            type="checkbox"
                                            id={`everyone-${index}`}
                                            checked={fee.is_everyone}
                                            onChange={(e) => handleInputChange(index, "is_everyone", e.target.checked)}
                                            className="w-3.5 h-3.5 accent-[var(--accent)]"
                                        />
                                        <Label htmlFor={`everyone-${index}`} className="text-[11px] cursor-pointer text-slate-600">All Members</Label>
                                    </div>
                                    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-100">
                                        <input
                                            type="checkbox"
                                            id={`exceed-${index}`}
                                            checked={fee.can_exceed_limit}
                                            onChange={(e) => handleInputChange(index, "can_exceed_limit", e.target.checked)}
                                            className="w-3.5 h-3.5 accent-[var(--accent)]"
                                        />
                                        <Label htmlFor={`exceed-${index}`} className="text-[11px] cursor-pointer text-slate-600">Allow Overpay</Label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {fees.length < 15 && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={addFee}
                            className="w-full border-dashed border-2 border-slate-200 text-black hover:text-[var(--accent)] hover:border-[var(--accent)] hover:bg-slate-50 flex items-center justify-center gap-2 py-5 text-xs font-semibold transition-all rounded"
                        >
                            <Plus className="w-4 h-4" /> Add Another Fee Definition
                        </Button>
                    )}
                </div>

                <div className="flex justify-end pt-4">
                    <Button
                        type="submit"
                        className="bg-[#ea1315] hover:bg-[#c71012] text-white px-12 h-12 flex items-center gap-2 font-semibold shadow-lg shadow-rose-100 rounded"
                        disabled={loading || isLoadingGL}
                    >
                        {loading ? "Saving Batch..." : <><Save className="w-4 h-4" /> Commit Batch</>}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default BulkFeeTypeCreate;
