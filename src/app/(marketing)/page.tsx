import { CreatorBenefitsSection } from "@/components/sections/creator-benefits-section";
import { CTASection } from "@/components/sections/cta-section";
import { FAQPreviewSection } from "@/components/sections/faq-preview-section";
import { FeaturedCreatorsSection } from "@/components/sections/featured-creators-section";
import { HeroSection } from "@/components/sections/hero-section";
import { HowItWorksSection } from "@/components/sections/how-it-works-section";
import TestimonialsSection from "@/components/sections/testimonials-section";
import { TrustSection } from "@/components/sections/trust-section";

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
    );
}
