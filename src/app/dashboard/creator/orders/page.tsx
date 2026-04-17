"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import {
  CalendarClock,
  CircleDollarSign,
  Clock3,
  Download,
  ListFilter,
  FolderKanban,
  Search,
  SlidersHorizontal,
  UserRoundSearch,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

type OrderStatus = "New" | "In Progress" | "Waiting on Buyer" | "Review" | "Completed"
type SortOption = "due-soon" | "recently-updated" | "highest-value"

type CreatorOrder = {
  id: string
  buyerName: string
  packageName: string
  amount: string
  dueDate: string
  dueSoon: boolean
  lastUpdated: string
  status: OrderStatus
}

const orderStats = [
  {
    label: "Active Orders",
    value: "12",
    detail: "Strong delivery pace across current work",
    icon: FolderKanban,
  },
  {
    label: "Due This Week",
    value: "4",
    detail: "2 are close enough to need attention today",
    icon: CalendarClock,
  },
  {
    label: "Waiting on Buyer",
    value: "3",
    detail: "Feedback or approval is blocking delivery flow",
    icon: Clock3,
  },
  {
    label: "Completed This Month",
    value: "19",
    detail: "Finished cleanly with strong client satisfaction",
    icon: CircleDollarSign,
  },
] as const

const statusTabs = [
  "All",
  "New",
  "In Progress",
  "Waiting on Buyer",
  "Review",
  "Completed",
] as const

const orders: CreatorOrder[] = [
  {
    id: "#ORD-2481",
    buyerName: "Nova Studio",
    packageName: "Anime VTuber model sheet",
    amount: "$680",
    dueDate: "Today, 5:00 PM",
    dueSoon: true,
    lastUpdated: "18 min ago",
    status: "In Progress",
  },
  {
    id: "#ORD-2474",
    buyerName: "PixelRaid",
    packageName: "Mascot redesign package",
    amount: "$420",
    dueDate: "Tomorrow, 10:30 AM",
    dueSoon: true,
    lastUpdated: "1 hour ago",
    status: "Review",
  },
  {
    id: "#ORD-2468",
    buyerName: "LunaCast",
    packageName: "PNGtuber starter bundle",
    amount: "$260",
    dueDate: "Apr 21",
    dueSoon: false,
    lastUpdated: "Today",
    status: "Waiting on Buyer",
  },
  {
    id: "#ORD-2461",
    buyerName: "GlowFrame",
    packageName: "Streaming overlay illustration set",
    amount: "$510",
    dueDate: "Apr 24",
    dueSoon: false,
    lastUpdated: "Yesterday",
    status: "New",
  },
  {
    id: "#ORD-2455",
    buyerName: "ArcBloom",
    packageName: "Character turnaround sheet",
    amount: "$590",
    dueDate: "Apr 27",
    dueSoon: false,
    lastUpdated: "2 days ago",
    status: "In Progress",
  },
  {
    id: "#ORD-2449",
    buyerName: "StreamMuse",
    packageName: "Starter branding kit",
    amount: "$310",
    dueDate: "Delivered",
    dueSoon: false,
    lastUpdated: "3 hours ago",
    status: "Completed",
  },
] as const

function getStatusVariant(status: OrderStatus): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "New":
      return "secondary"
    case "In Progress":
      return "default"
    case "Waiting on Buyer":
      return "destructive"
    case "Review":
      return "secondary"
    case "Completed":
      return "outline"
    default:
      return "outline"
  }
}

