"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { useFetchPeriods } from "@/hooks/accounting/actions";
import { closePeriod, reopenPeriod } from "@/services/accounting";
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
import { Empty, Field, Loading, PageShell, StatusBadge, apiError, inputClass } from "@/components/accounting/ui";

function lastMonth() {
  const d = new Date();
  const start = new Date(d.getFullYear(), d.getMonth() - 1, 1);
  const end = new Date(d.getFullYear(), d.getMonth(), 0);
  const iso = (x) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
  return {
    start: iso(start),
    end: iso(end),
    name: start.toLocaleString("en-KE", { month: "long", year: "numeric" }),
  };
}

function Periods() {
  const token = useAxiosAuth();
  const { data: periods, isLoading, refetch } = useFetchPeriods();
  const lm = lastMonth();
  const [form, setForm] = useState({ name: lm.name, start_date: lm.start, end_date: lm.end, is_year_end: false, notes: "" });
  const [issues, setIssues] = useState(null);
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const submit = async (acknowledge = false) => {
    setSaving(true);
    try {
      await closePeriod({ ...form, acknowledge_issues: acknowledge }, token);
      toast.success(`${form.name} closed`);
      setIssues(null);
      refetch();
    } catch (err) {
      if (err?.response?.status === 409) {
        setIssues(err.response.data.issues || []);
      } else {
        toast.error(apiError(err));
      }
    } finally {
      setSaving(false);
    }
  };

  const reopen = async (period) => {
    const reason = window.prompt(`Why are you reopening ${period.name}? (superusers only)`);
    if (!reason) return;
    try {
      await reopenPeriod(period.reference, { reason }, token);
      toast.success(`${period.name} reopened`);
      refetch();
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  return (
    <PageShell
      title="Accounting periods"
      description="Closing a period locks it: nothing can be posted into it and posted transactions can't be moved in or out. A year-end close also moves the year's net income into retained earnings."
    >
      <Card>
        <CardHeader>
          <CardTitle>Close a period</CardTitle>
          <CardDescription>Run month-end (accrual and provisioning) for the period before closing it.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(false);
            }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end"
          >
            <Field label="Name">
              <input required className={inputClass} value={form.name} onChange={set("name")} />
            </Field>
            <Field label="Start date">
              <input required type="date" className={inputClass} value={form.start_date} onChange={set("start_date")} />
            </Field>
            <Field label="End date">
              <input required type="date" className={inputClass} value={form.end_date} onChange={set("end_date")} />
            </Field>
            <label className="flex items-center gap-2 text-sm h-9">
              <input type="checkbox" checked={form.is_year_end} onChange={set("is_year_end")} />
              Year-end close (to retained earnings)
            </label>
            <div className="sm:col-span-2 lg:col-span-4">
              <Button type="submit" disabled={saving} className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white">
                {saving ? "Checking..." : "Close period"}
              </Button>
            </div>
          </form>

          {issues && (
            <div className="mt-4 rounded border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 space-y-2">
              <p className="font-semibold">The period was not closed. Please review:</p>
              <ul className="list-disc ml-5">
                {issues.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
              <Button size="sm" variant="outline" disabled={saving} onClick={() => submit(true)}>
                Close anyway
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardContent className="p-0">
          {isLoading ? (
            <Loading />
          ) : !periods?.length ? (
            <Empty>No periods closed yet.</Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Closed</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {periods.map((p) => (
                  <TableRow key={p.reference}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.start_date}</TableCell>
                    <TableCell>{p.end_date}</TableCell>
                    <TableCell>{p.is_year_end ? "Year-end" : "Month"}</TableCell>
                    <TableCell>
                      <StatusBadge status={p.status} />
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {p.closed_at ? new Date(p.closed_at).toLocaleString() : "—"}
                      {p.closed_by && ` by ${p.closed_by}`}
                    </TableCell>
                    <TableCell>
                      {p.status === "Closed" && (
                        <Button size="sm" variant="outline" onClick={() => reopen(p)}>
                          Reopen
                        </Button>
                      )}
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

export default Periods;
