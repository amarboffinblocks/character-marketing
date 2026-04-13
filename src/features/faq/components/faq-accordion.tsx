import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import type { FAQItem } from "@/features/faq/model/faq-item"

type FAQAccordionProps = {
  items: FAQItem[]
}

export function FAQAccordion({ items }: FAQAccordionProps) {
  return (
    <Accordion defaultValue={[]} className="w-full">
      {items.map((faq, index) => (
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
  )
}
