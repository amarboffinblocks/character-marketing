import { CreatorBenefitsSection } from "@/components/sections/creator-benefits-section";
import { FeaturedCreatorsSection } from "@/components/sections/featured-creators-section";
import { HeroSection } from "@/components/sections/hero-section";
import { HowItWorksSection } from "@/components/sections/how-it-works-section";
import { TrustSection } from "@/components/sections/trust-section";

export default function Home() {
    return (
        <main>
            <HeroSection />
            <FeaturedCreatorsSection />
            <HowItWorksSection />
            <CreatorBenefitsSection />
            <TrustSection/>
        </main>
    );
}
