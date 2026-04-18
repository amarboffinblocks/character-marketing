"use client"

import { useState } from "react"
import {
  Bell,
  ClipboardList,
  KeyRound,
  Save,
  Settings as SettingsIcon,
  Shield,
  ShieldAlert,
  SlidersHorizontal,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { SectionTabs, type SectionTabItem } from "@/features/creator/shared/section-tabs"
import { cn } from "@/lib/utils"

type AdminSettingsTab = "operations" | "alerts" | "audit"

const settingsTabs: SectionTabItem<AdminSettingsTab>[] = [
  { value: "operations", label: "Operations", icon: SlidersHorizontal },
  { value: "alerts", label: "Alerts & channels", icon: Bell },
  { value: "audit", label: "Audit log", icon: Shield },
]

const auditLogDemo = [
  {
    id: "aud-9001",
    actor: "alex.rivera@character.market",
    action: "toggle_feature_flag",
    target: "checkout_v2 → 25%",
    at: "Apr 18, 2026 · 14:22 UTC",
  },
  {
    id: "aud-9000",
    actor: "ops@character.market",
    action: "maintenance_banner",
    target: "enabled · 2h window",
    at: "Apr 17, 2026 · 22:10 UTC",
  },
  {
    id: "aud-8999",
    actor: "trust-ops@character.market",
    action: "export_grant",
    target: "Trust_flags_weekly · Parquet",
    at: "Apr 17, 2026 · 09:05 UTC",
  },
  {
    id: "aud-8998",
    actor: "finance@character.market",
    action: "payout_batch_release",
    target: "Batch #88",
    at: "Apr 16, 2026 · 18:00 UTC",
  },
  {
    id: "aud-8997",
    actor: "platform@character.market",
    action: "api_rate_limit",
    target: "partner acme-widgets · 2×",
    at: "Apr 16, 2026 · 11:40 UTC",
  },
]

function ToggleRow({
  label,
  description,
  value,
  onChange,
}: {
  label: string
  description: string
  value: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border/70 p-3">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-border transition-colors",
          value ? "bg-primary" : "bg-muted"
        )}
      >
        <span
          className={cn(
            "inline-block size-4 translate-x-0.5 rounded-full bg-background shadow-sm transition-transform",
            value && "translate-x-4"
          )}
        />
      </button>
    </div>
  )
}

