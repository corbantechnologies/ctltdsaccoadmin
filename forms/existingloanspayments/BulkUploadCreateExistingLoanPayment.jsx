"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { bulkUploadExistingLoanPayments, downloadExistingLoanPaymentsTemplate } from "@/services/existingloanspayments";
import { FileUp, X, Download, FileCheck } from "lucide-react";
import React, { useState, useRef } from "react";
import toast from "react-hot-toast";
import Modal from "@/components/general/Modal";

function BulkUploadCreateExistingLoanPayment({ isOpen, onClose, onBatchSuccess }) {
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
            await downloadExistingLoanPaymentsTemplate(token);
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

            await bulkUploadExistingLoanPayments(formData, token);
            toast.success("Payments uploaded successfully!");
            clearFile();
            if (onBatchSuccess) onBatchSuccess();
            onClose();
        } catch (error) {
            console.error("Upload error:", error.response?.data);
            toast.error(error?.response?.data?.message || "Failed to upload payments.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Bulk Upload Loan Payments"
            description="Import historical loan payments via CSV."
            maxWidth="max-w-4xl"
        >
            <div className="space-y-8 py-4">
                <div className="bg-emerald-50/50 rounded p-6 border border-emerald-100 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="bg-white p-3 rounded shadow-sm border border-emerald-100">
                            <Download className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-800 uppercase tracking-tighter">Payments Template</p>
                            <p className="text-[11px] text-slate-500 font-medium tracking-tight">Download the CSV structure for payment migration.</p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadTemplate}
                        className="border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white font-semibold px-6 h-10 transition-all shadow-sm rounded"
                    >
                        Get Template
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div
                        className={`border-2 border-dashed rounded p-12 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${file
                            ? "border-emerald-500 bg-emerald-50/20 shadow-inner"
                            : "border-slate-200 bg-white hover:border-emerald-500 hover:bg-slate-50"
                            }`}
                        onClick={() => !file && fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            accept=".csv"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        {file ? (
                            <div className="flex flex-col items-center space-y-4 animate-in fade-in zoom-in-95">
                                <div className="p-5 bg-emerald-600 rounded text-white shadow-sm ring-2 ring-emerald-50">
                                    <FileCheck className="w-10 h-10" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-semibold text-xl text-slate-900 tracking-tight">{file.name}</p>
                                    <p className="text-[12px] text-emerald-600 font-semibold uppercase tracking-[0.2em]">
                                        {(file.size / 1024).toFixed(2)} KB • ONBOARDING DATA
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        clearFile();
                                    }}
                                    className="text-red-500 border-red-100 hover:bg-red-50 hover:text-red-600 font-semibold h-9 mt-4 px-6 rounded"
                                >
                                    <X className="w-4 h-4 mr-1" /> Remove
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center space-y-6">
                                <div className="p-6 bg-slate-50 rounded text-slate-300 border-2 border-white shadow-md">
                                    <FileUp className="w-12 h-12" />
                                </div>
                                <div className="space-y-2">
                                    <p className="font-semibold text-xl text-slate-800 tracking-tight">
                                        Upload Payments CSV
                                    </p>
                                    <p className="text-sm text-slate-400 font-medium">
                                        Click your CSV file to begin the migration
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-center pt-2">
                        <Button
                            type="submit"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-24 h-14 rounded font-semibold text-lg shadow-sm transition-all active:scale-95 disabled:opacity-30 flex items-center gap-3 uppercase tracking-tight"
                            disabled={loading || !file}
                        >
                            {loading ? "Processing..." : "Start Import"}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}

export default BulkUploadCreateExistingLoanPayment;
