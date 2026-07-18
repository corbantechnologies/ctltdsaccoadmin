"use client";

import { Button } from "@/components/ui/button";
import { Plus, Trash2, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { bulkCreatePaymentAccounts } from "@/services/paymentaccounts";
import { useFetchGLAccounts } from "@/hooks/glaccounts/actions";
import React, { useState } from "react";
import toast from "react-hot-toast";

function BulkPaymentAccountCreate({ onBatchSuccess }) {
    const [loading, setLoading] = useState(false);
    const token = useAxiosAuth();
    const { data: glAccounts, isLoading: isLoadingGL } = useFetchGLAccounts();

    const emptyAccount = {
        name: "",
        gl_account: "",
        is_active: true,
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

            // Validate names and GL selections
            const invalidRow = accounts.find(acc => !acc.name || !acc.gl_account);
            if (invalidRow) {
                toast.error("All rows must have a Name and a GL Account selection.");
                setLoading(false);
                return;
            }

            await bulkCreatePaymentAccounts({ accounts }, token);
            toast.success("Payment Accounts created successfully!");

            // Persistence: Reset state but stay on page
            setAccounts([{ ...emptyAccount }]);

            if (onBatchSuccess) onBatchSuccess();
        } catch (error) {
            console.error("Bulk creation error: ", error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Failed to create payment accounts!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Bulk Create Payment Accounts</h2>
                    <p className="text-sm text-gray-500">Configure bank/cash accounts in bulk linking them to GL categories.</p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAccounts([{ ...emptyAccount }])}
                    className="text-xs h-8"
                >
                    Clear All
                </Button>
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

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-1.5 md:col-span-1">
                                    <Label className="text-[11px] font-bold uppercase text-slate-500">Account Name</Label>
                                    <Input
                                        placeholder="e.g. M-Pesa Till 45678"
                                        value={account.name}
                                        onChange={(e) => handleInputChange(index, "name", e.target.value)}
                                        className="h-10 text-sm border-slate-200 focus:border-[var(--accent)]"
                                    />
                                </div>

                                <div className="space-y-1.5 md:col-span-1">
                                    <Label className="text-[11px] font-bold uppercase text-slate-500">Link to GL Account</Label>
                                    <select
                                        value={account.gl_account}
                                        onChange={(e) => handleInputChange(index, "gl_account", e.target.value)}
                                        className="w-full border border-slate-200 rounded px-3 py-1.5 text-sm transition-colors bg-white h-10 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                                        disabled={isLoadingGL}
                                    >
                                        <option value="">-- Select GL Account --</option>
                                        {glAccounts?.map(gl => (
                                            <option key={gl.reference} value={gl.name}>
                                                {gl.name} ({gl.code})
                                            </option>
                                        ))}
                                    </select>
                                    {isLoadingGL && <p className="text-[10px] text-slate-400 animate-pulse">Loading ledgers...</p>}
                                </div>

                                <div className="flex items-center gap-2 pt-6">
                                    <input
                                        type="checkbox"
                                        id={`active-p-${index}`}
                                        checked={account.is_active}
                                        onChange={(e) => handleInputChange(index, "is_active", e.target.checked)}
                                        className="w-4 h-4 accent-[var(--accent)]"
                                    />
                                    <Label htmlFor={`active-p-${index}`} className="text-xs cursor-pointer font-medium text-slate-700">Account is Active</Label>
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
                        className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white px-10 h-10 flex items-center gap-2 font-bold shadow-md shadow-slate-200"
                        disabled={loading || isLoadingGL}
                    >
                        {loading ? "Processing..." : <><Save className="w-4 h-4" /> Save Batch</>}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default BulkPaymentAccountCreate;
