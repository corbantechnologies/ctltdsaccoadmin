"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  HandCoins,
  Landmark,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  downloadTemplate,
  getLoanOpeningPreview,
  postLoanOpeningBalances,
  removeOnboardedLoan,
  uploadLoans,
} from "@/services/loanonboarding";

const money = (v) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(Number(v || 0));
const today = () => new Date().toISOString().slice(0, 10);

function apiError(err, fallback = "Something went wrong.") {
  const data = err?.response?.data;
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (data.detail) return Array.isArray(data.detail) ? data.detail.join(" ") : data.detail;
  const first = Object.entries(data)[0];
  return first ? `${first[0]}: ${JSON.stringify(first[1])}` : fallback;
}

function errorText(r) {
  if (r.error) return r.error;
  if (!r.errors) return "";
  return Object.entries(r.errors)
    .map(([field, msg]) => `${field === "non_field_errors" ? "" : field + ": "}${Array.isArray(msg) ? msg.join(" ") : typeof msg === "object" ? JSON.stringify(msg) : msg}`)
    .join(" · ");
}

const METHODS = [
  {
    id: "history",
    label: "1. Full history",
    best: "The SACCO has every repayment, with dates.",
    gives: "Complete statements from the loan's first day.",
    effort: "High: one entry per past repayment.",
    gl: "Disburse each loan (posts like a new loan), then record each past repayment.",
  },
  {
    id: "paid",
    label: "2. Original loan + paid to date",
    best: "The SACCO knows each loan's original terms, but not every repayment.",
    gives: "The original schedule, with past instalments marked paid oldest first. Arrears and stages are worked out for you.",
    effort: "Low: one extra figure per loan.",
    gl: "No disbursement. Post the loan opening balance (tab 4).",
  },
  {
    id: "forward",
    label: "3. Balance forward",
    best: "The SACCO only has balances at a date.",
    gives: "A fresh schedule from the cut-off date. Arrears brought forward keep the loan's stage right.",
    effort: "Lowest.",
    gl: "No disbursement. Post the loan opening balance (tab 4).",
  },
];

