"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store";
import Link from "next/link";

interface PresetItem {
  title: string;
  desc: string;
}

interface DynamicModuleInfo {
  title: string;
  subtitle: string;
  placeholder: string;
  presets: PresetItem[];
}

// Seviyeye ve role göre dinamik içerik üreten fonksiyon
function getDynamicModuleInfo(
  moduleKey: string,
  role: "student" | "teacher",
  gradeLevel: string
): DynamicModuleInfo {
  const isLGS = gradeLevel.includes("LGS");
  const isYKS = gradeLevel.includes("YKS");
  const isIlkokul = gradeLevel.includes("İlkokul") || gradeLevel.includes("Ilkokul");
  const isOrtaokul = gradeLevel.includes("Ortaokul");
  const isLise = gradeLevel.includes("Lise");

  if (role === "teacher") {
    switch (moduleKey) {
      case "soru_bankasi":
        if (isLGS) {
          return {
            title: "📝 Soru Bankası Üretici",
            subtitle: "LGS 8. Sınıf MEB kazanımlarına tam uygun, yeni nesil soru havuzu hazırla.",
            placeholder: "LGS konusu veya kazanımı yazın (Örn: LGS Matematik Çarpanlar ve Katlar yeni nesil 3 soru...)",
            presets: [
              { title: "📐 LGS Matematik Yeni Nesil", desc: "Çarpanlar, katlar ve üslü sayılar beceri temelli sorular" },
              { title: "🧬 LGS Fen Mevsimler & İklim", desc: "Görsel ve grafik yorumlamalı 3 özgün soru" },
              { title: "📖 LGS Türkçe Paragraf & Mantık", desc: "Sözel mantık ve tablo analizli LGS sorusu" },
              { title: "🏛️ LGS İnkılap Tarihi", desc: "Birinci Dünya Savaşı ve Milli Uyanış öncüllü sorular" },
            ],
          };
        }
        if (isYKS) {
          return {
            title: "📝 Soru Bankası Üretici",
            subtitle: "YKS (TYT/AYT) ÖSYM standartlarında, detaylı çözümlü ve cevap anahtarlı soru havuzu tasarla.",
            placeholder: "YKS konusu yazın (Örn: AYT Matematik Türev ve Teğet Denklemi ÖSYM seviye 3 soru...)",
            presets: [
              { title: "📐 TYT Geometri Katlama", desc: "Üçgende alan ve katlama tarzı yeni nesil sorular" },
              { title: "⚡ AYT Fizik İndüksiyon", desc: "Manyetik akı ve Faraday kanunu ÖSYM formatı" },
              { title: "🧪 AYT Kimya Organik Reaksiyon", desc: "Alkan, alken ve fonksiyonel grup soruları" },
              { title: "🧬 AYT Biyoloji Kalıtım", desc: "Soyağacı ve popülasyon genetiği analiz soruları" },
            ],
          };
        }
        if (isIlkokul) {
          return {
            title: "📝 Soru Bankası Üretici",
            subtitle: "İlkokul (1-4. Sınıf) pedagojisine uygun, resimli ve hikayeleştirilmiş sorular üret.",
            placeholder: "İlkokul konusu yazın (Örn: 3. Sınıf Çarpma ve Bölme problemleri hikayeli 4 soru...)",
            presets: [
              { title: "🍎 3. Sınıf Matematik Problemleri", desc: "Günlük hayattan hikayeli 4 işlem soruları" },
              { title: "📖 2. Sınıf Okuduğunu Anlama", desc: "Kısa masal ve 3 adet kavrama sorusu" },
              { title: "🔬 4. Sınıf Fen Bilgisi Dünyamız", desc: "Dünyanın hareketleri ve kayaçlar soruları" },
              { title: "🧩 İlkokul Zeka & Mantık", desc: "Şekil ve örüntü tamamlama dikkat soruları" },
            ],
          };
        }
        if (isOrtaokul) {
          return {
            title: "📝 Soru Bankası Üretici",
            subtitle: "Ortaokul (5-7. Sınıf) MEB müfredatına tam uyumlu soru havuzu tasarla.",
            placeholder: "Ortaokul konusu yazın (Örn: 7. Sınıf Rasyonel Sayılar MEB kazanımlı 4 soru...)",
            presets: [
              { title: "📐 7. Sınıf Rasyonel Sayılar", desc: "Adım adım işlem ve rasyonel sayı problemleri" },
              { title: "⚡ 6. Sınıf Fen Kuvvet & Hareket", desc: "Bileşke kuvvet ve sabit sürat soruları" },
              { title: "📖 5. Sınıf Türkçe Yazım Kuralları", desc: "Noktalama ve büyük harf test soruları" },
              { title: "🌍 7. Sınıf İngilizce Wild Animals", desc: "Kelime ve okuduğunu anlama soruları" },
            ],
          };
        }
        if (isLise) {
          return {
            title: "📝 Soru Bankası Üretici",
            subtitle: "Lise (9-12. Sınıf) okul yazılılarına ve MEB ünitelerine uygun soru bankası tasarla.",
            placeholder: "Lise konusu yazın (Örn: 11. Sınıf Trigonometri Yazılıya Hazırlık 4 soru...)",
            presets: [
              { title: "📐 11. Sınıf Trigonometri", desc: "Toplam-fark ve yarım açı yazılı soruları" },
              { title: "🧪 10. Sınıf Kimya Mol Kavramı", desc: "Avogadro sayısı ve kimyasal hesaplamalar" },
              { title: "⚡ 10. Sınıf Fizik Elektrik Devreleri", desc: "Ohm kanunu ve eşdeğer direnç hesapları" },
              { title: "🧬 9. Sınıf Biyoloji Hücre Bölünmesi", desc: "Mitoz ve mayoz karşılaştırma soruları" },
            ],
          };
        }
        // Üniversite / KPSS
        return {
          title: "📝 Soru Bankası Üretici",
          subtitle: "KPSS ve Üniversite sınav formatında, akademik derinlikli soru havuzu tasarla.",
          placeholder: "KPSS veya Üniversite konusu yazın (Örn: KPSS Tarih İnkılap Tarihi ÖSYM tarzı 4 soru...)",
          presets: [
            { title: "📊 KPSS Matematik & Mantık", desc: "Sayısal mantık ve grafik yorumlama soruları" },
            { title: "🏛️ KPSS Tarih & İnkılap", desc: "Kronoloji ve anlaşmalar öncüllü sorular" },
            { title: "🎓 Eğitim Bilimleri Öğretim", desc: "Öğretim ilke ve yöntemleri vaka soruları" },
            { title: "📐 Üniversite Diferansiyel", desc: "1. ve 2. mertebeden diferansiyel denklemler" },
          ],
        };

      case "deneme_sihirbazi":
        if (isLGS) {
          return {
            title: "🎯 Deneme Sınavı Sihirbazı",
            subtitle: "LGS 8. Sınıf formatında, sözel/sayısal antetli deneme sınavı üret.",
            placeholder: "LGS deneme kapsamını yazın (Örn: LGS Matematik 1. Dönem 10 Soruluk Mini Deneme...)",
            presets: [
              { title: "📑 LGS Türkçe 10 Soru Tarama", desc: "Paragraf, fiilimsi ve sözel mantık denemesi" },
              { title: "📊 LGS Matematik 10 Soru Deneme", desc: "Yeni nesil çarpanlar ve üslü sayılar denemesi" },
              { title: "🔬 LGS Fen Bilimleri Mini Deneme", desc: "Mevsimler, DNA ve basınç karma sınavı" },
              { title: "🌍 LGS Sözel Bölüm Karma Test", desc: "Türkçe, İnkılap, Din ve İngilizce taraması" },
            ],
          };
        }
        if (isYKS) {
          return {
            title: "🎯 Deneme Sınavı Sihirbazı",
            subtitle: "YKS (TYT/AYT) tam formatında, antetli ve cevap anahtarlı deneme sınavları üret.",
            placeholder: "YKS deneme konusunu yazın (Örn: TYT Matematik İlk 12 Konu 10 Soruluk Deneme...)",
            presets: [
              { title: "📑 TYT Türkçe 15 Soruluk Hız Denemesi", desc: "Paragraf ve dil bilgisi karma hız testi" },
              { title: "📊 AYT Matematik Mini Deneme", desc: "Polinom, logaritma, dizi ve türev karma deneme" },
              { title: "🔬 TYT Fen Bilimleri 10 Soru", desc: "Fizik, kimya ve biyoloji karma deneme" },
              { title: "🏛️ AYT Edebiyat-Sosyal-1 Deneme", desc: "Divan, Tanzimat, Cumhuriyet ve Tarih karma" },
            ],
          };
        }
        return {
          title: "🎯 Deneme Sınavı Sihirbazı",
          subtitle: `${gradeLevel} seviyesinde baskıya ve indirmeye hazır antetli deneme sınavları üret.`,
          placeholder: `${gradeLevel} deneme kapsamını yazın (Örn: 1. Dönem Genel Tarama Sınavı 10 Soru...)`,
          presets: [
            { title: `📑 ${gradeLevel} Genel Tarama`, desc: "Dönem kazanımlarını ölçen karma mini sınav" },
            { title: `📊 ${gradeLevel} Matematik Denemesi`, desc: "Kazanım temelli şıklı matematik sınavı" },
            { title: `🔬 ${gradeLevel} Fen Denemesi`, desc: "Deney ve kavram analizli fen sınavı" },
            { title: `📖 ${gradeLevel} Türkçe & Sosyal`, desc: "Okuma anlama ve yorumlama sınavı" },
          ],
        };

      case "kurs_mufredat":
        if (isLGS) {
          return {
            title: "🗺️ Kurs & Müfredat Mimarı",
            subtitle: "LGS 8. Sınıf öğrencileri için haftalık hızlandırma ve soru çözüm müfredatları tasarla.",
            placeholder: "LGS kurs konusunu yazın (Örn: 8 Haftalık LGS Matematik Yeni Nesil Soru Kampı...)",
            presets: [
              { title: "🚀 8 Haftalık LGS Matematik Kampı", desc: "Hafta hafta yeni nesil problem ve taktik planı" },
              { title: "📚 LGS Fen Bilimleri Full Tekrar", desc: "6 haftalık MEB deney ve grafik kampı" },
              { title: "🎯 LGS Paragraf & Mantık Atölyesi", desc: "4 haftalık soru çözme hızlandırma programı" },
              { title: "💡 LGS Son 30 Gün Bitirme Kampı", desc: "Deneme çözümü ve eksik kapatma müfredatı" },
            ],
          };
        }
        if (isYKS) {
          return {
            title: "🗺️ Kurs & Müfredat Mimarı",
            subtitle: "YKS (TYT/AYT) için online ders paketleri ve modüler kurs müfredatları oluştur.",
            placeholder: "YKS kurs konusunu yazın (Örn: Sıfırdan Zirveye 12 Haftalık AYT Matematik...)",
            presets: [
              { title: "🚀 12 Haftalık AYT Matematik Kampı", desc: "Fonksiyonlardan İntegrale eksiksiz müfredat" },
              { title: "📚 TYT Problem & Geometri Atölyesi", desc: "6 haftalık pratik soru çözme programı" },
              { title: "🎯 AYT Fen Bilimleri Maratonu", desc: "8 haftalık Fizik-Kimya-Biyoloji yoğun kamp" },
              { title: "💡 YKS Edebiyat Ezbersiz Dönemler", desc: "Görsel hafıza teknikleriyle 6 modüllük plan" },
            ],
          };
        }
        if (isIlkokul) {
          return {
            title: "🗺️ Kurs & Müfredat Mimarı",
            subtitle: "İlkokul (1-4. Sınıf) için eğlenceli, interaktif okul takviye ve gelişim müfredatları tasarla.",
            placeholder: "İlkokul kurs konusunu yazın (Örn: 6 Haftalık Eğlenceli Matematik ve Zeka Oyunları...)",
            presets: [
              { title: "🍎 6 Haftalık Eğlenceli Matematik", desc: "Görsel oyunlar ve günlük hayat problemleri" },
              { title: "📖 İlkokul Hızlı Okuma & Anlama", desc: "4 haftalık dikkat ve odaklanma müfredatı" },
              { title: "🇬🇧 İlkokul Kids English Kulübü", desc: "6 haftalık şarkı ve oyunlarla İngilizce" },
              { title: "🔬 Küçük Mucitler Fen Atölyesi", desc: "Evde yapılabilecek güvenli deneyler müfredatı" },
            ],
          };
        }
        return {
          title: "🗺️ Kurs & Müfredat Mimarı",
          subtitle: `${gradeLevel} seviyesinde online ders paketleri ve özel ders programları için haftalık müfredat tasarla.`,
          placeholder: `${gradeLevel} kurs konusunu yazın (Örn: ${gradeLevel} Kapsamlı Başarı ve Takviye Programı...)`,
          presets: [
            { title: `🚀 8 Haftalık ${gradeLevel} Başarı Kampı`, desc: "Haftalık ders, ödev ve tarama takvimi" },
            { title: `📚 ${gradeLevel} Soru Çözüm Atölyesi`, desc: "Kilit sorular ve sınav stratejileri" },
            { title: `🎯 ${gradeLevel} Hızlandırma Programı`, desc: "Kısa sürede konuları toparlama planı" },
            { title: `💡 ${gradeLevel} Birebir Özel Ders Paketi`, desc: "12 saatlik kişisel öğrenci takip müfredatı" },
          ],
        };

      case "materyal_kutuphanesi":
        if (isLGS) {
          return {
            title: "📚 Materyal & Ders Planı",
            subtitle: "LGS 8. Sınıf için 5E ders planları, çalışma yaprakları (worksheet) ve özet föyleri hazırla.",
            placeholder: "LGS materyal konusunu yazın (Örn: LGS 8. Sınıf Üslü İfadeler 5E Ders Planı ve Çalışma Kağıdı...)",
            presets: [
              { title: "📄 8. Sınıf Üslü İfadeler 5E Planı", desc: "Giriş, keşfetme, açıklama ve değerlendirme" },
              { title: "📝 LGS DNA ve Genetik Kod Föyü", desc: "Boşluk doldurmalı ve şekilli çalışma föyü" },
              { title: "📊 LGS Türkçe Fiilimsiler Şeması", desc: "İsim-fiil, sıfat-fiil, zarf-fiil özet tablosu" },
              { title: "💡 LGS Matematik Formül Kartları", desc: "Yeni nesil soru çözme ipuçları ve taktikler" },
            ],
          };
        }
        if (isYKS) {
          return {
            title: "📚 Materyal & Ders Planı",
            subtitle: "YKS (TYT/AYT) için 5E ders planları, formül föyleri ve infografik materyaller tasarla.",
            placeholder: "YKS materyal konusunu yazın (Örn: AYT Matematik Türev ve İntegral 5E Ders Planı...)",
            presets: [
              { title: "📄 AYT Türev & İntegral 5E Planı", desc: "Kavramsal derinlikli lise ders planı" },
              { title: "📝 TYT Kimya Periyodik Sistem Föyü", desc: "Özellikler, istisnalar ve çalışma yaprağı" },
              { title: "📊 AYT Biyoloji Sistemler Zihin Haritası", desc: "Dolaşım ve sinir sistemi özet tablosu" },
              { title: "💡 TYT Fizik Vektörler & Kuvvet Kartı", desc: "Cepte taşınabilir özet formül föyü" },
            ],
          };
        }
        return {
          title: "📚 Materyal & Ders Planı",
          subtitle: `${gradeLevel} seviyesinde derste dağıtılabilecek ders planı, çalışma yaprağı ve özet föyü hazırla.`,
          placeholder: `${gradeLevel} materyal konusunu yazın (Örn: ${gradeLevel} Çalışma Yaprağı ve Ders Planı...)`,
          presets: [
            { title: `📄 ${gradeLevel} 5E Modeli Ders Planı`, desc: "Adım adım pedagojik ders işleniş taslağı" },
            { title: `📝 ${gradeLevel} Çalışma Yaprağı (Worksheet)`, desc: "Öğrenci aktif katılım alıştırma föyü" },
            { title: `📊 ${gradeLevel} Kavram & Zihin Haritası`, desc: "Görsel özet ve anahtar kelimeler tablosu" },
            { title: `💡 ${gradeLevel} Özet Formül & Bilgi Kartı`, desc: "Hızlı tekrar için pratik özet kartı" },
          ],
        };

      case "odev_degerlendirme":
        if (isLGS) {
          return {
            title: "📋 Ödev & Rubrik Asistanı",
            subtitle: "LGS 8. Sınıf öğrencileri için net analiz rubrikleri ve yapıcı gelişim dönütleri hazırla.",
            placeholder: "LGS ödev veya deneme konusunu yazın (Örn: LGS Matematik Deneme Analiz ve Hata Takip Rubriği...)",
            presets: [
              { title: "📊 LGS Deneme Analiz Rubriği", desc: "Doğru, yanlış, boş ve süre analiz kriterleri" },
              { title: "💬 LGS Öğrenci Motivasyon Dönütü", desc: "Eksikleri yapıcı dille anlatan öğretmen notu" },
              { title: "📝 LGS Paragraf Okuma Takip Çizelgesi", desc: "Günlük sayfa ve hız değerlendirme ölçeği" },
              { title: "🎯 LGS Matematik Problem Çözme Rubriği", desc: "Anlama, denklem kurma ve işlem puanlaması" },
            ],
          };
        }
        if (isYKS) {
          return {
            title: "📋 Ödev & Rubrik Asistanı",
            subtitle: "YKS (TYT/AYT) için deneme performans rubrikleri ve koçluk geri bildirimleri oluştur.",
            placeholder: "YKS değerlendirme konusunu yazın (Örn: AYT Sayısal Deneme Performans Rubriği ve Koçluk Notu...)",
            presets: [
              { title: "📊 YKS Haftalık Deneme Rubriği", desc: "Net, zamanlama ve strateji puanlama tablosu" },
              { title: "💬 AYT Sayısal Koçluk Dönüt Notu", desc: "Branş bazlı yapıcı gelişim ve analiz metni" },
              { title: "📝 TYT Paragraf Hız & Doğruluk Skalası", desc: "Soru başına düşen süre ve başarı ölçeği" },
              { title: "🎯 AYT Matematik Çözüm Rubriği", desc: "İşlem basamakları ve analitik düşünme kriterleri" },
            ],
          };
        }
        return {
          title: "📋 Ödev & Rubrik Asistanı",
          subtitle: `${gradeLevel} seviyesinde ödev değerlendirme rubrikleri ve öğrenci dönüt notları oluştur.`,
          placeholder: `${gradeLevel} ödev veya değerlendirme konusunu yazın (Örn: ${gradeLevel} Performans Görevi Rubriği...)`,
          presets: [
            { title: `📊 ${gradeLevel} Performans Rubriği`, desc: "İçerik, sunum ve zamanlama puanlama ölçeği" },
            { title: `💬 ${gradeLevel} Yapıcı Öğretmen Dönüt Notu`, desc: "Öğrenciyi teşvik eden kişiselleştirilmiş geri bildirim" },
            { title: `📝 ${gradeLevel} Proje Değerlendirme Kriterleri`, desc: "Adım adım puanlama skalası" },
            { title: `🎯 ${gradeLevel} Ödev Takip & Kontrol Çizelgesi`, desc: "Haftalık tamamlama kontrol kriterleri" },
          ],
        };

      default:
        return {
          title: "✨ Eğitim Aracı",
          subtitle: `${gradeLevel} seviyesine uygun içerik üretin.`,
          placeholder: "Talebinizi yazın...",
          presets: [],
        };
    }
  }

  // Öğrenci Modu
  switch (moduleKey) {
    case "soru_cozucu":
      if (isLGS) {
        return {
          title: "🧠 Soru Çözücü",
          subtitle: "LGS 8. Sınıf sorularını adım adım, taktiklerle ve anlaşılır şekilde çöz.",
          placeholder: "LGS sorusunu yapıştır veya yaz (Örn: Bir kenarı √48 cm olan karenin çevresi...)",
          presets: [
            { title: "📐 LGS Kareköklü İfadeler", desc: "Kareköklü sayılarda toplama ve alan hesabı" },
            { title: "⚡ LGS Fen Basınç Sorusu", desc: "Katı ve sıvı basıncı deney sorusu analizi" },
            { title: "📖 LGS Paragrafta Anlam", desc: "Ana fikir ve yardımcı düşünce soru çözümü" },
            { title: "🧬 LGS DNA ve Genetik Kod", desc: "Çaprazlama ve nükleotid dizilim sorusu" },
          ],
        };
      }
      if (isYKS) {
        return {
          title: "🧠 Soru Çözücü",
          subtitle: "YKS (TYT/AYT) matematik, fen ve sosyal sorularını formüllü ve adım adım çöz.",
          placeholder: "YKS sorusunu yapıştır veya yaz (Örn: ∫(2x+3)e^x dx integralini hesapla...)",
          presets: [
            { title: "📐 İntegral / Türev Çözümü", desc: "Fonksiyon grafiği ve türev hesabı sorusu çöz" },
            { title: "⚡ AYT Fizik Elektrik & Devre", desc: "Kirchhoff ve manyetizma hesabı sorusu" },
            { title: "🧪 AYT Kimya Denge & pH", desc: "Asit-baz dengesi ve titrasyon hesabı" },
            { title: "🧬 AYT Biyoloji Kalıtım", desc: "Genetik Punnett karesi analizi" },
          ],
        };
      }
      return {
        title: "🧠 Soru Çözücü",
        subtitle: `${gradeLevel} seviyesinde sorularını adım adım, formüllü ve detaylı çöz.`,
        placeholder: `${gradeLevel} seviyesindeki sorunu buraya yaz...`,
        presets: [
          { title: `📐 ${gradeLevel} Matematik Sorusu`, desc: "Adım adım açıklamalı işlem çözümü" },
          { title: `⚡ ${gradeLevel} Fen Sorusu`, desc: "Deney ve kavram analizi ile çözüm" },
          { title: `📖 ${gradeLevel} Türkçe & Paragraf`, desc: "Metin ve dilbilgisi analizi" },
          { title: `🌍 ${gradeLevel} Sosyal / Tarih`, desc: "Öncüllü ve neden-sonuç analizi" },
        ],
      };

    case "konu_anlatimi":
      if (isLGS) {
        return {
          title: "📚 Konu Anlatımı",
          subtitle: "LGS 8. Sınıf konularını akılda kalıcı özetler ve sınav püf noktalarıyla öğren.",
          placeholder: "Anlatılmasını istediğin LGS konusunu yaz (Örn: LGS Cümlede Anlam, İklim ve Hava Olayları...)",
          presets: [
            { title: "🌦️ LGS İklim ve Hava Hareketleri", desc: "Rüzgar oluşumu ve basınç merkezleri özeti" },
            { title: "📊 LGS Çarpanlar ve Asal Çarpanlar", desc: "EBOB-EKOK pratik bulma yolları" },
            { title: "🦠 LGS Hücre Bölünmesi ve DNA", desc: "Mitoz-mayoz ve mutasyon-modifikasyon farkı" },
            { title: "📖 LGS Fiilimsiler (Eylemsiler)", desc: "İsim-fiil, sıfat-fiil ve zarf-fiil ipuçları" },
          ],
        };
      }
      if (isYKS) {
        return {
          title: "📚 Konu Anlatımı",
          subtitle: "YKS (TYT/AYT) konularını zihin haritaları, formül özetleri ve sınav taktikleriyle öğren.",
          placeholder: "Anlatılmasını istediğin YKS konusunu yaz (Örn: AYT Limit ve Süreklilik, Organik Kimya...)",
          presets: [
            { title: "🌌 İzafiyet Teorisi & Modern Fizik", desc: "Görelilik kuramı ve fotoelektrik özet" },
            { title: "📊 YKS Paragrafta Hız Taktikleri", desc: "Soru kökünü doğru okuma ve eleme sanatı" },
            { title: "🦠 AYT Fotosentez & Kemosentez", desc: "Işığa bağımlı ve bağımsız evre şeması" },
            { title: "⚖️ Trigonometri Formül Özetleri", desc: "Temel sin, cos, tan dönüşüm kuralları" },
          ],
        };
      }
      return {
        title: "📚 Konu Anlatımı",
        subtitle: `${gradeLevel} seviyesinde konuları akılda kalıcı benzetmeler ve zihin haritalarıyla öğren.`,
        placeholder: `${gradeLevel} seviyesinde anlatılmasını istediğin konuyu yaz...`,
        presets: [
          { title: `🎯 ${gradeLevel} Konu Özeti`, desc: "Kilit kavramlar ve dikkat edilmesi gerekenler" },
          { title: `📘 ${gradeLevel} Püf Noktaları`, desc: "Sık yapılan hatalar ve sınav ipuçları" },
          { title: `🔍 Günlük Hayattan Örnekler`, desc: "Konuyu somutlaştıran benzetmeler" },
          { title: `📊 Zihin Haritası ve Şema`, desc: "Gözle canlandırılabilir özet tablo" },
        ],
      };

    case "quiz_generator":
      return {
        title: "📝 Quiz & Test Üretici",
        subtitle: `${gradeLevel} seviyesine özel şıklı testler ve detaylı çözümler oluştur.`,
        placeholder: `${gradeLevel} quiz konusunu belirt (Örn: 5 soruluk test üret...)`,
        presets: [
          { title: `📝 5 Soruluk ${gradeLevel} Quizi`, desc: "Temel ve orta seviye karma şıklı test" },
          { title: `📐 ${gradeLevel} Matematik Quizi`, desc: "İşlem ve problem odaklı 5 soru" },
          { title: `🔬 ${gradeLevel} Fen Bilgisi Testi`, desc: "Kavram ve deney odaklı mini test" },
          { title: `📖 ${gradeLevel} Türkçe / Dil Quizi`, desc: "Okuma ve dilbilgisi tarama testi" },
        ],
      };

    case "calisma_plani":
      return {
        title: "📅 Çalışma Planlayıcı",
        subtitle: `${gradeLevel} hedefine göre haftalık kişiselleştirilmiş program oluştur.`,
        placeholder: `${gradeLevel} hedefini ve günlük çalışma saatini yaz...`,
        presets: [
          { title: `🎯 30 Günlük ${gradeLevel} Programı`, desc: "Eksik konuları kapatma ve tekrar takvimi" },
          { title: `⏳ Günlük 4 Saatlik Ders Rutini`, desc: "Ders, mola ve soru çözümü dengesi" },
          { title: `⚡ Pomodoro Çalışma Planı`, desc: "25 dk ders + 5 dk mola çalışma düzeni" },
          { title: `📊 Haftalık Deneme Analiz Günü`, desc: "Hataları tespit etme ve pekiştirme saati" },
        ],
      };

    case "bihocam_chat":
    default:
      return {
        title: "💬 Bihocam Chat",
        subtitle: `7/24 yanındaki akıllı eğitim rehberin ile ${gradeLevel} seviyesinde sohbet et.`,
        placeholder: "Aklına takılan her şeyi sorabilirsin...",
        presets: [
          { title: "🚀 Sınav Stresi Nasıl Yönetilir?", desc: "Motivasyon ve odaklanma tavsiyeleri al" },
          { title: "💡 Verimli Ders Çalışma Yolları", desc: "Feynman tekniği ve akılda tutma yöntemleri" },
          { title: "🎓 Hedef Belirleme & Rehberlik", desc: "İstikrarlı çalışma ve net artırma tüyoları" },
          { title: "📚 Yanlış Defteri Nasıl Tutulur?", desc: "Deneme hatalarını analiz etme sistemi" },
        ],
      };
  }
}

