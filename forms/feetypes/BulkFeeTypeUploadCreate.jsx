"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { bulkUploadFeeTypes, downloadFeeTypesTemplate } from "@/services/feetypes";
import { FileUp, X, Download, FileCheck } from "lucide-react";
import React, { useState, useRef } from "react";
import toast from "react-hot-toast";

function BulkFeeTypeUpload({ onBatchSuccess }) {
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
            await downloadFeeTypesTemplate(token);
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

            await bulkUploadFeeTypes(formData, token);
            toast.success("Fee Types uploaded successfully!");
            clearFile();
            if (onBatchSuccess) onBatchSuccess();
        } catch (error) {
            console.error("Upload error:", error.response?.data);
            toast.error(error?.response?.data?.message || "Failed to upload fee types.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 py-4">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold text-[var(--accent)]">Bulk Import Fee Types</h2>
                <p className="text-black text-sm max-w-lg mx-auto">
                    Quickly onboard multiple fee definitions using our CSV template.
                    Ensure your GL account names match exactly.
                </p>
            </div>

            <div className="bg-slate-50 rounded p-6 border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="bg-white p-3 rounded shadow-sm border border-slate-50">
                        <Download className="w-6 h-6 text-[#ea1315]" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-black">Download Fee Template</p>
                        <p className="text-[11px] text-black font-medium italic">Get the structure required for successful import.</p>
                    </div>
                </div>
                <Button
                    variant="default"
                    size="sm"
                    onClick={handleDownloadTemplate}
                    className="bg-[var(--accent)] hover:bg-slate-800 text-white font-semibold px-6 h-10 shadow-md shadow-slate-200"
                >
                    Get CSV Template
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div
                    className={`border-2 border-dashed rounded p-16 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${file
                        ? "border-green-500 bg-green-50/30"
                        : "border-slate-200 bg-white hover:border-[#ea1315] hover:bg-slate-50 shadow-sm"
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
                            <div className="p-5 bg-green-500 rounded text-white shadow-lg shadow-green-100">
                                <FileCheck className="w-10 h-10" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-extrabold text-xl text-black">{file.name}</p>
                                <p className="text-sm text-black font-semibold">
                                    {(file.size / 1024).toFixed(2)} KB • READY
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    clearFile();
                                }}
                                className="text-rose-600 border-rose-100 hover:bg-rose-50 hover:text-rose-700 font-semibold h-9 mt-4 px-6 rounded"
                            >
                                <X className="w-4 h-4 mr-1" /> Remove
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center space-y-5">
                            <div className="p-6 bg-slate-50 rounded text-[#ea1315]/40 border-4 border-white shadow-inner">
                                <FileUp className="w-12 h-12" />
                            </div>
                            <div className="space-y-2">
                                <p className="font-semibold text-xl text-black">
                                    Drop your CSV here
                                </p>
                                <p className="text-sm text-black font-medium">
                                    Click to browse your local storage
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-center pt-2">
                    <Button
                        type="submit"
                        className="bg-[#ea1315] hover:bg-[#c71012] text-white px-20 h-14 rounded font-semibold text-lg shadow-xl shadow-rose-200 transition-all active:scale-95 disabled:opacity-30 flex items-center gap-3"
                        disabled={loading || !file}
                    >
                        {loading ? "Processing Upload..." : "Import Fees"}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default BulkFeeTypeUpload;