export default function CreatorOrdersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeStatus, setActiveStatus] = useState<(typeof statusTabs)[number]>("All")
  const [sortBy, setSortBy] = useState<SortOption>("due-soon")
  const [dueSoonOnly, setDueSoonOnly] = useState(false)

  const filteredOrders = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    const nextOrders = orders.filter((order) => {
      const matchesSearch =
        normalizedQuery.length === 0 ||
        order.id.toLowerCase().includes(normalizedQuery) ||
        order.buyerName.toLowerCase().includes(normalizedQuery) ||
        order.packageName.toLowerCase().includes(normalizedQuery)

      const matchesStatus = activeStatus === "All" || order.status === activeStatus
      const matchesDueSoon = !dueSoonOnly || order.dueSoon

      return matchesSearch && matchesStatus && matchesDueSoon
    })

    return [...nextOrders].sort((first, second) => {
      if (sortBy === "highest-value") {
        return Number.parseInt(second.amount.replace(/\D/g, ""), 10) - Number.parseInt(first.amount.replace(/\D/g, ""), 10)
      }

      if (sortBy === "recently-updated") {
        const recentOrderIds = orders.map((order) => order.id)
        return recentOrderIds.indexOf(first.id) - recentOrderIds.indexOf(second.id)
      }

      if (first.dueSoon === second.dueSoon) {
        return orders.findIndex((order) => order.id === first.id) - orders.findIndex((order) => order.id === second.id)
      }

      return Number(first.dueSoon === false) - Number(second.dueSoon === false)
    })
  }, [activeStatus, dueSoonOnly, searchQuery, sortBy])

  return (
    <main className="space-y-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Orders</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Track active work, due dates, and buyer status. Export or jump to requests when you need to qualify new
            leads.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" className="rounded-full">
            <Download className="size-4" aria-hidden />
            Export
          </Button>
          <Link href="/dashboard/creator/requests" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-full")}>
            <UserRoundSearch className="size-4" aria-hidden />
            View requests
          </Link>
          <Link href="/dashboard/creator/profile" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-full")}>
            <Clock3 className="size-4" aria-hidden />
            Availability
          </Link>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {orderStats.map((stat) => {
          const Icon = stat.icon

          return (
            <Card key={stat.label} className="border-border/60 shadow-none transition-colors hover:bg-muted/15">
              <CardHeader>
                <CardDescription className="flex items-center justify-between gap-3">
                  <span>{stat.label}</span>
                  <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-4" aria-hidden />
                  </span>
                </CardDescription>
                <CardTitle className="text-3xl">{stat.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{stat.detail}</p>
              </CardContent>
            </Card>
          )
        })}
      </section>

      <section className="grid gap-6">
        <Card className="py-0">
          <CardHeader>
            <CardTitle>Order workspace</CardTitle>
            <CardDescription>Filter, search, and sort active work without losing context across your delivery pipeline.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pb-5">
            <div className="flex flex-col gap-4 rounded-2xl border bg-muted/20 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                  <Input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search by order id, buyer, or package"
                    className="pl-9"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:w-[360px]">
                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                    <SelectTrigger>
                      <div className="flex items-center gap-2">
                        <SlidersHorizontal className="size-4 text-muted-foreground" aria-hidden />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="due-soon">Sort: Due soon</SelectItem>
                      <SelectItem value="recently-updated">Sort: Recently updated</SelectItem>
                      <SelectItem value="highest-value">Sort: Highest value</SelectItem>
                    </SelectContent>
                  </Select>
                  <button
                    type="button"
                    onClick={() => setDueSoonOnly((current) => !current)}
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      dueSoonOnly && "border-primary/40 bg-primary/5 text-primary"
                    )}
                  >
                    <ListFilter className="size-4" aria-hidden />
                    Due soon only
                  </button>
                </div>
              </div>

              <Tabs value={activeStatus} onValueChange={(value) => setActiveStatus(value as (typeof statusTabs)[number])}>
                <TabsList className="h-auto w-full flex-wrap justify-start rounded-2xl bg-transparent p-0">
                  {statusTabs.map((status) => (
                    <TabsTrigger
                      key={status}
                      value={status}
                      className="h-9 flex-none rounded-full border border-border/70 bg-background px-4 data-active:border-primary/25 data-active:bg-primary/8"
                    >
                      {status}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="rounded-3xl border border-dashed bg-muted/15 px-6 py-12 text-center">
                <div className="mx-auto flex max-w-md flex-col items-center gap-3">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <FolderKanban className="size-5" aria-hidden />
                  </span>
                  <h2 className="text-lg font-semibold">No orders match these filters</h2>
                  <p className="text-sm text-muted-foreground">
                    Try another status, remove the due-soon filter, or search with a buyer name or order id.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("")
                      setActiveStatus("All")
                      setSortBy("due-soon")
                      setDueSoonOnly(false)
                    }}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                  >
                    Reset filters
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="hidden overflow-hidden rounded-2xl border lg:block">
                  <div className="grid grid-cols-[0.9fr_1fr_1.4fr_0.8fr_0.9fr_1fr_0.9fr_auto] gap-4 border-b bg-muted/25 px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <span>Order</span>
                    <span>Buyer</span>
                    <span>Package</span>
                    <span>Amount</span>
                    <span>Due date</span>
                    <span>Status</span>
                    <span>Last updated</span>
                    <span className="text-right">Action</span>
                  </div>
                  <div className="divide-y">
                    {filteredOrders.map((order) => (
                      <div
                        key={order.id}
                        className="grid grid-cols-[0.9fr_1fr_1.4fr_0.8fr_0.9fr_1fr_0.9fr_auto] items-center gap-4 px-4 py-4"
                      >
                        <span className="font-medium">{order.id}</span>
                        <span className="font-medium">{order.buyerName}</span>
                        <span className="text-muted-foreground">{order.packageName}</span>
                        <span className="font-medium">{order.amount}</span>
                        <span className={cn("text-sm", order.dueSoon ? "text-foreground" : "text-muted-foreground")}>
                          {order.dueDate}
                        </span>
                        <Badge variant={getStatusVariant(order.status)} className="w-fit">
                          {order.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{order.lastUpdated}</span>
                        <div className="text-right">
                          <Link href="/dashboard/creator/orders" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                            View Order
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 lg:hidden">
                  {filteredOrders.map((order) => (
                    <div key={order.id} className="rounded-2xl border bg-muted/20 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{order.id}</p>
                          <h2 className="mt-1 font-medium">{order.packageName}</h2>
                        </div>
                        <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Buyer</p>
                          <p className="mt-1 text-sm font-medium">{order.buyerName}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Amount</p>
                          <p className="mt-1 text-sm font-medium">{order.amount}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Due date</p>
                          <p className="mt-1 text-sm font-medium">{order.dueDate}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Last updated</p>
                          <p className="mt-1 text-sm font-medium">{order.lastUpdated}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <Link href="/dashboard/creator/orders" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                          View Order
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="justify-between">
            <span className="text-sm text-muted-foreground">Review near-deadline orders first to keep delivery confidence high.</span>
            <Link href="/dashboard/creator" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
              Dashboard overview
            </Link>
          </CardFooter>
        </Card>
      </section>
    </main>
  )
}
