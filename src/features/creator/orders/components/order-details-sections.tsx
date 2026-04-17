import Link from "next/link"
import {
  CalendarClock,
  CheckCheck,
  Clock3,
  Flag,
  HandCoins,
  MessageSquare,
  Paperclip,
  RefreshCcw,
  Send,
  Upload,
  UserRound,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { OrderStatusBadge } from "@/features/creator/orders/components/order-status-badge"
import type { CreatorOrder } from "@/features/creator/orders/types"
import type { OrderDetailsData } from "@/features/creator/orders/order-details-data"
import {
  formatCurrency,
  getDeadlineState,
  getDueDateTone,
  getOrderPriorityClass,
} from "@/features/creator/orders/utils"
import { cn } from "@/lib/utils"

const stageLabels = [
  "Order Accepted",
  "Work Started",
  "Draft Delivered",
  "Under Review",
  "Completed",
] as const

function buyerInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

type HeaderProps = {
  order: CreatorOrder
}

export function OrderDetailsHeader({ order }: HeaderProps) {
  return (
    <section className="rounded-2xl border border-border bg-linear-to-br from-primary/10 via-accent/30 to-background p-5 sm:p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-1.5">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {order.id}
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {order.packageName}
          </h2>
          <p className="text-sm text-muted-foreground">Buyer: {order.customerName}</p>
          <OrderStatusBadge status={order.status} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button className="h-9">
            <CheckCheck className="size-4" />
            Mark as Completed
          </Button>
          <Button variant="outline" className="h-9">
            <MessageSquare className="size-4" />
            Message Buyer
          </Button>
          <Button variant="ghost" className="h-9">
            Request Revision
          </Button>
        </div>
      </div>
    </section>
  )
}

type OverviewProps = {
  order: CreatorOrder
  details: OrderDetailsData
}

export function OrderOverviewCard({ order, details }: OverviewProps) {
  const deadline = getDeadlineState(order)

  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <CardTitle>Order overview</CardTitle>
        <CardDescription>Core order context for execution and delivery.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 py-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border/80 bg-muted/20 p-3">
          <p className="text-xs text-muted-foreground">Buyer</p>
          <div className="mt-1.5 flex items-center gap-2">
            <Avatar size="sm">
              <AvatarFallback>{buyerInitials(order.customerName)}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-foreground">{order.customerName}</span>
          </div>
        </div>
        <div className="rounded-lg border border-border/80 bg-muted/20 p-3">
          <p className="text-xs text-muted-foreground">Total amount</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{formatCurrency(order.amount)}</p>
        </div>
        <div className="rounded-lg border border-border/80 bg-muted/20 p-3">
          <p className="text-xs text-muted-foreground">Order date</p>
          <p className="mt-1 text-sm font-medium text-foreground">{details.orderDate}</p>
        </div>
        <div className="rounded-lg border border-border/80 bg-muted/20 p-3">
          <p className="text-xs text-muted-foreground">Last updated</p>
          <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
            <RefreshCcw className="size-3.5" />
            {order.updatedAt}
          </p>
        </div>
        <div className="rounded-lg border border-border/80 bg-muted/20 p-3">
          <p className="text-xs text-muted-foreground">Due date</p>
          <p className={cn("mt-1 inline-flex items-center gap-1.5 text-sm font-medium", getDueDateTone(order))}>
            <CalendarClock className="size-3.5" />
            {order.dueDate}
          </p>
        </div>
        <div className={cn("rounded-lg border p-3", deadline.className)}>
          <p className="text-xs font-medium">{deadline.label}</p>
          <p className="mt-1 text-sm">{deadline.detail}</p>
        </div>
        <div className="rounded-lg border border-border/80 bg-muted/20 p-3 sm:col-span-2">
          <p className="text-xs text-muted-foreground">Priority</p>
          <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium">
            <Flag className={cn("size-3.5", getOrderPriorityClass(order.priority))} />
            <span className={cn("capitalize", getOrderPriorityClass(order.priority))}>
              {order.priority}
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export function PackageDetailsCard({ details }: { details: OrderDetailsData }) {
  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <CardTitle>Package details</CardTitle>
        <CardDescription>What the buyer purchased and expected deliverables.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 py-4">
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-md border border-border/80 bg-muted/20 px-3 py-2">
            <p className="text-xs text-muted-foreground">Package name</p>
            <p className="text-sm font-medium text-foreground">{details.packageName}</p>
          </div>
          <div className="rounded-md border border-border/80 bg-muted/20 px-3 py-2">
            <p className="text-xs text-muted-foreground">Delivery time</p>
            <p className="text-sm font-medium text-foreground">{details.deliveryTime}</p>
          </div>
          <div className="rounded-md border border-border/80 bg-muted/20 px-3 py-2">
            <p className="text-xs text-muted-foreground">Revisions included</p>
            <p className="text-sm font-medium text-foreground">{details.revisionsIncluded}</p>
          </div>
          <div className="rounded-md border border-border/80 bg-muted/20 px-3 py-2">
            <p className="text-xs text-muted-foreground">Token limit</p>
            <p className="text-sm font-medium text-foreground">
              {details.tokenCount ? details.tokenCount.toLocaleString() : "Not specified"}
            </p>
          </div>
        </div>
        <ul className="grid gap-2 sm:grid-cols-2">
          {details.deliverables.map((item) => (
            <li key={item} className="rounded-md border border-border/80 bg-muted/20 px-3 py-2 text-sm">
              {item}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

export function BuyerRequestsCard({ details }: { details: OrderDetailsData }) {
  const sections = [
    {
      id: "character",
      title: "Character Request",
      content: (
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Name</p>
            <p className="text-sm font-medium">{details.requests.character.name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Tags</p>
            <p className="text-sm">{details.requests.character.tags.join(", ")}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs text-muted-foreground">Description</p>
            <p className="text-sm">{details.requests.character.description}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs text-muted-foreground">Scenario / Universe</p>
            <p className="text-sm">{details.requests.character.scenarioUniverse}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Personality</p>
            <p className="text-sm">{details.requests.character.personality}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Dialogue style</p>
            <p className="text-sm">{details.requests.character.dialogueStyle}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs text-muted-foreground">First message</p>
            <p className="text-sm">{details.requests.character.firstMessage}</p>
          </div>
        </div>
      ),
    },
    {
      id: "persona",
      title: "Persona Request",
      content: (
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Name</p>
            <p className="text-sm font-medium">{details.requests.persona.name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Tags</p>
            <p className="text-sm">{details.requests.persona.tags.join(", ")}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs text-muted-foreground">Details</p>
            <p className="text-sm">{details.requests.persona.details}</p>
          </div>
        </div>
      ),
    },
    {
      id: "lorebook",
      title: "Lorebook Request",
      content: (
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Name</p>
            <p className="text-sm font-medium">{details.requests.lorebook.name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Keywords</p>
            <p className="text-sm">{details.requests.lorebook.keywords.join(", ")}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs text-muted-foreground">Description</p>
            <p className="text-sm">{details.requests.lorebook.description}</p>
          </div>
        </div>
      ),
    },
    {
      id: "background",
      title: "Background Request",
      content: (
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Name</p>
            <p className="text-sm font-medium">{details.requests.background.name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Reference images</p>
            <p className="text-sm">{details.requests.background.references.join(", ")}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs text-muted-foreground">Description</p>
            <p className="text-sm">{details.requests.background.description}</p>
          </div>
        </div>
      ),
    },
    {
      id: "avatar",
      title: "Avatar Request",
      content: (
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Name</p>
            <p className="text-sm font-medium">{details.requests.avatar.name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Reference images</p>
            <p className="text-sm">{details.requests.avatar.references.join(", ")}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs text-muted-foreground">Description</p>
            <p className="text-sm">{details.requests.avatar.description}</p>
          </div>
        </div>
      ),
    },
  ] as const

  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <CardTitle>Buyer requests</CardTitle>
        <CardDescription>
          Structured request data for character, persona, lorebook, background, and avatar.
        </CardDescription>
      </CardHeader>
      <CardContent className="py-3">
        <Accordion defaultValue={["character"]} className="gap-1">
          {sections.map((section) => (
            <AccordionItem
              key={section.id}
              value={section.id}
              className="rounded-md border border-border/80 px-3"
            >
              <AccordionTrigger>{section.title}</AccordionTrigger>
              <AccordionContent>{section.content}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  )
}

export function BuyerInstructionsCard({ details }: { details: OrderDetailsData }) {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="border-b border-primary/20 pb-4">
        <CardTitle>Message to creator</CardTitle>
        <CardDescription>Direct buyer message and execution preferences.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 py-4">
        <p className="text-sm leading-relaxed text-foreground">{details.buyerMessageToCreator}</p>
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Preferences</p>
          <ul className="mt-2 space-y-1.5 text-sm text-foreground">
            {details.preferences.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </div>
        {details.attachments.length > 0 ? (
          <div>
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Attachments</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {details.attachments.map((file) => (
                <span key={file} className="inline-flex items-center gap-1.5 rounded-md border border-border/80 bg-background px-2 py-1 text-xs">
                  <Paperclip className="size-3.5" />
                  {file}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

export function ConversationCard({ details }: { details: OrderDetailsData }) {
  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <CardTitle>Conversation</CardTitle>
        <CardDescription>Direct thread between creator and buyer.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 py-4">
        <div className="space-y-2">
          {details.conversation.map((message) => (
            <div
              key={message.id}
              className={cn(
                "rounded-lg border px-3 py-2 text-sm",
                message.sender === "creator" && "ml-8 border-primary/20 bg-primary/5",
                message.sender === "buyer" && "mr-8 border-border/80 bg-muted/20",
                message.sender === "system" &&
                  "border-dashed border-border bg-background text-muted-foreground"
              )}
            >
              <p className="text-xs font-medium capitalize text-muted-foreground">{message.sender}</p>
              <p className="mt-1 text-foreground">{message.text}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{message.time}</p>
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-border/80 bg-muted/20 p-3">
          <Textarea placeholder="Write a message to the buyer..." className="min-h-24 bg-background" />
          <div className="mt-2 flex items-center justify-between gap-2">
            <Button variant="outline" size="sm">
              <Paperclip className="size-4" />
              Attach file
            </Button>
            <Button size="sm">
              <Send className="size-4" />
              Send
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function WorkProgressCard({ details }: { details: OrderDetailsData }) {
  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <CardTitle>Work progress</CardTitle>
        <CardDescription>Current production stage and completion path.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 py-4">
        {stageLabels.map((label, index) => {
          const step = index + 1
          const isComplete = step < details.currentStage
          const isCurrent = step === details.currentStage
          return (
            <div key={label} className="flex items-start gap-3">
              <span
                className={cn(
                  "mt-0.5 inline-flex size-5 items-center justify-center rounded-full border text-[11px] font-medium",
                  isComplete && "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                  isCurrent && "border-primary/40 bg-primary/10 text-primary",
                  !isComplete && !isCurrent && "border-border text-muted-foreground"
                )}
              >
                {step}
              </span>
              <div>
                <p className={cn("text-sm font-medium", isCurrent ? "text-foreground" : "text-muted-foreground")}>
                  {label}
                </p>
                {isCurrent ? <p className="text-xs text-primary">Current stage</p> : null}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

export function DeliveryCard() {
  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <CardTitle>Delivery</CardTitle>
        <CardDescription>Submit final files and delivery notes to the buyer.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 py-4">
        <div className="rounded-lg border border-dashed border-border/80 bg-muted/20 p-4 text-center">
          <Upload className="mx-auto size-5 text-muted-foreground" />
          <p className="mt-2 text-sm text-foreground">Drop files here or upload manually</p>
          <p className="text-xs text-muted-foreground">Accepted: ZIP, PNG, PSD, PDF</p>
          <Button variant="outline" size="sm" className="mt-3">
            Choose files
          </Button>
        </div>
        <Textarea placeholder="Add delivery notes for the buyer..." className="min-h-24" />
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button variant="outline">Save Draft</Button>
          <Button>Submit Delivery</Button>
        </div>
        <p className="text-xs text-muted-foreground">After submission: status updates to waiting for buyer review.</p>
      </CardContent>
    </Card>
  )
}

export function RevisionsCard({ details }: { details: OrderDetailsData }) {
  if (details.revisionRequests.length === 0) return null

  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <CardTitle>Revisions</CardTitle>
        <CardDescription>Revision requests and response tracking.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 py-4">
        {details.revisionRequests.map((revision) => (
          <div key={revision.id} className="rounded-lg border border-border/80 bg-muted/20 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-foreground">{revision.note}</p>
              <Badge variant={revision.status === "open" ? "secondary" : "outline"}>
                {revision.status === "open" ? "Open" : "Resolved"}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{revision.requestedAt}</p>
            <div className="mt-2 flex gap-2">
              <Button size="sm" variant="outline">
                Reply
              </Button>
              <Button size="sm">Upload update</Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function OrderQuickSidebar({ order }: { order: CreatorOrder }) {
  const deadline = getDeadlineState(order)

  return (
    <Card className="h-fit xl:sticky xl:top-20">
      <CardHeader className="border-b pb-4">
        <CardTitle>Quick actions</CardTitle>
        <CardDescription>Fast controls for this order.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 py-4">
        <Link href="/dashboard/creator/orders" className={cn(buttonVariants(), "h-9 justify-start")}>
          <MessageSquare className="size-4" />
          Message buyer
        </Link>
        <Button variant="outline" className="h-9 justify-start">
          <Clock3 className="size-4" />
          Update timeline
        </Button>
        <Button variant="outline" className="h-9 justify-start">
          <HandCoins className="size-4" />
          Request payout
        </Button>
        <div className={cn("mt-2 rounded-lg border p-3 text-xs", deadline.className)}>
          <p className="font-medium">{deadline.label}</p>
          <p className="mt-1">{deadline.detail}</p>
        </div>
        <div className="rounded-lg border border-border/80 bg-muted/20 p-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Assignee</p>
          <p className="mt-1 inline-flex items-center gap-1.5">
            <UserRound className="size-3.5" />
            You are assigned as creator
          </p>
        </div>
        <Input placeholder="Internal note..." className="h-8" />
      </CardContent>
    </Card>
  )
}