function ColumnTable({ rows }) {
  return (
    <div className="overflow-x-auto rounded border">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
          <tr>
            <th className="p-2">Column</th>
            <th className="p-2">Needed?</th>
            <th className="p-2">What to enter</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map(([col, need, what]) => (
            <tr key={col}>
              <td className="p-2 font-medium whitespace-nowrap">{col}</td>
              <td className="p-2 whitespace-nowrap">{need}</td>
              <td className="p-2 text-slate-600">{what}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Uploader({ kind, token, onDone }) {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const run = async (dryRun) => {
    if (!file) return toast.error("Choose the filled-in CSV file first.");
    if (!dryRun && !window.confirm("Save these loans? Nothing is posted to the GL at this step.")) return;
    setBusy(true);
    try {
      const r = await uploadLoans(kind, file, dryRun, token);
      setResult(r);
      if (dryRun) toast.success(`Checked: ${r.success_count} ready, ${r.error_count} with problems. Nothing saved.`);
      else {
        toast.success(`${r.success_count} loans onboarded${r.error_count ? `, ${r.error_count} rows skipped` : ""}.`);
        onDone?.();
      }
    } catch (err) {
      toast.error(apiError(err, "The file could not be processed."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        <Button variant="outline" className="gap-2" onClick={() => downloadTemplate(kind, token).catch(() => toast.error("Could not download the template."))}>
          <Download className="w-4 h-4" /> Download template
        </Button>
        <input
          type="file"
          accept=".csv"
          className="text-sm"
          onChange={(e) => {
            setFile(e.target.files?.[0] || null);
            setResult(null);
          }}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button disabled={busy || !file} variant="outline" className="gap-2" onClick={() => run(true)}>
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Check file (saves nothing)
        </Button>
        <Button disabled={busy || !file} className="gap-2 bg-[var(--primary)] text-white" onClick={() => run(false)}>
          <Upload className="w-4 h-4" /> Upload and save
        </Button>
      </div>
      {result && <Results result={result} />}
    </div>
  );
}

function Results({ result }) {
  const t = result.totals || {};
  return (
    <div className="space-y-3">
      <div className={`rounded border p-3 text-sm ${result.dry_run ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"}`}>
        <p className="font-semibold">
          {result.dry_run ? "Check only. Nothing was saved." : "Saved."} {result.success_count} ready, {result.error_count} with problems.
        </p>
        <p className="mt-1">
          Outstanding principal {money(t.outstanding_principal)} · Outstanding balance {money(t.outstanding_balance)}
          {t.arrears !== undefined && ` · Arrears ${money(t.arrears)}`}
        </p>
        <p className="mt-1 text-slate-600">
          Compare the outstanding principal with the loans figure in the SACCO&apos;s trial balance at the cut-off date before saving.
        </p>
      </div>
      <div className="overflow-x-auto rounded border max-h-[420px]">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 text-left uppercase text-slate-500 sticky top-0">
            <tr>
              <th className="p-2">Row</th>
              <th className="p-2">Result</th>
              <th className="p-2">Loan</th>
              <th className="p-2 text-right">Principal owed</th>
              <th className="p-2 text-right">Balance owed</th>
              <th className="p-2">Stage</th>
              <th className="p-2">Problem</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {(result.results || []).map((r) => (
              <tr key={r.row} className={r.status === "Success" ? "" : "bg-red-50"}>
                <td className="p-2">{r.row}</td>
                <td className="p-2">{r.status === "Success" ? "OK" : "Error"}</td>
                <td className="p-2">{r.account_number || ""}</td>
                <td className="p-2 text-right">{r.outstanding_principal ? money(r.outstanding_principal) : ""}</td>
                <td className="p-2 text-right">{r.outstanding_balance ? money(r.outstanding_balance) : ""}</td>
                <td className="p-2">
                  {r.arrears_stage ? `${r.arrears_stage}${r.days_in_arrears ? ` (${r.days_in_arrears} days)` : ""}` : ""}
                </td>
                <td className="p-2 text-red-700">{errorText(r)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PostToGL({ token, refreshKey }) {
  const [preview, setPreview] = useState(null);
  const [date, setDate] = useState(today());
  const [expected, setExpected] = useState("");
  const [busy, setBusy] = useState(false);

  // useAxiosAuth returns a new object every render, so depend on the header.
  const auth = token?.headers?.Authorization || "";
  const load = useCallback(async () => {
    if (!auth || /undefined|null/.test(auth)) return;
    try {
      setPreview(await getLoanOpeningPreview({ headers: { Authorization: auth } }));
    } catch (err) {
      toast.error(apiError(err, "Could not load the loans waiting for the GL."));
    }
  }, [auth]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const post = async () => {
    if (!window.confirm(`Post ${preview.count} loans totalling ${money(preview.total)} to the GL, dated ${date}? This posts real entries.`)) return;
    setBusy(true);
    try {
      const r = await postLoanOpeningBalances(
        { posting_date: date, ...(expected ? { expected_total: expected.replace(/,/g, "") } : {}) },
        token
      );
      toast.success(`Posted ${r.loans} loans (${money(r.total)}), batch ${r.batch_reference}.`);
      load();
    } catch (err) {
      toast.error(apiError(err, "Nothing was posted."));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (loan) => {
    if (!window.confirm(`Remove onboarded loan ${loan.account_number} for ${loan.member_name}? You can onboard it again with the right figures.`)) return;
    try {
      await removeOnboardedLoan(loan.reference, token);
      toast.success("Removed.");
      load();
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  if (!preview) return <p className="text-sm text-slate-500">Loading...</p>;
  return (
    <div className="space-y-4">
      <div className="rounded border bg-slate-50 p-3 text-sm text-slate-700 space-y-1">
        <p>
          Loans onboarded by methods 2 and 3 are not in the GL yet. This step posts, for each loan, the principal owed at its cut-off:
        </p>
        <p className="font-mono text-xs">DR Loans to members (the product&apos;s principal GL) · CR Opening Balance Equity</p>
        <p>
          Unpaid interest, fees and penalties are not posted. They become income when members pay them. Repayments recorded after the cut-off reduce the GL as usual, so post this before or after them; the amount stays the cut-off figure.
        </p>
      </div>

      {preview.problems?.length > 0 && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {preview.problems.map((p) => <p key={p}>{p}</p>)}
        </div>
      )}

      {preview.count === 0 ? (
        <p className="text-sm text-slate-600">No onboarded loans are waiting to be posted.</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded border">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="p-2">GL account</th>
                  <th className="p-2 text-right">Loans</th>
                  <th className="p-2 text-right">To post</th>
                  <th className="p-2 text-right">GL balance now</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {preview.by_gl.map((g) => (
                  <tr key={g.gl_code}>
                    <td className="p-2">{g.gl_code} {g.gl_name}</td>
                    <td className="p-2 text-right">{g.loans}</td>
                    <td className="p-2 text-right">{money(g.amount)}</td>
                    <td className="p-2 text-right">{money(g.gl_balance_now)}</td>
                  </tr>
                ))}
                <tr className="font-semibold">
                  <td className="p-2">Total</td>
                  <td className="p-2 text-right">{preview.count}</td>
                  <td className="p-2 text-right">{money(preview.total)}</td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 items-end">
            <label className="block space-y-1">
              <span className="text-sm font-medium">Posting date</span>
              <input type="date" className="w-full h-9 rounded border px-3 text-sm" value={date} onChange={(e) => setDate(e.target.value)} />
              <span className="text-xs text-slate-500">Usually the cut-off or go-live date.</span>
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium">Loans total on the old trial balance</span>
              <input className="w-full h-9 rounded border px-3 text-sm" placeholder="e.g. 1,250,000.00" value={expected} onChange={(e) => setExpected(e.target.value)} />
              <span className="text-xs text-slate-500">Optional. If it differs from the total above by even a cent, nothing is posted.</span>
            </label>
            <Button disabled={busy || preview.problems?.length > 0} className="gap-2 bg-[var(--primary)] text-white" onClick={post}>
              <Landmark className="w-4 h-4" /> Post loan opening balances
            </Button>
          </div>

          <div className="overflow-x-auto rounded border max-h-[420px]">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-left uppercase text-slate-500 sticky top-0">
                <tr>
                  <th className="p-2">Loan</th>
                  <th className="p-2">Member</th>
                  <th className="p-2">Product</th>
                  <th className="p-2">Method</th>
                  <th className="p-2">Cut-off</th>
                  <th className="p-2 text-right">Principal to post</th>
                  <th className="p-2" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {preview.loans.map((l) => (
                  <tr key={l.reference}>
                    <td className="p-2">{l.account_number}</td>
                    <td className="p-2">{l.member_no} {l.member_name}</td>
                    <td className="p-2">{l.product}</td>
                    <td className="p-2">{l.onboarding_method === "balance_forward" ? "Balance forward" : "Paid to date"}</td>
                    <td className="p-2">{l.cut_off_date}</td>
                    <td className="p-2 text-right">{money(l.opening_principal)}</td>
                    <td className="p-2 text-right">
                      <button className="inline-flex items-center gap-1 text-red-700 hover:underline" onClick={() => remove(l)}>
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default function OnboardExistingLoans() {
  const token = useAxiosAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const bump = () => setRefreshKey((k) => k + 1);

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 space-y-6">
      <div className="space-y-2">
        <Link href="/sacco-admin/onboarding" className="text-sm text-[var(--accent)] hover:underline">
          Back to the Migration Hub
        </Link>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 flex items-center gap-2">
          <HandCoins className="w-5 h-5 text-[var(--accent)]" /> Onboard existing loans
        </h1>
        <p className="text-slate-600 max-w-3xl">
          Bring loans members already had into the system. Pick the method that matches the records the SACCO has; you can use different methods for different loans. Every loan is tied to its loan product, so repayments, top-ups, penalties and arrears work exactly as for new loans. Full instructions are in the Help &amp; Guide, under &quot;Onboarding existing loans&quot;.
        </p>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Which method?</CardTitle>
          <CardDescription>Ask the SACCO what records they have for each loan, then choose.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-3">
            {METHODS.map((m) => (
              <div key={m.id} className="rounded border p-3 text-sm space-y-1 bg-white">
                <p className="font-semibold">{m.label}</p>
                <p><span className="text-slate-500">Best when:</span> {m.best}</p>
                <p><span className="text-slate-500">You get:</span> {m.gives}</p>
                <p><span className="text-slate-500">Effort:</span> {m.effort}</p>
                <p><span className="text-slate-500">GL:</span> {m.gl}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="paid" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="history">1. Full history</TabsTrigger>
          <TabsTrigger value="paid">2. Paid to date</TabsTrigger>
          <TabsTrigger value="forward">3. Balance forward</TabsTrigger>
          <TabsTrigger value="gl">4. Post to GL</TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Method 1: full history</CardTitle>
              <CardDescription>The original loan, then every past repayment with its date.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <ol className="list-decimal ml-5 space-y-1">
                <li>Download the template and fill in one row per loan: product, original amount, calculation mode, term and the original start date. Leave the last four columns empty.</li>
                <li>Click <b>Check file</b>. Fix any row marked Error and check again.</li>
                <li>Click <b>Upload and save</b>. Each loan is created as Approved, with its original schedule.</li>
                <li>Disburse each loan from Loan Applications, dated the original start date. This posts DR Loans / CR the payment account you pick.</li>
                <li>Record every past repayment on the loan with <b>Log Payment</b>, oldest first, each with its real date.</li>
                <li>Click <b>Refresh arrears</b> on the Loans page.</li>
              </ol>
              <p className="flex gap-2 rounded border border-amber-200 bg-amber-50 p-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                Until the past repayments are entered, the loan shows every past instalment as unpaid and may look Defaulted. That&apos;s expected.
              </p>
              <Uploader kind="original" token={token} onDone={bump} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paid">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Method 2: original loan plus total paid to date</CardTitle>
              <CardDescription>The original loan and one figure, the total the member has repaid up to the cut-off date.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <ColumnTable
                rows={[
                  ["Member No", "Yes", "Pre-filled. Leave rows for members without a loan empty; they are skipped."],
                  ["Product Name", "Yes", "Exactly as in Loan Products. The product sets the interest method, rate and GL accounts."],
                  ["Requested Amount", "Yes", "The original amount lent."],
                  ["Calculation Mode", "Yes", "fixed_term (flat and reducing) or fixed_payment (reducing only)."],
                  ["Term Months / Monthly Payment", "One of them", "The original term in months, or for fixed_payment the instalment."],
                  ["Start Date", "Yes", "When the loan was originally given. The first instalment falls due a month later."],
                  ["Cut-off Date", "Yes", "The date the SACCO's figures were taken at, usually a month end. Not in the future."],
                  ["Total Paid To Date", "Yes", "Everything the member repaid on this loan up to the cut-off: principal and interest, not penalties or fees. 0 if nothing."],
                  ["Unpaid Processing Fee", "No", "Leave empty if the fee was paid (the usual case)."],
                  ["Unpaid Penalties", "No", "Total penalties still owed at the cut-off."],
                ]}
              />
              <ol className="list-decimal ml-5 space-y-1">
                <li>Download the template, fill it in and click <b>Check file</b>. Each row shows the principal and balance the system works out, and the arrears stage.</li>
                <li>Compare the total outstanding principal with the SACCO&apos;s trial balance at the cut-off. Check a few loans with the SACCO.</li>
                <li>Click <b>Upload and save</b>. The total paid becomes one &quot;Brought Forward&quot; repayment dated the cut-off, applied oldest instalment first. No disbursement is needed and nothing is posted to the GL.</li>
                <li>Record repayments made after the cut-off as usual.</li>
                <li>When all loans are in, post the loan opening balance in tab 4.</li>
              </ol>
              <Uploader kind="original" token={token} onDone={bump} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forward">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Method 3: balance forward</CardTitle>
              <CardDescription>Only the position at the cut-off date. A fresh schedule is built from there.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <ColumnTable
                rows={[
                  ["Member No / Member Name", "Pre-filled", "Leave rows for members without a loan empty."],
                  ["Product Name", "Yes", "Exactly as in Loan Products."],
                  ["Cut-off Date", "Yes", "The date the balances were taken at. Not in the future."],
                  ["Outstanding Principal", "Yes", "Principal still owed at the cut-off."],
                  ["Outstanding Interest", "No", "Flat loans: interest still owed out of the original total. Reducing loans: interest due but unpaid. 0 if none."],
                  ["Arrears Amount", "No", "The part of the balance already overdue at the cut-off."],
                  ["Oldest Unpaid Due Date", "If arrears", "The due date of the oldest instalment still unpaid. Sets the days in arrears."],
                  ["Remaining Instalments", "One of them", "How many instalments are left after the arrears."],
                  ["Instalment Amount", "One of them", "Or the instalment the member pays; the system works out how many."],
                  ["Next Due Date", "No", "When the next instalment falls due. Default: one month after the cut-off."],
                  ["Unpaid Processing Fee / Unpaid Penalties", "No", "Only what is still owed."],
                  ["Original Principal / Original Start Date", "No", "For reference on the loan page only."],
                ]}
              />
              <div className="rounded border bg-slate-50 p-3 space-y-1">
                <p className="font-semibold">How the schedule is built</p>
                <p>The arrears become one instalment dated the oldest unpaid due date, so the loan is In Arrears or Defaulted from day one, exactly as it was.</p>
                <p><b>Flat loans:</b> the rest of the principal and interest are spread in equal instalments. No new interest is added.</p>
                <p><b>Reducing loans:</b> the product rate is charged on the remaining principal from the cut-off.</p>
              </div>
              <ol className="list-decimal ml-5 space-y-1">
                <li>Download the template, fill it in and click <b>Check file</b>.</li>
                <li>Compare the totals with the SACCO&apos;s trial balance at the cut-off.</li>
                <li>Click <b>Upload and save</b>. No disbursement is needed and nothing is posted to the GL.</li>
                <li>When all loans are in, post the loan opening balance in tab 4.</li>
              </ol>
              <Uploader kind="balanceForward" token={token} onDone={bump} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gl">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><FileSpreadsheet className="w-5 h-5" /> Post loan opening balances</CardTitle>
              <CardDescription>For loans onboarded by methods 2 and 3. Run it once all of them are in. Loans you add later can be posted in another run.</CardDescription>
            </CardHeader>
            <CardContent>
              <PostToGL token={token} refreshKey={refreshKey} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
