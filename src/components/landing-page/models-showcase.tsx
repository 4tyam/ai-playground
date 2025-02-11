import Image from "next/image";
import { models } from "@/lib/models";

export function ModelsShowcase() {
  return (
    <section
      id="models"
      className="bg-black text-white py-20 px-6 scroll-mt-16"
    >
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-semibold mb-12 text-center">
          Access to all the best AI models in one place
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {models.map((model) => (
            <div
              key={model.id}
              className="bg-[#0A0A0A] rounded-xl p-6 hover:bg-[#111111] transition-colors"
            >
              <div className="flex items-center gap-4 mb-4">
                <Image
                  src={model.icon}
                  alt={model.name}
                  width={32}
                  height={32}
                  className={
                    model.provider === "openai" ||
                    model.provider === "anthropic"
                      ? "dark:invert"
                      : ""
                  }
                />
                <div>
                  <h3 className="font-medium">{model.name}</h3>
                  <p className="text-sm text-gray-400">{model.company}</p>
                </div>
              </div>

              {model.info && (
                <p className="text-sm text-gray-400 mb-4">{model.info}</p>
              )}

              <div className="flex flex-wrap gap-2">
                {model.tags
                  ?.filter((tag) => !tag.name.includes("Price"))
                  .map((tag) => (
                    <span
                      key={tag.name}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${tag.color}20`,
                        color: tag.color,
                      }}
                    >
                      {typeof tag.icon === "string" ? (
                        tag.icon
                      ) : (
                        <tag.icon className="w-3 h-3" />
                      )}
                      {tag.name}
                    </span>
                  ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-xl font-semibold">
            ... and more models added constantly
          </p>
          {/* <p className="text-sm text-gray-500 mt-2">
            We constantly update our model selection to include the latest and
            best performing AI models
          </p> */}
        </div>
      </div>
    </section>
  );
}
