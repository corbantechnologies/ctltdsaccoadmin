"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { useFetchAccountingSettings } from "@/hooks/accounting/actions";
import { useFetchGLAccounts } from "@/hooks/glaccounts/actions";
import { useFetchSavingsTypes } from "@/hooks/savingtypes/actions";
import { setupAccounting, updateAccountingSettings } from "@/services/accounting";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Loading, PageShell, apiError, inputClass } from "@/components/accounting/ui";
import { SACCO_CONFIG } from "@/lib/sacco-config";

const GL_FIELDS = [
  ["suspense_gl", "Suspense (unallocated receipts)", "LIABILITY"],
  ["interest_receivable_gl", "Loan interest receivable (empty = cash-basis interest)", "ASSET"],
  ["loan_loss_provision_gl", "Loan loss provision", "ASSET"],
  ["provision_expense_gl", "Loan loss provision expense", "EXPENSE"],
  ["retained_earnings_gl", "Retained earnings", "EQUITY"],
  ["dividends_payable_gl", "Dividends payable", "LIABILITY"],
  ["withholding_tax_gl", "Withholding tax payable", "LIABILITY"],
  ["deposit_interest_expense_gl", "Interest on member deposits", "EXPENSE"],
  ["opening_balance_equity_gl", "Opening balance equity", "EQUITY"],
];

function AccountingSettings() {
  const token = useAxiosAuth();
  const { data: settings, isLoading, refetch } = useFetchAccountingSettings();
  const { data: glAccounts } = useFetchGLAccounts();
  const { data: savingTypes } = useFetchSavingsTypes();
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm({
        ...Object.fromEntries(GL_FIELDS.map(([f]) => [f, settings[f] || ""])),
        accrual_start_date: settings.accrual_start_date || "",
        non_accrual_days: settings.non_accrual_days,
        withholding_tax_rate: settings.withholding_tax_rate,
        non_withdrawable_saving_types: settings.non_withdrawable_saving_types || [],
        provisioning_rates: settings.provisioning_rates || [],
      });
    }
  }, [settings]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const createDefaults = async (enableAccrual) => {
    setBusy(true);
    try {
      const r = await setupAccounting({ enable_accrual: enableAccrual }, token);
      toast.success(r.created_accounts.length ? `Created ${r.created_accounts.length} GL accounts` : "Settings are complete");
      refetch();
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const values = { ...form };
      GL_FIELDS.forEach(([f]) => {
        values[f] = values[f] || null;
      });
      values.accrual_start_date = values.accrual_start_date || null;
      values.provisioning_rates = values.provisioning_rates.map((r) => ({
        ...r,
        min_days: Number(r.min_days),
        max_days: r.max_days === "" || r.max_days === null ? null : Number(r.max_days),
        rate: Number(r.rate),
      }));
      await updateAccountingSettings(values, token);
      toast.success("Accounting settings saved");
      refetch();
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  const setRate = (i, key) => (e) => {
    const rates = form.provisioning_rates.map((r, j) => (j === i ? { ...r, [key]: e.target.value } : r));
    setForm({ ...form, provisioning_rates: rates });
  };

  const toggleType = (name) => {
    const list = form.non_withdrawable_saving_types;
    setForm({
      ...form,
      non_withdrawable_saving_types: list.includes(name) ? list.filter((n) => n !== name) : [...list, name],
    });
  };

  if (isLoading || !form) return <Loading />;

  const missing = GL_FIELDS.filter(([f]) => f !== "interest_receivable_gl" && !settings[f]).length;

  return (
    <PageShell
      title="Accounting settings"
      description="The GL accounts used by suspense, accrual, provisioning, dividends and period close."
      actions={
        <>
          <Button variant="outline" disabled={busy} onClick={() => createDefaults(false)}>
            Create missing accounts
          </Button>
          {!settings.accrual_enabled && (
            <Button variant="outline" disabled={busy} onClick={() => createDefaults(true)}>
              Turn on interest accrual
            </Button>
          )}
        </>
      }
    >
      {missing > 0 && (
        <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          {missing} accounts are not set. Click "Create missing accounts" to create them with codes that don't clash with your chart, or pick existing accounts below.
        </div>
      )}
      <form onSubmit={save} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>GL accounts</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            {GL_FIELDS.map(([field, label, category]) => (
              <Field key={field} label={label}>
                <select className={inputClass} value={form[field]} onChange={set(field)}>
                  <option value="">Not set</option>
                  {(glAccounts || [])
                    .filter((a) => a.category === category)
                    .map((a) => (
                      <option key={a.reference} value={a.code}>
                        {a.code} {a.name}
                      </option>
                    ))}
                </select>
              </Field>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Interest and tax</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            <Field label="Accrue installments due from" hint="Older arrears are not booked as income.">
              <input type="date" className={inputClass} value={form.accrual_start_date} onChange={set("accrual_start_date")} />
            </Field>
            <Field label="Stop accruing after (days in arrears)">
              <input type="number" min="0" className={inputClass} value={form.non_accrual_days} onChange={set("non_accrual_days")} />
            </Field>
            <Field label="Default withholding tax (%)">
              <input type="number" step="0.01" min="0" className={inputClass} value={form.withholding_tax_rate} onChange={set("withholding_tax_rate")} />
            </Field>
            {SACCO_CONFIG.enableWithdrawals && (
            <div className="md:col-span-3">
              <p className="text-sm font-medium text-slate-700 mb-2">Members cannot withdraw from:</p>
              <div className="flex flex-wrap gap-4">
                {(savingTypes || []).map((t) => (
                  <label key={t.reference} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.non_withdrawable_saving_types.includes(t.name)}
                      onChange={() => toggleType(t.name)}
                    />
                    {t.name}
                  </label>
                ))}
              </div>
            </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Provisioning rates</CardTitle>
            <CardDescription>Defaults follow SASRA's classification. Leave "to days" empty for the last bucket.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {form.provisioning_rates.map((r, i) => (
              <div key={i} className="grid grid-cols-4 gap-2">
                <input className={inputClass} value={r.bucket} onChange={setRate(i, "bucket")} />
                <input type="number" className={inputClass} value={r.min_days} onChange={setRate(i, "min_days")} placeholder="from days" />
                <input type="number" className={inputClass} value={r.max_days ?? ""} onChange={setRate(i, "max_days")} placeholder="to days" />
                <input type="number" step="0.01" className={inputClass} value={r.rate} onChange={setRate(i, "rate")} placeholder="rate %" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Button type="submit" disabled={busy} className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white">
          Save settings
        </Button>
      </form>
    </PageShell>
  );
}

export default AccountingSettings;
