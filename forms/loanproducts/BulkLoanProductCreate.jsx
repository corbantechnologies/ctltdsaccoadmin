"use client";

import { Button } from "@/components/ui/button";
import { Plus, Trash2, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { bulkCreateLoanProducts } from "@/services/loanproducts";
import { useFetchGLAccounts } from "@/hooks/glaccounts/actions";
import React, { useState } from "react";
import toast from "react-hot-toast";

function BulkLoanProductCreate({ onBatchSuccess }) {
    const [loading, setLoading] = useState(false);
    const token = useAxiosAuth();
    const { data: glAccounts, isLoading: isLoadingGL } = useFetchGLAccounts();

    const emptyProduct = {
        name: "",
        interest_method: "Flat",
        interest_rate: 0,
        processing_fee: 0,
        gl_principal_asset: "",
        gl_interest_revenue: "",
        gl_penalty_revenue: "",
        gl_processing_fee_revenue: "",
    };

    const [products, setProducts] = useState([{ ...emptyProduct }]);

    const handleInputChange = (index, field, value) => {
        const newProducts = [...products];
        newProducts[index][field] = value;
        setProducts(newProducts);
    };

    const addProduct = () => {
        if (products.length < 15) {
            setProducts([...products, { ...emptyProduct }]);
        }
    };

    const removeProduct = (indexToRemove) => {
        setProducts(products.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            // Validate names and method
            const invalidRow = products.find(p => !p.name || !p.interest_method || !p.gl_principal_asset);
            if (invalidRow) {
                toast.error("All rows must have a Name, Interest Method, and Principal GL Account.");
                setLoading(false);
                return;
            }

            await bulkCreateLoanProducts({ loan_products: products }, token);
            toast.success("Loan Products created successfully!");

            // Persistence: Reset state but stay on page
            setProducts([{ ...emptyProduct }]);

            if (onBatchSuccess) onBatchSuccess();
        } catch (error) {
            console.error("Bulk creation error: ", error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Failed to create loan products!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-[var(--accent)]">Batch Setup Loan Products</h2>
                    <p className="text-sm text-gray-500">Define interest methods, rates, and automated accounting for new loan types.</p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setProducts([{ ...emptyProduct }])}
                    className="text-xs h-8"
                >
                    Clear All Rows
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6">
                    {products.map((product, index) => (
                        <div
                            key={index}
                            className="p-6 border border-slate-200 rounded bg-white shadow-sm hover:shadow-md transition-all relative group border-t-8 border-t-[var(--accent)]"
                        >
                            <div className="flex justify-between items-center mb-6 border-b border-slate-50 pb-4">
                                <span className="text-[11px] font-semibold px-3 py-1 bg-slate-100 rounded text-slate-500 uppercase tracking-widest border border-slate-200">
                                    Loan Scheme #{index + 1}
                                </span>
                                {products.length > 1 && (
                                    <Button
                                        type="button"
                                        onClick={() => removeProduct(index)}
                                        variant="ghost"
                                        className="text-rose-400 hover:text-rose-600 p-2 h-auto opacity-0 group-hover:opacity-100 transition-opacity bg-rose-50/50 rounded"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-4">
                                {/* Basic Info */}
                                <div className="md:col-span-4 space-y-1.5">
                                    <Label className="text-[10px] font-semibold uppercase text-slate-400 tracking-tighter">Product Name</Label>
                                    <Input
                                        placeholder="e.g. Emergency Loan"
                                        value={product.name}
                                        onChange={(e) => handleInputChange(index, "name", e.target.value)}
                                        className="h-10 text-sm font-semibold border-slate-200 focus:border-[var(--accent)]"
                                    />
                                </div>

                                <div className="md:col-span-3 space-y-1.5">
                                    <Label className="text-[10px] font-semibold uppercase text-slate-400 tracking-tighter">Interest Method</Label>
                                    <select
                                        value={product.interest_method}
                                        onChange={(e) => handleInputChange(index, "interest_method", e.target.value)}
                                        className="w-full border border-slate-200 rounded px-3 py-1.5 text-sm transition-colors bg-white h-10 focus:outline-none focus:ring-1 focus:ring-[var(--accent)] font-medium"
                                    >
                                        <option value="Flat">Flat-rate</option>
                                        <option value="Reducing">Reducing Balance</option>
                                    </select>
                                </div>

                                <div className="md:col-span-2 space-y-1.5">
                                    <Label className="text-[10px] font-semibold uppercase text-slate-400 tracking-tighter">Interest (%)</Label>
                                    <Input
                                        type="number"
                                        value={product.interest_rate}
                                        onChange={(e) => handleInputChange(index, "interest_rate", e.target.value)}
                                        className="h-10 text-sm font-semibold border-slate-200 focus:border-[var(--accent)] text-emerald-600"
                                    />
                                </div>

                                <div className="md:col-span-3 space-y-1.5">
                                    <Label className="text-[10px] font-semibold uppercase text-slate-400 tracking-tighter">Processing Fee (%)</Label>
                                    <Input
                                        type="number"
                                        value={product.processing_fee}
                                        onChange={(e) => handleInputChange(index, "processing_fee", e.target.value)}
                                        className="h-10 text-sm font-semibold border-slate-200 focus:border-[var(--accent)] text-amber-600"
                                    />
                                </div>

                                {/* Accounting Links */}
                                <div className="md:col-span-12 pt-2">
                                    <div className="h-px bg-slate-100 mb-4" />
                                    <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-4">Accounting Configuration (GL Links)</h4>
                                </div>

                                <div className="md:col-span-3 space-y-1.5">
                                    <Label className="text-[10px] font-semibold text-slate-500 italic">Principal Asset GL</Label>
                                    <select
                                        value={product.gl_principal_asset}
                                        onChange={(e) => handleInputChange(index, "gl_principal_asset", e.target.value)}
                                        className="w-full border border-slate-100 rounded px-3 py-1.5 text-[11px] transition-colors bg-slate-50 h-9 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                                        disabled={isLoadingGL}
                                    >
                                        <option value="">-- Select GL --</option>
                                        {glAccounts?.map(gl => (
                                            <option key={gl.reference} value={gl.name}>{gl.name} ({gl.code})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-3 space-y-1.5">
                                    <Label className="text-[10px] font-semibold text-slate-500 italic">Interest Revenue GL</Label>
                                    <select
                                        value={product.gl_interest_revenue}
                                        onChange={(e) => handleInputChange(index, "gl_interest_revenue", e.target.value)}
                                        className="w-full border border-slate-100 rounded px-3 py-1.5 text-[11px] transition-colors bg-slate-50 h-9 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                                        disabled={isLoadingGL}
                                    >
                                        <option value="">-- Select GL --</option>
                                        {glAccounts?.map(gl => (
                                            <option key={gl.reference} value={gl.name}>{gl.name} ({gl.code})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-3 space-y-1.5">
                                    <Label className="text-[10px] font-semibold text-slate-500 italic">Penalty Revenue GL</Label>
                                    <select
                                        value={product.gl_penalty_revenue}
                                        onChange={(e) => handleInputChange(index, "gl_penalty_revenue", e.target.value)}
                                        className="w-full border border-slate-100 rounded px-3 py-1.5 text-[11px] transition-colors bg-slate-50 h-9 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                                        disabled={isLoadingGL}
                                    >
                                        <option value="">-- Select GL --</option>
                                        {glAccounts?.map(gl => (
                                            <option key={gl.reference} value={gl.name}>{gl.name} ({gl.code})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-3 space-y-1.5">
                                    <Label className="text-[10px] font-semibold text-slate-500 italic">Processing Fee GL</Label>
                                    <select
                                        value={product.gl_processing_fee_revenue}
                                        onChange={(e) => handleInputChange(index, "gl_processing_fee_revenue", e.target.value)}
                                        className="w-full border border-slate-100 rounded px-3 py-1.5 text-[11px] transition-colors bg-slate-50 h-9 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                                        disabled={isLoadingGL}
                                    >
                                        <option value="">-- Select GL --</option>
                                        {glAccounts?.map(gl => (
                                            <option key={gl.reference} value={gl.name}>{gl.name} ({gl.code})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    ))}

                    {products.length < 15 && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={addProduct}
                            className="w-full border-dashed border-2 border-slate-200 text-slate-400 hover:text-[var(--accent)] hover:border-[var(--accent)] hover:bg-slate-50 flex items-center justify-center gap-2 py-6 text-sm font-semibold transition-all rounded-[1.5rem]"
                        >
                            <Plus className="w-5 h-5" /> Add Another Loan Scheme
                        </Button>
                    )}
                </div>

                <div className="flex justify-end pt-4">
                    <Button
                        type="submit"
                        className="bg-[var(--accent)] hover:bg-slate-800 text-white px-5 flex items-center gap-2 font-semibold rounded shadow-xl shadow-slate-200 text-lg"
                        disabled={loading || isLoadingGL}
                    >
                        {loading ? "Registering Batch..." : <><Save className="w-5 h-5 mr-1" /> Commit Schemes</>}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default BulkLoanProductCreate;
