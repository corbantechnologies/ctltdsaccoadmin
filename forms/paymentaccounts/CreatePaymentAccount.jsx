"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
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
import { createPaymentAccount } from "@/services/paymentaccounts";
import { useFetchGLAccounts } from "@/hooks/glaccounts/actions";
import { Field, Form, Formik } from "formik";
import React, { useState } from "react";
import toast from "react-hot-toast";

const CreatePaymentAccountModal = ({ isOpen, onClose, refetchPaymentAccounts }) => {
    const [loading, setLoading] = useState(false);
    const token = useAxiosAuth();
    const { data: glAccounts, isLoading: isLoadingGL } = useFetchGLAccounts();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Payment Account</DialogTitle>
                </DialogHeader>
                <Formik
                    initialValues={{
                        name: "",
                        gl_account: "",
                        is_active: true,
                    }}
                    onSubmit={async (values) => {
                        try {
                            setLoading(true);
                            await createPaymentAccount(values, token);
                            toast?.success("Payment Account created successfully!");
                            onClose();
                            refetchPaymentAccounts();
                        } catch (error) {
                            if (error?.response?.data?.name[0]) {
                                toast?.error("Payment Account name already exists!");
                            } else {
                                toast?.error("Failed to create Payment Account!");
                            }
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
                                    className="border-black"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="gl_account" className="text-black">
                                    GL Account
                                </Label>
                                <Select
                                    value={values.gl_account}
                                    onValueChange={(value) => setFieldValue("gl_account", value)}
                                    disabled={isLoadingGL}
                                    required
                                >
                                    <SelectTrigger className="border-black w-full">
                                        <SelectValue placeholder={isLoadingGL ? "Loading..." : "Select GL Account"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {glAccounts?.map((acc) => (
                                            <SelectItem key={acc.id || acc.reference} value={acc.name}>
                                                {acc.name} ({acc.code})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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
                                    disabled={loading || isLoadingGL}
                                >
                                    {loading ? "Creating..." : "Create"}
                                </Button>
                            </DialogFooter>
                        </Form>
                    )}
                </Formik>
            </DialogContent>
        </Dialog>
    );
};

export default CreatePaymentAccountModal;