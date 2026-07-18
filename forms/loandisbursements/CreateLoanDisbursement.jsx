"use client";

import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
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
import { Field, Form, Formik } from "formik";
import { createLoanDisbursement } from "@/services/loandisbursements";
import { useFetchPaymentAccounts } from "@/hooks/paymentaccounts/actions";
import toast from "react-hot-toast";

function CreateLoanDisbursementModal({ isOpen, onClose, refetch, application }) {
    const [loading, setLoading] = useState(false);
    const token = useAxiosAuth();
    const { data: paymentAccounts, isLoading: isLoadingPayment } = useFetchPaymentAccounts();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Disburse Loan: {application?.reference}</DialogTitle>
                    <DialogDescription className="hidden">Disburse Loan</DialogDescription>
                </DialogHeader>

                <Formik
                    initialValues={{
                        loan_account: application?.loan_account || "",
                        amount: application?.approved_amount || application?.requested_amount || "",
                        transaction_date: new Date().toISOString().split('T')[0],
                        disbursement_type: "Principal",
                        payment_method: "",
                        transaction_status: "Completed",
                    }}
                    enableReinitialize={true}
                    onSubmit={async (values) => {
                        setLoading(true);
                        try {
                            await createLoanDisbursement(values, token);
                            toast.success("Loan disbursed successfully!");
                            onClose();
                            if (typeof refetch === "function") refetch();
                        } catch (error) {
                            console.error("Disbursement failed", error);
                            toast.error("Failed to disburse loan!");
                        } finally {
                            setLoading(false);
                        }
                    }}
                >
                    {({ values, setFieldValue }) => (
                        <Form className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="loan_account" className="text-black">
                                    Loan Account
                                </Label>
                                <Field
                                    as={Input}
                                    id="loan_account"
                                    name="loan_account"
                                    className="border-black"
                                    readOnly
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="amount" className="text-black">
                                    Disbursement Amount
                                </Label>
                                <Field
                                    as={Input}
                                    type="number"
                                    id="amount"
                                    name="amount"
                                    className="border-black"
                                    placeholder="Enter amount"
                                    required
                                    min="0.01"
                                    step="0.01"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="transaction_date" className="text-black">
                                    Transaction Date
                                </Label>
                                <Field
                                    as={Input}
                                    type="date"
                                    id="transaction_date"
                                    name="transaction_date"
                                    className="border-black"
                                    required
                                />
                            </div>


                            <div className="space-y-2">
                                <Label htmlFor="payment_method" className="text-black">
                                    Payment Method
                                </Label>
                                <Select
                                    value={values.payment_method}
                                    onValueChange={(value) => setFieldValue("payment_method", value)}
                                    disabled={isLoadingPayment}
                                    required
                                >
                                    <SelectTrigger className="border-black w-full">
                                        <SelectValue
                                            placeholder={
                                                isLoadingPayment ? "Loading..." : "Select payment method"
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {paymentAccounts?.map((method) => (
                                            <SelectItem key={method.id || method.reference} value={method.name}>
                                                {method.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onClose}
                                    className="border-black"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-[#045e32] hover:bg-[#034625] text-white"
                                >
                                    {loading ? "Disbursing..." : "Disburse Loan"}
                                </Button>
                            </DialogFooter>
                        </Form>
                    )}
                </Formik>
            </DialogContent>
        </Dialog>
    );
}

export default CreateLoanDisbursementModal;