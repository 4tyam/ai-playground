import Image from "next/image";
import Link from "next/link";
export function GradientSection() {
  const displayModels = [
    {
      name: "GPT-4o",
      icon: "/ai-models/openai.svg",
      provider: "openai",
    },
    {
      name: "o1-mini",
      icon: "/ai-models/openai.svg",
      provider: "openai",
    },
    {
      name: "Claude 3.5 Sonnet",
      icon: "/ai-models/anthropic.svg",
      provider: "anthropic",
    },
    {
      name: "Deepseek R1",
      icon: "/ai-models/deepseek.png",
      provider: "deepseek",
    },
    {
      name: "Mixtral 8x7B",
      icon: "/ai-models/mistral.svg",
      provider: "mistral",
    },
    {
      name: "Gemini 2.0 Flash",
      icon: "/ai-models/googlegemini.svg",
      provider: "google",
    },
  ];

  return (
    <>
      <main className="min-h-[50vh] sm:h-[45vh] bg-gradient-to-b from-black via-[#000C3D] to-[#0061FF] text-foreground p-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left side - Text content */}
          <div className="pt-6 md:pt-8">
            <h1 className="text-4xl md:text-5xl font-semibold mb-4">
              Become a<br />
              100x creator today
            </h1>
            <p className="text-gray-300/70 text-base md:text-lg mb-6">
              Get access to all leading AI models with a single plan
              <br className="hidden md:block" />
              and start creating content like never before.
            </p>
            <Link
              href="/chat"
              className="bg-white text-black px-4 py-2 text-sm rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Try for free
            </Link>
          </div>

          {/* Right side - Model Icons Grid */}
          <div className="hidden md:grid grid-cols-3 gap-3 place-content-center relative">
            {displayModels.map((model) => (
              <div
                key={model.name}
                className="bg-black/20 backdrop-blur-sm rounded-xl p-3 hover:bg-black/30 transition-all transform hover:scale-105"
              >
                <Image
                  src={model.icon}
                  alt={model.name}
                  width={32}
                  height={32}
                  className={`${
                    model.provider === "openai" ||
                    model.provider === "anthropic"
                      ? "dark:invert"
                      : ""
                  }`}
                />
                <p className="text-xs text-white/70 mt-2">{model.name}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <div className="h-[60px] bg-gradient-to-b from-[#0061FF] to-[#049DFD]" />
    </>
  );
}
