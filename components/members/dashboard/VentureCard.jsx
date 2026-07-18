import React from "react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

const VentureCard = ({ venture, memberPath }) => {
  return (
    <Link href={`/${memberPath}/ventures/${venture?.reference}`}>
      <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded hover:bg-slate-50 transition-colors shadow-sm cursor-pointer mb-2">
        <div className="space-y-1">
          <p className="text-sm font-medium leading-none text-gray-900">
            {venture.venture_type}
          </p>
          <p className="text-xs text-muted-foreground font-mono">
            {venture.account_number}
          </p>
        </div>
        <div className="font-bold text-purple-700">
          {formatCurrency(venture.balance)}
        </div>
      </div>
    </Link>
  );
};

export default VentureCard;
