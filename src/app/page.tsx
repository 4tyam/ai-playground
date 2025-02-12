import { HeroSection } from "@/components/landing-page/hero-section";
import { ModelsShowcase } from "@/components/landing-page/models-showcase";
import { ValueComparison } from "@/components/landing-page/value-comparison";
import { PricingSection } from "@/components/landing-page/pricing-section";
import { GradientSection } from "@/components/landing-page/gradient-section";
import { ScrollText } from "@/components/landing-page/scroll-text";
import { auth } from "./auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    return redirect("/chat");
  }

  return (
    <div className="bg-black">
      <HeroSection />
      <ScrollText />
      <ModelsShowcase />
      <ValueComparison />
      <PricingSection />
      <GradientSection />
    </div>
  );
}
