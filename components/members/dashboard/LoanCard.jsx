import React from "react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import Link from "next/link";

const LoanCard = ({ loan, memberPath }) => {
  const nextDueDate =
    loan.application_details?.projection_snapshot?.schedule?.[0]?.due_date;

  return (
    <Link href={`/${memberPath}/loans/${loan?.reference}`}>
      <div className="flex flex-col space-y-3 p-4 border border-slate-100 bg-white rounded hover:shadow-sm transition-shadow cursor-pointer mb-2">
        <div className="flex justify-between items-center">
          <span className="font-medium text-sm text-gray-900">
            {loan.product} Loan
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 uppercase tracking-wide border border-emerald-100/50">
            {loan.status}
          </span>
        </div>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Balance</p>
            <p className="font-bold text-gray-900">
              {formatCurrency(loan.outstanding_balance)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-0.5">Due Date</p>
            <p className="text-sm text-gray-700 font-medium">
              {nextDueDate
                ? format(new Date(nextDueDate), "MMM dd, yyyy")
                : "N/A"}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default LoanCard;
