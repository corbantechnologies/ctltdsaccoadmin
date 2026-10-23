"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { useFetchDividends } from "@/hooks/accounting/actions";
import { useFetchSavingsTypes } from "@/hooks/savingtypes/actions";
import { createDividend } from "@/services/accounting";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Empty, Field, Loading, PageShell, StatusBadge, apiError, inputClass, money } from "@/components/accounting/ui";

function Dividends() {
  const token = useAxiosAuth();
  const { data: declarations, isLoading, refetch } = useFetchDividends();
  const { data: savingTypes } = useFetchSavingsTypes();
  const year = new Date().getFullYear() - 1;
  const [form, setForm] = useState({
    name: `FY${year} dividend`,
    kind: "Dividend",
    saving_type: "",
    payout_saving_type: "",
    period_start: `${year}-01-01`,
    period_end: `${year}-12-31`,
    rate: "",
    method: "Closing Balance",
    withholding_tax_rate: "5.00",
  });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const d = await createDividend({ ...form, payout_saving_type: form.payout_saving_type || null }, token);
      toast.success(`Draft created: ${money(d.total_gross)} gross`);
      refetch();
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell
      title="Dividends and interest on deposits"
      description="Create a draft, check each member's amount, then approve (books the liability) and pay (credits members' accounts net of withholding tax)."
    >
      <Card>
        <CardHeader>
          <CardTitle>New declaration</CardTitle>
          <CardDescription>
            The rate is annual. A period shorter than a year earns a pro-rata share. "Monthly average" uses the average of month-end balances.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 items-end">
            <Field label="Name">
              <input required className={inputClass} value={form.name} onChange={set("name")} />
            </Field>
            <Field label="Type">
              <select className={inputClass} value={form.kind} onChange={set("kind")}>
                <option value="Dividend">Dividend on shares (from retained earnings)</option>
                <option value="Interest on Deposits">Interest on deposits (an expense)</option>
              </select>
            </Field>
            <Field label="Paid on balances of">
              <select required className={inputClass} value={form.saving_type} onChange={set("saving_type")}>
                <option value="">Select saving type</option>
                {(savingTypes || []).map((t) => (
                  <option key={t.reference} value={t.name}>{t.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Credit to" hint="Leave as the same account, or pay into another saving type.">
              <select className={inputClass} value={form.payout_saving_type} onChange={set("payout_saving_type")}>
                <option value="">Same account</option>
                {(savingTypes || []).map((t) => (
                  <option key={t.reference} value={t.name}>{t.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Period start">
              <input required type="date" className={inputClass} value={form.period_start} onChange={set("period_start")} />
            </Field>
            <Field label="Period end">
              <input required type="date" className={inputClass} value={form.period_end} onChange={set("period_end")} />
            </Field>
            <Field label="Annual rate (%)">
              <input required type="number" step="0.0001" min="0" className={inputClass} value={form.rate} onChange={set("rate")} />
            </Field>
            <Field label="Qualifying balance">
              <select className={inputClass} value={form.method} onChange={set("method")}>
                <option value="Closing Balance">Closing balance</option>
                <option value="Monthly Average">Average of month-end balances</option>
              </select>
            </Field>
            <Field label="Withholding tax (%)">
              <input required type="number" step="0.01" min="0" className={inputClass} value={form.withholding_tax_rate} onChange={set("withholding_tax_rate")} />
            </Field>
            <div className="sm:col-span-2 lg:col-span-3">
              <Button type="submit" disabled={saving} className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white">
                {saving ? "Calculating..." : "Create draft"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardContent className="p-0">
          {isLoading ? (
            <Loading />
          ) : !declarations?.length ? (
            <Empty>No declarations yet.</Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Gross</TableHead>
                  <TableHead className="text-right">Tax</TableHead>
                  <TableHead className="text-right">Net</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {declarations.map((d) => (
                  <TableRow key={d.reference}>
                    <TableCell>
                      <Link className="font-medium text-[var(--primary)] hover:underline" href={`/sacco-admin/accounting/dividends/${d.reference}`}>
                        {d.name}
                      </Link>
                    </TableCell>
                    <TableCell>{d.kind}</TableCell>
                    <TableCell className="text-xs">
                      {d.period_start} to {d.period_end}
                    </TableCell>
                    <TableCell className="text-right">{Number(d.rate)}%</TableCell>
                    <TableCell className="text-right">{money(d.total_gross)}</TableCell>
                    <TableCell className="text-right">{money(d.total_tax)}</TableCell>
                    <TableCell className="text-right">{money(d.total_net)}</TableCell>
                    <TableCell>
                      <StatusBadge status={d.status} />
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

export default Dividends;
