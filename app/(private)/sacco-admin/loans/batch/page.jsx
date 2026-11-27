"use client";

import { Plus } from "lucide-react";
import SubPage from "@/components/general/SubPage";
import BulkLoanDisbursementCreate from "@/forms/loandisbursements/BulkLoanDisbursementCreate";

export default function Page() {
    return (
        <SubPage backHref="/sacco-admin/loans" backLabel="Loans" title="Manual Batch" description="Disburse several loans at once by filling in the form." icon={Plus}>
            <BulkLoanDisbursementCreate />
        </SubPage>
    );
}
