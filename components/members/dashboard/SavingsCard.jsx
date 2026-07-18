import React from "react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

const SavingsCard = ({ account, memberPath }) => {
  return (
    <Link href={`/${memberPath}/savings/${account?.reference}`}>
      <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded hover:bg-slate-50 transition-colors shadow-sm cursor-pointer mb-2">
        <div className="space-y-1">
          <p className="text-sm font-medium leading-none text-gray-900">
            {account.account_type}
          </p>
          <p className="text-xs text-muted-foreground font-mono">
            {account.account_number}
          </p>
        </div>
        <div className="font-bold text-primary">
          {formatCurrency(account.balance)}
        </div>
      </div>
    </Link>
  );
};

export default SavingsCard;
