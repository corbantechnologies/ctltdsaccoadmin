"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import {
  useFetchAccountingSettings,
  useFetchAccrualRuns,
  useFetchAgeing,
  useFetchProvisionRuns,
} from "@/hooks/accounting/actions";
import { runAccrual, runProvisioning } from "@/services/accounting";
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
import { Empty, Loading, PageShell, apiError, inputClass, money, today } from "@/components/accounting/ui";

function MonthEnd() {
  const token = useAxiosAuth();
  const [asOf, setAsOf] = useState(today());
  const [busy, setBusy] = useState(null);
  const { data: settings } = useFetchAccountingSettings();
  const { data: ageing, isLoading: loadingAgeing, refetch: refetchAgeing } = useFetchAgeing(asOf);
  const { data: accrualRuns, refetch: refetchAccruals } = useFetchAccrualRuns();
  const { data: provisionRuns, refetch: refetchProvisions } = useFetchProvisionRuns();

  const run = async (kind) => {
    setBusy(kind);
    try {
      if (kind === "accrual") {
        const r = await runAccrual({ as_of: asOf }, token);
        toast.success(`Accrued ${money(r.accrued_total)} on ${r.loans_accrued} loans`);
        refetchAccruals();
      } else {
        const r = await runProvisioning({ as_of: asOf }, token);
        toast.success(`Provision adjusted by ${money(r.adjustment)}`);
        refetchProvisions();
        refetchAgeing();
      }
    } catch (e) {
      toast.error(apiError(e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <PageShell
      title="Month-end"
      description="Accrue loan interest that has fallen due and update the loan-loss provision. Both are safe to run more than once; each run posts only what changed."
      actions={
        <>
          <input type="date" className={inputClass + " w-40"} value={asOf} onChange={(e) => setAsOf(e.target.value)} />
          <Button
            variant="outline"
            disabled={!!busy || !settings?.accrual_enabled}
            title={settings?.accrual_enabled ? "" : "Interest accrual is off. Turn it on in Accounting settings."}
            onClick={() => run("accrual")}
          >
            {busy === "accrual" && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Run interest accrual
          </Button>
          <Button className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white" disabled={!!busy} onClick={() => run("provision")}>
            {busy === "provision" && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Run provisioning
          </Button>
        </>
      }
    >
      {settings && !settings.accrual_enabled && (
        <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Interest is on a cash basis (recognised when paid). Turn on accrual in Accounting settings to recognise interest when it falls due.
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Portfolio at risk</CardTitle>
          <CardDescription>
            Disbursed loans grouped by days in arrears (oldest unpaid installment), using the provisioning rates in settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingAgeing ? (
            <Loading />
          ) : ageing ? (
            <>
              {ageing.date_errors?.length > 0 && (
                <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  <p className="font-semibold">
                    {ageing.date_errors.length} loans have an impossible date and are left out of provisioning and accrual until it is corrected:
                  </p>
                  <ul className="list-disc ml-5 mt-1">
                    {ageing.date_errors.map((l) => (
                      <li key={l.loan_account}>
                        {l.loan_account} ({l.member_name}, {l.product}) starts {l.start_date}, outstanding {money(l.outstanding_principal)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Stat label="Outstanding principal" value={money(ageing.total_outstanding_principal)} />
                <Stat label="Required provision" value={money(ageing.total_required_provision)} />
                <Stat label="Non-performing" value={money(ageing.non_performing_principal)} />
                <Stat label="NPL ratio" value={`${ageing.npl_ratio_percent}%`} />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bucket</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Loans</TableHead>
                    <TableHead className="text-right">Outstanding principal</TableHead>
                    <TableHead className="text-right">Required provision</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ageing.summary.map((b) => (
                    <TableRow key={b.bucket}>
                      <TableCell className="font-medium">{b.bucket}</TableCell>
                      <TableCell className="text-right">{b.rate}%</TableCell>
                      <TableCell className="text-right">{b.loans}</TableCell>
                      <TableCell className="text-right">{money(b.outstanding_principal)}</TableCell>
                      <TableCell className="text-right">{money(b.required_provision)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <details>
                <summary className="cursor-pointer text-sm font-medium text-slate-700">
                  Loans in arrears ({ageing.details.filter((d) => d.days_in_arrears > 0).length})
                </summary>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Loan</TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Days</TableHead>
                      <TableHead>Bucket</TableHead>
                      <TableHead className="text-right">Principal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ageing.details
                      .filter((d) => d.days_in_arrears > 0)
                      .map((d) => (
                        <TableRow key={d.loan_account}>
                          <TableCell className="font-mono text-xs">{d.loan_account}</TableCell>
                          <TableCell>
                            {d.member_name} <span className="text-slate-400">({d.member_no})</span>
                          </TableCell>
                          <TableCell>{d.product}</TableCell>
                          <TableCell className="text-right">{d.days_in_arrears}</TableCell>
                          <TableCell>{d.bucket}</TableCell>
                          <TableCell className="text-right">{money(d.outstanding_principal)}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </details>
            </>
          ) : (
            <Empty>No data.</Empty>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Interest accrual runs</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>As of</TableHead>
                  <TableHead className="text-right">Accrued</TableHead>
                  <TableHead className="text-right">Written back</TableHead>
                  <TableHead className="text-right">Loans</TableHead>
                  <TableHead className="text-right">Non-accrual</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(accrualRuns || []).map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.as_of}</TableCell>
                    <TableCell className="text-right">{money(r.accrued_total)}</TableCell>
                    <TableCell className="text-right">{money(r.written_back_total)}</TableCell>
                    <TableCell className="text-right">{r.loans_accrued}</TableCell>
                    <TableCell className="text-right">{r.loans_non_accrual}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!accrualRuns?.length && <Empty>No runs yet.</Empty>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Provisioning runs</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>As of</TableHead>
                  <TableHead className="text-right">Required</TableHead>
                  <TableHead className="text-right">Previous</TableHead>
                  <TableHead className="text-right">Posted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(provisionRuns || []).map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.as_of}</TableCell>
                    <TableCell className="text-right">{money(r.required_provision)}</TableCell>
                    <TableCell className="text-right">{money(r.previous_provision)}</TableCell>
                    <TableCell className="text-right">{money(r.adjustment)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!provisionRuns?.length && <Empty>No runs yet.</Empty>}
          </CardContent>
        </Card>
      </div>
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

export default MonthEnd;
