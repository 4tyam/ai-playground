import Link from "next/link";

export default function NotFound() {
  return (
    <div className="h-screen bg-black text-white flex flex-col">
      {/* Navigation */}
      <nav className="flex items-center justify-between max-w-7xl mx-auto w-full p-6">
        <Link href="/" className="text-xl sm:text-2xl font-bold">
          ai playground
        </Link>
      </nav>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        {/* Background Glow Effect */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2">
          <div className="absolute w-[600px] h-[600px] bg-gradient-to-r from-[#0061FF] to-[#19e8ff] rounded-full opacity-20 blur-[128px]" />
          <div className="absolute w-[600px] h-[600px] bg-[#112572] rounded-full opacity-30 blur-[128px] mix-blend-screen" />
        </div>

        <div className="relative text-center animate-fade-in">
          <h1 className="text-8xl font-bold mb-4">404</h1>
          <h2 className="text-2xl font-semibold mb-6">Page not found</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved. Check the URL or head back home.
          </p>
          <Link
            href="/"
            className="bg-[#0061FF] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#0061FF]/90 transition-colors inline-flex items-center gap-2"
          >
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}
