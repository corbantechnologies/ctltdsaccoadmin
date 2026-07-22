"use client";

import { Button } from "@/components/ui/button";
import { Plus, Trash2, Save, Settings2, ShieldAlert } from "lucide-react";
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
    const [expandedRows, setExpandedRows] = useState({ 0: true });

    const emptyProduct = {
        name: "",
        interest_method: "Flat",
        interest_rate: 0,
        processing_fee_type: "Percentage",
        processing_fee: 0,
        processing_fee_fixed_amount: 0,
        is_onboarding_only: false,
        gl_principal_asset: "",
        gl_interest_revenue: "",
        gl_penalty_revenue: "",
        gl_processing_fee_revenue: "",
        min_principal_amount: "",
        max_principal_amount: "",
        min_term_months: "",
        max_term_months: "",
        rule_savings_multiplier_enabled: false,
        max_savings_multiplier: 3.0,
        rule_first_time_applicant_enabled: false,
        first_time_max_savings_percent: 80.0,
        first_time_max_principal: "",
        first_time_min_membership_days: 0,
        rule_min_membership_days_enabled: false,
        min_membership_days: 0,
        rule_max_active_loans_enabled: false,
        max_active_loans: 1,
    };

    const [products, setProducts] = useState([{ ...emptyProduct }]);

    const handleInputChange = (index, field, value) => {
        const newProducts = [...products];
        newProducts[index][field] = value;
        setProducts(newProducts);
    };

    const toggleRow = (index) => {
        setExpandedRows(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const addProduct = () => {
        if (products.length < 15) {
            const nextIdx = products.length;
            setProducts([...products, { ...emptyProduct }]);
            setExpandedRows(prev => ({ ...prev, [nextIdx]: true }));
        }
    };

    const removeProduct = (indexToRemove) => {
        setProducts(products.filter((_, index) => index !== indexToRemove));
        // Recalculate expanded rows map
        const newExpanded = {};
        products.filter((_, index) => index !== indexToRemove).forEach((_, idx) => {
            newExpanded[idx] = true;
        });
        setExpandedRows(newExpanded);
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

            // Reset state
            setProducts([{ ...emptyProduct }]);
            setExpandedRows({ 0: true });

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
                    <p className="text-sm text-gray-500">Configure multiple loan schemes with custom limits, interest methods, and rules.</p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                        setProducts([{ ...emptyProduct }]);
                        setExpandedRows({ 0: true });
                    }}
                    className="text-xs h-8 border-slate-300 text-slate-600"
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
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => toggleRow(index)}
                                        className="text-xs h-8 border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
                                    >
                                        {expandedRows[index] ? "Collapse Details" : "Expand Details & Rules"}
                                    </Button>
                                    {products.length > 1 && (
                                        <Button
                                            type="button"
                                            onClick={() => removeProduct(index)}
                                            variant="ghost"
                                            className="text-rose-400 hover:text-rose-600 p-2 h-8 rounded bg-rose-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Collapsed view summary */}
                            {!expandedRows[index] && (
                                <div className="text-xs text-slate-500 flex flex-wrap gap-4 items-center font-medium bg-slate-50 p-3 rounded">
                                    <div><strong className="text-slate-700">Name:</strong> {product.name || "Unnamed"}</div>
                                    <div><strong className="text-slate-700">Method:</strong> {product.interest_method}</div>
                                    <div><strong className="text-slate-700">Interest:</strong> {product.interest_rate}%</div>
                                    <div>
                                        <strong className="text-slate-700">Fee:</strong> {product.processing_fee_type === "Percentage" ? `${product.processing_fee}%` : `KES ${product.processing_fee_fixed_amount}`}
                                    </div>
                                    <div><strong className="text-slate-700">Onboarding Only:</strong> {product.is_onboarding_only ? "Yes" : "No"}</div>
                                </div>
                            )}

                            {/* Full expanded settings */}
                            {expandedRows[index] && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-4">
                                        {/* Basic Info */}
                                        <div className="md:col-span-4 space-y-1.5">
                                            <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Product Name</Label>
                                            <Input
                                                placeholder="e.g. Normal Loan"
                                                value={product.name}
                                                onChange={(e) => handleInputChange(index, "name", e.target.value)}
                                                className="h-10 text-sm font-semibold border-slate-200 focus:border-[var(--accent)]"
                                            />
                                        </div>

                                        <div className="md:col-span-3 space-y-1.5">
                                            <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Interest Method</Label>
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
                                            <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Interest (%)</Label>
                                            <Input
                                                type="number"
                                                value={product.interest_rate}
                                                onChange={(e) => handleInputChange(index, "interest_rate", parseFloat(e.target.value) || 0)}
                                                className="h-10 text-sm font-semibold border-slate-200 focus:border-[var(--accent)] text-emerald-600"
                                            />
                                        </div>

                                        <div className="md:col-span-3 space-y-1.5">
                                            <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Processing Fee Type</Label>
                                            <select
                                                value={product.processing_fee_type}
                                                disabled={product.is_onboarding_only}
                                                onChange={(e) => {
                                                    handleInputChange(index, "processing_fee_type", e.target.value);
                                                    handleInputChange(index, "processing_fee", 0);
                                                    handleInputChange(index, "processing_fee_fixed_amount", 0);
                                                }}
                                                className="w-full border border-slate-200 rounded px-3 py-1.5 text-sm transition-colors bg-white h-10 focus:outline-none focus:ring-1 focus:ring-[var(--accent)] font-medium"
                                            >
                                                <option value="Percentage">Percentage of Principal (%)</option>
                                                <option value="Fixed">Fixed Amount (KES)</option>
                                            </select>
                                        </div>

                                        <div className="md:col-span-3 space-y-1.5">
                                            {product.processing_fee_type === "Percentage" ? (
                                                <>
                                                    <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Processing Fee (%)</Label>
                                                    <Input
                                                        type="number"
                                                        value={product.processing_fee}
                                                        onChange={(e) => handleInputChange(index, "processing_fee", parseFloat(e.target.value) || 0)}
                                                        className="h-10 text-sm font-semibold border-slate-200 focus:border-[var(--accent)] text-amber-600"
                                                    />
                                                </>
                                            ) : (
                                                <>
                                                    <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Processing Fee (KES)</Label>
                                                    <Input
                                                        type="number"
                                                        value={product.processing_fee_fixed_amount}
                                                        onChange={(e) => handleInputChange(index, "processing_fee_fixed_amount", parseFloat(e.target.value) || 0)}
                                                        className="h-10 text-sm font-semibold border-slate-200 focus:border-[var(--accent)] text-amber-600"
                                                    />
                                                </>
                                            )}
                                        </div>

                                        <div className="md:col-span-5 flex items-center gap-3 pt-6">
                                            <input
                                                type="checkbox"
                                                id={`is_onboarding_only_${index}`}
                                                checked={product.is_onboarding_only}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    handleInputChange(index, "is_onboarding_only", checked);
                                                    if (checked) {
                                                        handleInputChange(index, "processing_fee_type", "Fixed");
                                                        handleInputChange(index, "processing_fee", 0);
                                                    }
                                                }}
                                                className="h-4 w-4 accent-amber-600 rounded"
                                            />
                                            <div>
                                                <Label htmlFor={`is_onboarding_only_${index}`} className="text-xs font-semibold text-amber-800 cursor-pointer">
                                                    Onboarding Only Product
                                                </Label>
                                                <p className="text-[10px] text-amber-600">Locked to Fixed processing fee type.</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2. GL Mappings */}
                                    <div className="border-t border-slate-100 pt-4">
                                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Accounting Configuration (GL Links)</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div className="space-y-1">
                                                <Label className="text-[10px] font-semibold text-slate-600">Principal Asset GL</Label>
                                                <select
                                                    value={product.gl_principal_asset}
                                                    onChange={(e) => handleInputChange(index, "gl_principal_asset", e.target.value)}
                                                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-slate-50 h-9"
                                                    disabled={isLoadingGL}
                                                >
                                                    <option value="">-- Select GL --</option>
                                                    {glAccounts?.map(gl => (
                                                        <option key={gl.reference} value={gl.name}>{gl.name} ({gl.code})</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="space-y-1">
                                                <Label className="text-[10px] font-semibold text-slate-600">Interest Revenue GL</Label>
                                                <select
                                                    value={product.gl_interest_revenue}
                                                    onChange={(e) => handleInputChange(index, "gl_interest_revenue", e.target.value)}
                                                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-slate-50 h-9"
                                                    disabled={isLoadingGL}
                                                >
                                                    <option value="">-- Select GL --</option>
                                                    {glAccounts?.map(gl => (
                                                        <option key={gl.reference} value={gl.name}>{gl.name} ({gl.code})</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="space-y-1">
                                                <Label className="text-[10px] font-semibold text-slate-600">Penalty Revenue GL</Label>
                                                <select
                                                    value={product.gl_penalty_revenue}
                                                    onChange={(e) => handleInputChange(index, "gl_penalty_revenue", e.target.value)}
                                                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-slate-50 h-9"
                                                    disabled={isLoadingGL}
                                                >
                                                    <option value="">-- Select GL --</option>
                                                    {glAccounts?.map(gl => (
                                                        <option key={gl.reference} value={gl.name}>{gl.name} ({gl.code})</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="space-y-1">
                                                <Label className="text-[10px] font-semibold text-slate-600">Processing Fee GL</Label>
                                                <select
                                                    value={product.gl_processing_fee_revenue}
                                                    onChange={(e) => handleInputChange(index, "gl_processing_fee_revenue", e.target.value)}
                                                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-slate-50 h-9"
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

                                    {/* 3. Product Rules & Limits */}
                                    <div className="border-t border-slate-100 pt-4">
                                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Product Rules & Limits (Optional)</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {/* Principal Limits */}
                                            <div className="bg-slate-50/50 p-3 border rounded space-y-2">
                                                <h5 className="text-[10px] font-bold text-slate-700">Principal Limit (KES)</h5>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <Label className="text-[9px] text-slate-500">Min Principal</Label>
                                                        <Input
                                                            type="number"
                                                            value={product.min_principal_amount}
                                                            onChange={(e) => handleInputChange(index, "min_principal_amount", e.target.value)}
                                                            className="h-8 text-xs bg-white"
                                                            placeholder="Min"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-[9px] text-slate-500">Max Principal</Label>
                                                        <Input
                                                            type="number"
                                                            value={product.max_principal_amount}
                                                            onChange={(e) => handleInputChange(index, "max_principal_amount", e.target.value)}
                                                            className="h-8 text-xs bg-white"
                                                            placeholder="Max"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Term Limits */}
                                            <div className="bg-slate-50/50 p-3 border rounded space-y-2">
                                                <h5 className="text-[10px] font-bold text-slate-700">Term Limit (Months)</h5>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <Label className="text-[9px] text-slate-500">Min Months</Label>
                                                        <Input
                                                            type="number"
                                                            value={product.min_term_months}
                                                            onChange={(e) => handleInputChange(index, "min_term_months", e.target.value)}
                                                            className="h-8 text-xs bg-white"
                                                            placeholder="Min"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-[9px] text-slate-500">Max Months</Label>
                                                        <Input
                                                            type="number"
                                                            value={product.max_term_months}
                                                            onChange={(e) => handleInputChange(index, "max_term_months", e.target.value)}
                                                            className="h-8 text-xs bg-white"
                                                            placeholder="Max"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Rules checkboxes */}
                                            <div className="space-y-2">
                                                {/* Multiplier Rule */}
                                                <div className="p-2 bg-slate-50/50 border rounded space-y-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            id={`rule_savings_multiplier_enabled_${index}`}
                                                            checked={product.rule_savings_multiplier_enabled}
                                                            onChange={(e) => handleInputChange(index, "rule_savings_multiplier_enabled", e.target.checked)}
                                                            className="h-3.5 w-3.5"
                                                        />
                                                        <Label htmlFor={`rule_savings_multiplier_enabled_${index}`} className="text-[10px] font-semibold cursor-pointer">
                                                            Savings Multiplier
                                                        </Label>
                                                    </div>
                                                    {product.rule_savings_multiplier_enabled && (
                                                        <div className="flex items-center gap-2 pl-5">
                                                            <span className="text-[9px] text-slate-500">Max:</span>
                                                            <Input
                                                                type="number"
                                                                step="0.1"
                                                                value={product.max_savings_multiplier}
                                                                onChange={(e) => handleInputChange(index, "max_savings_multiplier", parseFloat(e.target.value) || 0)}
                                                                className="h-7 text-xs bg-white w-20"
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* First Time Rule */}
                                                <div className="p-2 bg-slate-50/50 border rounded space-y-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            id={`rule_first_time_applicant_enabled_${index}`}
                                                            checked={product.rule_first_time_applicant_enabled}
                                                            onChange={(e) => handleInputChange(index, "rule_first_time_applicant_enabled", e.target.checked)}
                                                            className="h-3.5 w-3.5"
                                                        />
                                                        <Label htmlFor={`rule_first_time_applicant_enabled_${index}`} className="text-[10px] font-semibold cursor-pointer">
                                                            First-Time Applicant
                                                        </Label>
                                                    </div>
                                                    {product.rule_first_time_applicant_enabled && (
                                                        <div className="grid grid-cols-2 gap-2 pl-5">
                                                            <div>
                                                                <span className="text-[8px] text-slate-500">Max Savings %</span>
                                                                <Input
                                                                    type="number"
                                                                    value={product.first_time_max_savings_percent}
                                                                    onChange={(e) => handleInputChange(index, "first_time_max_savings_percent", parseFloat(e.target.value) || 0)}
                                                                    className="h-7 text-xs bg-white"
                                                                />
                                                            </div>
                                                            <div>
                                                                <span className="text-[8px] text-slate-500">Max Principal</span>
                                                                <Input
                                                                    type="number"
                                                                    value={product.first_time_max_principal}
                                                                    onChange={(e) => handleInputChange(index, "first_time_max_principal", parseFloat(e.target.value) || 0)}
                                                                    className="h-7 text-xs bg-white"
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
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
