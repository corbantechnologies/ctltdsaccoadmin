"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { updateGLAccount } from "@/services/glaccounts";
import { Field, Form, Formik } from "formik";
import React, { useState } from "react";
import toast from "react-hot-toast";

const CATEGORIES = [
    { value: "ASSET", label: "Asset" },
    { value: "LIABILITY", label: "Liability" },
    { value: "EQUITY", label: "Equity" },
    { value: "REVENUE", label: "Revenue" },
    { value: "EXPENSE", label: "Expense" },
];

const UpdateGLAccountModal = ({ isOpen, onClose, refetchGLAccounts, glAccount }) => {
    const [loading, setLoading] = useState(false);
    const token = useAxiosAuth();

    if (!glAccount) return null;

    const hasTransactions = glAccount?.has_transactions || false;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Update GL Account: {glAccount?.name}</DialogTitle>
                </DialogHeader>
                <Formik
                    initialValues={{
                        name: glAccount?.name || "",
                        category: glAccount?.category || "",
                        code: glAccount?.code || "",
                        is_active: glAccount?.is_active ?? true,
                        is_current_account: glAccount?.is_current_account ?? true,
                    }}
                    onSubmit={async (values) => {
                        try {
                            setLoading(true);
                            await updateGLAccount(glAccount?.reference, values, token);
                            toast?.success("GL Account updated successfully!");
                            onClose();
                            refetchGLAccounts();
                        } catch (error) {
                            toast?.error("Failed to update GL Account!");
                        } finally {
                            setLoading(false);
                        }
                    }}
                >
                    {({ values, setFieldValue }) => (
                        <Form className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-black">
                                    Name
                                </Label>
                                <Field
                                    as={Input}
                                    id="name"
                                    name="name"
                                    className="border-black bg-gray-50"
                                    required
                                    disabled
                                />
                                <p className="text-xs text-muted-foreground">
                                    Name cannot be changed.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-black">Category</Label>
                                <Select
                                    name="category"
                                    value={values.category}
                                    onValueChange={(value) => setFieldValue("category", value)}
                                    className="w-full"
                                >
                                    <SelectTrigger className="border-black">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map((category) => (
                                            <SelectItem key={category.value} value={category.value}>
                                                {category.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="code" className="text-black">Code</Label>
                                <Field
                                    as={Input}
                                    id="code"
                                    name="code"
                                    className="border-black"
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_active"
                                    checked={values.is_active}
                                    onCheckedChange={(checked) => setFieldValue("is_active", checked)}
                                />
                                <Label htmlFor="is_active" className="text-black">
                                    Is Active?
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_current_account"
                                    checked={values.is_current_account}
                                    onCheckedChange={(checked) => setFieldValue("is_current_account", checked)}
                                />
                                <Label htmlFor="is_current_account" className="text-black">
                                    Is Current Account?
                                </Label>
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onClose}
                                    className="border-black text-black hover:bg-gray-100"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-[#ea1315] hover:bg-[#c71012] text-white"
                                    disabled={loading}
                                >
                                    {loading ? "Updating..." : "Update"}
                                </Button>
                            </DialogFooter>
                        </Form>
                    )}
                </Formik>
            </DialogContent>
        </Dialog>
    );
};

export default UpdateGLAccountModal;