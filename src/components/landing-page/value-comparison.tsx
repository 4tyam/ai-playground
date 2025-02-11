"use client";

import Image from "next/image";

export function ValueComparison() {
  const competitors = [
    {
      name: "ChatGPT Plus",
      icon: "/ai-models/openai.svg",
      price: "$20",
      invertIcon: true,
    },
    {
      name: "Claude Pro",
      icon: "/ai-models/anthropic.svg",
      price: "$20",
      invertIcon: true,
    },
    {
      name: "Mistral",
      icon: "/ai-models/mistral.svg",
      price: "$15",
      invertIcon: false,
    },
  ];

  return (
    <section className="bg-black text-white py-24 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-semibold mb-4">
          Why pay for multiple subscriptions?
        </h2>
        <p className="text-gray-400 text-lg mb-16">
          Get access to all leading AI models with a single plan
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {competitors.map((competitor) => (
            <div
              key={competitor.name}
              className="bg-[#0A0A0A] rounded-xl p-6 border border-gray-800"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <Image
                  src={competitor.icon}
                  alt={competitor.name}
                  width={24}
                  height={24}
                  className={competitor.invertIcon ? "dark:invert" : ""}
                />
                <span className="text-lg font-medium">{competitor.name}</span>
              </div>
              <p className="text-3xl font-bold text-gray-300">
                {competitor.price}
              </p>
              <p className="text-sm text-gray-500 mt-1">per month</p>
            </div>
          ))}
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-800"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-black px-4 text-lg text-gray-400">or</span>
          </div>
        </div>

        <div
          className="mt-16 p-[3.5px] rounded-xl bg-gradient-to-r relative max-w-lg mx-auto"
          style={{
            backgroundImage:
              "linear-gradient(var(--angle), #0061FF, #60EFFF, #0061FF)",
            animation: "rotate-gradient 4s linear infinite",
          }}
        >
          <div className="bg-[#0A0A0A] rounded-xl p-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Image
                src="/ai-models/openai.svg"
                alt="AI Playground"
                width={32}
                height={32}
                className="dark:invert"
              />
              <span className="text-xl font-medium">AI Playground Pro</span>
            </div>
            <p className="text-4xl font-bold text-white mb-2">$20</p>
            <p className="text-gray-400">
              Access all models in one subscription
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @property --angle {
          syntax: "<angle>";
          initial-value: 0deg;
          inherits: false;
        }

        @keyframes rotate-gradient {
          to {
            --angle: 360deg;
          }
        }
      `}</style>
    </section>
  );
}
