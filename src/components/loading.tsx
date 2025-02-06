export default function Loading() {
  const numMessages = 5;

  return (
    <main className="h-[calc(100vh-80px)] -m-4 relative">
      <div className="absolute inset-0 overflow-y-auto pb-[140px] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full dark:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 light:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-track]:bg-transparent">
        <div className="max-w-4xl mx-auto px-4 md:px-12 lg:px-24 py-8 space-y-8">
          {Array.from({ length: numMessages }).map((_, i) => (
            <div
              key={i}
              className={`flex ${
                i % 2 === 0 ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`w-1/2 rounded-2xl p-3 ${
                  i % 2 === 0
                    ? "bg-primary/5 rounded-br-none dark:bg-primary/5"
                    : "bg-muted rounded-bl-none"
                }`}
              >
                <div className="space-y-2">
                  <div
                    className={`h-3 animate-pulse rounded w-[90%] ${
                      i % 2 === 0 ? "bg-primary/10" : "bg-muted-foreground/10"
                    }`}
                  />
                  <div
                    className={`h-3 animate-pulse rounded w-[75%] ${
                      i % 2 === 0 ? "bg-primary/10" : "bg-muted-foreground/10"
                    }`}
                  />
                  <div
                    className={`h-3 animate-pulse rounded w-[60%] ${
                      i % 2 === 0 ? "bg-primary/10" : "bg-muted-foreground/10"
                    }`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-background">
        <div className="w-full max-w-4xl mx-auto px-4 md:px-12 lg:px-24">
          <div className="h-[120px] flex items-center">
            <div className="w-full h-16 bg-muted-foreground/10 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    </main>
  );
}
