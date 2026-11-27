"use client";

import { FileUp } from "lucide-react";
import SubPage from "@/components/general/SubPage";
import BulkFeePaymentUploadCreate from "@/forms/feepayments/BulkFeePaymentUploadCreate";

export default function Page() {
    return (
        <SubPage backHref="/sacco-admin/fee-payments" backLabel="Fee Accounts" title="CSV Import" description="Record fee payments in bulk from a CSV file." icon={FileUp}>
            <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-6"><BulkFeePaymentUploadCreate /></div>
        </SubPage>
    );
}
