"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { Filter, MessageCircle, Heart } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

type GlobalBid = {
  id: string
  title: string
  postedAgo: string
  rate: string
  experience: "Entry" | "Intermediate" | "Expert"
  duration: string
  hours: string
  description: string
  skills: string[]
  paymentVerified: boolean
  rating: string
  spent: string
  location: string
  proposals: string
  persona?: {
    tone: string
    traits: string[]
  }
  lorebook?: {
    universe: string
    background: string
  }
  avatar?: string
  background?: string
}

const globalBids: GlobalBid[] = [
  {
    id: "cm-4",
    title: "Kael Draven – Cyberpunk Fixer & Underworld Strategist",
    postedAgo: "Added 5 hours ago",
    rate: "$60-$90",
    experience: "Expert",
    duration: "Persistent Character",
    hours: "20-30 interactions/week",
    description:
      "Kael Draven is a sharp-minded fixer operating in a neon-lit cyberpunk city. He helps users navigate high-stakes decisions, underground deals, and strategic planning through immersive roleplay and calculated thinking.",

    skills: [
      "Cyberpunk Worldbuilding",
      "Strategic Thinking",
      "Roleplay",
      "Character Persona",
      "Decision Making"
    ],

    paymentVerified: true,
    rating: "4.9",
    spent: "12K+ interactions",
    location: "Neo-Verse City",
    proposals: "20 to 25 users engaged",

    persona: {
      tone: "Calm, calculated, slightly intimidating",
      traits: ["Strategic", "Cold", "Intelligent", "Resourceful"],
    },

    lorebook: {
      universe: "Neo-Verse",
      background:
        "A legendary fixer known for solving impossible problems in the underground network of a futuristic dystopian city.",
    },

    avatar: "kael-draven.png",
    background: "cyberpunk-city"
  },
  {
    id: "cm-5",
    title: "Luna Aetheris – Celestial Guide & Emotional Companion",
    postedAgo: "Added 2 hours ago",
    rate: "$30-$60",
    experience: "Intermediate",
    duration: "Persistent Character",
    hours: "15-25 interactions/week",
    description:
      "Luna Aetheris is a serene celestial being who offers emotional guidance, reflective conversations, and calming interactions. Designed for users seeking comfort, clarity, and mindful dialogue.",

    skills: [
      "Emotional Support",
      "Guided Conversations",
      "Mindfulness",
      "Character Persona",
      "Companion Roleplay"
    ],

    paymentVerified: true,
    rating: "4.7",
    spent: "8K+ interactions",
    location: "Astral Plane",
    proposals: "25 to 30 users engaged",

    persona: {
      tone: "Soft, calming, empathetic",
      traits: ["Gentle", "Wise", "Supportive", "Intuitive"],
    },

    lorebook: {
      universe: "Celestial Realm",
      background:
        "A cosmic entity who observes human emotions and guides lost souls toward inner peace and understanding.",
    },

    avatar: "luna-aetheris.png",
    background: "celestial-sky"
  },
  {
    id: "cm-3",
    title: "Nyx Shadowbane – Dark Fantasy Lorekeeper Character",
    postedAgo: "Added 8 hours ago",
    rate: "$40-$70",
    experience: "Intermediate",
    duration: "Persistent Character",
    hours: "10-20 interactions/week",
    description:
      "Nyx Shadowbane is a mysterious lorekeeper from a dark fantasy universe, designed for immersive AI roleplay. This character comes with a deeply structured lorebook, consistent personality, and rich narrative depth for long-term storytelling.",

    skills: [
      "Lorebooks",
      "Worldbuilding",
      "Fantasy Roleplay",
      "Character Persona",
      "Narrative Design"
    ],

    paymentVerified: true,
    rating: "4.8",
    spent: "5K+ interactions",
    location: "Shadowfall Realm",
    proposals: "15 to 20 users engaged",

    // 👇 added but structure preserved (optional extension)
    persona: {
      tone: "Dark, poetic, immersive",
      traits: ["Mysterious", "Wise", "Cryptic"],
    },

    lorebook: {
      universe: "Shadowfall Realm",
      background:
        "An ancient entity who preserves forbidden knowledge and guides travelers through forgotten histories.",
    },

    avatar: "nyx-shadowbane.png",
    background: "dark-fantasy-castle"
  }
]

const bidTabs = [
  { id: "best-matches", label: "Best Matches" },
  { id: "most-recent", label: "Most Recent" },
  { id: "saved-jobs", label: "Saved Jobs" },
] as const

