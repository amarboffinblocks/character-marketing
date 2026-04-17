"use client"

import { useMemo, useState, useRef, useEffect } from "react"
import {
  CheckCheck,
  Circle,
  FileText,
  ImageIcon,
  MessageSquare,
  MoreVertical,
  Paperclip,
  Phone,
  Search,
  Send,
  Smile,
  Video,
} from "lucide-react"
import { motion, AnimatePresence } from "motion/react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CreatorMessageThread, creatorMessageThreads } from "@/features/creator/messages/messages-data"
import { cn } from "@/lib/utils"



export function CreatorMessagesView() {
  const [threads, setThreads] = useState<CreatorMessageThread[]>(creatorMessageThreads)
  const [activeThreadId, setActiveThreadId] = useState<string>(threads[0]?.id ?? "")
  const [search, setSearch] = useState("")
  const [composer, setComposer] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const scrollRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [activeThreadId, threads])

  const filteredThreads = useMemo(() => {
    const query = search.trim().toLowerCase()
    return threads.filter((thread) => {
      const matchesSearch =
        query.length === 0 ||
        thread.buyerName.toLowerCase().includes(query) ||
        thread.packageName.toLowerCase().includes(query)
      return matchesSearch
    })
  }, [search, threads])

  const activeThread = threads.find((t) => t.id === activeThreadId) ?? threads[0]

  const handleSendMessage = () => {
    if (!composer.trim() || !activeThread) return

    setThreads((current) =>
      current.map((t) => {
        if (t.id !== activeThread.id) return t
        return {
          ...t,
          lastMessageAt: "Just now",
          messages: [
            ...t.messages,
            {
              id: crypto.randomUUID(),
              sender: "creator",
              text: composer,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ],
        }
      })
    )
    setComposer("")
  }

  return (
    <TooltipProvider>
      <div className="flex flex-1 overflow-hidden rounded-3xl border border-border/60 bg-background/50 h-[calc(100vh-48px)]">
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Conversations List */}
          <aside className="flex w-full flex-col border-r border-border/40 bg-muted/5 sm:w-[380px]">
            <div className="p-6 pb-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search here..."
                  className="pl-10 h-11 bg-background/50 border-border/40 focus:ring-primary/20"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

            </div>

            <div className="flex-1 overflow-y-auto px-2 pb-6 pt-2 space-y-1 scrollbar-thin">
              <AnimatePresence mode="popLayout" initial={false}>
                {filteredThreads.map((thread) => (
                  <motion.button
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={thread.id}
                    onClick={() => setActiveThreadId(thread.id)}
                    className={cn(
                      "flex w-full items-start gap-4 rounded-2xl p-4 text-left transition-all hover:bg-accent/40",
                      activeThreadId === thread.id ? "bg-accent shadow-sm" : "transparent"
                    )}
                  >
                    <div className="relative shrink-0">
                      <Avatar className="size-12 shadow-md">
                        <AvatarImage src={`https://i.pravatar.cc/150?u=${thread.buyerName}`} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {thread.buyerName[0]}
                        </AvatarFallback>
                      </Avatar>
                      {thread.status === "needs_response" && (
                        <span className="absolute -bottom-1 -right-1 size-3.5 rounded-full bg-red-500 border-2 border-background" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-foreground truncate">{thread.buyerName}</span>
                        <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                          {thread.lastMessageAt}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className={cn(
                          "truncate text-xs text-muted-foreground flex-1",
                          thread.unreadCount > 0 && "font-semibold text-foreground"
                        )}>
                          {thread.messages?.[thread.messages.length - 1]?.text ?? thread.packageName}
                        </p>
                        {thread.unreadCount > 0 && (
                          <span className="flex items-center justify-center size-5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm">
                            {thread.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </aside>

          {/* Chat Window */}
          <main className="flex flex-1 flex-col bg-background/30">
            {activeThread ? (
              <>
                <header className="flex h-[88px] items-center justify-between border-b border-border/40 px-8 py-4 backdrop-blur-md">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="size-12 shadow-sm">
                        <AvatarImage src={`https://i.pravatar.cc/150?u=${activeThread.buyerName}`} />
                        <AvatarFallback>{activeThread.buyerName[0]}</AvatarFallback>
                      </Avatar>
                      <span className="absolute bottom-0 right-0 size-3 rounded-full bg-green-500 border-2 border-background" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-foreground leading-none">{activeThread.buyerName}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">08 Member • 4 Online</span>
                        <Badge variant="outline" className="text-[10px] h-4 px-1 opacity-60">
                          {activeThread.orderId}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger 
                        render={
                          <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted/50 transition-all">
                            <Phone className="size-5 text-muted-foreground" />
                          </Button>
                        } 
                      />
                      <TooltipContent>Audio Call</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger 
                        render={
                          <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted/50 transition-all">
                            <Video className="size-5 text-muted-foreground" />
                          </Button>
                        } 
                      />
                      <TooltipContent>Video Call</TooltipContent>
                    </Tooltip>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <MoreVertical className="size-5 text-muted-foreground" />
                    </Button>
                  </div>
                </header>

                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-thin bg-black/5 dark:bg-white/5"
                >
                  <div className="flex justify-center my-4">
                    <span className="bg-background/80 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-medium text-muted-foreground shadow-sm">
                      Today
                    </span>
                  </div>

                  {activeThread.messages.map((message, i) => {
                    const isCreator = message.sender === "creator"
                    const isSystem = message.sender === "system"
                    
                    if (isSystem) {
                      return (
                        <div key={message.id} className="flex justify-center">
                          <div className="bg-muted/40 border border-border/40 px-6 py-2 rounded-xl text-xs text-muted-foreground italic max-w-md text-center">
                            {message.text}
                          </div>
                        </div>
                      )
                    }

                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "flex group w-full",
                          isCreator ? "justify-end" : "justify-start"
                        )}
                      >
                        <div className={cn(
                          "flex max-w-[70%] items-end gap-3",
                          isCreator ? "flex-reverse" : ""
                        )}>
                         
                          <div className="space-y-1">
                            {!isCreator && (
                              <p className="text-[11px] font-semibold text-muted-foreground ml-1">
                                {activeThread.buyerName}
                              </p>
                            )}
                            <div
                              className={cn(
                                "relative px-4 py-3 shadow-sm",
                                isCreator
                                  ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-none"
                                  : "bg-background border border-border/40 text-foreground rounded-2xl rounded-tl-none"
                              )}
                            >
                              {message.text.includes(".pdf") ? (
                                <div className="flex items-center gap-3 p-2 bg-black/10 rounded-lg cursor-pointer hover:bg-black/20 transition-colors">
                                  <div className="size-10 flex items-center justify-center bg-red-500 rounded-md text-white">
                                    <FileText className="size-5" />
                                  </div>
                                  <div className="pr-4">
                                    <p className="text-xs font-bold leading-none">{message.text.split('\n')[0]}</p>
                                    <p className="text-[10px] mt-1 opacity-70">20.2MB • 12th Jun 2024</p>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm leading-relaxed">{message.text}</p>
                              )}
                              <div className={cn(
                                "flex items-center gap-1 mt-2 justify-end opacity-60",
                                isCreator ? "text-primary-foreground/80" : "text-muted-foreground"
                              )}>
                                <span className="text-[10px] font-medium">{message.time}</span>
                                {isCreator && <CheckCheck className="size-3" />}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <footer className="p-6  bg-background/40">
                  <div className="w-full mx-auto relative group">
                    <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-background/80 p-2 pl-4 shadow-xl ring-offset-background group-within:ring-2 group-within:ring-primary/20 transition-all">
                      <Input
                        placeholder="Type message..."
                        className="flex-1 border-none bg-transparent shadow-none focus-visible:ring-0 text-sm h-12"
                        value={composer}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                        onChange={(e) => setComposer(e.target.value)}
                      />
                      <div className="flex items-center gap-1 shrink-0 px-2 border-l border-border/40">
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted text-muted-foreground">
                          <Smile className="size-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted text-muted-foreground">
                          <Paperclip className="size-5" />
                        </Button>
                        <Button 
                          onClick={handleSendMessage}
                          size="icon" 
                          className="size-11 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-primary/40 transition-all active:scale-95 ml-2"
                        >
                          <Send className="size-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </footer>
              </>
            ) : (
              <div className="flex h-full items-center justify-center p-8 text-center">
                <div className="space-y-4 max-w-sm">
                  <div className="size-20 rounded-3xl bg-primary/5 flex items-center justify-center mx-auto">
                    <MessageSquare className="size-10 text-primary/40" />
                  </div>
                  <h3 className="text-xl font-bold">Pick up where you left off</h3>
                  <p className="text-sm text-muted-foreground">
                    Select a conversation from the sidebar to view messages and details about your active orders.
                  </p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
