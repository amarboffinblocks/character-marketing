import type { CreatorOrder } from "@/features/creator/orders/types"

export type OrderConversationMessage = {
  id: string
  sender: "buyer" | "creator" | "system"
  text: string
  time: string
}

export type OrderRevisionRequest = {
  id: string
  note: string
  requestedAt: string
  status: "open" | "resolved"
}

export type OrderDetailsData = {
  orderDate: string
  packageName: string
  deliveryTime: string
  revisionsIncluded: number
  deliverables: string[]
  tokenCount?: number
  buyerMessageToCreator: string
  preferences: string[]
  attachments: string[]
  requests: {
    character: {
      name: string
      tags: string[]
      description: string
      scenarioUniverse: string
      personality: string
      firstMessage: string
      dialogueStyle: string
    }
    persona: {
      name: string
      tags: string[]
      details: string
    }
    lorebook: {
      name: string
      description: string
      keywords: string[]
    }
    background: {
      name: string
      description: string
      references: string[]
    }
    avatar: {
      name: string
      description: string
      references: string[]
    }
  }
  conversation: OrderConversationMessage[]
  currentStage: 1 | 2 | 3 | 4 | 5
  revisionRequests: OrderRevisionRequest[]
}

const fallbackDetails: OrderDetailsData = {
  orderDate: "Apr 15, 2026",
  packageName: "Character Premium Package",
  deliveryTime: "5 days",
  revisionsIncluded: 2,
  deliverables: ["Character concept", "Portrait render", "Source files"],
  tokenCount: 3500,
  buyerMessageToCreator:
    "Looking for a polished final delivery that fits our campaign art direction.",
  preferences: ["High contrast visuals", "Consistent silhouette language"],
  attachments: ["moodboard-v2.pdf", "brand-guidelines.png"],
  requests: {
    character: {
      name: "Nova",
      tags: ["Cyberpunk", "Detective", "Noir"],
      description: "A stylish investigator navigating a neon megacity.",
      scenarioUniverse: "A rain-soaked futuristic city under AI surveillance.",
      personality: "Composed, sharp, quietly empathetic.",
      firstMessage: "You can trust me. I always find the truth.",
      dialogueStyle: "Concise with dramatic noir undertones.",
    },
    persona: {
      name: "Nova Core Persona",
      tags: ["Analytical", "Witty", "Loyal"],
      details: "Balances detective logic with emotionally grounded interactions.",
    },
    lorebook: {
      name: "Neon Arcology Lorebook",
      description: "Reference entries for districts, factions, and corporate conflicts.",
      keywords: ["Arcadia Tower", "Black Rail", "Echelon Systems"],
    },
    background: {
      name: "Rainy City Alley",
      description: "Neon alley backdrop with holographic signage and wet reflections.",
      references: ["alley-shot-01.png", "night-neon-ref-02.jpg"],
    },
    avatar: {
      name: "Close-up Avatar",
      description: "Waist-up framing with expressive eyes and contrast lighting.",
      references: ["face-angle-ref-a.jpg", "avatar-lighting-guide.png"],
    },
  },
  conversation: [
    {
      id: "sys-1",
      sender: "system",
      text: "Order accepted by creator.",
      time: "Apr 15 · 09:14",
    },
    {
      id: "buyer-1",
      sender: "buyer",
      text: "Please prioritize the hero pose and expression sheet first.",
      time: "Apr 15 · 11:02",
    },
    {
      id: "creator-1",
      sender: "creator",
      text: "Confirmed. I will share first draft previews within 24 hours.",
      time: "Apr 15 · 11:17",
    },
  ],
  currentStage: 2,
  revisionRequests: [],
}

