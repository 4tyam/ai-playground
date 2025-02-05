import ReactMarkdown, { Components } from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import type { ComponentPropsWithoutRef } from "react";
import { useState } from "react";
import { ChevronDown, ChevronUp, Check, Copy } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface CodeProps extends ComponentPropsWithoutRef<"code"> {
  inline?: boolean;
}

export default function FormattedMessage({ content }: { content: string }) {
  const [showReasoning, setShowReasoning] = useState(false);

  // Custom renderer for the think tags
  const renderContent = (text: string) => {
    const parts = text.split(/(<think>[\s\S]*?<\/think>)/);

    return parts.map((part, index) => {
      if (part.startsWith("<think>") && part.endsWith("</think>")) {
        const reasoningContent = part.slice(7, -8).trim();

        return (
          <div key={index}>
            <div className="rounded-lg">
              <button
                onClick={() => setShowReasoning(!showReasoning)}
                className="w-full px-3 py-1.5 flex items-center gap-1.5 text-sm text-gray-500"
              >
                <span className="font-medium">AI Reasoning</span>
                {showReasoning ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </button>
              {showReasoning && (
                <div className="px-3 pb-2 text-sm text-gray-500">
                  <ReactMarkdown components={components}>
                    {reasoningContent}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        );
      }

      return part ? (
        <ReactMarkdown key={index} components={components}>
          {part}
        </ReactMarkdown>
      ) : null;
    });
  };

  const CodeBlock = ({
    language,
    content,
  }: {
    language: string;
    content: string;
  }) => {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy text: ", err);
      }
    };

    return (
      <div className="not-prose relative my-3 pb-4 last:mb-0">
        <div className="rounded-t-md overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-zinc-800/90 text-zinc-400 text-xs">
            <span className="font-medium">{language}</span>
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1 hover:text-zinc-200 transition-colors"
                  >
                    {copied ? (
                      <div className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5" />
                        Copied
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <Copy className="h-3.5 w-3.5" />
                        Copy
                      </div>
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy to clipboard</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <div className="rounded-b-md overflow-hidden bg-[#282c34]">
          <SyntaxHighlighter
            style={oneDark}
            language={language}
            PreTag="div"
            customStyle={{
              margin: 0,
              background: "transparent",
              padding: "0.75rem 1rem",
              fontSize: "0.875rem",
              lineHeight: "1.5",
            }}
            codeTagProps={{
              style: {
                fontSize: "inherit",
                lineHeight: "inherit",
              },
            }}
          >
            {content}
          </SyntaxHighlighter>
        </div>
      </div>
    );
  };

  const components: Components = {
    p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
    h1: ({ children }) => (
      <h1 className="text-2xl font-bold mb-3">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-xl font-bold mb-2">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-lg font-bold mb-2">{children}</h3>
    ),
    ul: ({ children }) => (
      <ul className="list-disc ml-6 mb-3 last:mb-0 space-y-1">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal ml-6 mb-3 last:mb-0 space-y-1">{children}</ol>
    ),
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 my-3 italic">
        {children}
      </blockquote>
    ),
    code: ({ inline, className, children }: CodeProps) => {
      const match = /language-(\w+)/.exec(className || "");

      if (inline) {
        return (
          <code className="px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-200 font-mono text-sm">
            {children}
          </code>
        );
      }

      const content = String(children).replace(/\n$/, "");
      const shouldBeCodeBlock =
        !inline && (content.includes("\n") || content.length > 50 || match);

      if (shouldBeCodeBlock) {
        const language = match ? match[1] : "";
        return <CodeBlock language={language} content={content} />;
      }

      return (
        <code className="px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-200 font-mono text-sm">
          {children}
        </code>
      );
    },
  };

  return (
    <div className="w-full prose prose-sm dark:prose-invert max-w-none">
      {renderContent(content)}
      <style jsx global>{`
        pre {
          margin: 0 !important;
          padding: 0 !important;
        }
        .prose pre {
          margin: 0 !important;
          padding: 0 !important;
        }
      `}</style>
    </div>
  );
}
