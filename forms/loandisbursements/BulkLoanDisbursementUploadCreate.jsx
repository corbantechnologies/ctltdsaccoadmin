"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { bulkUploadLoanDisbursements, downloadLoanDisbursementsTemplate } from "@/services/loandisbursements";
import { FileUp, X, Download, FileCheck } from "lucide-react";
import React, { useState, useRef } from "react";
import toast from "react-hot-toast";

function BulkLoanDisbursementUpload({ onBatchSuccess }) {
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
            await downloadLoanDisbursementsTemplate(token);
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

            await bulkUploadLoanDisbursements(formData, token);
            toast.success("Disbursements uploaded successfully!");
            clearFile();
            if (onBatchSuccess) onBatchSuccess();
        } catch (error) {
            console.error("Upload error:", error.response?.data);
            toast.error(error?.response?.data?.message || "Failed to upload disbursements.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10 py-4">
            <div className="text-center space-y-3">
                <h2 className="text-lg font-semibold text-gray-900 tracking-tight">Bulk Disburse Approved Loans</h2>
                <p className="text-slate-500 text-base max-w-2xl mx-auto">
                    Export pending disbursements to CSV, complete the payment methods, and upload here to fund multiple members at once.
                </p>
            </div>

            <div className="bg-slate-50 rounded p-4 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                    <div className="bg-white p-4 rounded shadow-sm border border-slate-100">
                        <Download className="w-8 h-8 text-[var(--accent)]" />
                    </div>
                    <div>
                        <p className="text-lg font-semibold text-black tracking-tight">Disbursement Template</p>
                        <p className="text-sm text-black font-medium">Pre-filled with all currently approved but unfunded loans.</p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    onClick={handleDownloadTemplate}
                    className="border-black text-black hover:bg-slate-100 font-semibold px-8 h-12 transition-all rounded"
                >
                    Get Pre-filled Template
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div
                    className={`border-4 border-dashed rounded p-4 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${file
                        ? "border-green-500 bg-green-50/30"
                        : "border-slate-200 bg-white hover:border-[var(--accent)] hover:bg-slate-50/50"
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
                        <div className="flex flex-col items-center space-y-4 animate-in fade-in zoom-in-95">
                            <div className="p-4 bg-green-600 rounded text-white shadow ring-8 ring-green-50">
                                <FileCheck className="w-8 h-8" />
                            </div>
                            <div className="space-y-2">
                                <p className="font-semibold text-lg text-slate-900 ">{file.name}</p>
                                <p className="text-sm text-green-600 font-semibold ">
                                    {(file.size / 1024).toFixed(2)} KB • DATA READY FOR FUNDING
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    clearFile();
                                }}
                                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-semibold h-10 px-8 rounded mt-2"
                            >
                                <X className="w-5 h-5 mr-2" /> Reset Selection
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center space-y-6">
                            <div className="p-8 bg-slate-50 rounded-full text-[var(--accent)]/20 border-4 border-white shadow-inner">
                                <FileUp className="w-8 h-8" />
                            </div>
                            <div className="space-y-3">
                                <p className="font-semibold text-lg text-black">
                                    Upload Completed CSV
                                </p>
                                <p className="text-sm text-black">
                                    Click to select your disbursement file
                                </p>
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex justify-center pt-4">
                    <Button
                        type="submit"
                        className="bg-[#ea1315] hover:bg-[#c71012] text-white px-12 h-12 rounded font-semibold text-xl shadow shadow-rose-100 transition-all active:scale-95 disabled:opacity-30"
                        disabled={loading || !file}
                    >
                        {loading ? "Processing Upload..." : "Start Batch Disbursement"}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default BulkLoanDisbursementUpload;