const detailsByOrderId: Record<string, OrderDetailsData> = {
  "ORD-3021": {
    orderDate: "Apr 17, 2026",
    packageName: "Character + Persona Pro",
    deliveryTime: "4 days",
    revisionsIncluded: 3,
    deliverables: [
      "Character persona sheet",
      "Lorebook entry",
      "Avatar portrait",
      "Transparent PNG exports",
    ],
    tokenCount: 4200,
    buyerMessageToCreator:
      "I need a futuristic cyber-noir heroine for a visual novel. Keep her design elegant, sharp, and emotionally expressive. Please avoid overly armored silhouettes.",
    preferences: [
      "Neon accents with dark base outfit",
      "Facial expression range: neutral, confident, playful",
      "Hair should be asymmetrical",
    ],
    attachments: ["reference-board-cyber-noir.pdf", "palette-guide.png"],
    requests: {
      character: {
        name: "Vesper",
        tags: ["Cyber-noir", "Heroine", "Visual Novel"],
        description:
          "Lead protagonist with elegant design language and cinematic emotional range.",
        scenarioUniverse:
          "Neo-Edo megacity under corporate factions and rogue synthetic agents.",
        personality:
          "Confident, strategic, emotionally restrained, but deeply protective.",
        firstMessage:
          "If the city wants a ghost, I will become one before sunrise.",
        dialogueStyle:
          "Short, intense lines with subtle vulnerability under pressure.",
      },
      persona: {
        name: "Vesper Persona Card",
        tags: ["Strategic", "Protective", "Observant"],
        details:
          "Prioritizes mission outcomes while preserving personal ethics and trust.",
      },
      lorebook: {
        name: "Neo-Edo Codex",
        description:
          "World entries for districts, factions, syndicates, and faction hierarchy.",
        keywords: ["Riven Ward", "Hollow Grid", "Kaizen Consortium"],
      },
      background: {
        name: "Skybridge District",
        description:
          "High-rise city skyline with moving holograms, dramatic rainy atmosphere.",
        references: ["skybridge-ref-01.png", "city-rain-ref-02.jpg"],
      },
      avatar: {
        name: "Portrait Avatar",
        description: "Cinematic close-up with asymmetrical hair and confident expression.",
        references: ["portrait-ref-a.jpg", "face-lighting-ref-b.png"],
      },
    },
    conversation: [
      {
        id: "sys-3021",
        sender: "system",
        text: "Order accepted by creator.",
        time: "Apr 17 · 09:08",
      },
      {
        id: "buyer-3021-1",
        sender: "buyer",
        text: "Can you include one alternate hairstyle for social assets?",
        time: "Apr 17 · 10:14",
      },
      {
        id: "creator-3021-1",
        sender: "creator",
        text: "Yes, I will include one alternate hair variant in final exports.",
        time: "Apr 17 · 10:29",
      },
    ],
    currentStage: 2,
    revisionRequests: [],
  },
  "ORD-3008": {
    orderDate: "Apr 12, 2026",
    packageName: "Mascot Brand Bundle",
    deliveryTime: "6 days",
    revisionsIncluded: 2,
    deliverables: ["Mascot turnaround", "6 pose set", "Brand color variants"],
    tokenCount: 2800,
    buyerMessageToCreator:
      "The mascot should feel friendly but premium. Please align with our streaming channel identity and include social-friendly framing.",
    preferences: [
      "Rounded silhouette language",
      "Avoid heavy linework",
      "Warm color palette preference",
    ],
    attachments: ["brand-mascot-notes.docx", "example-expressions.zip"],
    requests: {
      character: {
        name: "Pip",
        tags: ["Mascot", "Friendly", "Streamer"],
        description: "Compact mascot with high readability for thumbnails and overlays.",
        scenarioUniverse: "Gaming stream overlays and social media assets.",
        personality: "Playful, optimistic, supportive.",
        firstMessage: "Hey chat, ready to level up together?",
        dialogueStyle: "Short, energetic, community-first tone.",
      },
      persona: {
        name: "Pip Persona",
        tags: ["Cheerful", "Welcoming", "High-energy"],
        details: "Acts as a positive companion for livestream and short-form content.",
      },
      lorebook: {
        name: "Pip World Notes",
        description: "Short lore entries for mascot role and recurring visual motifs.",
        keywords: ["Arcade Hub", "Pixel Drift", "Glow Tokens"],
      },
      background: {
        name: "Stream Overlay Background",
        description: "Clean gradient backdrop with room for overlay widgets and text.",
        references: ["overlay-grid-ref.png", "stream-theme-guide.jpg"],
      },
      avatar: {
        name: "Circular Avatar",
        description: "Face-forward mascot crop optimized for platform profile circles.",
        references: ["avatar-round-ref.png"],
      },
    },
    conversation: [
      {
        id: "sys-3008",
        sender: "system",
        text: "Draft delivered for buyer review.",
        time: "Apr 16 · 15:40",
      },
      {
        id: "buyer-3008-1",
        sender: "buyer",
        text: "Can we increase eye contrast and simplify shoulder accessories?",
        time: "Apr 16 · 16:10",
      },
      {
        id: "creator-3008-1",
        sender: "creator",
        text: "Absolutely. I will post revised draft by tomorrow morning.",
        time: "Apr 16 · 16:25",
      },
    ],
    currentStage: 4,
    revisionRequests: [
      {
        id: "rev-3008-1",
        note: "Adjust eye contrast and simplify shoulder accessories.",
        requestedAt: "Apr 16 · 16:10",
        status: "open",
      },
    ],
  },
}

export function getOrderDetailsData(order: CreatorOrder): OrderDetailsData {
  return detailsByOrderId[order.id] ?? fallbackDetails
}
