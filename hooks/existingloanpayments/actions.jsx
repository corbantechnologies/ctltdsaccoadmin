"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "../authentication/useAxiosAuth";
import { 
    getExistingLoanPayments, 
    getExistingLoanPaymentDetail, 
    createExistingLoanPayment, 
    bulkCreateExistingLoanPayments, 
    bulkUploadExistingLoanPayments 
} from "@/services/existingloanspayments";
import toast from "react-hot-toast";

export function useFetchExistingLoanPayments() {
    const token = useAxiosAuth();

    return useQuery({
        queryKey: ["existingloanspayments"],
        queryFn: () => getExistingLoanPayments(token),
    });
}

export function useFetchExistingLoanPayment(reference) {
    const token = useAxiosAuth();

    return useQuery({
        queryKey: ["existingloanpayment", reference],
        queryFn: () => getExistingLoanPaymentDetail(reference, token),
        enabled: !!reference,
    });
}

export function useCreateExistingLoanPayment() {
    const token = useAxiosAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (values) => createExistingLoanPayment(values, token),
        onSuccess: () => {
            queryClient.invalidateQueries(["existingloanspayments"]);
            toast.success("Payment recorded successfully");
        },
        onError: (error) => {
            console.error("Create payment error:", error);
            toast.error(error?.response?.data?.message || "Failed to record payment");
        },
    });
}

export function useBulkCreateExistingLoanPayment() {
    const token = useAxiosAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (values) => bulkCreateExistingLoanPayments(values, token),
        onSuccess: () => {
            queryClient.invalidateQueries(["existingloanspayments"]);
            toast.success("Bulk payments recorded successfully");
        },
        onError: (error) => {
            console.error("Bulk create payment error:", error);
            toast.error(error?.response?.data?.message || "Failed to bulk record payments");
        },
    });
}

export function useBulkUploadExistingLoanPayments() {
    const token = useAxiosAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (values) => bulkUploadExistingLoanPayments(values, token),
        onSuccess: () => {
            queryClient.invalidateQueries(["existingloanspayments"]);
            toast.success("Payments uploaded successfully");
        },
        onError: (error) => {
            console.error("Bulk upload payment error:", error);
            toast.error(error?.response?.data?.message || "Failed to upload payments");
        },
    });
}
