// Processing Mpesa STK Push Request
// A form to confirm the deposit and trigger STK Push Request
// Make a callback
// Navigate back to the savings account detail page

"use client";

import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { useFetchSavingsDepositDetail } from "@/hooks/savingsdeposits/actions";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { Loader2, ArrowLeft, Phone } from "lucide-react";
import * as Yup from "yup";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MemberLoadingSpinner from "@/components/general/MemberLoadingSpinner";
import { formatCurrency } from "@/lib/utils";
import { generateDepositSTKPush } from "@/services/mpesa";

export default function DepositProcessing() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { reference, deposit_reference } = useParams();
  const token = useAxiosAuth();
  const [paymentMessage, setPaymentMessage] = useState("");
  const [isPolling, setIsPolling] = useState(false);

  // Poll-specific query for status updates would be better, but re-using Detail fetch is okay if we refetch manually.
  // Actually, standard useQuery might cache. Let's use refetch from the hook.
  const {
    data: deposit,
    isLoading: isLoadingDeposit,
    refetch: refetchDeposit,
  } = useFetchSavingsDepositDetail(deposit_reference, token);

  const pollPaymentStatus = async (currentRef) => {
    setIsPolling(true);
    const maxRetries = 24; // 2 minutes (assuming 5s interval)
    let tries = 0;

    const interval = setInterval(async () => {
      tries++;
      try {
        const result = await refetchDeposit();
        const currentStatus = result?.data?.payment_status;
        const currentTxnStatus = result?.data?.transaction_status; // Fallback or additional check

        if (currentStatus === "COMPLETED" || currentTxnStatus === "Completed") {
          clearInterval(interval);
          setPaymentMessage("Payment Successful! Redirecting...");
          toast.success("Payment Received!");
          setTimeout(() => {
            router.push(`/sacco-admin/personal/savings/${reference}`);
          }, 2000);
          setIsPolling(false);
        } else if (
          ["FAILED", "CANCELLED", "REVERSED"].includes(currentStatus)
        ) {
          clearInterval(interval);
          setPaymentMessage(
            `Payment ${currentStatus ? currentStatus.toLowerCase() : "failed"
            }. Please try again.`
          );
          toast.error(`Payment ${currentStatus || "failed"}`);
          setIsPolling(false);
          setLoading(false); // Enable button again
        } else if (tries >= maxRetries) {
          clearInterval(interval);
          setPaymentMessage(
            "Payment verification timed out. Please check your messages. \n\nIf you received the confirmation message, please ignore this message."
          );
          toast("Taking longer than expected...", { icon: "⏳" });
          setIsPolling(false);
          setLoading(false);
        }
      } catch (e) {
        console.error("Polling error", e);
      }
    }, 5000);
  };

const PaymentSkeleton = () => (
  <div className="w-full max-w-md shadow-lg bg-white rounded-lg p-6 space-y-4 animate-pulse">
    <div className="flex items-center space-x-2">
      <div className="h-8 w-8 bg-slate-200 rounded" />
      <div className="h-6 w-48 bg-slate-200 rounded" />
    </div>
    <div className="h-4 w-full bg-slate-200 rounded" />
    <div className="h-10 w-full bg-slate-200 rounded mt-6" />
  </div>
);

  if (isLoadingDeposit && !isPolling) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-4 sm:p-8 flex items-center justify-center">
        <PaymentSkeleton />
      </div>
    );
  }

  if (!deposit) return <div className="p-8 text-center">Deposit not found</div>;

  const validationSchema = Yup.object().shape({
    phone_number: Yup.string()
      .required("Phone number is required")
      .matches(
        /^(2547|2541)\d{8}$/,
        "Phone number must start with 2547 or 2541 and be 12 digits"
      ),
  });

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 sm:p-8 flex items-center justify-center">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center space-x-2 mb-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-8 w-8"
              disabled={loading} // Disable back while processing? Maybe safer
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-xl font-semibold text-[#045e32]">
              Complete Deposit
            </CardTitle>
          </div>
          <CardDescription>
            Confirm your details to initiate M-Pesa payment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Deposit Details Summary */}
          <div className="bg-gray-50 p-4 rounded space-y-3 border">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-semibold text-lg">
                {formatCurrency(deposit.amount)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Account</span>
              <span className="font-mono">{deposit.savings_account}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Reference</span>
              <span className="font-mono">{deposit.reference}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Payment Status</span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium 
                ${deposit.payment_status === "COMPLETED"
                    ? "bg-green-100 text-green-800"
                    : deposit.payment_status === "FAILED"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
              >
                {deposit.payment_status || "PENDING"}
              </span>
            </div>
          </div>

          {paymentMessage && (
            <div
              className={`p-3 rounded text-sm text-center ${paymentMessage.includes("Successful")
                ? "bg-green-50 text-green-700"
                : paymentMessage.includes("failed") ||
                  paymentMessage.includes("timed out")
                  ? "bg-red-50 text-red-700"
                  : "bg-blue-50 text-blue-700 animate-pulse"
                }`}
            >
              {paymentMessage}
            </div>
          )}

          {/* Confirmation Form */}
          {!isPolling && deposit.payment_status !== "COMPLETED" && (
            <Formik
              initialValues={{
                phone_number: deposit.phone_number || "",
                deposit_reference: deposit.reference || "",
              }}
              validationSchema={validationSchema}
              onSubmit={async (values) => {
                setLoading(true);
                setPaymentMessage("Sending STK Push to your phone...");
                try {
                  const payload = {
                    phone_number: values.phone_number,
                    deposit_reference: values.deposit_reference,
                  };

                  await generateDepositSTKPush(payload);
                  setPaymentMessage(
                    "STK Push sent! Please check your phone to complete the payment."
                  );
                  toast.success("Push sent! Waiting for payment...");

                  // Start Polling
                  pollPaymentStatus(values.deposit_reference);
                } catch (error) {
                  console.error(error);
                  toast.error("Failed to initiate payment");
                  setPaymentMessage(
                    "Failed to initiate payment. Please try again."
                  );
                  setLoading(false);
                }
              }}
            >
              {({ errors, touched }) => (
                <Form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone_number">M-Pesa Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Field
                        as={Input}
                        id="phone_number"
                        name="phone_number"
                        className={`pl-9 ${errors.phone_number && touched.phone_number
                          ? "border-red-500"
                          : ""
                          }`}
                        placeholder="2547..."
                      />
                    </div>
                    <ErrorMessage
                      name="phone_number"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#045e32] hover:bg-[#034625] h-12 text-lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Initating...
                      </>
                    ) : (
                      "Pay Now"
                    )}
                  </Button>
                </Form>
              )}
            </Formik>
          )}

          {isPolling && (
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              <Loader2 className="h-12 w-12 text-[#045e32] animate-spin" />
              <p className="text-sm text-gray-500 text-center px-4">
                Waiting for M-Pesa confirmation. This usually takes 10-20
                seconds after you enter your PIN.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center border-t p-4 bg-gray-50 rounded-b">
          <p className="text-xs text-muted-foreground text-center">
            A prompt will be sent to your phone. Enter your M-Pesa PIN to
            authorize the transaction.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
