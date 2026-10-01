"use client";

import { motion } from "framer-motion";
import { Award, CheckCircle2, ShieldCheck, Sparkles, Video, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function WhyBiHocamSection() {
  const cards = [
    {
      id: "teachers",
      badge: "Güvenilir Kadro",
      badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
      accentBg: "from-emerald-500/5 to-transparent",
      icon: <Award className="w-6 h-6 text-emerald-600" />,
      title: "Doğrulanmış Branş Eğitmenleri",
      description:
        "Kimlik ve diploma teyidi tamamlanmış, alanında tecrübeli eğitmenlerle birebir çalışırsın. Eğitmenini profillerini ve uzmanlık alanlarını inceleyerek güvenle seçebilirsin.",
      link: "/teachers",
      linkText: "Eğitmenleri Keşfet",
    },
    {
      id: "escrow",
      badge: "Finansal Güvence",
      badgeColor: "bg-teal-50 text-teal-800 border-teal-200/80",
      accentBg: "from-teal-500/5 to-transparent",
      icon: <ShieldCheck className="w-6 h-6 text-teal-600" />,
      title: "Emanet Havuz Ödeme Güvencesi",
      description:
        "Ödemen, eğitmenle dersini tamamlayıp onaylayana kadar {{ODEME_KURULUSU_ADI}} korumalı emanet havuzda güvende kalır. Mesafeli satış sözleşmesi hükümlerine uygun yasal güvence sağlanır.",
      link: "/pages/mesafeli-satis-sozlesmesi",
      linkText: "Sözleşme Şartlarını Gör",
    },
    {
      id: "live-session",
      badge: "Modern Altyapı",
      badgeColor: "bg-indigo-50 text-indigo-800 border-indigo-200/80",
      accentBg: "from-indigo-500/5 to-transparent",
      icon: <Video className="w-6 h-6 text-indigo-600" />,
      title: "Kurulumsuz Canlı Ders & Düzenli Takip",
      description:
        "Ek program indirmeden doğrudan tarayıcından interaktif canlı derse bağlanırsın. Her ders sonrası eğitmenin notu ve haftalık özet raporla gelişimini düzenli takip edersin.",
      link: "/tenders/new",
      linkText: "Ders Talebi Aç",
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-white border-b border-slate-100 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>GÜVENİLİR EĞİTİM</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 font-display tracking-tight leading-[1.12]">
            Neden BiHocam&apos;ı Tercih Etmelisin?
          </h2>
          <p className="text-slate-600 font-normal text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Hedeflerine güvenle ve verimli şekilde ulaşman için oluşturduğumuz 3 temel platform güvencesi:
          </p>
        </div>

        {/* 3 Value Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {cards.map((card, i) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className={`relative rounded-3xl border border-slate-200/90 bg-gradient-to-b ${card.accentBg} bg-white p-8 flex flex-col justify-between shadow-xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 overflow-hidden`}
            >
              <div>
                {/* Top Badge & Icon */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                    {card.icon}
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${card.badgeColor}`}>
                    {card.badge}
                  </span>
                </div>

                {/* Card Title */}
                <h3 className="text-xl font-bold text-slate-900 mb-3 leading-snug tracking-tight font-display">
                  {card.title}
                </h3>

                {/* Card Description */}
                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  {card.description}
                </p>
              </div>

              {/* Bottom Link */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href={card.link}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
                >
                  <span>{card.linkText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
