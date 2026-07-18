"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { createBulkCombinedUpdates } from "@/services/transactions";
import { FileUp, X, Loader2 } from "lucide-react";
import React, { useState, useRef } from "react";
import toast from "react-hot-toast";

function BulkAccountsUpload({ closeModal, openModal, onSuccess }) {
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

            await createBulkCombinedUpdates(formData, token);
            toast.success("Accounts list uploaded successfully!");
            closeModal();
            clearFile();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Bulk upload error:", error);
            toast.error(error?.response?.data?.message || "Failed to upload accounts list.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={openModal} onOpenChange={(open) => { if (!loading) closeModal(); }}>
            <DialogContent className="w-full sm:max-w-xl h-auto p-4 sm:p-6 bg-white shrink-0">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold ">
                        Bulk Combined Accounts Upload (CSV)
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <p className="text-sm text-gray-500">
                            Upload a CSV file containing combined account updates. Make sure it matches the required schema before importing.
                        </p>

                        <div
                            className={`border-2 border-dashed rounded p-8 flex flex-col items-center justify-center text-center ${
                                loading
                                    ? "border-primary/30 bg-gray-50/50 cursor-not-allowed"
                                    : file
                                    ? "border-green-500 bg-green-50/50"
                                    : "border-gray-300 hover:border-black"
                            } transition-colors cursor-pointer`}
                            onClick={() => !file && !loading && fileInputRef.current?.click()}
                        >
                            <Input
                                type="file"
                                accept=".csv"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                disabled={loading}
                                className="hidden"
                            />

                            {loading ? (
                                <div className="flex flex-col items-center space-y-3 py-4 animate-pulse">
                                    <div className="p-3 bg-primary/10 rounded text-primary">
                                        <Loader2 className="w-8 h-8 animate-spin" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">Uploading accounts data...</p>
                                        <p className="text-sm text-gray-500">
                                            Please do not close this window
                                        </p>
                                    </div>
                                </div>
                            ) : file ? (
                                <div className="flex flex-col items-center space-y-2">
                                    <div className="p-3 bg-green-100 rounded text-green-600">
                                        <FileUp className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{file.name}</p>
                                        <p className="text-sm text-gray-500">
                                            {(file.size / 1024).toFixed(2)} KB
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        disabled={loading}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            clearFile();
                                        }}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-2"
                                    >
                                        <X className="w-4 h-4 mr-2" /> Remove File
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center space-y-2">
                                    <div className="p-3 bg-gray-100 rounded text-gray-500">
                                        <FileUp className="w-8 h-8" />
                                    </div>
                                    <p className="font-semibold text-gray-700">
                                        Click to browse 
                                    </p>
                                    <p className="text-sm text-gray-500">Only CSV files are supported</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                clearFile();
                                closeModal();
                            }}
                            disabled={loading}
                            className="border-black text-black hover:bg-gray-100 text-base py-2 px-4 w-full sm:w-auto"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-primary hover:bg-[#022007] text-white text-base py-2 px-4 w-full sm:w-auto flex items-center justify-center gap-2"
                            disabled={loading || !file}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                "Upload File"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default BulkAccountsUpload;
