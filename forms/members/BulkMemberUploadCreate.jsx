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
import { createBulkMembersUpload } from "@/services/members";
import { FileUp, X, CheckCircle2, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useRef } from "react";
import toast from "react-hot-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function BulkMemberUploadCreate({ closeModal, openModal }) {
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(null);
    const [createdMembers, setCreatedMembers] = useState(null);
    const fileInputRef = useRef(null);
    const token = useAxiosAuth();
    const router = useRouter();

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

    const handleDownloadCSV = () => {
        if (!createdMembers || createdMembers.length === 0) return;
        const headers = ["Member No", "Name", "Email", "Phone", "Temporary Password"];
        const rows = createdMembers.map(m => [
            m.member_no,
            m.name,
            m.email || "",
            m.phone || "",
            m.temporary_password || ""
        ]);
        const csvContent = "data:text/csv;charset=utf-8," 
            + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `bulk_members_credentials.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Credentials downloaded!");
    };

    const handleDone = () => {
        setCreatedMembers(null);
        clearFile();
        closeModal();
        router.refresh();
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
            formData.append("csv_file", file);

            const response = await createBulkMembersUpload(formData, token);
            toast.success("Members uploaded successfully!");
            
            const members = response?.data?.created_members;
            if (members && members.length > 0) {
                setCreatedMembers(members);
            } else {
                closeModal();
                router.refresh();
                clearFile();
            }
        } catch (error) {
            console.log(error);
            toast.error(error?.response?.data?.message || "Failed to upload members.");
        } finally {
            setLoading(false);
        }
    };

    if (createdMembers) {
        return (
            <Dialog open={openModal} onOpenChange={handleDone}>
                <DialogContent className="w-full sm:max-w-2xl h-auto p-4 sm:p-6 bg-white overflow-y-auto max-h-[90vh]">
                    <DialogHeader className="text-center flex flex-col items-center">
                        <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <DialogTitle className="text-2xl font-bold text-slate-900">
                            Bulk Import Complete!
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 my-4">
                        <p className="text-sm text-gray-500 text-center">
                            Successfully onboarded <strong>{createdMembers.length}</strong> members. Below are their generated credentials. Please download the CSV file to preserve them.
                        </p>

                        <div className="border rounded-lg overflow-hidden max-h-[40vh] overflow-y-auto">
                            <Table>
                                <TableHeader className="bg-slate-50">
                                    <TableRow>
                                        <TableHead>Member No</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Temporary Password</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {createdMembers.map((member, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell className="font-mono text-xs">{member.member_no}</TableCell>
                                            <TableCell className="font-medium text-sm">{member.name}</TableCell>
                                            <TableCell className="font-mono text-xs font-semibold text-emerald-700">{member.temporary_password}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    <DialogFooter className="flex flex-col sm:flex-row gap-3">
                        <Button
                            type="button"
                            onClick={handleDownloadCSV}
                            variant="outline"
                            className="border-slate-300 hover:bg-slate-50 text-slate-700 w-full sm:w-auto text-base py-2 px-4"
                        >
                            <Download className="w-4 h-4 mr-2" /> Download CSV
                        </Button>
                        <Button
                            onClick={handleDone}
                            className="bg-[#ea1315] hover:bg-[#c71012] text-white w-full sm:w-auto text-base py-2 px-4"
                        >
                            Done
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={openModal} onOpenChange={closeModal}>
            <DialogContent className="w-full sm:max-w-xl h-auto p-4 sm:p-6 bg-white shrink-0">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold ">
                        Bulk Upload Members (CSV)
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <p className="text-sm text-gray-500">
                            Upload a CSV file containing member data. Ensure it has the correct headers: salutation, first_name, last_name, gender, email, employer, payroll_no, phone.
                        </p>

                        <div
                            className={`border-2 border-dashed rounded p-8 flex flex-col items-center justify-center text-center ${file ? "border-green-500 bg-green-50" : "border-gray-300 hover:border-black"
                                } transition-colors cursor-pointer`}
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
                            className="border-black text-black hover:bg-gray-100 text-base py-2 px-4 w-full sm:w-auto"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-[#ea1315] hover:bg-[#c71012] text-white text-base py-2 px-4 w-full sm:w-auto"
                            disabled={loading || !file}
                        >
                            {loading ? "Uploading..." : "Upload Members"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default BulkMemberUploadCreate;