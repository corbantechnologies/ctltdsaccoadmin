"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { bulkUploadJournalBatches, downloadJournalBatchesTemplate } from "@/services/journalbatches";
import { FileUp, X, Download, FileCheck } from "lucide-react";
import React, { useState, useRef } from "react";
import toast from "react-hot-toast";

function BulkJournalBatchUpload({ onBatchSuccess }) {
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
            await downloadJournalBatchesTemplate(token);
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

            await bulkUploadJournalBatches(formData, token);
            toast.success("Journal batches uploaded successfully!");
            clearFile();
            if (onBatchSuccess) onBatchSuccess();
        } catch (error) {
            console.error("Upload error:", error.response?.data);
            toast.error(error?.response?.data?.message || "Failed to upload journal batches.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 py-4">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-[#ea1315]">Bulk Journal Batches (CSV)</h2>
                <p className="text-slate-500 text-sm max-w-lg mx-auto">
                    Import multiple transaction batches at once using a CSV manifest.
                </p>
            </div>

            <div className="bg-rose-50 rounded p-6 border border-rose-100 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="bg-white p-3 rounded shadow-sm border border-rose-50">
                        <Download className="w-6 h-6 text-[#ea1315]" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-800 uppercase tracking-tighter">Batch Template</p>
                        <p className="text-[11px] text-slate-500 font-medium italic">Standard CSV format for journals.</p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadTemplate}
                    className="border-[#ea1315] text-[#ea1315] hover:bg-[#ea1315] hover:text-white font-bold px-6 h-10 transition-all rounded transition-colors"
                >
                    Get Template
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div
                    className={`border-2 border-dashed rounded-[2rem] p-16 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${file
                        ? "border-[#ea1315] bg-rose-50/20"
                        : "border-slate-200 bg-white hover:border-[#ea1315] hover:bg-rose-50/5"
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
                        <div className="flex flex-col items-center space-y-4 animate-in fade-in zoom-in-95 font-medium">
                            <div className="p-5 bg-[#ea1315] rounded text-white shadow-lg ring-4 ring-rose-50">
                                <FileCheck className="w-10 h-10" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-extrabold text-xl text-slate-900 tracking-tight">{file.name}</p>
                                <p className="text-[12px] text-[#ea1315] font-semibold uppercase tracking-[0.2em]">
                                    {(file.size / 1024).toFixed(2)} KB • READY FOR PROCESSING
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    clearFile();
                                }}
                                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-bold h-9 mt-4 px-6 rounded"
                            >
                                <X className="w-4 h-4 mr-1" /> Reset
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center space-y-5">
                            <div className="p-6 bg-slate-50 rounded text-rose-300 border-2 border-white shadow-md">
                                <FileUp className="w-12 h-12" />
                            </div>
                            <div className="space-y-2">
                                <p className="font-semibold text-xl text-slate-800 tracking-tight font-bold">
                                    Drop Batch Manifest
                                </p>
                                <p className="text-sm text-slate-400 font-medium font-bold uppercase tracking-widest">
                                    Click here to upload your CSV file
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-center pt-2">
                    <Button
                        type="submit"
                        className="bg-[#ea1315] hover:bg-[#c71012] text-white px-20 h-14 rounded font-bold text-lg shadow-xl shadow-rose-100 transition-all active:scale-95 disabled:opacity-30 uppercase tracking-tight"
                        disabled={loading || !file}
                    >
                        {loading ? "Processing Batch..." : "Execute Bulk Import"}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default BulkJournalBatchUpload;
