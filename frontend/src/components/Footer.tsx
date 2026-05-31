"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            {/* Premium Integrated Mini CTA Card */}
            <div 
              className="p-4 rounded-2xl bg-[#0A1128] border border-blue-900/40 text-left relative overflow-hidden backdrop-blur-sm shadow-lg shadow-blue-950/20"
              style={{
                backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px)",
                backgroundSize: "16px 16px"
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-transparent pointer-events-none"></div>
              <div className="relative z-10 space-y-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-white/90 text-[10px] font-extrabold tracking-wide uppercase">
                  <span>💪</span>
                  <span>Başlayalım</span>
                </div>
                <h5 className="text-sm font-black text-white leading-snug tracking-tight">
                  Başarıya Doğru <br />İlk Adımı Atın
                </h5>
                <div>
                  <Link
                    href="/courses"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    <span>🎓</span>
                    <span>Kurslara Kaydolun</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-4">Platform</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/courses" className="text-gray-400 hover:text-teal-400 text-sm transition-colors">
                  Kurslar
                </Link>
              </li>
              <li>
                <Link href="/egitim-programlari" className="text-gray-400 hover:text-teal-400 text-sm transition-colors">
                  Eğitim Programları
                </Link>
              </li>
              <li>
                <Link href="/teachers" className="text-gray-400 hover:text-teal-400 text-sm transition-colors">
                  Eğitmenler
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-teal-400 text-sm transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/register?role=teacher" className="text-gray-400 hover:text-teal-400 text-sm transition-colors">
                  Eğitmen Ol
                </Link>
              </li>
              <li>
                <Link href="/iletisim" className="text-gray-400 hover:text-teal-400 text-sm transition-colors">
                  İletişim
                </Link>
              </li>
            </ul>
          </div>

          {/* Kurumsal */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-4">Kurumsal</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/pages/hakkimizda" className="text-gray-400 hover:text-teal-400 text-sm transition-colors">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link href="/pages/uyelik-sozlesmesi" className="text-gray-400 hover:text-teal-400 text-sm transition-colors">
                  Üyelik Sözleşmesi
                </Link>
              </li>
              <li>
                <Link href="/pages/gizlilik" className="text-gray-400 hover:text-teal-400 text-sm transition-colors">
                  Gizlilik ve Çerez Politikası
                </Link>
              </li>
              <li>
                <Link href="/pages/KVKK-aydinlatma-metni" className="text-gray-400 hover:text-teal-400 text-sm transition-colors">
                  KVKK Aydınlatma Metni
                </Link>
              </li>
              <li>
                <Link href="/pages/mesafeli-satis-sozlesmesi" className="text-gray-400 hover:text-teal-400 text-sm transition-colors">
                  Mesafeli Satış Sözleşmesi
                </Link>
              </li>
            </ul>
          </div>

          {/* İletişim */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-4">İletişim</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-teal-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Çanakkale/Turkey</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-teal-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <a href="tel:+908508405543" className="hover:text-teal-400 transition-colors">+90 8508405543</a>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-teal-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:bilgi@bihocam.com" className="hover:text-teal-400 transition-colors">bilgi@bihocam.com</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} BiHocam. Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-gray-500 hover:text-teal-400 transition-colors" aria-label="Twitter">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="#" className="text-gray-500 hover:text-teal-400 transition-colors" aria-label="Instagram">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </a>
            <a href="#" className="text-gray-500 hover:text-teal-400 transition-colors" aria-label="YouTube">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
