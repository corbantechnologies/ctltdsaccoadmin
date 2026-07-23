"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { bulkUploadFeePayments, downloadFeePaymentsTemplate } from "@/services/feepayments";
import { useFetchFeeTypes } from "@/hooks/feetypes/actions";
import { FileUp, X, Download, FileCheck } from "lucide-react";
import React, { useState, useRef } from "react";
import toast from "react-hot-toast";

function BulkFeePaymentUpload({ onBatchSuccess }) {
    const getLastDayOfCurrentMonth = () => {
        const today = new Date();
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return lastDay.toISOString().split("T")[0];
    };

    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(null);
    const [selectedFeeType, setSelectedFeeType] = useState("");
    const [targetDate, setTargetDate] = useState(getLastDayOfCurrentMonth());
    const fileInputRef = useRef(null);
    const token = useAxiosAuth();
    const { data: feeTypes } = useFetchFeeTypes();

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
            await downloadFeePaymentsTemplate(token, selectedFeeType, targetDate);
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

            await bulkUploadFeePayments(formData, token);
            toast.success("Fee payments uploaded successfully!");
            clearFile();
            if (onBatchSuccess) onBatchSuccess();
        } catch (error) {
            console.error("Upload error:", error.response?.data);
            toast.error(error?.response?.data?.message || "Failed to upload fee payments.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 py-4">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-slate-900 text-[var(--accent)]">Bulk Upload Fee Payments</h2>
                <p className="text-slate-500 text-sm max-w-md mx-auto">
                    Import multiple fee payments at once using a CSV file.
                </p>
            </div>

            <div className="bg-slate-50 rounded p-6 border border-slate-100 space-y-4">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded shadow-sm">
                            <Download className="w-5 h-5 text-[var(--accent)]" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800">CSV Template</p>
                            <p className="text-xs text-slate-500">Download the required structure before uploading.</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Transaction Date</span>
                            <Input
                                type="date"
                                value={targetDate}
                                onChange={(e) => setTargetDate(e.target.value)}
                                className="h-8 text-xs border border-slate-200 w-36 focus-visible:ring-0 bg-white"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Fee Type</span>
                            <select
                                value={selectedFeeType}
                                onChange={(e) => setSelectedFeeType(e.target.value)}
                                className="border border-slate-200 rounded px-3 py-1.5 text-xs transition-colors bg-white h-8 focus:outline-none w-44"
                            >
                                <option value="">-- All Fee Types --</option>
                                {feeTypes?.map((ft) => (
                                    <option key={ft.id || ft.reference} value={ft.name}>
                                        {ft.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end h-14">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDownloadTemplate}
                                className="border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white whitespace-nowrap h-8"
                            >
                                Download Template
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div
                    className={`border border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                        file
                            ? "border-green-500 bg-green-50/50"
                            : "border-slate-200 bg-slate-50/30 hover:border-[var(--accent)] hover:bg-slate-50"
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
                        <div className="flex flex-col items-center space-y-3">
                            <div className="p-3 bg-green-100 rounded text-green-600 shadow-sm animate-in zoom-in">
                                <FileCheck className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="font-bold text-base text-slate-900">{file.name}</p>
                                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                                    {(file.size / 1024).toFixed(2)} KB • READY TO UPLOAD
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    clearFile();
                                }}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 text-xs px-4"
                            >
                                <X className="w-3.5 h-3.5 mr-2" /> Change Selection
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center space-y-3">
                            <div className="p-3 bg-white rounded text-slate-400 shadow-sm border border-slate-100">
                                <FileUp className="w-8 h-8" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-bold text-base text-slate-800">
                                    Click to browse 
                                </p>
                                <p className="text-xs text-slate-500">Only CSV files are supported for bulk processing</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-center">
                    <Button
                        type="submit"
                        className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white px-12 h-10 rounded font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 text-sm"
                        disabled={loading || !file}
                    >
                        {loading ? "Uploading Data..." : "Start Import"}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default BulkFeePaymentUpload;
