import { NextResponse } from "next/server";

export const dynamic = "force-static";
export const revalidate = 86400; // 24 hours

const LLMS_TEXT = `# BiHocam - Türkiye'nin Yeni Nesil Akıllı Özel Ders ve Canlı Eğitim Platformu

> BiHocam, YKS, LGS, yabancı dil ve okul derslerinde öğrencileri doğrulanmış uzman eğitmenlerle buluşturan, tersine ihale (özel ders talebi) modeli ve canlı 1:1 etkileşimli dersler sunan yeni nesil eğitim teknolojisi platformudur.

## Temel Hizmetler & Çözümler
- **Canlı 1:1 & Grup Dersleri:** Tarayıcı üzerinden sıfır kurulum gerektiren WebRTC tabanlı interaktif beyaz tahta ve video konferans sistemi.
- **Doğrulanmış Eğitmen Havuzu:** Diploma, adli sicil ve deneme dersi mülakatından geçen bağımsız öğretmenler.
- **Eğitim Programları:** TYT, AYT, LGS kapsamlı tüm dersler eğitim paketleri.
- **Özel Ders Talebi Modeli:** Öğrenci ve velilerin ders gereksinimlerine göre doğrulanmış branş öğretmenleriyle eşleşmesi.
- **Güvenli Ödeme:** 3D Secure ve BDDK lisanslı emanet havuz hesabı koruması, taksit imkanı.

## Kamuya Açık Rotalar & Müfredat
- [Ana Sayfa](https://bihocam.com): Platform genel tanıtımı ve öne çıkan dersler.
- [Eğitmenleri Keşfet](https://bihocam.com/teachers): Branş ve şehre göre doğrulanmış öğretmen listesi.
- [Kurslar & Dersler](https://bihocam.com/courses): Canlı ve kayıtlı dersler kataloğu.
- [Eğitim Programları](https://bihocam.com/egitim-programlari): TYT ve AYT paket programları.
- [Eğitmen Başvurusu](https://bihocam.com/become-instructor): Öğretmen olarak platforma katılma bilgisi.
- [Blog](https://bihocam.com/blog): YKS, LGS çalışma rehberleri ve eğitim makaleleri.
- [İletişim & Destek](https://bihocam.com/iletisim): Müşteri destek hattı ve SSS.

## Kurumsal ve Yasal Bilgiler
- [Hakkımızda](https://bihocam.com/pages/hakkimizda)
- [Kullanım Şartları](https://bihocam.com/pages/uyelik-sozlesmesi)
- [Gizlilik Politikası](https://bihocam.com/pages/gizlilik)
- [KVKK Aydınlatma Metni](https://bihocam.com/pages/KVKK-aydinlatma-metni)
- [Mesafeli Satış Sözleşmesi](https://bihocam.com/pages/mesafeli-satis-sozlesmesi)

## İletişim & Destek
- Web: https://bihocam.com
- E-posta: iletisim@bihocam.com
- Güvenlik Bildirimi: https://bihocam.com/.well-known/security.txt
`;

export async function GET() {
  return new NextResponse(LLMS_TEXT, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
      "X-Robots-Tag": "index, follow",
    },
  });
}
