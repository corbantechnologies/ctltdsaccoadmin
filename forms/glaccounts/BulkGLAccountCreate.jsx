"use client";

import { Button } from "@/components/ui/button";
import { X, Plus, Trash2, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { bulkCreateGLAccounts } from "@/services/glaccounts";
import React, { useState } from "react";
import toast from "react-hot-toast";

function BulkGLAccountCreate({ onBatchSuccess }) {
    const [loading, setLoading] = useState(false);
    const token = useAxiosAuth();

    const categories = ["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"];

    const emptyAccount = {
        name: "",
        code: "",
        category: "ASSET",
        is_active: true,
        is_current_account: false,
    };

    const [accounts, setAccounts] = useState([{ ...emptyAccount }]);

    const handleInputChange = (index, field, value) => {
        const newAccounts = [...accounts];
        newAccounts[index][field] = value;
        setAccounts(newAccounts);
    };

    const addAccount = () => {
        if (accounts.length < 15) {
            setAccounts([...accounts, { ...emptyAccount }]);
        }
    };

    const removeAccount = (indexToRemove) => {
        setAccounts(accounts.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            // Validate names and codes are present
            const invalidRow = accounts.find(acc => !acc.name || !acc.code);
            if (invalidRow) {
                toast.error("All rows must have a Name and Code.");
                setLoading(false);
                return;
            }

            await bulkCreateGLAccounts({ accounts }, token);
            toast.success("GL Accounts created successfully!");

            // Reset to empty but stay on page (allow more entries)
            setAccounts([{ ...emptyAccount }]);

            if (onBatchSuccess) onBatchSuccess();
        } catch (error) {
            console.error("Bulk creation error: ", error.response?.data || error.message);
            const detail = error.response?.data?.error || error.response?.data?.message || "Failed to create accounts!";
            toast.error(detail);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Bulk Create GL Accounts</h2>
                    <p className="text-sm text-gray-500">Add up to 15 accounts manually in one batch.</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setAccounts([{ ...emptyAccount }])}
                        className="text-xs h-8"
                    >
                        Clear All
                    </Button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    {accounts.map((account, index) => (
                        <div
                            key={index}
                            className="p-4 border border-gray-100 rounded bg-white shadow-sm hover:shadow-md transition-shadow relative group"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-500 uppercase tracking-wider">
                                    Account #{index + 1}
                                </span>
                                {accounts.length > 1 && (
                                    <Button
                                        type="button"
                                        onClick={() => removeAccount(index)}
                                        variant="ghost"
                                        className="text-red-400 hover:text-red-600 p-1 h-auto opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-bold uppercase text-slate-500">Name</Label>
                                    <Input
                                        placeholder="e.g. Cash at Hand"
                                        value={account.name}
                                        onChange={(e) => handleInputChange(index, "name", e.target.value)}
                                        className="h-9 text-sm border-slate-200 focus:border-[var(--accent)]"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-bold uppercase text-slate-500">Code</Label>
                                    <Input
                                        placeholder="e.g. 1010"
                                        value={account.code}
                                        onChange={(e) => handleInputChange(index, "code", e.target.value)}
                                        className="h-9 text-sm border-slate-200 focus:border-[var(--accent)]"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-bold uppercase text-slate-500">Category</Label>
                                    <select
                                        value={account.category}
                                        onChange={(e) => handleInputChange(index, "category", e.target.value)}
                                        className="w-full border border-slate-200 rounded px-3 py-1.5 text-sm transition-colors bg-white h-9 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex flex-col justify-center gap-2">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id={`active-${index}`}
                                            checked={account.is_active}
                                            onChange={(e) => handleInputChange(index, "is_active", e.target.checked)}
                                            className="w-4 h-4 accent-[var(--accent)]"
                                        />
                                        <Label htmlFor={`active-${index}`} className="text-xs cursor-pointer">Active</Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id={`current-${index}`}
                                            checked={account.is_current_account}
                                            onChange={(e) => handleInputChange(index, "is_current_account", e.target.checked)}
                                            className="w-4 h-4 accent-[var(--accent)]"
                                        />
                                        <Label htmlFor={`current-${index}`} className="text-xs cursor-pointer">Current Account</Label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {accounts.length < 15 && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={addAccount}
                            className="w-full border-dashed border-2 border-slate-200 text-slate-400 hover:text-[var(--accent)] hover:border-[var(--accent)] hover:bg-slate-50 flex items-center justify-center gap-2 py-4 text-xs font-bold"
                        >
                            <Plus className="w-4 h-4" /> Add Another Row
                        </Button>
                    )}
                </div>

                <div className="flex justify-end pt-4">
                    <Button
                        type="submit"
                        className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white px-8 h-10 flex items-center gap-2 font-bold"
                        disabled={loading}
                    >
                        {loading ? "Processing..." : <><Save className="w-4 h-4" /> Save Batch</>}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default BulkGLAccountCreate;
