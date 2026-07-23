"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { bulkUploadSavingsDeposits, downloadSavingsDepositsTemplate } from "@/services/savingsdeposits";
import { useFetchSavingsTypes } from "@/hooks/savingtypes/actions";
import { FileUp, X, Download, FileCheck } from "lucide-react";
import React, { useState, useRef } from "react";
import toast from "react-hot-toast";

function BulkSavingDepositUpload({ onBatchSuccess }) {
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(null);
    const [selectedSavingType, setSelectedSavingType] = useState("");
    const fileInputRef = useRef(null);
    const token = useAxiosAuth();
    const { data: savingTypes } = useFetchSavingsTypes();

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.type === "text/csv" || selectedFile.name.endsWith(".csv")) {
                setFile(selectedFile);
            } else {
                toast.error("Please select a valid CSV file.");
                e.target.value = null;
            }
        }
    };

    const clearFile = () => {
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            await downloadSavingsDepositsTemplate(token, selectedSavingType);
            toast.success("Template downloaded successfully!");
        } catch (error) {
            toast.error("Failed to download template.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            toast.error("Please select a file first.");
            return;
        }

        try {
            setLoading(true);
            const formData = new FormData();
            formData.append("file", file);

            await bulkUploadSavingsDeposits(formData, token);
            toast.success("Deposits uploaded successfully!");
            clearFile();
            if (onBatchSuccess) onBatchSuccess();
        } catch (error) {
            console.error("Upload error:", error.response?.data);
            toast.error(error?.response?.data?.message || "Failed to upload deposits.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 py-4">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-emerald-800">Bulk Savings Deposit (CSV)</h2>
                <p className="text-slate-500 text-sm max-w-lg mx-auto">
                    Record batch deposits for multiple members at once using a CSV file.
                </p>
            </div>

            <div className="bg-emerald-50 rounded p-6 border border-emerald-100 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="bg-white p-3 rounded shadow-sm border border-emerald-50">
                        <Download className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-800 uppercase tracking-tighter">Deposit Template</p>
                        <p className="text-[11px] text-slate-500 font-medium italic">Pre-filled template with member account details.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <select
                        value={selectedSavingType}
                        onChange={(e) => setSelectedSavingType(e.target.value)}
                        className="border border-emerald-200 rounded px-3 py-1.5 text-xs transition-colors bg-white h-8 focus:outline-none"
                    >
                        <option value="">-- All Saving Types --</option>
                        {savingTypes?.map((st) => (
                            <option key={st.id || st.reference} value={st.name}>
                                {st.name}
                            </option>
                        ))}
                    </select>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadTemplate}
                        className="border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white font-bold px-6 h-10 transition-all rounded whitespace-nowrap"
                    >
                        Get Template
                    </Button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div
                    className={`border border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${file
                        ? "border-emerald-500 bg-emerald-50/20"
                        : "border-slate-200 bg-white hover:border-emerald-500 hover:bg-emerald-50/5"
                        }`}
                    onClick={() => !file && fileInputRef.current?.click()}
                >
                    <Input
                        type="file"
                        accept=".csv"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    {file ? (
                        <div className="flex flex-col items-center space-y-3 animate-in fade-in zoom-in-95">
                            <div className="p-4 bg-emerald-600 rounded text-white shadow-md ring-4 ring-emerald-50">
                                <FileCheck className="w-8 h-8" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-extrabold text-lg text-slate-900 tracking-tight">{file.name}</p>
                                <p className="text-[10px] text-emerald-600 font-semibold uppercase tracking-[0.2em]">
                                    {(file.size / 1024).toFixed(2)} KB • BATCH READY
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    clearFile();
                                }}
                                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-bold h-8 mt-2 px-4 rounded text-xs"
                             >
                                <X className="w-3.5 h-3.5 mr-1" /> Reset
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center space-y-2">
                            <div className="p-4 bg-slate-50 rounded text-emerald-500 border border-slate-100 shadow-sm">
                                <FileUp className="w-8 h-8" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-semibold text-base text-slate-800 tracking-tight">
                                    Drop Deposit Manifest
                                </p>
                                <p className="text-xs text-slate-400 font-medium">
                                    Click here to upload your CSV file
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-center pt-2">
                    <Button
                        type="submit"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-12 h-10 rounded font-semibold text-sm shadow-md transition-all active:scale-95 disabled:opacity-30 uppercase tracking-tight"
                        disabled={loading || !file}
                    >
                        {loading ? "Processing Batch..." : "Execute Bulk Deposit"}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default BulkSavingDepositUpload;
