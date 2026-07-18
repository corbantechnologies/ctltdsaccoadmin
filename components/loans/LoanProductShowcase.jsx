"use client";

import React from "react";
import { useFetchLoanProducts } from "@/hooks/loanproducts/actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HandCoins, Info, Percent, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function LoanProductShowcase({ showTitle = true }) {
  const { data: loanProducts, isLoading } = useFetchLoanProducts();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-slate-100 animate-pulse rounded border border-slate-200" />
        ))}
      </div>
    );
  }

  if (!loanProducts || loanProducts.length === 0) return null;

  return (
    <div className="space-y-4">
      {showTitle && (
        <div className="flex items-center gap-2">
          <HandCoins className="w-5 h-5 text-[var(--primary)]" />
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Available Loan Products</h2>
        </div>
      )}

      {/* Info Card Explaining Rates */}
      <Card className="border-slate-200 bg-slate-50/50 shadow-sm">
        <CardContent className="p-3 space-y-2">
          <div className="flex gap-2 items-center">
            <Info className="w-4 h-4 text-[var(--primary)] shrink-0" />
            <span className="text-xs font-semibold text-slate-800">Repayment Methods</span>
          </div>
          <div className="text-[11px] text-slate-500 space-y-1 font-medium leading-relaxed">
            <p>• <strong>Flat Rate:</strong> Fixed based on original loan principal.</p>
            <p>• <strong>Reducing Balance:</strong> Calculated on declining balance (lower total interest).</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2">
        {loanProducts.map((product) => (
          <Card
            key={product.reference}
            className="border-slate-200 hover:border-[var(--primary)]/30 hover:shadow-md transition-all duration-300 flex flex-col"
          >
            <CardHeader className="p-3 pb-1">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-bold text-slate-900">{product.name}</CardTitle>
                <Badge variant="outline" className="text-[9px] font-bold text-[var(--primary)] border-emerald-100 bg-emerald-50/30">
                  {product.interest_method}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-1 flex-grow">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-0.5">
                  <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Interest Rate</p>
                  <p className="text-xs font-bold text-slate-900">
                    {product.interest_rate}% <span className="text-[10px] text-slate-500 font-normal">/ yr</span>
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Processing Fee</p>
                  <p className="text-xs font-bold text-slate-900">
                    {product.processing_fee}% <span className="text-[10px] text-slate-500 font-normal">flat</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