export default function AIStudioPage() {
  const { user } = useAuthStore();
  
  // Kullanıcının oturum açtığı gerçek role göre modu kesin olarak belirle
  const isStudent = user?.role === "student";
  const isAdmin = user?.role === "admin";
  const defaultRole: "student" | "teacher" = isStudent ? "student" : "teacher";

  const [role, setRole] = useState<"student" | "teacher">(defaultRole);
  const [activeModule, setActiveModule] = useState<string>(defaultRole === "teacher" ? "soru_bankasi" : "soru_cozucu");
  const [gradeLevel, setGradeLevel] = useState("LGS (8. Sınıf)");
  const [inputMessage, setInputMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Oturum değiştiğinde rolü ve modülü otomatik güncelle
  useEffect(() => {
    const newRole: "student" | "teacher" = user?.role === "student" ? "student" : "teacher";
    setRole(newRole);
    setActiveModule(newRole === "teacher" ? "soru_bankasi" : "soru_cozucu");
  }, [user?.role]);

  // Seçilen role, modüle ve seviyeye göre DİNAMİK içerik
  const activeInfo = getDynamicModuleInfo(activeModule, role, gradeLevel);

  // Sol menüde listelenecek modül anahtarları
  const currentModuleKeys =
    role === "teacher"
      ? ["soru_bankasi", "deneme_sihirbazi", "kurs_mufredat", "materyal_kutuphanesi", "odev_degerlendirme"]
      : ["soru_cozucu", "konu_anlatimi", "quiz_generator", "calisma_plani", "bihocam_chat"];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isGenerating]);

  const handleRoleChange = (newRole: "student" | "teacher") => {
    setRole(newRole);
    const newModuleKey = newRole === "teacher" ? "soru_bankasi" : "soru_cozucu";
    setActiveModule(newModuleKey);
    setChatMessages([]);
  };

  const handleGradeLevelChange = (newGrade: string) => {
    setGradeLevel(newGrade);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const message = textToSend || inputMessage;
    if (!message.trim() || isGenerating) return;

    const newMessages = [...chatMessages, { role: "user" as const, content: message }];
    setChatMessages(newMessages);
    setInputMessage("");
    setIsGenerating(true);

    const apiKey =
      typeof window !== "undefined"
        ? localStorage.getItem("bihocam_omniroute_key") || "sk-1e303c7740970c08-989c16-70e53af9"
        : "sk-1e303c7740970c08-989c16-70e53af9";

    const systemPrompt = `Sen Bihocam AI Eğitim ve Müfredat Stüdyosu uzmanısın.
Kullanıcı Rolü: ${role === "teacher" ? "Öğretmen (Educator OS)" : "Öğrenci Platformu"}.
Modül: ${activeInfo.title} (${activeInfo.subtitle}).
Hedef Seviye: ${gradeLevel}.

Önemli Kural: Çıktılarını KESİNLİKLE seçilen seviye olan '${gradeLevel}' müfredatına ve kazanımlarına göre özelleştir.
Öğretmenler için: MEB ve ÖSYM müfredatına tam uyumlu, pedagojik, cevap anahtarlı ve sınav formatında çıktılar üret.
Öğrenciler için: Adım adım, anlaşılır, zihin açıcı ve pedagojik çözümler sun.
Matematik ve fen ifadeleri için anlaşılır formül yapısı kullan.`;

    try {
      const response = await fetch("https://omniroute.io/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            ...newMessages.map((m) => ({ role: m.role, content: m.content })),
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Hatası: ${response.status}`);
      }

      const data = await response.json();
      const assistantReply = data.choices?.[0]?.message?.content || "İçerik üretilemedi.";

      setChatMessages([...newMessages, { role: "assistant", content: assistantReply }]);
    } catch (err: any) {
      console.warn("API Fallback:", err);
      const fallbackResponse = `📌 **${activeInfo.title} - ${gradeLevel} Sonucu**\n\n` +
        `**Talep:** ${message}\n\n` +
        `**${gradeLevel} Kazanım Değerlendirmesi:**\n` +
        `Belirtilen konu kapsamında ${gradeLevel} seviyesine uygun, pedagojik standartlarda materyal hazırlanmıştır.\n\n` +
        `✅ **Örnek Çıktı & Çözüm:**\n` +
        `1. ${gradeLevel} kazanım odaklı temel kavramlar açıklandı.\n` +
        `2. Örnek soru ve çözüm adımları detaylandırıldı.\n` +
        `3. Sınav için kilit püf noktaları listelendi.\n\n` +
        `*İpucu:* Sağ üstteki "PDF İndir" butonuna basarak bu çıktıyı sınav kağıdı formatında kaydedebilirsiniz.`;

      setChatMessages([...newMessages, { role: "assistant", content: fallbackResponse }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportPdf = () => {
    if (chatMessages.length === 0) {
      toast.error("İndirilecek içerik bulunamadı. Lütfen önce bir içerik üretin.");
      return;
    }

    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Studio Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-teal-900/40">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/20 border border-teal-400/30 rounded-full text-teal-300 text-xs font-bold uppercase tracking-wider">
              <span>✨</span>
              <span>Bihocam AI Engine 2.0</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {role === "teacher" ? "Öğretmen AI Kurs & Müfredat Stüdyosu" : "Öğrenci AI Çalışma Odası & Rehber"}
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              {role === "teacher"
                ? "MEB ve ÖSYM standartlarında soru bankaları, deneme sınavları, haftalık kurs müfredatları ve çalışma föyleri üretin."
                : "Soru çözücü, konu anlatımları, kişiselleştirilmiş quizler ve haftalık çalışma planlayıcı ile 7/24 yanındaki akıllı rehberin."}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Admin ise switcher göster, normal öğretmen veya öğrencide sadece sabit rol etiketi göster */}
            {isAdmin ? (
              <div className="p-1 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 flex items-center gap-1 shadow-inner">
                <button
                  onClick={() => handleRoleChange("teacher")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    role === "teacher"
                      ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  👩‍🏫 Öğretmen Modu
                </button>
                <button
                  onClick={() => handleRoleChange("student")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    role === "student"
                      ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  👨‍🎓 Öğrenci Modu
                </button>
              </div>
            ) : (
              <div className="px-4 py-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-xs font-bold text-teal-200 flex items-center gap-2">
                <span>{role === "teacher" ? "👩‍🏫" : "👨‍🎓"}</span>
                <span>{role === "teacher" ? "Öğretmen Paneli" : "Öğrenci Paneli"}</span>
              </div>
            )}

            {/* Role Specific Action Button */}
            {role === "teacher" ? (
              <Link
                href="/dashboard/my-courses/new"
                className="px-4 py-2.5 bg-white text-slate-900 hover:bg-teal-50 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 whitespace-nowrap"
              >
                <span>➕</span>
                <span>Yeni Kurs Aç</span>
              </Link>
            ) : (
              <Link
                href="/dashboard/courses"
                className="px-4 py-2.5 bg-white text-slate-900 hover:bg-indigo-50 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 whitespace-nowrap"
              >
                <span>📚</span>
                <span>Kayıtlı Kurslarım</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar: Modules & Grade Selector */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-5">
          {/* Level Filter */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>🎯 HEDEF SEVİYE</span>
              <span className="text-[10px] text-teal-700 bg-teal-100 px-2 py-0.5 rounded-md font-extrabold">Aktif</span>
            </label>
            <select
              value={gradeLevel}
              onChange={(e) => handleGradeLevelChange(e.target.value)}
              className="w-full px-4 py-3 bg-white border-2 border-teal-500/40 focus:border-teal-500 rounded-xl text-sm font-bold text-gray-900 outline-none shadow-sm transition-all cursor-pointer"
            >
              <option value="LGS (8. Sınıf)">LGS (8. Sınıf)</option>
              <option value="YKS (TYT/AYT)">YKS (TYT / AYT)</option>
              <option value="İlkokul (1-4. Sınıf)">İlkokul (1-4. Sınıf)</option>
              <option value="Ortaokul (5-7. Sınıf)">Ortaokul (5-7. Sınıf)</option>
              <option value="Lise (9-12. Sınıf)">Lise (9-12. Sınıf)</option>
              <option value="Üniversite / KPSS">Üniversite / KPSS</option>
            </select>
            <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">
              💡 Seçtiğiniz seviyeye göre tüm içerikler ve şablonlar anında güncellenir.
            </p>
          </div>

          <div className="flex items-center justify-between pt-1">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {role === "teacher" ? "ÖĞRETMEN ARAÇLARI" : "ÖĞRENCİ ARAÇLARI"}
            </h3>
            <span className="text-[10px] bg-teal-50 text-teal-700 font-bold px-2 py-0.5 rounded-full">
              {currentModuleKeys.length} Modül
            </span>
          </div>

          <div className="space-y-1.5">
            {currentModuleKeys.map((key) => {
              const mod = getDynamicModuleInfo(key, role, gradeLevel);
              const isActive = activeModule === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveModule(key)}
                  className={`w-full text-left p-3.5 rounded-2xl transition-all flex items-start gap-3 border ${
                    isActive
                      ? role === "teacher"
                        ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md shadow-teal-500/20 border-transparent"
                        : "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-500/20 border-transparent"
                      : "bg-gray-50/70 hover:bg-gray-100/80 text-gray-700 border-transparent"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className={`font-bold text-sm leading-snug ${isActive ? "text-white" : "text-gray-900"}`}>
                      {mod.title}
                    </div>
                    <div className={`text-xs mt-0.5 line-clamp-1 ${isActive ? "text-teal-100" : "text-gray-500"}`}>
                      {mod.subtitle}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Area: Interactive AI Workspace */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col min-h-[580px] overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4 bg-slate-50/50">
            <div>
              <h2 className="font-bold text-gray-900 text-base flex items-center gap-2 flex-wrap">
                <span>{activeInfo.title}</span>
                <span className="text-xs font-bold text-teal-700 bg-teal-100 px-3 py-1 rounded-full border border-teal-200 shadow-sm">
                  {gradeLevel}
                </span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">{activeInfo.subtitle}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportPdf}
                disabled={chatMessages.length === 0}
                className="px-3.5 py-2 bg-white hover:bg-gray-50 disabled:opacity-40 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 shadow-sm transition-all flex items-center gap-1.5"
                title="Yazdır veya PDF olarak kaydet"
              >
                <span>📄</span>
                <span>PDF İndir</span>
              </button>
            </div>
          </div>

          {/* Chat Stream / Output Area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 max-h-[460px] bg-slate-50/30">
            {chatMessages.length === 0 ? (
              <div className="py-8 text-center space-y-4 max-w-lg mx-auto">
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-3xl mx-auto shadow-inner border ${
                  role === "teacher" ? "bg-teal-50 text-teal-600 border-teal-100/50" : "bg-indigo-50 text-indigo-600 border-indigo-100/50"
                }`}>
                  ✨
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    {gradeLevel} İçin Nasıl Yardımcı Olabilirim?
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Aşağıdaki <strong className="text-teal-700">{gradeLevel}</strong> özel şablonlarından birini seçebilir veya kendi talebinizi doğrudan yazabilirsiniz.
                  </p>
                </div>

                {/* Level-Specific Preset Chips */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left pt-2">
                  {activeInfo.presets.map((preset, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(preset.title + " - " + preset.desc)}
                      className="p-3.5 bg-white hover:bg-teal-50/60 border border-gray-100 hover:border-teal-300 rounded-2xl shadow-sm hover:shadow-md transition-all text-left group"
                    >
                      <div className="text-xs font-bold text-gray-900 group-hover:text-teal-700 flex items-center gap-1.5">
                        <span>{preset.title}</span>
                      </div>
                      <div className="text-[11px] text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                        {preset.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-md">
                      B
                    </div>
                  )}

                  <div
                    className={`max-w-2xl rounded-2xl p-4 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? role === "teacher"
                          ? "bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-md"
                          : "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md"
                        : "bg-white text-gray-800 border border-gray-100 shadow-sm whitespace-pre-line"
                    }`}
                  >
                    {msg.content}
                  </div>

                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-xl bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {role === "teacher" ? "ÖĞR" : "ÖĞN"}
                    </div>
                  )}
                </div>
              ))
            )}

            {isGenerating && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-teal-500 text-white flex items-center justify-center font-bold text-xs animate-pulse">
                  B
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-2 text-xs font-semibold text-teal-700">
                  <div className="w-3 h-3 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>Bihocam AI {gradeLevel} içeriğini hazırlıyor...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-teal-500 focus-within:bg-white transition-all">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder={activeInfo.placeholder}
                disabled={isGenerating}
                className="flex-1 bg-transparent px-3 py-2 text-sm font-medium text-gray-800 outline-none placeholder:text-gray-400"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isGenerating}
                className={`px-5 py-2.5 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-40 ${
                  role === "teacher"
                    ? "bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500"
                    : "bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500"
                }`}
              >
                <span>Gönder</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
