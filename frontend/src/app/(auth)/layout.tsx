import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-orange-50 flex flex-col">
      <header className="container mx-auto px-6 py-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
            <span className="text-white font-bold text-lg">B</span>
          </div>
          <span className="text-xl font-bold text-gray-900">BiHocam</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        {children}
      </main>

      <footer className="container mx-auto px-6 py-6 text-center text-gray-500 text-sm">
        &copy; 2025 BiHocam. Tüm hakları saklıdır.
      </footer>
    </div>
  );
}
