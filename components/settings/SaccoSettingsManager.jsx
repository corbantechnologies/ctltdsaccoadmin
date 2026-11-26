"use client";

// SACCO settings, read from and saved to the API (/api/v1/settings/).
// The same component is used in two portals:
//   mode="superuser"  every setting, including M-Pesa keys (masked),
//                     feature switches, prefixes, senders and licence.
//   mode="admin"      branding, contacts and loan policy are editable;
//                     plan and features are shown read-only.
// The API decides what each user may change ("editable" on each setting)
// and logs every change, so this page only follows what it is told.

import React, { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { Loader2, Lock, Upload, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";

import useAxiosAuth from "@/hooks/authentication/useAxiosAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  deleteSaccoLogo,
  getSaccoSettings,
  getSettingChanges,
  sendTestEmail,
  settingsErrors,
  testMpesaKeys,
  updateSaccoSettings,
  uploadSaccoLogo,
} from "@/services/saccosettings";

const GROUPS = {
  branding: { title: "Branding", description: "Name, tagline, colours and logo shown in all three portals." },
  contacts: { title: "Contacts", description: "Shown to members in emails, the help page and the login page." },
  policy: { title: "Loan policy", description: "SACCO by-laws the system applies to loans and guarantors." },
  features: {
    title: "Features",
    description: "Switch these on only once the SACCO meets the requirements (for M-Pesa, Safaricom's).",
  },
  mpesa: { title: "M-Pesa", description: "Daraja credentials. Secrets are stored encrypted and only shown masked." },
  email: { title: "Email senders", description: "Each sender must be on a domain verified in Resend." },
  references: { title: "Reference numbers", description: "Prefixes for new numbers. Existing numbers never change." },
  portals: { title: "Portals & sign-in", description: "Portal addresses used in emails and between portals." },
  licence: { title: "Licence", description: "What the SACCO pays for, and its Corban account lead." },
};

const TABS = {
  superuser: [
    { id: "profile", label: "Profile", groups: ["branding", "contacts"], logo: true },
    { id: "policy", label: "Loan policy", groups: ["policy"] },
    { id: "features", label: "Features", groups: ["features"] },
    { id: "mpesa", label: "M-Pesa", groups: ["mpesa"] },
    { id: "email", label: "Email", groups: ["email"] },
    { id: "platform", label: "References & portals", groups: ["references", "portals"] },
    { id: "licence", label: "Licence", groups: ["licence"] },
    { id: "history", label: "Change history", history: true },
  ],
  admin: [
    { id: "profile", label: "SACCO profile", groups: ["branding", "contacts"], logo: true },
    { id: "policy", label: "Loan policy", groups: ["policy"] },
    { id: "plan", label: "Plan & features", groups: ["features", "licence"] },
    { id: "history", label: "Change history", history: true },
  ],
};

const SENDERS = ["onboarding_email_from", "finance_email_from", "security_email_from", "loans_email_from"];
const MPESA_KEYS = ["mpesa_shortcode", "mpesa_consumer_key", "mpesa_consumer_secret", "mpesa_passkey"];

function tokenReady(token) {
  const header = token?.headers?.Authorization || "";
  return header.startsWith("Token ") && !/undefined|null/.test(header);
}

function initialValue(item) {
  if (item.kind === "secret") return "";
  if (item.kind === "bool") return item.value === null || item.value === undefined ? null : Boolean(item.value);
  return item.value === null || item.value === undefined ? "" : String(item.value);
}

function isChanged(item, draft) {
  if (item.kind === "secret") return draft !== "";
  return draft !== initialValue(item);
}

function SourceBadge({ item }) {
  if (item.source === "database") return null;
  if (item.source === "env") {
    return (
      <Badge variant="outline" className="text-[10px] font-normal text-slate-500" title="Not saved yet, read from the server's env var">
        from env
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-[10px] font-normal text-slate-400">
      not set
    </Badge>
  );
}

function FieldInput({ item, value, onChange, disabled }) {
  const id = `setting-${item.key}`;
  if (item.kind === "bool") {
    return (
      <label htmlFor={id} className="flex items-center gap-3 cursor-pointer select-none">
        <input
          id={id}
          type="checkbox"
          className="h-4 w-4 accent-[var(--primary)]"
          checked={Boolean(value)}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="text-sm text-slate-700">
          {value === null
            ? item.key === "accounting_enabled"
              ? "Not set (counts as on until saved)"
              : "Not set"
            : value
              ? "On"
              : "Off"}
        </span>
      </label>
    );
  }
  if (item.kind === "choice") {
    return (
      <select
        id={id}
        className="h-9 w-full rounded border border-slate-300 bg-white px-3 text-sm disabled:bg-slate-50"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Not set</option>
        {(item.choices || []).map((choice) => (
          <option key={choice} value={choice}>
            {choice.charAt(0).toUpperCase() + choice.slice(1)}
          </option>
        ))}
      </select>
    );
  }
  if (item.kind === "color") {
    const valid = /^#[0-9a-fA-F]{6}$/.test(value);
    return (
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${item.label} picker`}
          className="h-9 w-12 cursor-pointer rounded border border-slate-300 bg-white p-1 disabled:cursor-not-allowed"
          value={valid ? value : "#ffffff"}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
        <Input id={id} value={value} placeholder="e.g. #174271" disabled={disabled} onChange={(e) => onChange(e.target.value)} />
      </div>
    );
  }
  if (item.kind === "secret") {
    return (
      <div className="space-y-1">
        <div className="text-sm font-mono text-slate-600">{item.is_set ? item.masked || "••••" : "Not set"}</div>
        {!disabled && (
          <Input
            id={id}
            type="password"
            autoComplete="new-password"
            value={value}
            placeholder={item.is_set ? "Type a new value to replace it" : "Enter value"}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
      </div>
    );
  }
  const type = item.kind === "int" || item.kind === "decimal" ? "number" : item.kind === "date" ? "date" : item.kind === "email" ? "email" : item.kind === "url" ? "url" : "text";
  return (
    <Input
      id={id}
      type={type}
      step={item.kind === "decimal" ? "0.01" : undefined}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function SettingsGroup({ group, items, token, onSaved, mode, extra }) {
  const [drafts, setDrafts] = useState({});
  const [errors, setErrors] = useState({});
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDrafts(Object.fromEntries(items.map((item) => [item.key, initialValue(item)])));
    setErrors({});
  }, [items]);

  const changes = useMemo(() => {
    const out = {};
    items.forEach((item) => {
      if (item.editable && item.key in drafts && isChanged(item, drafts[item.key])) {
        out[item.key] = drafts[item.key];
      }
    });
    return out;
  }, [items, drafts]);
  const changedCount = Object.keys(changes).length;
  const anyEditable = items.some((item) => item.editable);

  const save = async () => {
    setSaving(true);
    setErrors({});
    try {
      await updateSaccoSettings(changes, reason, token);
      toast.success("Saved");
      setReason("");
      onSaved();
    } catch (error) {
      const errs = settingsErrors(error);
      setErrors(errs);
      toast.error(errs.detail || "Some values were not accepted. Nothing was saved.");
    } finally {
      setSaving(false);
    }
  };

  const meta = GROUPS[group] || { title: group };
  return (
    <section className="rounded border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-base font-semibold text-slate-900">{meta.title}</h2>
        {meta.description && <p className="mt-0.5 text-sm text-slate-500">{meta.description}</p>}
      </div>
      <div className="grid grid-cols-1 gap-x-6 gap-y-5 px-5 py-5 md:grid-cols-2">
        {items.map((item) => (
          <div key={item.key} className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Label htmlFor={`setting-${item.key}`} className="text-sm font-medium text-slate-800">
                {item.label}
              </Label>
              {!item.editable && (
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-500" title="Only the Corban account lead can change this">
                  <Lock className="h-3 w-3" /> {mode === "admin" ? "Set by Corban" : "Read only"}
                </span>
              )}
              <SourceBadge item={item} />
            </div>
            <FieldInput
              item={item}
              value={drafts[item.key] ?? initialValue(item)}
              disabled={!item.editable}
              onChange={(value) => setDrafts((d) => ({ ...d, [item.key]: value }))}
            />
            {item.help && <p className="text-xs text-slate-500">{item.help}</p>}
            {errors[item.key] && <p className="text-xs text-red-600">{errors[item.key]}</p>}
          </div>
        ))}
      </div>
      {extra && <div className="border-t border-slate-100 px-5 py-4">{extra({ drafts })}</div>}
      {anyEditable && (
        <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <Input
            className="sm:max-w-sm bg-white"
            placeholder="Reason for the change (optional, kept in the history)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="flex items-center gap-3">
            {errors.detail && <span className="text-xs text-red-600">{errors.detail}</span>}
            <span className="text-xs text-slate-500">
              {changedCount ? `${changedCount} change${changedCount > 1 ? "s" : ""}` : "No changes"}
            </span>
            <Button onClick={save} disabled={!changedCount || saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save {meta.title}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

function LogoPanel({ data, token, onSaved, canEdit }) {
  const [busy, setBusy] = useState("");

  const upload = async (variant, file) => {
    if (!file) return;
    if (file.size > 500 * 1024) {
      toast.error("The logo must be 500 KB or smaller.");
      return;
    }
    setBusy(variant);
    try {
      await uploadSaccoLogo(file, variant, token);
      toast.success("Logo updated");
      onSaved();
    } catch (error) {
      const errs = settingsErrors(error);
      toast.error(errs.file || errs.detail || "Upload failed");
    } finally {
      setBusy("");
    }
  };

  const remove = async (variant) => {
    setBusy(variant);
    try {
      await deleteSaccoLogo(variant, token);
      toast.success("Logo removed");
      onSaved();
    } catch (error) {
      toast.error(settingsErrors(error).detail || "Couldn't remove the logo");
    } finally {
      setBusy("");
    }
  };

  const variants = [
    { id: "full", label: "Logo", hint: "Shown on the login page and in the header." },
    { id: "small", label: "Small logo / icon", hint: "Square works best. Used as the browser icon. Falls back to the logo." },
  ];
  return (
    <section className="rounded border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-base font-semibold text-slate-900">Logo</h2>
        <p className="mt-0.5 text-sm text-slate-500">PNG, JPEG or WebP, up to 500 KB. Stored in the SACCO’s own database.</p>
      </div>
      <div className="grid grid-cols-1 gap-6 px-5 py-5 md:grid-cols-2">
        {variants.map((v) => {
          const url = data?.public?.[`logo_${v.id}_url`];
          return (
            <div key={v.id} className="space-y-3">
              <div className="text-sm font-medium text-slate-800">{v.label}</div>
              <div className="flex h-28 items-center justify-center rounded border border-dashed border-slate-300 bg-slate-50">
                {url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={url} alt={v.label} className="max-h-24 max-w-[90%] object-contain" />
                ) : (
                  <span className="text-xs text-slate-400">No logo uploaded. The portal’s default is used.</span>
                )}
              </div>
              <p className="text-xs text-slate-500">{v.hint}</p>
              {canEdit && (
                <div className="flex gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50">
                    {busy === v.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    Upload
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        upload(v.id, e.target.files?.[0]);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {url && (
                    <Button variant="outline" size="sm" onClick={() => remove(v.id)} disabled={busy === v.id}>
                      <Trash2 className="mr-1 h-4 w-4" /> Remove
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function MpesaTools({ data, drafts, token, onSaved }) {
  const [busy, setBusy] = useState("");
  const [result, setResult] = useState(null);
  const environment = data.settings.find((s) => s.key === "mpesa_environment")?.value;

  const run = async (env, save) => {
    setBusy(`${env}-${save}`);
    setResult(null);
    const values = { environment: env, save };
    MPESA_KEYS.forEach((key) => {
      if (drafts[key]) values[key] = drafts[key];
    });
    try {
      const res = await testMpesaKeys(values, token);
      setResult({ ok: true, message: res.message + (res.saved?.length ? " New keys saved." : "") });
      if (save || res.live_verified) onSaved();
    } catch (error) {
      const d = error?.response?.data;
      setResult({ ok: false, message: d?.message || Object.values(d?.errors || {})[0] || d?.detail || "Test failed" });
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="space-y-3">
      <div className="text-sm text-slate-600">
        The test asks Safaricom for an access token, which checks the consumer key and secret. The shortcode and passkey
        are checked by the first real STK push. Daraja can be switched to <b>Live</b> only after a live test passes
        {data.mpesa_live_verified_at
          ? ` (last passed ${format(new Date(data.mpesa_live_verified_at), "d MMM yyyy, HH:mm")}).`
          : " (not passed yet)."}
        {environment === "live" && " While Live, new keys are saved only through Test live keys and save."}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" disabled={!!busy} onClick={() => run("sandbox", false)}>
          {busy === "sandbox-false" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Test sandbox keys
        </Button>
        <Button variant="outline" size="sm" disabled={!!busy} onClick={() => run("live", false)}>
          {busy === "live-false" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Test live keys
        </Button>
        <Button size="sm" disabled={!!busy || !MPESA_KEYS.some((k) => drafts[k])} onClick={() => run("live", true)}>
          {busy === "live-true" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Test live keys and save
        </Button>
      </div>
      {result && (
        <p className={`text-sm ${result.ok ? "text-green-700" : "text-red-600"}`}>{result.message}</p>
      )}
    </div>
  );
}

function EmailTools({ token }) {
  const [busy, setBusy] = useState("");
  const send = async (sender) => {
    setBusy(sender);
    try {
      const res = await sendTestEmail(sender, token);
      toast.success(res.message || "Sent");
    } catch (error) {
      const d = error?.response?.data;
      toast.error(d?.message || Object.values(d?.errors || {})[0] || d?.detail || "Couldn't send");
    } finally {
      setBusy("");
    }
  };
  return (
    <div className="space-y-2">
      <p className="text-sm text-slate-600">Send a test email to yourself from a saved sender to check its domain is verified.</p>
      <div className="flex flex-wrap gap-2">
        {SENDERS.map((sender) => (
          <Button key={sender} variant="outline" size="sm" disabled={!!busy} onClick={() => send(sender)}>
            {busy === sender && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Test {sender.split("_")[0]}
          </Button>
        ))}
      </div>
    </div>
  );
}

function LicenceUsage({ usage }) {
  if (!usage) return null;
  const colour =
    usage.status === "over" ? "text-red-700" : usage.status === "near" ? "text-amber-700" : "text-slate-800";
  return (
    <div className="text-sm text-slate-600">
      <span className={`font-semibold ${colour}`}>
        {usage.members.toLocaleString()} active members
        {usage.limit ? ` of ${usage.limit.toLocaleString()} covered (${usage.percent}%)` : ""}
      </span>
      {usage.status === "over" && " · Over the licence. Registrations still work; contact the account lead about the next tier."}
      {usage.status === "near" && " · Close to the licence limit."}
      {usage.expires_on && ` · Licence ${usage.expired ? "expired" : "expires"} ${format(new Date(usage.expires_on), "d MMM yyyy")}.`}
    </div>
  );
}

function ChangeHistory({ token }) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ["sacco-setting-changes", page],
    queryFn: () => getSettingChanges(token, { page, page_size: 50 }),
    enabled: tokenReady(token),
  });
  const totalPages = Math.max(1, Math.ceil((data?.count || 0) / 50));
  if (isLoading) return <Loader2 className="h-6 w-6 animate-spin text-slate-400" />;
  return (
    <section className="rounded border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>When</TableHead>
              <TableHead>Setting</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>By</TableHead>
              <TableHead>Reason</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data?.results || []).map((row) => (
              <TableRow key={row.id}>
                <TableCell className="whitespace-nowrap text-xs">{format(new Date(row.created_at), "d MMM yyyy, HH:mm")}</TableCell>
                <TableCell className="text-sm font-medium">
                  {row.key === "import_from_env" ? "Copied from env vars" : row.label}
                </TableCell>
                <TableCell className="max-w-[220px] truncate text-xs text-slate-500" title={row.old_value || ""}>
                  {row.old_value ?? "—"}
                </TableCell>
                <TableCell className="max-w-[220px] truncate text-xs" title={row.new_value || ""}>
                  {row.new_value ?? "—"}
                </TableCell>
                <TableCell className="text-xs">{row.changed_by}</TableCell>
                <TableCell className="text-xs text-slate-500">{row.reason}</TableCell>
              </TableRow>
            ))}
            {!data?.results?.length && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-sm text-slate-500">
                  No changes yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-3 text-sm">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <span>
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      )}
    </section>
  );
}

export default function SaccoSettingsManager({ mode = "admin" }) {
  const token = useAxiosAuth();
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["sacco-settings"],
    queryFn: () => getSaccoSettings(token),
    enabled: tokenReady(token),
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["sacco-settings"] });
    queryClient.invalidateQueries({ queryKey: ["sacco-setting-changes"] });
  };

  const byGroup = useMemo(() => {
    const out = {};
    (data?.settings || []).forEach((item) => {
      (out[item.group] = out[item.group] || []).push(item);
    });
    return out;
  }, [data]);

  if (isLoading || !tokenReady(token)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }
  if (error) {
    const status = error?.response?.status;
    return (
      <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {status === 404
          ? "This SACCO's API doesn't have settings yet. It needs the latest API release."
          : status === 403
            ? "You don't have access to SACCO settings."
            : "Couldn't load settings. Try again."}
      </div>
    );
  }

  const tabs = TABS[mode] || TABS.admin;
  const usage = data?.licence_usage;
  const logoEditable = Boolean(byGroup.branding?.some((i) => i.editable));

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">SACCO settings</h1>
        <p className="text-sm text-slate-500">
          {mode === "superuser"
            ? "Everything a SACCO needs, saved in its own database. Every change is recorded with who made it."
            : "Your SACCO's profile. Settings marked “Set by Corban” are changed by your Corban account lead."}
        </p>
      </div>

      {mode === "superuser" && data && !data.encryption_available && (
        <div className="flex gap-3 rounded border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>
            SETTINGS_ENCRYPTION_KEY is not set on this SACCO’s Railway API, so M-Pesa secrets can’t be saved here yet.
            They keep working from env. Add the variable, redeploy, then run <code>python manage.py import_settings_from_env</code>.
          </span>
        </div>
      )}
      {usage && (usage.status === "over" || usage.status === "near" || usage.expired) && (
        <div className="flex gap-3 rounded border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <LicenceUsage usage={usage} />
        </div>
      )}

      <Tabs defaultValue={tabs[0].id} className="w-full">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-slate-100 p-1">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="px-3 py-1.5 text-sm">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-4 space-y-5">
            {tab.history ? (
              <ChangeHistory token={token} />
            ) : (
              <>
                {(tab.groups || []).map((group) =>
                  byGroup[group]?.length ? (
                    <SettingsGroup
                      key={group}
                      group={group}
                      items={byGroup[group]}
                      token={token}
                      mode={mode}
                      onSaved={refresh}
                      extra={
                        mode === "superuser" && group === "mpesa"
                          ? ({ drafts }) => <MpesaTools data={data} drafts={drafts} token={token} onSaved={refresh} />
                          : mode === "superuser" && group === "email"
                            ? () => <EmailTools token={token} />
                            : group === "licence"
                              ? () => <LicenceUsage usage={usage} />
                              : null
                      }
                    />
                  ) : null
                )}
                {tab.logo && <LogoPanel data={data} token={token} onSaved={refresh} canEdit={logoEditable} />}
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <p className="flex items-center gap-1.5 text-xs text-slate-500">
        <CheckCircle2 className="h-3.5 w-3.5" /> A value marked “from env” isn’t saved here yet and is read from the
        server’s settings until it is.
      </p>
    </div>
  );
}
