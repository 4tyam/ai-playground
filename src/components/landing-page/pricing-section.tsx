"use client";

export function PricingSection() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for trying out the platform",
      features: [
        "3 AI models",
        "100 messages per day",
        "Basic support",
        "1 concurrent chat",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Pro",
      price: "$20",
      period: "/month",
      description: "Best for individual developers",
      features: [
        "All AI models",
        "Unlimited messages",
        "Priority support",
        "5 concurrent chats",
        "API access",
        "Custom instructions",
      ],
      cta: "Purchase",
      popular: true,
    },
  ];

  return (
    <section className="bg-black text-white py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-semibold mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-gray-400 text-lg">
            Choose the plan that&apos;s right for you
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative ${
                plan.popular
                  ? "p-[3.5px] rounded-xl bg-gradient-to-r animate-border"
                  : ""
              }`}
              style={
                plan.popular
                  ? {
                      backgroundImage:
                        "linear-gradient(var(--angle), #0061FF, #60EFFF, #0061FF)",
                      animation: "rotate-gradient 4s linear infinite",
                    }
                  : undefined
              }
            >
              <div
                className={`relative h-full bg-[#0A0A0A] rounded-xl p-8 
                  ${!plan.popular && "border border-gray-800"} 
                  hover:border-gray-700 transition-colors`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#0061FF] text-white text-xs rounded-full">
                    Most Popular
                  </span>
                )}

                <div className="mb-8">
                  <h3 className="text-xl font-medium mb-2">{plan.name}</h3>
                  <div className="flex items-baseline mb-2">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && (
                      <span className="text-gray-400 ml-1">{plan.period}</span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center text-sm">
                      <svg
                        className="w-5 h-5 text-[#0061FF] mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors
                    ${
                      plan.popular
                        ? "bg-[#0061FF] text-white hover:bg-[#0061FF]/90"
                        : "bg-white text-black hover:bg-gray-100"
                    }`}
                >
                  {plan.cta}
                </button>
              </div>
            </div>
          ))}
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
