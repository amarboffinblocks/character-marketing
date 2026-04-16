
"use client"

import type { ReactNode } from "react"
import { Quote, Star } from "lucide-react"
import { motion } from "motion/react"

import { Container, SectionHeader } from "@/components/shared"
import { cn } from "@/lib/utils"

type Testimonial = {
    quote: string
    name: string
    role: string
    initials: string
}

const SECTION_TITLE_ID = "testimonials-heading"

const testimonials: Testimonial[] = [
    {
        quote: "I found a creator who understood my worldbuilding style right away. The final lorebook felt like it came straight from my notes.",
        name: "Maya Thompson",
        role: "Tabletop GM",
        initials: "MT",
    },
    {
        quote: "Clear timelines, fair pricing, and fast revisions. Character Market made the whole process smooth from brief to delivery.",
        name: "Jordan Lee",
        role: "Indie Game Designer",
        initials: "JL",
    },
    {
        quote: "As a creator, this is where niche expertise is actually valued. I get better briefs and higher-quality repeat clients.",
        name: "Ari Rivera",
        role: "Verified Creator",
        initials: "AR",
    },
    {
        quote: "The trust protections gave me confidence to place my first commission. Delivery quality was excellent.",
        name: "Nora Patel",
        role: "Fiction Writer",
        initials: "NP",
    },
    {
        quote: "I booked two repeat projects in one month. The platform tools and review flow helped me grow much faster.",
        name: "Kai Morgan",
        role: "Character Artist",
        initials: "KM",
    },
    {
        quote: "From discovery to delivery, everything feels professional and easy to navigate. It is built for serious collaboration.",
        name: "Sam Walker",
        role: "Product Designer",
        initials: "SW",
    },
    {
        quote: "I only hire verified creators now. The profile quality and communication standards are far better than generic marketplaces.",
        name: "Liam Chen",
        role: "Content Lead",
        initials: "LC",
    },
    {
        quote: "Payments and milestones are transparent, and support resolves issues quickly. That reliability is why I keep coming back.",
        name: "Riya Kapoor",
        role: "Studio Founder",
        initials: "RK",
    },
    {
        quote: "Great buyer experience and strong creator outcomes. The process feels premium without being complicated.",
        name: "Noah Brooks",
        role: "Community Manager",
        initials: "NB",
    },
]


const firstColumn = testimonials.slice(0, 3)
const secondColumn = testimonials.slice(3, 6)
const thirdColumn = testimonials.slice(6, 9)

function TestimonialCard({ quote, name, role, initials }: Testimonial) {
    return (
        <article className="w-full max-w-xs rounded-2xl border border-border/70 bg-card p-6 shadow-sm shadow-primary/5">
            <div className="flex items-center justify-between">
                <Quote className="size-4 text-primary" aria-hidden />
                <div className="flex gap-0.5 text-accent">
                    <Star className="size-3.5 fill-current" aria-hidden />
                    <Star className="size-3.5 fill-current" aria-hidden />
                    <Star className="size-3.5 fill-current" aria-hidden />
                    <Star className="size-3.5 fill-current" aria-hidden />
                    <Star className="size-3.5 fill-current" aria-hidden />
                </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">&ldquo;{quote}&rdquo;</p>

            <div className="mt-5 flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {initials}
                </div>
                <div>
                    <p className="text-sm font-semibold leading-tight">{name}</p>
                    <p className="text-xs text-muted-foreground">{role}</p>
                </div>
            </div>
        </article>
    )
}

const TestimonialsSection = () => {
    return (
        <section
            aria-labelledby={SECTION_TITLE_ID}
            className="relative border-t border-border/40 bg-linear-to-b from-background to-muted/20"
        >
            <Container paddingY="md" size="xl">
                <SectionHeader
                    titleId={SECTION_TITLE_ID}
                    title="Loved by Creators and Customers"
                    description="See what our community has to say about Character Market"
                    className=" text-center sm:block "
                    align="center"
                />

                <div className="mt-10 flex max-h-[760px] justify-center gap-6 overflow-hidden mask-[linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)]">
                    <TestimonialsColumn testimonials={firstColumn} duration={15} />
                    <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
                    <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
                </div>
            </Container>
        </section>
    );
};

export default TestimonialsSection;



export const TestimonialsColumn = (props: {
    className?: string;
    testimonials: Testimonial[];
    duration?: number;
    direction?: "up" | "down";
}) => {
    const animation = props.direction === "down" ? "50%" : "-50%"

    return (
        <div className={cn("shrink-0", props.className)}>
            <motion.div
                animate={{
                    translateY: animation,
                }}
                transition={{
                    duration: props.duration || 10,
                    repeat: Infinity,
                    ease: "linear",
                    repeatType: "loop",
                }}
                className="flex flex-col gap-5 pb-5"
            >
                {[
                    ...new Array(2).fill(0).map((_, blockIndex) => (
                        <TestimonialsColumnGroup key={blockIndex}>
                            {props.testimonials.map((testimonial, index) => (
                                <TestimonialCard key={`${testimonial.name}-${index}`} {...testimonial} />
                            ))}
                        </TestimonialsColumnGroup>
                    )),
                ]}
            </motion.div>
        </div>
    );
};

function TestimonialsColumnGroup({ children }: { children: ReactNode }) {
    return <>{children}</>
}





