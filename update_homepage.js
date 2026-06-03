const fs = require('fs');
const path = require('path');

const filePath = path.join('frontend', 'src', 'app', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Define variants and Marquee data
const topAdditions = `
// Animation variants
const fadeUpVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};
`;

// Insert after imports if not present
if (!content.includes('const fadeUpVariants')) {
    content = content.replace('export default function Home() {', topAdditions + '\nexport default function Home() {');
}

// Replace section tags with motion.section
content = content.replace(/<section className="py-20 /g, '<motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUpVariants} className="py-20 ');
content = content.replace(/<section className="py-24 /g, '<motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUpVariants} className="py-24 ');
content = content.replace(/<section className="py-8 /g, '<motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUpVariants} className="py-8 ');
content = content.replace(/<section className="py-12 /g, '<motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUpVariants} className="py-12 ');

const newSections = `
      </section>

      {/* Marquee Ticker */}
      <div className="bg-teal-600 text-white py-3 overflow-hidden whitespace-nowrap border-y border-teal-700/50 relative shadow-inner">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600 via-transparent to-teal-600 z-10 w-full pointer-events-none"></div>
        <motion.div 
          className="inline-block"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        >
          <div className="inline-flex gap-12 px-6 text-sm md:text-base font-semibold tracking-wide">
            <span className="flex items-center gap-2">🚀 15.000+ Aktif Öğrenci</span>
            <span className="flex items-center gap-2">⭐ 4.9 Ortalama Memnuniyet</span>
            <span className="flex items-center gap-2">👨‍🏫 100+ Seçkin Eğitmen</span>
            <span className="flex items-center gap-2">🎯 YKS'de Yüksek Başarı</span>
            <span className="flex items-center gap-2">💻 Kişiselleştirilmiş Eğitim</span>
            {/* Duplicate for seamless looping */}
            <span className="flex items-center gap-2">🚀 15.000+ Aktif Öğrenci</span>
            <span className="flex items-center gap-2">⭐ 4.9 Ortalama Memnuniyet</span>
            <span className="flex items-center gap-2">👨‍🏫 100+ Seçkin Eğitmen</span>
            <span className="flex items-center gap-2">🎯 YKS'de Yüksek Başarı</span>
            <span className="flex items-center gap-2">💻 Kişiselleştirilmiş Eğitim</span>
          </div>
        </motion.div>
      </div>

      {/* SİZE ÖZEL DERSLER */}
      <motion.section 
        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUpVariants}
        className="py-20 bg-slate-50 relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image / Checklist side */}
            <div className="relative flex justify-center">
              <div className="relative w-full max-w-sm">
                <img src="/calm_student_1780326826128.png" alt="Seçkin Öğretmenler" className="w-full object-contain drop-shadow-2xl z-0" />
                
                {/* Floating Checklists */}
                <motion.div 
                   variants={{
                     hidden: { opacity: 0, x: -50 },
                     visible: { opacity: 1, x: 0, transition: { delay: 0.3, duration: 0.5 } }
                   }}
                   className="absolute top-1/4 -right-10 md:-right-20 bg-white rounded-2xl p-4 shadow-xl border border-gray-100 flex items-center gap-3 w-64 md:w-72"
                >
                  <div className="flex-1 text-sm font-semibold text-gray-800">Seçkin öğretmen topluluğuna sahibiz.</div>
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 border-2 border-white shadow">
                     <div className="w-full h-full flex items-center justify-center text-xl">👨‍🏫</div>
                  </div>
                </motion.div>

                <motion.div 
                   variants={{
                     hidden: { opacity: 0, x: -50 },
                     visible: { opacity: 1, x: 0, transition: { delay: 0.5, duration: 0.5 } }
                   }}
                   className="absolute top-1/2 -right-6 md:-right-12 bg-white rounded-2xl p-4 shadow-xl border border-gray-100 flex items-center gap-3 w-64 md:w-72"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                     <span className="text-blue-600 font-bold">✓</span>
                  </div>
                  <div className="flex-1 text-sm font-semibold text-gray-800">Doğru öğretmenlerle eşleştiriyoruz.</div>
                </motion.div>

                <motion.div 
                   variants={{
                     hidden: { opacity: 0, x: -50 },
                     visible: { opacity: 1, x: 0, transition: { delay: 0.7, duration: 0.5 } }
                   }}
                   className="absolute bottom-1/4 -right-10 md:-right-20 bg-white rounded-2xl p-4 shadow-xl border border-gray-100 flex items-center gap-3 w-64 md:w-72"
                >
                  <div className="flex-1 text-sm font-semibold text-gray-800">Her öğrencimize özel eğitim tasarlıyoruz.</div>
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-rose-100 flex items-center justify-center text-rose-500">
                     📚
                  </div>
                </motion.div>

              </div>
            </div>

            {/* Text Side */}
            <div className="space-y-6 lg:pl-12">
              <div className="text-blue-600 font-bold uppercase tracking-wider text-sm">SİZE ÖZEL DERSLER</div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
                Seçkin öğretmenleri arasından size en uygun öğretmenleri belirliyoruz.
              </h2>
              <p className="text-slate-600 leading-relaxed font-medium">
                Burada Türkiye'nin en seçkin öğretmenlerini bir arada bulabilirsiniz. Ve her branş için bu öğretmen topluluğundan akademik ve pedagojik yönden size en uygun öğretmenleri belirleyip yine size özel eğitim metodlarını uyguluyoruz.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/hakkimizda" className="px-6 py-3 rounded-full border-2 border-orange-200 text-orange-500 font-bold hover:bg-orange-50 transition-colors">
                  Detaylı Bilgi
                </Link>
                <Link href="/tanisma-dersi" className="px-6 py-3 rounded-full bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-0.5">
                  Tanışma Dersi Al
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* SİZİ ARAYABİLİRİZ */}
      <motion.section 
        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUpVariants}
        className="py-12 bg-slate-50"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-200/50 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center justify-between">
            <div className="space-y-4 md:w-1/2">
               <div className="text-blue-600 font-bold uppercase tracking-wider text-sm">SİZİ ARAYABİLİRİZ</div>
               <h3 className="text-3xl font-black text-slate-900">Numaranızı bırakabilirsiniz.</h3>
               <p className="text-slate-700 text-sm font-medium">
                 Size aşağıdaki kurumsal iletişim hattımızdan ulaşacağız: <br />
                 <span className="font-bold text-slate-900">+90 (850) 255 20 80</span>
               </p>
            </div>
            <div className="w-full md:w-1/2 space-y-4">
               <input type="text" placeholder="Adınız ve soyadınız" className="w-full px-5 py-4 rounded-xl border border-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
               <input type="tel" placeholder="Telefon 5xx xxx xx xx" className="w-full px-5 py-4 rounded-xl border border-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
               <button className="w-full bg-orange-400 hover:bg-orange-500 text-white font-bold py-4 rounded-xl shadow-md transition-colors">
                 Arama Talebi Oluştur
               </button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Benefit Cards Section (From screenshot) */}
`;

content = content.replace('      </section>\\n\\n      {/* Benefit Cards Section (From screenshot) */}', newSections);
content = content.replace('      </section>\n\n      {/* Benefit Cards Section (From screenshot) */}', newSections);

content = content.replace(/<\/section>/g, '</motion.section>');
content = content.replace(/<section className="relative pt-32/g, '<motion.section initial="hidden" animate="visible" variants={staggerContainer} className="relative pt-32');

// Fix `<section>` without attributes or with others just in case
content = content.replace(/<section\b([^>]*)>/gi, (match, p1) => {
    if (match.includes('motion.section')) return match;
    return `<motion.section${p1}>`;
});

fs.writeFileSync(filePath, content);
console.log("Updated page.tsx successfully.");
