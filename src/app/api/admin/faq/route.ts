import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { resolvePersistedRole } from "@/lib/profile-role"

export async function GET() {
  try {
    const faqs = await prisma.faq.findMany({
      where: { isAdmin: true },
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

  const role = await resolvePersistedRole(supabase, user)
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { faqs } = body // Expected to be an array of { question, answer }

    if (!Array.isArray(faqs)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    // Replace all admin FAQs with the new set
    await prisma.$transaction([
      prisma.faq.deleteMany({ where: { isAdmin: true } }),
      prisma.faq.createMany({
        data: faqs.map((f, i) => ({
          question: f.question,
          answer: f.answer,
          isAdmin: true,
          order: i,
        })),
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
