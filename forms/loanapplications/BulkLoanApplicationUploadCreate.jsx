"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { bulkUploadLoanApplications, downloadLoanApplicationsTemplate } from "@/services/loanapplications";
import { FileUp, X, Download, FileCheck } from "lucide-react";
import React, { useState, useRef } from "react";
import toast from "react-hot-toast";

function BulkLoanApplicationUpload({ onBatchSuccess }) {
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
            await downloadLoanApplicationsTemplate(token);
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

            await bulkUploadLoanApplications(formData, token);
            toast.success("Loan applications uploaded successfully!");
            clearFile();
            if (onBatchSuccess) onBatchSuccess();
        } catch (error) {
            console.error("Upload error:", error.response?.data);
            toast.error(error?.response?.data?.detail || "Failed to upload loan applications.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto space-y-6 py-4">
            <div className="text-center space-y-3">
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Bulk Upload Loan Applications</h2>
                <p className="text-slate-500 text-base max-w-2xl mx-auto">
                    Export the template, fill it with member loan application details, and upload here to onboard multiple loans at once.
                </p>
            </div>

            <div className="bg-slate-50 rounded p-2 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                <div className="flex items-center gap-6">
                    <div className="bg-white p-2 rounded shadow-sm border border-slate-100">
                        <Download className="w-8 h-8 text-[#045e32]" />
                    </div>
                    <div>
                        <p className="text-base text-slate-800 tracking-tight">Application Template</p>
                        <p className="text-sm text-slate-500 font-medium">Download the standard CSV template with required columns.</p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    onClick={handleDownloadTemplate}
                    className="border-black bg-[#045e32] text-black hover:bg-slate-100 px-6 h-10 transition-all rounded"
                >
                    Get Template
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div
                    className={`border-4 border-dashed rounded p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${file
                        ? "border-green-500 bg-green-50/30"
                        : "border-slate-200 bg-white hover:border-[#045e32] hover:bg-slate-50/50"
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
                        <div className="flex flex-col items-center space-y-6 animate-in fade-in zoom-in-95">
                            <div className="p-6 bg-green-600 rounded text-white shadow-xl ring-8 ring-green-50">
                                <FileCheck className="w-8 h-8" />
                            </div>
                            <div className="space-y-2">
                                <p className="font-bold text-lg text-slate-900 tracking-tight">{file.name}</p>
                                <p className="text-sm text-green-600 font-bold uppercase tracking-widest">
                                    {(file.size / 1024).toFixed(2)} KB • DATA READY FOR UPLOAD
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    clearFile();
                                }}
                                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-bold h-10 px-8 rounded mt-2"
                            >
                                <X className="w-5 h-5 mr-2" /> Reset Selection
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center space-y-6">
                            <div className="p-4 bg-slate-50 rounded text-[#045e32]/20 border-4 border-white shadow-inner">
                                <FileUp className="w-8 h-8" />
                            </div>
                            <div className="space-y-3">
                                <p className="font-bold text-lg text-slate-800 tracking-tight">
                                    Upload Completed CSV
                                </p>
                                <p className="text-base text-slate-400 font-medium">
                                    Click to select or drop your file here
                                </p>
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex justify-center pt-2">
                    <Button
                        type="submit"
                        className="bg-[#045e32] hover:bg-[#034625] text-white px-12 h-10 rounded font-bold text-base shadow shadow-[#045e32]/20 transition-all active:scale-95 disabled:opacity-30"
                        disabled={loading || !file}
                    >
                        {loading ? "Processing Upload..." : "Start Batch Upload"}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default BulkLoanApplicationUpload;
