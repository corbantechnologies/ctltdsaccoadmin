"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { useFetchSuspense } from "@/hooks/accounting/actions";
import { useFetchPaymentAccounts } from "@/hooks/paymentaccounts/actions";
import { allocateSuspense, recordUnmatchedReceipt } from "@/services/accounting";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Empty,
  Field,
  Loading,
  PageShell,
  StatusBadge,
  apiError,
  inputClass,
  money,
  today,
} from "@/components/accounting/ui";

function Suspense() {
  const token = useAxiosAuth();
  const [filter, setFilter] = useState("open");
  const { data: entries, isLoading, refetch } = useFetchSuspense(filter === "all" ? "" : filter);
  const { data: paymentAccounts } = useFetchPaymentAccounts();
  const activeAccounts = (paymentAccounts || []).filter((p) => p.is_active);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [allocating, setAllocating] = useState(null);

  return (
    <PageShell
      title="Suspense"
      description="Money received that isn't owed to anything yet: loan overpayments, and receipts you can't match to a member (e.g. a paybill payment with a wrong account number). Allocate each one to a savings account or loan, or refund it."
      actions={
        <>
          <select className={inputClass + " w-40"} value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="open">Open</option>
            <option value="Allocated">Allocated</option>
            <option value="Reversed">Reversed</option>
            <option value="all">All</option>
          </select>
          <Button className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white" onClick={() => setReceiptOpen(true)}>
            Record unmatched receipt
          </Button>
        </>
      }
    >
      <Card className="shadow-md">
        <CardContent className="p-0">
          {isLoading ? (
            <Loading />
          ) : !entries?.length ? (
            <Empty>Nothing in suspense.</Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Remaining</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((e) => (
                  <TableRow key={e.reference}>
                    <TableCell>{e.transaction_date}</TableCell>
                    <TableCell>
                      {e.source_type}
                      <div className="font-mono text-[10px] text-slate-400">{e.source_reference}</div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{e.description}</TableCell>
                    <TableCell>{e.member || "—"}</TableCell>
                    <TableCell className="text-right">{money(e.amount)}</TableCell>
                    <TableCell className="text-right font-semibold">{money(e.remaining)}</TableCell>
                    <TableCell>
                      <StatusBadge status={e.status} />
                    </TableCell>
                    <TableCell>
                      {Number(e.remaining) > 0 && e.status !== "Reversed" && (
                        <Button size="sm" variant="outline" onClick={() => setAllocating(e)}>
                          Allocate
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

      <ReceiptDialog
        open={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        accounts={activeAccounts}
        onDone={refetch}
        token={token}
      />
      <AllocateDialog
        entry={allocating}
        onClose={() => setAllocating(null)}
        accounts={activeAccounts}
        onDone={refetch}
        token={token}
      />
    </PageShell>
  );
}

function ReceiptDialog({ open, onClose, accounts, onDone, token }) {
  const [form, setForm] = useState({ amount: "", payment_method: "", transaction_date: today(), description: "", source_reference: "", member_no: "" });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await recordUnmatchedReceipt(form, token);
      toast.success("Receipt recorded in suspense");
      onDone();
      onClose();
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record unmatched receipt</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <Field label="Amount (KES)">
            <input required type="number" min="1" step="0.01" className={inputClass} value={form.amount} onChange={set("amount")} />
          </Field>
          <Field label="Received into">
            <select required className={inputClass} value={form.payment_method} onChange={set("payment_method")}>
              <option value="">Select account</option>
              {accounts.map((a) => (
                <option key={a.reference} value={a.name}>{a.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Date received">
            <input required type="date" className={inputClass} value={form.transaction_date} onChange={set("transaction_date")} />
          </Field>
          <Field label="Receipt / M-Pesa code" hint="Must be unique. Leave blank to generate one.">
            <input className={inputClass} value={form.source_reference} onChange={set("source_reference")} />
          </Field>
          <Field label="Member number (if known)">
            <input className={inputClass} value={form.member_no} onChange={set("member_no")} />
          </Field>
          <Field label="Description">
            <input required className={inputClass} value={form.description} onChange={set("description")} />
          </Field>
          <Button type="submit" disabled={saving} className="w-full bg-[var(--primary)] text-white">
            {saving ? "Saving..." : "Record receipt"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AllocateDialog({ entry, onClose, accounts, onDone, token }) {
  const [form, setForm] = useState({ action: "savings", amount: "", account_number: "", payment_method: "", note: "" });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const values = { ...form, amount: form.amount || entry.remaining };
      await allocateSuspense(entry.reference, values, token);
      toast.success("Allocated");
      onDone();
      onClose();
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!entry} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Allocate {entry && money(entry.remaining)}</DialogTitle>
        </DialogHeader>
        {entry && (
          <form onSubmit={submit} className="space-y-3">
            <Field label="Allocate to">
              <select className={inputClass} value={form.action} onChange={set("action")}>
                <option value="savings">Member savings account</option>
                <option value="loan">Member loan (repayment)</option>
                <option value="refund">Refund to the payer</option>
              </select>
            </Field>
            <Field label="Amount (KES)" hint={`Leave blank to allocate all ${money(entry.remaining)}.`}>
              <input type="number" min="0.01" step="0.01" max={entry.remaining} className={inputClass} value={form.amount} onChange={set("amount")} />
            </Field>
            {form.action !== "refund" ? (
              <Field label={form.action === "loan" ? "Loan account number" : "Savings account number"}>
                <input required className={inputClass} value={form.account_number} onChange={set("account_number")} />
              </Field>
            ) : (
              <>
                <Field label="Refund paid from">
                  <select required className={inputClass} value={form.payment_method} onChange={set("payment_method")}>
                    <option value="">Select account</option>
                    {accounts.map((a) => (
                      <option key={a.reference} value={a.name}>{a.name}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Note">
                  <input className={inputClass} value={form.note} onChange={set("note")} />
                </Field>
              </>
            )}
            <Button type="submit" disabled={saving} className="w-full bg-[var(--primary)] text-white">
              {saving ? "Saving..." : "Allocate"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default Suspense;
