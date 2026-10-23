"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { useFetchDividend, useFetchDividendLines } from "@/hooks/accounting/actions";
import { dividendAction } from "@/services/accounting";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Empty, Loading, PageShell, StatusBadge, apiError, money } from "@/components/accounting/ui";

const CONFIRM = {
  approve: "Approve this declaration? This posts the full gross amount to Dividends Payable.",
  pay: "Pay members now? Each member's account is credited with the net amount.",
  cancel: "Cancel this draft?",
};

function DividendDetail() {
  const { dividend_reference: reference } = useParams();
  const token = useAxiosAuth();
  const { data: d, isLoading, refetch } = useFetchDividend(reference);
  const { data: lines, refetch: refetchLines } = useFetchDividendLines(reference);
  const [busy, setBusy] = useState(false);

  const act = async (action) => {
    if (!window.confirm(CONFIRM[action])) return;
    setBusy(true);
    try {
      const r = await dividendAction(reference, action, token);
      toast.success(action === "pay" ? `Paid ${r.lines_paid} members` : `Declaration ${r.status.toLowerCase()}`);
      refetch();
      refetchLines();
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  if (isLoading || !d) return <Loading />;

  return (
    <PageShell
      title={d.name}
      crumbs={[{ label: "Dividends", href: "/sacco-admin/accounting/dividends" }]}
      description={`${d.kind} at ${Number(d.rate)}% a year on ${d.saving_type} (${d.method.toLowerCase()}), ${d.period_start} to ${d.period_end}. Withholding tax ${Number(d.withholding_tax_rate)}%.`}
      actions={
        <>
          <StatusBadge status={d.status} />
          {d.status === "Draft" && (
            <>
              <Button variant="outline" disabled={busy} onClick={() => act("cancel")}>Cancel</Button>
              <Button className="bg-[var(--primary)] text-white" disabled={busy} onClick={() => act("approve")}>Approve</Button>
            </>
          )}
          {d.status === "Approved" && (
            <Button className="bg-[var(--primary)] text-white" disabled={busy} onClick={() => act("pay")}>Pay members</Button>
          )}
        </>
      }
    >
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Gross" value={money(d.total_gross)} />
        <Stat label="Withholding tax" value={money(d.total_tax)} />
        <Stat label="Net to members" value={money(d.total_net)} />
      </div>
      <Card className="shadow-md">
        <CardContent className="p-0">
          {!lines?.length ? (
            <Empty>No qualifying members.</Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead className="text-right">Qualifying balance</TableHead>
                  <TableHead className="text-right">Gross</TableHead>
                  <TableHead className="text-right">Tax</TableHead>
                  <TableHead className="text-right">Net</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((l) => (
                  <TableRow key={l.account_number}>
                    <TableCell>
                      {l.member_name} <span className="text-slate-400">({l.member_no})</span>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{l.account_number}</TableCell>
                    <TableCell className="text-right">{money(l.qualifying_balance)}</TableCell>
                    <TableCell className="text-right">{money(l.gross)}</TableCell>
                    <TableCell className="text-right">{money(l.tax)}</TableCell>
                    <TableCell className="text-right font-semibold">{money(l.net)}</TableCell>
                    <TableCell>
                      <StatusBadge status={l.status} />
                    </TableCell>
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

function Stat({ label, value }) {
  return (
    <div className="rounded border bg-white p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

export default DividendDetail;
