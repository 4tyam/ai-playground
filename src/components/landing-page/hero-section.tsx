"use client";

import { motion } from "motion/react";
import { ContainerIcon, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

type ModelProvider = {
  name: string;
  invert: boolean;
  isPng?: boolean;
};

const MODEL_PROVIDERS: ModelProvider[] = [
  { name: "openai", invert: true },
  { name: "anthropic", invert: true },
  { name: "mistral", invert: false },
  { name: "deepseek", invert: false, isPng: true },
  { name: "googlegemini", invert: false },
];

export function HeroSection() {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAuth = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn("github", { callbackUrl: "/chat" });
    } catch (error) {
      console.error("Authentication error:", error);
    }
  };

  if (!mounted) {
    return <div className="h-screen bg-black" />;
  }

  return (
    <section className="h-screen bg-black text-white p-6 flex flex-col overflow-hidden relative">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between max-w-7xl mx-auto w-full"
      >
        <span className="text-xl sm:text-2xl font-bold">ai playground</span>
        <div className="flex items-center gap-4">
          <a
            href="#"
            onClick={handleAuth}
            className="bg-white text-black px-3.5 py-1.5 text-sm rounded-lg font-medium hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading</span>
              </>
            ) : (
              "Sign up"
            )}
          </a>
        </div>
      </motion.nav>

      {/* Hero Content */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto text-center relative -mt-16">
        {/* Background Glow Effects */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2">
          <div className="absolute w-[600px] h-[600px] bg-gradient-to-r from-[#0061FF] to-[#19e8ff] rounded-full opacity-20 blur-[128px]" />
          <div className="absolute w-[600px] h-[600px] bg-[#112572] rounded-full opacity-30 blur-[128px] mix-blend-screen" />
        </div>

        <div className="relative">
          <motion.h1
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl sm:text-8xl leading-tight font-semibold tracking-tight mb-6"
          >
            Stop using{" "}
            <span className="relative inline-block">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="relative z-10"
              >
                10 different
              </motion.span>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.2 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="absolute inset-0 bg-gradient-to-r from-[#0061FF] to-[#60EFFF] blur-xl"
              />
            </span>
            <br />
            AI chat apps
          </motion.h1>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-4">
            <a
              href="#"
              className="bg-[#0061FF] text-white px-5 py-2.5 text-sm rounded-lg font-medium hover:bg-[#0061FF]/90 transition-colors"
              onClick={handleAuth}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading</span>
                </div>
              ) : (
                "Start for free"
              )}
            </a>
            <a
              href="#models"
              className="bg-white/10 text-white px-5 py-2.5 text-sm rounded-lg font-medium hover:bg-white/20 transition-colors flex items-center gap-2"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("models")?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
            >
              <span>View models</span>
              <ContainerIcon className="w-4 h-4" />
            </a>
          </div>

          {/* Model Logos */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="mt-auto pt-20"
          >
            <p className="text-sm text-gray-500 mb-6">
              Supported AI models and platforms
            </p>
            <div className="flex justify-center items-center gap-8 flex-wrap">
              {MODEL_PROVIDERS.map((provider, index) => (
                <motion.div
                  key={provider.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 0.5, y: 0 }}
                  transition={{ duration: 0.3, delay: 1.2 + index * 0.1 }}
                  whileHover={{ opacity: 1 }}
                >
                  <Image
                    src={`/ai-models/${provider.name}.${
                      provider.isPng ? "png" : "svg"
                    }`}
                    alt={provider.name}
                    width={24}
                    height={24}
                    className={provider.invert ? "dark:invert" : ""}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
