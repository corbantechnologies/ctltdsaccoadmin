"use client";

import { Button } from "@/components/ui/button";
import { Plus, Trash2, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { bulkCreateSavingTypes } from "@/services/savingtypes";
import { useFetchGLAccounts } from "@/hooks/glaccounts/actions";
import React, { useState } from "react";
import toast from "react-hot-toast";

function BulkSavingTypeCreate({ onBatchSuccess }) {
    const [loading, setLoading] = useState(false);
    const token = useAxiosAuth();
    const { data: glAccounts, isLoading: isLoadingGL } = useFetchGLAccounts();

    const emptyType = {
        name: "",
        interest_rate: 0,
        can_guarantee: true,
        gl_account: "", // GL Account Name
    };

    const [types, setTypes] = useState([{ ...emptyType }]);

    const handleInputChange = (index, field, value) => {
        const newTypes = [...types];
        newTypes[index][field] = value;
        setTypes(newTypes);
    };

    const addType = () => {
        if (types.length < 15) {
            setTypes([...types, { ...emptyType }]);
        }
    };

    const removeType = (indexToRemove) => {
        setTypes(types.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            // Validate names and GL selections
            const invalidRow = types.find(t => !t.name || !t.gl_account);
            if (invalidRow) {
                toast.error("All rows must have a Name and a GL Account selection.");
                setLoading(false);
                return;
            }

            await bulkCreateSavingTypes({ saving_types: types }, token);
            toast.success("Saving Types created successfully!");

            // Persistence: Reset state but stay on page
            setTypes([{ ...emptyType }]);

            if (onBatchSuccess) onBatchSuccess();
        } catch (error) {
            console.error("Bulk creation error: ", error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Failed to create saving types!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl text-[var(--accent)]">Batch Setup Saving Products</h2>
                    <p className="text-sm text-gray-500">Define interest rates and guarantee rules for new deposit products.</p>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setTypes([{ ...emptyType }])}
                        className="text-xs h-8 border-slate-200 mt-3"
                    >
                        Clear
                    </Button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    {types.map((type, index) => (
                        <div
                            key={index}
                            className="p-5 border border-slate-100 rounded bg-white shadow-sm hover:shadow-md transition-all relative group border-l-4 border-l-emerald-500"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-50 rounded text-emerald-600 uppercase tracking-widest">
                                    Product Definition #{index + 1}
                                </span>
                                {types.length > 1 && (
                                    <Button
                                        type="button"
                                        onClick={() => removeType(index)}
                                        variant="ghost"
                                        className="text-rose-400 hover:text-rose-600 p-1 h-auto opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="space-y-1.5 col-span-1 md:col-span-1">
                                    <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Product Name</Label>
                                    <Input
                                        placeholder="e.g. Fixed Deposit"
                                        value={type.name}
                                        onChange={(e) => handleInputChange(index, "name", e.target.value)}
                                        className="h-10 text-sm border-slate-200 focus:border-emerald-500 font-medium"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Interest rate (%)</Label>
                                    <Input
                                        type="number"
                                        placeholder="5.5"
                                        step="0.01"
                                        value={type.interest_rate}
                                        onChange={(e) => handleInputChange(index, "interest_rate", e.target.value)}
                                        className="h-10 text-sm border-slate-200 focus:border-emerald-500 font-bold"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ledger Entry (GL)</Label>
                                    <select
                                        value={type.gl_account}
                                        onChange={(e) => handleInputChange(index, "gl_account", e.target.value)}
                                        className="w-full border border-slate-200 rounded px-3 py-1.5 text-sm transition-colors bg-white h-10 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        disabled={isLoadingGL}
                                    >
                                        <option value="">-- Link to GL Ledger --</option>
                                        {glAccounts?.map(gl => (
                                            <option key={gl.reference} value={gl.name}>
                                                {gl.name} ({gl.code})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center gap-2 pt-6">
                                    <div className="flex items-center gap-2 bg-emerald-50/50 p-2.5 rounded border border-emerald-100 w-full">
                                        <input
                                            type="checkbox"
                                            id={`guarantee-${index}`}
                                            checked={type.can_guarantee}
                                            onChange={(e) => handleInputChange(index, "can_guarantee", e.target.checked)}
                                            className="w-4 h-4 accent-emerald-600"
                                        />
                                        <Label htmlFor={`guarantee-${index}`} className="text-xs cursor-pointer font-bold text-emerald-800">Can Guarantee Loans</Label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {types.length < 15 && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={addType}
                            className="w-full border-dashed border-2 border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-600 hover:bg-emerald-50 flex items-center justify-center gap-2 py-5 text-xs font-bold transition-all rounded"
                        >
                            <Plus className="w-4 h-4" /> Define Another Savings Account Type
                        </Button>
                    )}
                </div>

                <div className="flex justify-end pt-4">
                    <Button
                        type="submit"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-12 h-12 flex items-center gap-2 font-bold shadow-lg shadow-emerald-100 rounded"
                        disabled={loading || isLoadingGL}
                    >
                        {loading ? "Registering..." : <><Save className="w-4 h-4" /> Save Batch</>}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default BulkSavingTypeCreate;
