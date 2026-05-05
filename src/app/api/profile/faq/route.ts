import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const faqs = await prisma.faq.findMany({
      where: { creatorId: user.id },
      orderBy: { order: "asc" },
    })
    return NextResponse.json(faqs)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { faqs } = body // Array of { id?, question, answer }

    if (!Array.isArray(faqs)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    await prisma.$transaction([
      prisma.faq.deleteMany({ where: { creatorId: user.id } }),
      prisma.faq.createMany({
        data: faqs.map((f, i) => ({
          question: f.question,
          answer: f.answer,
          creatorId: user.id,
          order: i,
        })),
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
