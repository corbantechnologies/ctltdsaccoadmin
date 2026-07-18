"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { bulkUploadPaymentAccounts, downloadPaymentAccountsTemplate } from "@/services/paymentaccounts";
import { FileUp, X, Download, FileCheck } from "lucide-react";
import React, { useState, useRef } from "react";
import toast from "react-hot-toast";

function BulkPaymentAccountUpload({ onBatchSuccess }) {
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);
    const token = useAxiosAuth();

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
            await downloadPaymentAccountsTemplate(token);
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

            await bulkUploadPaymentAccounts(formData, token);
            toast.success("Payment Accounts uploaded successfully!");
            clearFile();
            if (onBatchSuccess) onBatchSuccess();
        } catch (error) {
            console.error("Upload error:", error.response?.data);
            toast.error(error?.response?.data?.message || "Failed to upload accounts.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 py-4">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-[var(--accent)]">Bulk Upload Payment Accounts</h2>
                <p className="text-slate-500 text-sm">
                    Import multiple Bank/Cash accounts linking them to GL categories via CSV.
                </p>
            </div>

            <div className="bg-slate-50 rounded p-6 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded shadow-sm border border-slate-100">
                        <Download className="w-5 h-5 text-[var(--accent)]" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-800">CSV Template</p>
                        <p className="text-xs text-slate-500 font-medium">Download the structure before filling your data.</p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadTemplate}
                    className="border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-all font-bold"
                >
                    Download Template
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div
                    className={`border-2 border-dashed rounded p-12 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${file
                        ? "border-green-500 bg-green-50/50"
                        : "border-slate-200 bg-white hover:border-[var(--accent)] hover:bg-slate-50 shadow-sm"
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
                        <div className="flex flex-col items-center space-y-4">
                            <div className="p-4 bg-green-100 rounded text-green-600 shadow-sm">
                                <FileCheck className="w-10 h-10" />
                            </div>
                            <div>
                                <p className="font-bold text-lg text-slate-900">{file.name}</p>
                                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">
                                    {(file.size / 1024).toFixed(2)} KB • VALID CSV FILE
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    clearFile();
                                }}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs font-bold"
                            >
                                <X className="w-4 h-4 mr-1" /> REMOVE & RESET
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center space-y-4">
                            <div className="p-4 bg-slate-100 rounded text-slate-400">
                                <FileUp className="w-10 h-10" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-bold text-lg text-slate-800">
                                    Browse Files
                                </p>
                                <p className="text-sm text-slate-500">Ensure columns match the template exactly</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-center">
                    <Button
                        type="submit"
                        className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white px-16 h-12 rounded font-bold shadow-lg shadow-[var(--accent)]/20 transition-all active:scale-95 disabled:opacity-50"
                        disabled={loading || !file}
                    >
                        {loading ? "Importing Accounts..." : "Process Upload"}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default BulkPaymentAccountUpload;
