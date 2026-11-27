"use client";

import { FileUp } from "lucide-react";
import SubPage from "@/components/general/SubPage";
import BulkLoanDisbursementUploadCreate from "@/forms/loandisbursements/BulkLoanDisbursementUploadCreate";

export default function Page() {
    return (
        <SubPage backHref="/sacco-admin/loans" backLabel="Loans" title="CSV Upload" description="Disburse loans in bulk from a CSV file." icon={FileUp}>
            <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-6"><BulkLoanDisbursementUploadCreate /></div>
        </SubPage>
    );
}
