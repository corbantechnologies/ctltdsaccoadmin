"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { bulkUploadSavingTypes, downloadSavingTypesTemplate } from "@/services/savingtypes";
import { FileUp, X, Download, FileCheck } from "lucide-react";
import React, { useState, useRef } from "react";
import toast from "react-hot-toast";

function BulkSavingTypeUpload({ onBatchSuccess }) {
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
            await downloadSavingTypesTemplate(token);
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

            await bulkUploadSavingTypes(formData, token);
            toast.success("Saving Types uploaded successfully!");
            clearFile();
            if (onBatchSuccess) onBatchSuccess();
        } catch (error) {
            console.error("Upload error:", error.response?.data);
            toast.error(error?.response?.data?.message || "Failed to upload saving types.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 py-4">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold text-emerald-700">Import Savings Products</h2>
                <p className="text-slate-500 text-sm max-w-lg mx-auto italic font-medium">
                    Scale your SACCO offerings by importing multiple savings products at once.
                </p>
            </div>

            <div className="bg-emerald-50/50 rounded p-6 border border-emerald-100 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="bg-white p-3 rounded shadow-sm border border-emerald-100">
                        <Download className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-800 uppercase tracking-tighter">Savings Template</p>
                        <p className="text-[11px] text-slate-500 font-medium">Download the structure with GL mapping columns.</p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadTemplate}
                    className="border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white font-semibold px-6 h-10 transition-all shadow-sm"
                >
                    Get Template
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div
                    className={`border-2 border-dashed rounded p-16 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${file
                        ? "border-emerald-500 bg-emerald-50/20 shadow-inner"
                        : "border-slate-200 bg-white hover:border-emerald-500 hover:bg-emerald-50/10"
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
                            <div className="p-5 bg-emerald-600 rounded text-white shadow-xl shadow-emerald-100 ring-4 ring-emerald-50">
                                <FileCheck className="w-10 h-10" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-extrabold text-xl text-slate-900 tracking-tight">{file.name}</p>
                                <p className="text-[12px] text-emerald-600 font-semibold uppercase tracking-[0.2em]">
                                    {(file.size / 1024).toFixed(2)} KB • SECURE DATA
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    clearFile();
                                }}
                                className="text-emerald-700 border-emerald-100 hover:bg-emerald-50 hover:text-emerald-800 font-semibold h-9 mt-4 px-6 rounded"
                            >
                                <X className="w-4 h-4 mr-1" /> Remove Selection
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center space-y-6">
                            <div className="p-6 bg-emerald-50 rounded text-emerald-300 border-2 border-white shadow-md">
                                <FileUp className="w-12 h-12" />
                            </div>
                            <div className="space-y-2">
                                <p className="font-semibold text-xl text-slate-800 tracking-tight">
                                    Upload Savings Spreadsheet
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
                        className="bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded transition-all active:scale-95 disabled:opacity-30 flex items-center gap-3"
                        disabled={loading || !file}
                    >
                        {loading ? "Syncing Products..." : "Import Savings Data"}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default BulkSavingTypeUpload;
