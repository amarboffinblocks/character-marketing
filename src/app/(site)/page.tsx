import {
  CreatorBenefitsSection,
  CTASection,
  FAQPreviewSection,
  FeaturedCreatorsSection,
  HeroSection,
  HowItWorksSection,
  TestimonialsSection,
  TrustSection,
} from "@/features/site/home"

export default function Home() {
  return (
    <main>
      <HeroSection />
      <FeaturedCreatorsSection />
      <HowItWorksSection />
      <CreatorBenefitsSection />
      <TrustSection />
      <TestimonialsSection />
      <FAQPreviewSection />
      <CTASection />
    </main>
  )
}
