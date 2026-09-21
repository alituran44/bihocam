import Link from "next/link";
import Logo from "@/components/ui/Logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-orange-50 flex flex-col">
      <header className="container mx-auto px-6 py-6">
        <Logo size="lg" variant="light" href="/" />
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
