"use client";

import { useState } from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { useFetchReconciliation } from "@/hooks/accounting/actions";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Empty, Loading, PageShell, inputClass, money, today } from "@/components/accounting/ui";

function Reconciliation() {
  const [asOf, setAsOf] = useState(today());
  const { data, isLoading } = useFetchReconciliation(asOf);

  return (
    <PageShell
      title="Control account reconciliation"
      description="Each control account in the GL should equal the total of the member records behind it. A difference means something was posted to the GL without the member record (or the reverse), e.g. opening balances posted straight to a bank account."
      actions={<input type="date" className={inputClass + " w-40"} value={asOf} onChange={(e) => setAsOf(e.target.value)} />}
    >
      {data && (
        <div
          className={`flex items-center gap-2 rounded border p-3 text-sm ${
            data.all_reconciled ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-900"
          }`}
        >
          {data.all_reconciled ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          {data.all_reconciled ? "Every control account agrees with its member ledger." : "Some control accounts don't agree. Investigate the rows marked below."}
        </div>
      )}
      <Card className="shadow-md">
        <CardContent className="p-0">
          {isLoading ? (
            <Loading />
          ) : !data?.rows?.length ? (
            <Empty>No control accounts found.</Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Control</TableHead>
                  <TableHead>GL account</TableHead>
                  <TableHead className="text-right">GL balance</TableHead>
                  <TableHead className="text-right">Member ledger</TableHead>
                  <TableHead className="text-right">Difference</TableHead>
                  <TableHead>Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.rows.map((r) => (
                  <TableRow key={r.control} className={r.reconciled ? "" : "bg-amber-50/60"}>
                    <TableCell className="font-medium">{r.control}</TableCell>
                    <TableCell className="text-xs">{r.gl_code ? `${r.gl_code} ${r.gl_name}` : "—"}</TableCell>
                    <TableCell className="text-right">{r.gl_balance !== null ? money(r.gl_balance) : "—"}</TableCell>
                    <TableCell className="text-right">{money(r.ledger_total)}</TableCell>
                    <TableCell className={`text-right font-semibold ${r.reconciled ? "text-emerald-700" : "text-amber-800"}`}>
                      {r.difference !== null ? money(r.difference) : "—"}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">{r.note}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </PageShell>
  );
}

export default Reconciliation;
