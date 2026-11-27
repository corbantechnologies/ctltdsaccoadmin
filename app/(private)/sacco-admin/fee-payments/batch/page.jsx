"use client";

import { Plus } from "lucide-react";
import SubPage from "@/components/general/SubPage";
import BulkFeePaymentCreate from "@/forms/feepayments/BulkFeePaymentCreate";

export default function Page() {
    return (
        <SubPage backHref="/sacco-admin/fee-payments" backLabel="Fee Accounts" title="Manual Batch" description="Record several fee payments at once by filling in the form." icon={Plus}>
            <BulkFeePaymentCreate />
        </SubPage>
    );
}
