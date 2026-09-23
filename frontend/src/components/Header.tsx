"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { useQuery } from "@tanstack/react-query";
import { cartApi } from "@/lib/api";
import Avatar from "@/components/Avatar";
import NotificationBell from "./NotificationBell";
import Logo from "@/components/ui/Logo";
import { 
  ShoppingBag, 
  Menu, 
  X, 
  LayoutDashboard, 
  BookOpen, 
  Settings, 
  LogOut, 
  Sparkles,
  PlusCircle
} from "lucide-react";

const navItems = [
  { label: "Özel Ders Talepleri", href: "/tenders" },
  { label: "Kurslar", href: "/courses" },
  { label: "Eğitim Programları", href: "/egitim-programlari" },
  { label: "Eğitmenler", href: "/teachers" },
  { label: "Blog", href: "/blog" },
  { label: "İletişim", href: "/iletisim" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();

  // Get cart count
  const { data: cartItems } = useQuery({
    queryKey: ["cart"],
    queryFn: () => cartApi.getCart(),
    enabled: isAuthenticated,
  });

  const cartCount = cartItems?.length || 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-white/90 backdrop-blur-xl border-b border-slate-200/90 shadow-sm shadow-slate-200/40" 
          : "bg-white/80 backdrop-blur-md border-b border-slate-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between h-20">
          {/* Logo with Brand Glow */}
          <div className="flex items-center">
            <Logo size="md" variant="light" href="/" />
          </div>

          {/* Desktop Nav - 21st.dev Minimalist Links */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-100/90 p-1.5 rounded-full border border-slate-200/90 backdrop-blur-md">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 ${
                    active 
                      ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Right Action Icons & Auth */}
          <div className="flex items-center gap-3">
            {/* Quick Action: New Request Button */}
            <Link
              href="/tenders/new"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ders Talebi Aç</span>
            </Link>

            {isAuthenticated && (
              <NotificationBell />
            )}

            {/* Cart Icon */}
            <Link 
              href="/cart" 
              aria-label="Alışveriş Sepeti"
              className="relative p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-[10px] font-bold text-slate-950 rounded-full flex items-center justify-center shadow-md">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>

            {/* Authenticated User Menu */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-label="Kullanıcı Profil Menüsü"
                  aria-expanded={userMenuOpen}
                  className="flex items-center gap-2 p-1 rounded-xl border border-slate-200 hover:border-emerald-500/40 bg-slate-50 transition-all"
                >
                  <Avatar
                    src={(user as any).avatar_url}
                    name={user.full_name}
                    size="sm"
                    className="ring-2 ring-emerald-500/30"
                  />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="font-bold text-slate-900 text-sm">{user.full_name}</p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
                    </div>
                    <div className="py-2">
                      <Link 
                        href="/dashboard" 
                        className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                        Kontrol Paneli
                      </Link>
                      <Link 
                        href="/dashboard/student/tenders" 
                        className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                      >
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        Ders Taleplerim
                      </Link>
                      <Link 
                        href="/dashboard/my-courses" 
                        className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                      >
                        <BookOpen className="w-4 h-4 text-teal-600" />
                        Kurslarım
                      </Link>
                      <Link 
                        href="/dashboard/settings" 
                        className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        Ayarlar
                      </Link>
                    </div>
                    <div className="border-t border-slate-100 pt-1">
                      <button 
                        onClick={() => logout()} 
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-rose-600" />
                        Çıkış Yap
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                <Link 
                  href="/login" 
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Giriş
                </Link>
                <Link 
                  href="/register" 
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-full shadow-sm transition-all"
                >
                  Ücretsiz Başla
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Gezinme menüsünü kapat" : "Gezinme menüsünü aç"}
              aria-expanded={mobileOpen}
              className="lg:hidden p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 shadow-xl px-4 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    active 
                      ? "bg-emerald-50 text-emerald-700 font-bold border border-emerald-200" 
                      : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href="/tenders/new"
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span>Ders Talebi Aç</span>
            </Link>

            {!isAuthenticated ? (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link 
                  href="/login" 
                  className="w-full py-2.5 text-center text-xs font-bold text-slate-700 bg-slate-100 rounded-xl"
                >
                  Giriş
                </Link>
                <Link 
                  href="/register" 
                  className="w-full py-2.5 text-center text-xs font-bold text-white bg-emerald-600 rounded-xl shadow-sm"
                >
                  Kayıt Ol
                </Link>
              </div>
            ) : (
              <Link 
                href="/dashboard" 
                className="w-full py-2.5 text-center text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl"
              >
                Kontrol Paneline Git
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