export function GlobalBidsView() {
  const [activeTab, setActiveTab] = useState<(typeof bidTabs)[number]["id"]>("best-matches")
  const [query, setQuery] = useState("")
  const [sortBy, setSortBy] = useState("relevance")
  const [maxBudget, setMaxBudget] = useState(125)
  const [paymentVerifiedOnly, setPaymentVerifiedOnly] = useState(false)

  const filteredBids = useMemo(() => {
    const q = query.trim().toLowerCase()

    return globalBids.filter((bid) => {
      const topRate = Number(bid.rate.split("-")[1]?.replace("$", "") ?? "0")
      const matchesQuery =
        q.length === 0 ||
        bid.title.toLowerCase().includes(q) ||
        bid.description.toLowerCase().includes(q) ||
        bid.skills.some((skill) => skill.toLowerCase().includes(q))
      const matchesBudget = topRate <= maxBudget
      const matchesPayment = paymentVerifiedOnly ? bid.paymentVerified : true

      return matchesQuery && matchesBudget && matchesPayment
    })
  }, [maxBudget, paymentVerifiedOnly, query])

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Jobs you might like</h1>
        <Tabs value={activeTab} onValueChange={(next) => setActiveTab(next as (typeof bidTabs)[number]["id"])}>
          <div className="flex items-center justify-between gap-2">
            <TabsList variant="line" className="h-auto bg-transparent p-0">
              {bidTabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="h-8 px-3 text-sm">
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <button type="button" className={cn(buttonVariants({ variant: "outline" }), "h-8 border-green-700 text-green-700")}>
              <Filter className="size-4" />
              Filters
            </button>
          </div>
        </Tabs>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr] lg:items-start">
        <aside className="rounded-xl border border-border/70 bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Filters</h2>
            <button
              type="button"
              className="text-xs font-medium text-primary hover:underline"
              onClick={() => {
                setQuery("")
                setSortBy("relevance")
                setMaxBudget(125)
                setPaymentVerifiedOnly(false)
              }}
            >
              Clear all
            </button>
          </div>
          <div className="mt-6 space-y-7">
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Budget range</h3>
              <div className="mt-4">
                <input
                  type="range"
                  min={25}
                  max={200}
                  step={5}
                  value={maxBudget}
                  onChange={(event) => setMaxBudget(Number(event.currentTarget.value))}
                  className="w-full accent-primary"
                  aria-label="Maximum hourly budget"
                />
                <div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
                  <span>$25/hr</span>
                  <span className="font-medium text-foreground">Up to ${maxBudget}/hr</span>
                </div>
              </div>
            </section>
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Quick filters</h3>
              <div className="mt-3 space-y-2.5">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-border"
                    checked={paymentVerifiedOnly}
                    onChange={(event) => setPaymentVerifiedOnly(event.currentTarget.checked)}
                  />
                  Payment verified only
                </label>
              </div>
            </section>
          </div>
        </aside>

        <section className="space-y-4">
          <div className="rounded-xl border border-border/70 bg-card p-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search jobs, skills, clients..."
              />
              <Select value={sortBy} onValueChange={(value) => setSortBy(value ?? "relevance")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">relevance</SelectItem>
                  <SelectItem value="latest">latest</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">Showing {filteredBids.length} jobs</p>
          </div>

          <ul className="space-y-3">
            {filteredBids.map((bid) => (
              <li key={bid.id} className="rounded-xl border border-border/70 bg-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-primary/80">{bid.postedAgo}</p>
                    <h2 className="text-xl font-semibold text-foreground">{bid.title}</h2>
                    <p className="text-sm  dark:text-violet-300/80">
                      Hourly: {bid.rate} - {bid.experience} - Est. Time: {bid.duration}, {bid.hours}
                    </p>
                    <p className="text-sm leading-6 text-foreground/90">{bid.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {bid.skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="rounded-full bg-primary/20 text-black/70 dark:bg-sky-900/30 dark:text-sky-200"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="text-emerald-700 font-semibold dark:text-emerald-300">
                        {bid.paymentVerified ? "Payment verified" : "Payment unverified"}
                      </span>
                      <span className="text-amber-700 font-semibold dark:text-amber-300">{bid.rating}</span>
                      <span className="text-indigo-700 font-semibold dark:text-indigo-300">{bid.spent}</span>
                      <span className="text-cyan-700 font-semibold dark:text-cyan-300">{bid.location}</span>
                    </div>
                    <p className="text-sm text-rose-700 font-semibold dark:text-rose-300">Proposals: {bid.proposals}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href="/dashboard/creator/messages"
                      className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "size-8")}
                    >
                      <MessageCircle className="size-4" />
                    </Link>
                    <button type="button" className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "size-8")}>
                      <Heart className="size-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
