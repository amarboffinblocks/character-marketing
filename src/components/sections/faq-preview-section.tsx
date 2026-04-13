import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Container, SectionHeader } from "@/components/elements"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const SECTION_TITLE_ID = "faq-preview-heading"

type FaqItem = {
  question: string
  answer: string
}

const faqs: FaqItem[] = [
  {
    question: "What is a character card?",
    answer: "A character card is a complete AI character definition that includes personality traits, backstory, dialogue examples, and other attributes that help AI systems roleplay as that character consistently.",
  },
  {
    question: "How do I know if a creator is trustworthy?",
    answer: "Look for the verified badge on creator profiles. Verified creators have been reviewed by our team and have demonstrated quality work. You can also check their reviews, completion rate, and response time.",
  },
  {
    question: "What happens if I am not satisfied with my order?",
    answer: "Every order includes revisions based on the package you choose. If you are still not satisfied after revisions, our support team will help mediate. Your payment is protected until you approve the final delivery.",
  },
  {
    question: "How much do commissions typically cost?",
    answer: "Prices vary by creator and complexity. Simple character cards start around $25-50, while complex worldbuilding bundles can be $200-500+. Each creator sets their own prices and packages.",
  },
]

export function FAQPreviewSection() {
  return (
    <section
      aria-labelledby={SECTION_TITLE_ID}
      className="border-t border-border/40 bg-linear-to-b from-background to-muted/20"
    >
      <Container paddingY="md" size="md">
        <SectionHeader
          titleId={SECTION_TITLE_ID}
          title="Frequently asked questions"
          description="Quick answers to common questions about ordering, trust, and pricing on Character Market."
          align="center"
          className="items-center text-center"
        />

        <div className="mt-10  sm:p-4">
          <Accordion defaultValue={[]} className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={faq.question}
                value={`item-${index}`}
                className="border-border/60 last:border-b-0"
              >
                <AccordionTrigger className="px-2 text-left text-base font-medium hover:no-underline sm:px-3">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-2 pb-4 text-sm leading-relaxed text-muted-foreground sm:px-3">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/faq"
            className={cn(buttonVariants({ variant: "ghost" }), "h-10")}
          >
            View all FAQs
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
          </Link>
        </div>
      </Container>
    </section>
  )
}
