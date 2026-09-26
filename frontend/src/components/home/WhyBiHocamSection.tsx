"use client";

import { motion } from "framer-motion";
import { Award, CheckCircle2, MessageSquare, Shield, Sparkles, TrendingUp, Users } from "lucide-react";

export default function WhyBiHocamSection() {
  const cards = [
    {
      id: "teachers",
      badge: "Gerçek Saha Tecrübesi",
      badgeColor: "bg-rose-50 text-rose-700 border-rose-200/80",
      iconColor: "text-rose-600 bg-rose-100/70 border-rose-200",
      accentBg: "from-rose-500/5 to-transparent",
      title: "Alanında Aktif Akademisyen & Uzmanlar",
      description:
        "Yalnızca teorik anlatanlar değil; güncel sınav sisteminin püf noktalarına ve sektöre hakim, 4 aşamalı denetimden geçmiş seçkin eğitimciler.",
      graphic: (
        <div className="flex items-end gap-1.5 h-12 pt-2">
          <div className="w-3 bg-rose-200 rounded-t h-4" />
          <div className="w-3 bg-rose-300 rounded-t h-7" />
          <div className="w-3 bg-rose-400 rounded-t h-9" />
          <div className="w-3 bg-rose-500 rounded-t h-12" />
        </div>
      ),
    },
    {
      id: "curriculum",
      badge: "Hedefe Odaklı 1:1",
      badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
      iconColor: "text-indigo-600 bg-indigo-100/70 border-indigo-200",
      accentBg: "from-indigo-500/5 to-transparent",
      title: "Yarım Kalmayan, Kişiye Özel Yol Haritası",
      description:
        "Standart video paketleri gibi bir kenara atılmaz. Öğrencinin seviyesine, eksiklerine ve hedefine göre haftalık esnek canlı seanslarla planlanır.",
      graphic: (
        <div className="flex items-center justify-center h-12">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 flex items-center justify-center font-mono text-xs font-bold text-indigo-700">
            %100
          </div>
        </div>
      ),
    },
    {
      id: "feedback",
      badge: "Şeffaf Takip",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200/80",
      iconColor: "text-amber-600 bg-amber-100/70 border-amber-200",
      accentBg: "from-amber-500/5 to-transparent",
      title: "Gerçek Geri Bildirim & Veli Raporlaması",
      description:
        "Her seans sonunda çözülen sorular, eksik kazanımlar ve ödev takip durumları veli ve öğrenciye şeffaf gelişim raporu olarak iletilir.",
      graphic: (
        <div className="flex items-center gap-1.5 h-12 px-3 py-1.5 rounded-xl bg-amber-100/50 border border-amber-200/60 text-xs font-semibold text-amber-800">
          <MessageSquare className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Anlık Raporlama</span>
        </div>
      ),
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-white border-b border-slate-100 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>NEDEN BİHOCAM?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 font-display tracking-tight leading-[1.12]">
            Öğrencilerimiz Neden Bizi Tercih Ediyor?
          </h2>
          <p className="text-slate-600 font-normal text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Bir eğitimin yarım kalmasıyla hedefe ulaştırması arasındaki 3 kritik fark:
          </p>
        </div>

        {/* 3 Value Cards Grid (Aniq-UI Style) */}
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
                {/* Top Badge */}
                <div className="flex items-center justify-between mb-6">
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

              {/* Bottom Subtle Graphic & Decorative Area */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">BiHocam Güvencesi</span>
                {card.graphic}
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
