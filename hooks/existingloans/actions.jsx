"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "../authentication/useAxiosAuth";
import { 
    getExistingLoans, 
    getExistingLoanDetail, 
    createExistingLoan, 
    bulkCreateExistingLoans, 
    bulkUploadExistingLoans 
} from "@/services/existingloans";
import toast from "react-hot-toast";

export function useFetchExistingLoans() {
    const token = useAxiosAuth();

    return useQuery({
        queryKey: ["existingloans"],
        queryFn: () => getExistingLoans(token),
    });
}

export function useFetchExistingLoan(reference) {
    const token = useAxiosAuth();

    return useQuery({
        queryKey: ["existingloan", reference],
        queryFn: () => getExistingLoanDetail(reference, token),
        enabled: !!reference,
    });
}

export function useCreateExistingLoan() {
    const token = useAxiosAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (values) => createExistingLoan(values, token),
        onSuccess: () => {
            queryClient.invalidateQueries(["existingloans"]);
            toast.success("Existing loan created successfully");
        },
        onError: (error) => {
            console.error("Create existing loan error:", error);
            toast.error(error?.response?.data?.message || "Failed to create existing loan");
        },
    });
}

export function useBulkCreateExistingLoan() {
    const token = useAxiosAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (values) => bulkCreateExistingLoans(values, token),
        onSuccess: () => {
            queryClient.invalidateQueries(["existingloans"]);
            toast.success("Bulk loans created successfully");
        },
        onError: (error) => {
            console.error("Bulk create existing loan error:", error);
            toast.error(error?.response?.data?.message || "Failed to bulk create loans");
        },
    });
}

export function useBulkUploadExistingLoans() {
    const token = useAxiosAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (values) => bulkUploadExistingLoans(values, token),
        onSuccess: () => {
            queryClient.invalidateQueries(["existingloans"]);
            toast.success("Existing loans uploaded successfully");
        },
        onError: (error) => {
            console.error("Bulk upload existing loan error:", error);
            toast.error(error?.response?.data?.message || "Failed to upload existing loans");
        },
    });
}
