"use client";

import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { createLoanRepaymentMpesa } from "@/services/loanrepayments";

export default function MpesaCreateLoanPaymentForm({
    isOpen,
    onClose,
    loanReference,       // The correct loan reference (for URL)
    loanAccountNumber,   // For the backend payload
}) {
    const [loading, setLoading] = useState(false);
    const token = useAxiosAuth();
    const router = useRouter();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Make M-Pesa Loan Payment</DialogTitle>
                    <DialogDescription>
                        Enter the amount and your M-Pesa phone number to initiate payment.
                    </DialogDescription>
                </DialogHeader>

                <Formik
                    initialValues={{
                        loan_account: loanAccountNumber,
                        amount: "",
                        phone_number: "",
                        transaction_status: "Pending",
                        repayment_type: "Mpesa STK Push",
                    }}
                    onSubmit={async (values) => {
                        setLoading(true);
                        try {
                            const response = await createLoanRepaymentMpesa(values, token);

                            toast.success("Payment request created successfully!");

                            // CORRECT REDIRECT using loanReference
                            router.push(`/member/loans/${loanReference}/${response?.reference || ''}`);

                            onClose();
                        } catch (error) {
                            console.error(error);
                            const errorMsg = error?.response?.data?.error ||
                                error?.response?.data?.loan_account?.[0] ||
                                "Failed to create payment request";
                            toast.error(errorMsg);
                        } finally {
                            setLoading(false);
                        }
                    }}
                >
                    {({ errors, touched }) => (
                        <Form className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="amount">Amount (KES)</Label>
                                <Field
                                    as={Input}
                                    id="amount"
                                    name="amount"
                                    type="number"
                                    placeholder="Enter amount"
                                    className={errors.amount && touched.amount ? "border-red-500" : ""}
                                />
                                <ErrorMessage name="amount" component="p" className="text-red-500 text-sm" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone_number">M-Pesa Phone Number</Label>
                                <Field
                                    as={Input}
                                    id="phone_number"
                                    name="phone_number"
                                    type="text"
                                    placeholder="254712345678"
                                    className={errors.phone_number && touched.phone_number ? "border-red-500" : ""}
                                />
                                <ErrorMessage name="phone_number" component="p" className="text-red-500 text-sm" />
                                <p className="text-[0.8rem] text-muted-foreground">
                                    Format: 2547XXXXXXXX
                                </p>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#045e32] hover:bg-[#034625]"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Initiating Payment...
                                    </>
                                ) : (
                                    "Initiate M-Pesa Payment"
                                )}
                            </Button>
                        </Form>
                    )}
                </Formik>
            </DialogContent>
        </Dialog>
    );
}