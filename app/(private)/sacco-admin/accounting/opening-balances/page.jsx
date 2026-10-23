"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { postGLOpeningBalances, postSavingsOpeningBalances } from "@/services/accounting";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, PageShell, apiError, inputClass, money, today } from "@/components/accounting/ui";

// Accepts "a,b" or "a<TAB>b" per line, so it can be pasted from Excel.
function parseLines(text, columns) {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !/^account/i.test(l))
    .map((l) => {
      const parts = l.split(/\t|,/).map((p) => p.trim());
      return Object.fromEntries(columns.map((c, i) => [c, parts[i] || ""]));
    });
}

function OpeningBalances() {
  const token = useAxiosAuth();
  const [date, setDate] = useState(today());

  const [savingsText, setSavingsText] = useState("");
  const [savingsResult, setSavingsResult] = useState(null);
  const savingsLines = parseLines(savingsText, ["account_number", "amount"]);
  const savingsTotal = savingsLines.reduce((s, l) => s + Number(l.amount || 0), 0);

  const [glText, setGlText] = useState("");
  const [balanceToEquity, setBalanceToEquity] = useState(false);
  const glLines = parseLines(glText, ["account", "debit", "credit"]);
  const glDr = glLines.reduce((s, l) => s + Number(l.debit || 0), 0);
  const glCr = glLines.reduce((s, l) => s + Number(l.credit || 0), 0);

  const [busy, setBusy] = useState(false);

  const postSavings = async () => {
    if (!window.confirm(`Post ${savingsLines.length} member opening balances totalling ${money(savingsTotal)}?`)) return;
    setBusy(true);
    try {
      const r = await postSavingsOpeningBalances({ posting_date: date, lines: savingsLines }, token);
      setSavingsResult(r);
      toast.success(`${r.created.length} posted`);
    } catch (err) {
      if (err?.response?.data?.errors) setSavingsResult(err.response.data);
      toast.error(apiError(err, "None were posted."));
    } finally {
      setBusy(false);
    }
  };

  const postGL = async () => {
    if (!window.confirm(`Post ${glLines.length} GL opening lines?`)) return;
    setBusy(true);
    try {
      const r = await postGLOpeningBalances(
        { posting_date: date, balance_to_equity: balanceToEquity, lines: glLines.map((l) => ({ ...l, debit: l.debit || 0, credit: l.credit || 0 })) },
        token
      );
      toast.success(`Posted batch ${r.batch_reference}`);
      setGlText("");
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageShell
      title="Opening balances"
      description="Use when moving a SACCO onto the platform. Member savings are loaded per member so their statements and the GL agree; the other side goes to Opening Balance Equity. Load everything else (bank, fixed assets, payables, reserves) as GL lines."
      actions={<input type="date" className={inputClass + " w-40"} value={date} onChange={(e) => setDate(e.target.value)} />}
    >
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Member savings</CardTitle>
            <CardDescription>One line per account: account number, amount. Paste from Excel. Each account can only have one opening balance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <textarea
              rows={10}
              className="w-full rounded border border-slate-300 p-2 font-mono text-xs"
              placeholder={"SAV0001234, 15000\nSAV0001235, 2500.50"}
              value={savingsText}
              onChange={(e) => setSavingsText(e.target.value)}
            />
            <p className="text-sm text-slate-600">
              {savingsLines.length} lines, total {money(savingsTotal)}
            </p>
            <Button disabled={busy || !savingsLines.length} className="bg-[var(--primary)] text-white" onClick={postSavings}>
              Post member opening balances
            </Button>
            {savingsResult?.errors?.length > 0 && (
              <div className="rounded border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                <p className="font-semibold mb-1">{savingsResult.errors.length} lines were not posted:</p>
                <ul className="list-disc ml-4">
                  {savingsResult.errors.map((e) => (
                    <li key={e.line}>
                      Line {e.line}: {e.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Other GL balances</CardTitle>
            <CardDescription>
              One line per account: GL code, debit, credit. Member savings and loan GL accounts are refused here.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <textarea
              rows={10}
              className="w-full rounded border border-slate-300 p-2 font-mono text-xs"
              placeholder={"11000, 250000, 0\n25000, 0, 40000"}
              value={glText}
              onChange={(e) => setGlText(e.target.value)}
            />
            <p className={`text-sm ${glDr === glCr ? "text-slate-600" : "text-amber-700"}`}>
              Debits {money(glDr)} · Credits {money(glCr)}
              {glDr !== glCr && ` · difference ${money(glDr - glCr)}`}
            </p>
            <Field label="">
              <span className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={balanceToEquity} onChange={(e) => setBalanceToEquity(e.target.checked)} />
                Post any difference to Opening Balance Equity
              </span>
            </Field>
            <Button disabled={busy || !glLines.length} className="bg-[var(--primary)] text-white" onClick={postGL}>
              Post GL opening balances
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}

export default OpeningBalances;
