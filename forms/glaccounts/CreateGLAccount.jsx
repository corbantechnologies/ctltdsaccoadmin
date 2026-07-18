"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { createGLAccount } from "@/services/glaccounts";
import { Field, Form, Formik } from "formik";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { X } from "lucide-react";

const CATEGORIES = [
    { value: "ASSET", label: "Asset" },
    { value: "LIABILITY", label: "Liability" },
    { value: "EQUITY", label: "Equity" },
    { value: "REVENUE", label: "Revenue" },
    { value: "EXPENSE", label: "Expense" },
];

const CreateGLAccountModal = ({ isOpen, onClose, refetchGLAccounts }) => {
    const [loading, setLoading] = useState(false);
    const token = useAxiosAuth();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4 animate-in fade-in duration-200">
            <div
                className="bg-white rounded shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b bg-white">
                    <h2 className="text-xl font-bold text-slate-900">
                        Create New GL Account
                    </h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="h-8 w-8 rounded hover:bg-slate-100 transition-colors"
                    >
                        <X className="h-4 w-4 text-slate-500" />
                    </Button>
                </div>

                <div className="p-6">
                    <Formik
                        initialValues={{
                            name: "",
                            category: "ASSET",
                            code: "",
                            is_active: true,
                            is_current_account: true,
                        }}
                        onSubmit={async (values) => {
                            try {
                                setLoading(true);
                                await createGLAccount(values, token);
                                toast?.success("GL Account created successfully!");
                                onClose();
                                refetchGLAccounts();
                            } catch (error) {
                                if (error?.response?.data?.code?.[0]) {
                                    toast?.error("GL Account code already exists!");
                                } else if (error?.response?.data?.name?.[0]) {
                                    toast?.error("GL Account name already exists!");
                                } else {
                                    toast?.error("Failed to create GL Account!");
                                }
                            } finally {
                                setLoading(false);
                            }
                        }}
                    >
                        {({ values, setFieldValue }) => (
                            <Form className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        Account Name
                                    </Label>
                                    <Field
                                        as={Input}
                                        id="name"
                                        name="name"
                                        placeholder="e.g. Cash at Bank"
                                        className="border-slate-200 focus:border-[#ea1315] focus:ring-[#ea1315] h-10"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        Category
                                    </Label>
                                    <Select
                                        value={values.category}
                                        onValueChange={(value) => setFieldValue("category", value)}
                                        required
                                        className="w-full"
                                    >
                                        <SelectTrigger className="border-slate-200 w-full h-10">
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CATEGORIES.map((cat) => (
                                                <SelectItem key={cat.value} value={cat.value}>
                                                    {cat.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="code" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        Account Code
                                    </Label>
                                    <Field
                                        as={Input}
                                        id="code"
                                        name="code"
                                        placeholder="e.g. 1001"
                                        className="border-slate-200 focus:border-[#ea1315] focus:ring-[#ea1315] h-10 font-mono"
                                        required
                                    />
                                </div>
                                <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded border border-slate-100">
                                    <Checkbox
                                        id="is_active"
                                        checked={values.is_active}
                                        onCheckedChange={(checked) => setFieldValue("is_active", checked)}
                                        className="border-slate-300 data-[state=checked]:bg-[#ea1315] data-[state=checked]:border-[#ea1315]"
                                    />
                                    <Label htmlFor="is_active" className="text-sm font-medium text-slate-700 cursor-pointer">
                                        Is this account active?
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded border border-slate-100">
                                    <Checkbox
                                        id="is_current_account"
                                        checked={values.is_current_account}
                                        onCheckedChange={(checked) => setFieldValue("is_current_account", checked)}
                                        className="border-slate-300 data-[state=checked]:bg-[#ea1315] data-[state=checked]:border-[#ea1315]"
                                    />
                                    <Label htmlFor="is_current_account" className="text-sm font-medium text-slate-700 cursor-pointer">
                                        Is this a current account?
                                    </Label>
                                </div>

                                <div className="pt-4 flex items-center justify-end gap-3">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={onClose}
                                        className="text-slate-500 hover:text-slate-700 font-bold text-xs"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="bg-[#ea1315] hover:bg-[#c71012] text-white font-bold h-10 px-8 rounded shadow-lg shadow-[#ea1315]/20 animate-in fade-in slide-in-from-bottom-2 duration-300"
                                        disabled={loading}
                                    >
                                        {loading ? "Creating..." : "Create Account"}
                                    </Button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>

            {/* Backdrop click to close */}
            <div className="absolute inset-0 -z-10" onClick={onClose} />
        </div>
    );
};

export default CreateGLAccountModal;
