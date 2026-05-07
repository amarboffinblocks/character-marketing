"use client"

import { Search, Mail, MessageCircle, FileText, User, Shield, CreditCard, ShoppingCart, HelpCircle, ChevronRight, Zap } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"

const categories = [
  {
    title: "Account & Security",
    description: "Manage your profile settings, passwords, and account security.",
    icon: User,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "Buying & Payments",
    description: "Learn about purchasing characters, escrow, and payment methods.",
    icon: ShoppingCart,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    title: "Selling & Payouts",
    description: "Set up your creator profile, manage services, and get paid.",
    icon: CreditCard,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    title: "Trust & Safety",
    description: "Our community guidelines, dispute resolution, and buyer protection.",
    icon: Shield,
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
  },
]

const faqs = [
  {
    question: "How does the escrow system work?",
    answer: "When you purchase a character or service, your payment is held securely in escrow. The funds are only released to the creator once you approve the delivery or the review period ends without a dispute. This ensures both parties are protected.",
  },
  {
    question: "How do I become a verified creator?",
    answer: "To become a verified creator, you must complete your profile (at least 80%), add a portfolio with 3+ items, and link a valid Stripe Connect account for payouts. Our team manually reviews applications to ensure quality and trust.",
  },
  {
    question: "What are the character usage rights?",
    answer: "Usage rights vary by creator and package. Generally, purchasing a character gives you personal usage rights. Commercial rights are often available as an add-on or included in premium packages. Always check the specific package details before purchasing.",
  },
  {
    question: "How do I request a revision?",
    answer: "If the delivered work doesn't meet the agreed-upon scope, you can request a revision through the order dashboard. Most packages include a specific number of revisions. Be sure to provide clear, actionable feedback to help the creator.",
  },
  {
    question: "What happens if I'm not happy with my order?",
    answer: "If you encounter an issue, we recommend communicating with the creator first. Most issues can be resolved through revisions. If you cannot reach an agreement, you can open a dispute, and our support team will mediate.",
  },
]

export function SupportView() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-b from-primary/10 via-background to-background py-20 lg:py-32">
        <div className="container mx-auto px-4 relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4 bg-primary/15 text-primary">
              <HelpCircle className="mr-1.5 size-3.5" />
              Support Center
            </Badge>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              How can we help you?
            </h1>
            <p className="mb-10 text-lg text-muted-foreground">
              Search our help center for answers to common questions about buying, selling, and managing your account.
            </p>
            <div className="relative mx-auto max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
              <Input
                placeholder="Search for articles, guides, or keywords..."
                className="h-14 pl-12 pr-4 text-base shadow-xl ring-primary/20 focus-visible:ring-primary"
              />
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <span className="text-sm text-muted-foreground">Popular:</span>
              <button className="text-sm font-medium text-primary hover:underline">Escrow</button>
              <button className="text-sm font-medium text-primary hover:underline">Verification</button>
              <button className="text-sm font-medium text-primary hover:underline">Payouts</button>
              <button className="text-sm font-medium text-primary hover:underline">Revisions</button>
            </div>
          </div>
        </div>
        
        {/* Abstract background elements */}
        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-[32rem] h-[32rem] bg-accent/20 rounded-full blur-3xl" />
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <Card key={category.title} className="group cursor-pointer border-border/50 transition-all hover:-translate-y-1 hover:shadow-lg hover:border-primary/20">
                <CardHeader>
                  <div className={`mb-3 flex size-12 items-center justify-center rounded-2xl ${category.bgColor} ${category.color}`}>
                    <category.icon className="size-6" />
                  </div>
                  <CardTitle className="text-xl">{category.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" size="sm" className="w-full justify-between p-0 hover:bg-transparent text-primary">
                    Browse articles
                    <ChevronRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Frequently Asked Questions</h2>
              <p className="mt-4 text-muted-foreground">Quick answers to the most common questions from our community.</p>
            </div>
            <Card className="border-border/50 shadow-sm">
              <CardContent className="p-0">
                <Accordion className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border-b border-border/50 last:border-0 px-6 py-1">
                      <AccordionTrigger className="text-left text-lg font-medium hover:no-underline hover:text-primary">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
            <div className="mt-10 text-center">
              <Button variant="outline" className="gap-2">
                <FileText className="size-4" />
                View all Documentation
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl rounded-[2.5rem] bg-linear-to-br from-primary via-primary/90 to-primary/80 p-8 text-primary-foreground shadow-2xl sm:p-16 relative overflow-hidden">
            <div className="relative z-10 grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="mb-6 text-3xl font-bold sm:text-5xl leading-tight">Still need help? Our team is here for you.</h2>
                <p className="mb-10 text-lg text-primary-foreground/80 leading-relaxed">
                  Can't find what you're looking for? Whether you're an admin, creator, or buyer, our dedicated support team is ready to assist you.
                </p>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                      <Mail className="size-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary-foreground/60">Email Support</p>
                      <p className="text-lg font-semibold">support@charactermarket.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                      <MessageCircle className="size-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary-foreground/60">Live Chat</p>
                      <p className="text-lg font-semibold">Mon-Fri, 9am - 6pm EST</p>
                    </div>
                  </div>
                </div>
              </div>
              <Card className="border-none bg-white/95 backdrop-blur-sm shadow-xl text-foreground">
                <CardHeader>
                  <CardTitle className="text-2xl">Send us a message</CardTitle>
                  <CardDescription>We typically respond within 2-4 hours.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Subject</label>
                    <Input placeholder="What do you need help with?" />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Message</label>
                    <textarea 
                      className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Describe your issue in detail..."
                    />
                  </div>
                  <Button className="w-full gap-2 shadow-lg h-12 text-base">
                    <Zap className="size-4 fill-current" />
                    Send Support Request
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            {/* Decorative background circle */}
            <div className="absolute -bottom-24 -right-24 size-96 rounded-full bg-white/5 blur-3xl" />
          </div>
        </div>
      </section>

      {/* Footer Support Info */}
      <section className="border-t border-border/50 py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Character Market Support. All rights reserved. 
            <span className="mx-2">|</span>
            <a href="#" className="hover:text-primary">Privacy Policy</a>
            <span className="mx-2">|</span>
            <a href="#" className="hover:text-primary">Terms of Service</a>
          </p>
        </div>
      </section>
    </div>
  )
}
