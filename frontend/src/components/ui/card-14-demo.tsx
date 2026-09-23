"use client";

import Card14Demo, { LessonPerspectiveCard } from "@/components/ui/card-14";

export default function Card14DemoUsage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-slate-950 p-6 md:p-12 space-y-12">
      <div className="text-center max-w-2xl space-y-3">
        <h2 className="text-3xl font-black text-white font-display">
          3D Perspective Flip Ders Kartları
        </h2>
        <p className="text-slate-400 text-sm">
          Fare ile üzerine gelerek (hover) kartın 3D eksende dönüşünü ve arka yüzdeki ders detaylarını inceleyebilirsiniz.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center w-full max-w-6xl">
        <LessonPerspectiveCard
          id="1"
          title="YKS Matematik: Sıfırdan Zirveye AYT Kampı"
          category="YKS / AYT"
          teacherName="Ahmet Yılmaz (Boğaziçi Mezunu)"
          rating={4.9}
          reviewCount={112}
          duration="48 Saat"
          format="Canlı 1:1"
          materials="ÖSYM Soru Bankası"
          price={1400}
          discountPrice={980}
          imageUrl="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80"
          slug="yks-matematik-ayt-kampi"
        />

        <LessonPerspectiveCard
          id="2"
          title="LGS Fen Bilimleri: Yeni Nesil Beceri Temelli Sorular"
          category="LGS Hazırlık"
          teacherName="Zeynep Kaya (ODTÜ Eğitim)"
          rating={5.0}
          reviewCount={78}
          duration="36 Saat"
          format="Birebir + Etüt"
          materials="Haftalık Deneme"
          price={1100}
          discountPrice={850}
          imageUrl="https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80"
          slug="lgs-fen-bilimleri"
        />

        <LessonPerspectiveCard
          id="3"
          title="Birebir İngilizce: Konuşma ve IELTS Sınav Pratiği"
          category="Yabancı Dil"
          teacherName="Sarah Jenkins (Native Speaker)"
          rating={4.8}
          reviewCount={95}
          duration="24 Saat"
          format="İnteraktif Canlı"
          materials="IELTS Mock Tests"
          price={1600}
          imageUrl="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"
          slug="birebir-ingilizce-ielts"
        />
      </div>
    </div>
  );
}
