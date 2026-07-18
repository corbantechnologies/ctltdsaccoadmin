"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { bulkUploadLoanProducts, downloadLoanProductsTemplate } from "@/services/loanproducts";
import { FileUp, X, Download, FileCheck } from "lucide-react";
import React, { useState, useRef } from "react";
import toast from "react-hot-toast";

function BulkLoanProductUpload({ onBatchSuccess }) {
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
            await downloadLoanProductsTemplate(token);
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

            await bulkUploadLoanProducts(formData, token);
            toast.success("Loan Products uploaded successfully!");
            clearFile();
            if (onBatchSuccess) onBatchSuccess();
        } catch (error) {
            console.error("Upload error:", error.response?.data);
            toast.error(error?.response?.data?.message || "Failed to upload loan products.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 py-4">
            <div className="text-center space-y-2">
                <h2 className="text-lg font-semibold text-[var(--accent)]">Loan Product Ingestion</h2>
                <p className="text-slate-500 text-sm max-w-lg mx-auto font-medium">
                    Automate the creation of complex loan schemes using our standardized CSV Template.
                </p>
            </div>

            <div className="bg-slate-50 rounded p-8 border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                <div className="flex items-center gap-5">
                    <div className="bg-white p-4 rounded shadow-sm border border-slate-50">
                        <Download className="w-7 h-7 text-[var(--accent)]" />
                    </div>
                    <div>
                        <p className="text-base font-semibold text-slate-800 tracking-tight">Loan Scheme Template</p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="lg"
                    onClick={handleDownloadTemplate}
                    className="border-2 border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white font-semibold px-8 rounded transition-all shadow-md group h-12"
                >
                    Download Template
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div
                    className={`border-2 border-dashed rounded p-20 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${file
                        ? "border-[var(--accent)] bg-[var(--accent)]/5 shadow-inner"
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
                        <div className="flex flex-col items-center space-y-6 animate-in zoom-in-95 duration-500">
                            <div className="p-4 bg-[var(--accent)] rounded text-white shadow-2xl shadow-slate-200 ring-8 ring-white">
                                <FileCheck className="w-8 h-8" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-semibold text-lg text-slate-900 tracking-tighter">{file.name}</p>
                                <p className="text-[12px] text-slate-400 font-semibold uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                                    <span className="w-2 h-2 rounded bg-emerald-500 animate-pulse" />
                                    {(file.size / 1024).toFixed(2)} KB • READY TO SYNC
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    clearFile();
                                }}
                                className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 font-semibold h-10 mt-6 px-8 rounded border-2 border-transparent hover:border-rose-100"
                            >
                                <X className="w-4 h-4 mr-2" /> DISCARD
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center space-y-6">
                            <div className="p-4 bg-slate-50 rounded text-slate-200 border-4 border-white shadow-inner">
                                <FileUp className="w-8 h-8" />
                            </div>
                            <div className="space-y-2">
                                <p className="font-semibold text-lg text-slate-800 tracking-tight">
                                    Drop Your Loan Template
                                </p>
                                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">
                                    Tap to select from files
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-center pt-4">
                    <Button
                        type="submit"
                        className="bg-[var(--accent)] hover:bg-slate-800 text-white p-4 rounded font-semibold text-md  transition-all active:scale-95 disabled:opacity-20 flex items-center gap-4"
                        disabled={loading || !file}
                    >
                        {loading ? "Synchronizing Data..." : "Engage Bulk Upload"}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default BulkLoanProductUpload;
