"use client";

import Link from "next/link";
import { PlusCircle, ArrowRight, ShieldCheck } from "lucide-react";

export default function Footer({ hideCta = false }: { hideCta?: boolean }) {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand & Mini CTA */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-white font-display tracking-tight">BiHocam</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Türkiye&apos;nin Yeni Nesil Özel Ders Platformu. Doğrulanmış eğitmenlerle birebir canlı dersler ve emanet havuz güvencesi.
            </p>

            {/* Quick Action Mini Card */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                <SparklesIcon className="w-3 h-3 text-emerald-400" />
                <span>Özel Ders Talebi</span>
              </div>
              <p className="text-xs text-slate-300 font-medium leading-snug">
                İhtiyacın olan dersi belirt, eğitmenlerden bütçene uygun teklifler al.
              </p>
              <Link
                href="/tenders/new"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-sm transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Ders Talebi Aç</span>
              </Link>
            </div>
          </div>

          {/* Platform Linkleri */}
          <div>
            <h4 className="font-bold text-white text-sm mb-4">Platform</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/tenders" className="hover:text-emerald-400 transition-colors">
                  Özel Ders Talepleri
                </Link>
              </li>
              <li>
                <Link href="/teachers" className="hover:text-emerald-400 transition-colors">
                  Eğitmenler
                </Link>
              </li>
              <li>
                <Link href="/fiyatlar" className="hover:text-emerald-400 transition-colors">
                  Fiyatlar & Bütçe Planlama
                </Link>
              </li>
              <li>
                <Link href="/become-instructor" className="hover:text-emerald-400 transition-colors">
                  Eğitmen Ol
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-emerald-400 transition-colors">
                  Rehberlik & Blog
                </Link>
              </li>
              <li>
                <Link href="/iletisim" className="hover:text-emerald-400 transition-colors">
                  İletişim
                </Link>
              </li>
            </ul>
          </div>

          {/* Kurumsal ve Hukuki */}
          <div>
            <h4 className="font-bold text-white text-sm mb-4">Kurumsal</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/pages/hakkimizda" className="hover:text-emerald-400 transition-colors">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link href="/pages/uyelik-sozlesmesi" className="hover:text-emerald-400 transition-colors">
                  Üyelik Sözleşmesi
                </Link>
              </li>
              <li>
                <Link href="/pages/gizlilik" className="hover:text-emerald-400 transition-colors">
                  Gizlilik ve Çerez Politikası
                </Link>
              </li>
              <li>
                <Link href="/pages/KVKK-aydinlatma-metni" className="hover:text-emerald-400 transition-colors">
                  KVKK Aydınlatma Metni
                </Link>
              </li>
              <li>
                <Link href="/pages/mesafeli-satis-sozlesmesi" className="hover:text-emerald-400 transition-colors">
                  Mesafeli Satış Sözleşmesi
                </Link>
              </li>
            </ul>
          </div>

          {/* İletişim ve Satıcı Bilgileri (Denetim Kuralı 6) */}
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-white text-sm mb-3">İletişim</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href="tel:+908508405543" className="hover:text-emerald-400 font-mono transition-colors">
                    +90 (850) 840 55 43
                  </a>
                </li>
                <li>
                  <a href="mailto:bilgi@bihocam.com" className="hover:text-emerald-400 transition-colors">
                    bilgi@bihocam.com
                  </a>
                </li>
                <li>
                  <span>Çanakkale, Türkiye</span>
                </li>
              </ul>
            </div>

            {/* Yasal Satıcı Künyesi Placeholderları (Kullanıcı tarafından doldurulacak) */}
            <div className="pt-3 border-t border-slate-800 text-[11px] space-y-1 text-slate-500">
              <p>
                <span className="text-slate-400 font-semibold">Ünvan:</span> {"{{TICARI_UNVAN}}"}
              </p>
              <p>
                <span className="text-slate-400 font-semibold">MERSİS:</span> {"{{MERSIS_NO}}"}
              </p>
              <p>
                <span className="text-slate-400 font-semibold">Vergi No:</span> {"{{VERGI_DAIRESI_NO}}"}
              </p>
              <p>
                <span className="text-slate-400 font-semibold">Adres:</span> {"{{ACIK_ADRES}}"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="border-t border-slate-900 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} BiHocam Eğitim Teknolojileri. Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-4">
            <a
              href="https://twitter.com/bihocam"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition-colors"
              aria-label="BiHocam Twitter Hesabı"
            >
              Twitter
            </a>
            <a
              href="https://www.instagram.com/bihocam"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition-colors"
              aria-label="BiHocam Instagram Hesabı"
            >
              Instagram
            </a>
            <a
              href="https://www.youtube.com/@bihocam"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition-colors"
              aria-label="BiHocam YouTube Kanalı"
            >
              YouTube
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}