export function AdminSettingsView() {
  const [tab, setTab] = useState<AdminSettingsTab>("operations")
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [require2faStaff, setRequire2faStaff] = useState(true)
  const [readOnlyMode, setReadOnlyMode] = useState(false)
  const [emailOnIncident, setEmailOnIncident] = useState(true)
  const [slackNotify, setSlackNotify] = useState(true)
  const [defaultReportTz, setDefaultReportTz] = useState("utc")
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    "We’re upgrading payments — checkout is paused until 04:00 UTC."
  )

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-linear-to-br from-primary/10 via-accent/30 to-background p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <span className="inline-flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
              <SettingsIcon className="size-5" />
            </span>
            <div className="space-y-1.5">
              <Badge variant="secondary" className="w-fit">
                Platform controls
              </Badge>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Settings
              </h2>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Operations, alerting, integrations, and audit trails — same structure as creator
                settings, scoped to the admin console (demo only).
              </p>
            </div>
          </div>
          <Button variant="outline" className="h-9 shrink-0 border-primary/25 bg-background/80 hover:bg-primary/10">
            <Save className="size-4" />
            Save all
          </Button>
        </div>
      </section>

      <SectionTabs value={tab} onChange={setTab} items={settingsTabs} />

      {tab === "operations" ? (
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border-primary/15 lg:col-span-2">
              <CardHeader className="border-b border-primary/10 pb-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="size-4 text-primary" />
                  <CardTitle>Platform switches</CardTitle>
                </div>
                <CardDescription>High-impact toggles for buyers and staff.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-6">
                <ToggleRow
                  label="Maintenance mode"
                  description="Show a banner site-wide and block new checkouts."
                  value={maintenanceMode}
                  onChange={setMaintenanceMode}
                />
                <ToggleRow
                  label="Require 2FA for staff"
                  description="Applies to admin, support, and scoped roles."
                  value={require2faStaff}
                  onChange={setRequire2faStaff}
                />
                <ToggleRow
                  label="Read-only admin"
                  description="Freeze config edits during incidents (UI-only demo)."
                  value={readOnlyMode}
                  onChange={setReadOnlyMode}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b pb-4">
                <CardTitle className="text-base">Maintenance copy</CardTitle>
                <CardDescription>Shown in the banner when maintenance is on.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-6">
                <Textarea
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                  className="min-h-[88px] resize-y"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b pb-4">
                <CardTitle className="text-base">Defaults</CardTitle>
                <CardDescription>Scheduled reports and exports.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Report timezone</label>
                  <Select
                    value={defaultReportTz}
                    onValueChange={(v) => setDefaultReportTz(v ?? "utc")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utc">UTC</SelectItem>
                      <SelectItem value="america_la">America/Los_Angeles</SelectItem>
                      <SelectItem value="europe_london">Europe/London</SelectItem>
                      <SelectItem value="asia_tokyo">Asia/Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">API burst ceiling</label>
                  <Input defaultValue="1200 rpm" readOnly className="bg-muted/50 font-mono text-sm" />
                  <p className="text-[11px] text-muted-foreground">Contact platform to change (demo).</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}

      {tab === "alerts" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="lg:col-span-2">
            <CardHeader className="border-b pb-4">
              <div className="flex items-center gap-2">
                <Bell className="size-4 text-primary" />
                <CardTitle>Notification routing</CardTitle>
              </div>
              <CardDescription>Where severe incidents and digests go.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-6">
              <ToggleRow
                label="Email on SEV-1 incident"
                description="Pager-style message to ops distribution list."
                value={emailOnIncident}
                onChange={setEmailOnIncident}
              />
              <ToggleRow
                label="Slack #admin-ops mirror"
                description="Post a thread for every SEV and maintenance window."
                value={slackNotify}
                onChange={setSlackNotify}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-base">Email</CardTitle>
              <CardDescription>Primary on-call inbox.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-6">
              <div className="space-y-1.5">
                <label htmlFor="ops-email" className="text-xs font-medium text-muted-foreground">
                  Ops email
                </label>
                <Input id="ops-email" type="email" defaultValue="ops@character.market" />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="pager-email" className="text-xs font-medium text-muted-foreground">
                  Pager CC (optional)
                </label>
                <Input id="pager-email" type="email" placeholder="pager@your-telco.com" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b pb-4">
              <div className="flex items-center gap-2">
                <KeyRound className="size-4 text-muted-foreground" />
                <CardTitle className="text-base">Integrations</CardTitle>
              </div>
              <CardDescription>Webhook endpoints (masked).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-6">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Slack webhook</label>
                <Input
                  readOnly
                  className="font-mono text-xs"
                  defaultValue="https://hooks.slack.com/services/****/****/********"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">PagerDuty routing key</label>
                <Input readOnly className="font-mono text-xs" defaultValue="pd_routing_••••••••" />
              </div>
              <Button variant="outline" size="sm" className="w-full" type="button">
                Rotate secrets (demo)
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {tab === "audit" ? (
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="border-b border-primary/10 pb-4">
              <div className="flex items-center gap-2">
                <ClipboardList className="size-4 text-primary" />
                <CardTitle>Recent config & access events</CardTitle>
              </div>
              <CardDescription>Immutable-style log (demo rows).</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary/5 hover:bg-primary/5">
                      <TableHead className="font-mono text-xs">ID</TableHead>
                      <TableHead>Actor</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead className="text-right">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogDemo.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-mono text-xs text-muted-foreground">{row.id}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm">{row.actor}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-normal">
                            {row.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[220px] truncate text-sm text-muted-foreground">
                          {row.target}
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">
                          {row.at}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card className="border-dashed bg-muted/20">
            <CardContent className="flex flex-col gap-2 py-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <ShieldAlert className="size-5 shrink-0 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="text-sm font-medium text-foreground">Export full audit trail</p>
                  <p className="text-xs text-muted-foreground">
                    Production would stream to your SIEM or S3 bucket with signed URLs.
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" type="button">
                Request export
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  )
}
