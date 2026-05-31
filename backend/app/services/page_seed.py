import logging
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.page import Page

logger = logging.getLogger(__name__)

DEFAULT_PAGES = [
    {
        "slug": "hakkimizda",
        "title": "Hakkımızda",
        "content": """
<h2>Biz Kimiz?</h2>
<p>BiHocam, Türkiye'nin lider online ve yüz yüze birebir eğitim platformudur. Amacımız, her seviyeden öğrenciyi alanında uzman eğitmenlerle buluşturarak öğrenme sürecini en verimli ve keyifli hale getirmektir.</p>
<p>Modern teknolojik altyapımız, gelişmiş ödev ve test modüllerimiz, entegre canlı ders sistemimiz ve güvenli ödeme yöntemlerimizle Türkiye genelinde binlerce öğrenci ve öğretmene hizmet veriyoruz.</p>

<h2>Misyonumuz</h2>
<p>Eğitime erişimi kolaylaştırmak, her bireyin potansiyelini en üst düzeye çıkarmasını sağlamak ve kaliteli eğitimi herkes için ulaşılabilir kılmaktır.</p>

<h2>Vizyonumuz</h2>
<p>Eğitim teknolojileri alanında küresel standartları belirleyen, yenilikçi çözümler sunan ve en çok tercih edilen eğitim ekosistemi olmaktır.</p>
"""
    },
    {
        "slug": "uyelik-sozlesmesi",
        "title": "Üyelik Sözleşmesi",
        "content": """
<h2>1. Taraflar</h2>
<p>İşbu Üyelik Sözleşmesi ("Sözleşme"), BiHocam platformu ("Platform") ile BiHocam hizmetlerinden yararlanmak amacıyla üye olan kullanıcı ("Üye") arasında akdedilmiştir.</p>

<h2>2. Sözleşmenin Konusu</h2>
<p>İşbu Sözleşme'nin konusu, Platform üzerinden sunulan eğitim, canlı ders, ödev ve sınav hizmetlerinin kullanım şartlarının, tarafların hak ve yükümlülüklerinin belirlenmesidir.</p>

<h2>3. Hak ve Yükümlülükler</h2>
<ul>
    <li>Üye, kayıt formunda belirttiği bilgilerin doğru olduğunu kabul ve taahhüt eder.</li>
    <li>Platform, üyelerine kesintisiz ve kaliteli hizmet sunmak için azami çabayı gösterir.</li>
    <li>Eğitmen üyeler, platform kurallarına ve yasal mevzuata uygun şekilde ders içerikleri oluşturmakla yükümlüdür.</li>
</ul>

<h2>4. Sözleşmenin Yürürlüğü</h2>
<p>Üye, kayıt işlemlerini tamamladığı andan itibaren işbu sözleşmenin tüm şartlarını kabul etmiş sayılır.</p>
"""
    },
    {
        "slug": "gizlilik",
        "title": "Gizlilik ve Çerez Politikası",
        "content": """
<h2>1. Veri Sorumlusu</h2>
<p>BiHocam olarak, kullanıcılarımızın kişisel verilerinin güvenliğine büyük önem veriyoruz. Kişisel verileriniz, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca veri sorumlusu sıfatıyla işlenmektedir.</p>

<h2>2. Hangi Verileri İşliyoruz?</h2>
<p>Üyelik ve profil oluşturma sırasında paylaştığınız ad-soyad, e-posta adresi, telefon numarası gibi kimlik ve iletişim bilgileri ile platform kullanımınız esnasında oluşan çerez (cookie) verileri işlenmektedir.</p>

<h2>3. Çerezlerin Kullanımı</h2>
<p>Sitemizde size en iyi deneyimi sunabilmek adına teknik çerezler, performans çerezleri ve analitik çerezler kullanılmaktadır. Tarayıcı ayarlarınızdan çerez tercihlerinizi dilediğiniz zaman değiştirebilirsiniz.</p>
"""
    },
    {
        "slug": "KVKK-aydinlatma-metni",
        "title": "KVKK Aydınlatma Metni",
        "content": """
<h2>Kişisel Verilerin Korunması Hakkında Aydınlatma Metni</h2>
<p>BiHocam olarak, kişisel verilerinizin 6698 sayılı Kişisel Verilerin Korunması Kanunu'na ("KVKK") uygun olarak işlenmesine ve korunmasına özen gösteriyoruz.</p>

<h2>1. Kişisel Verilerin İşlenme Amaçları</h2>
<p>Kişisel verileriniz; platform üyelik süreçlerinin yürütülmesi, eğitim hizmetlerinin sunulması, ödeme işlemlerinin gerçekleştirilmesi ve yasal yükümlülüklerimizin yerine getirilmesi amaçlarıyla işlenmektedir.</p>

<h2>2. İşlenen Verilerin Aktarılması</h2>
<p>Kişisel verileriniz, kanuni yükümlülüklerin yerine getirilmesi amacıyla yetkili kamu kurum ve kuruluşları ile ödeme hizmeti sağlayıcımız PayTR gibi iş ortaklarımıza KVKK 8. ve 9. maddelerine uygun olarak aktarılabilecektir.</p>

<h2>3. Haklarınız</h2>
<p>KVKK'nın 11. maddesi uyarınca, verilerinizin işlenip işlenmediğini öğrenme, işlenme amacını kontrol etme, verilerinizin düzeltilmesini veya silinmesini talep etme haklarına sahipsiniz.</p>
"""
    },
    {
        "slug": "mesafeli-satis-sozlesmesi",
        "title": "Mesafeli Satış Sözleşmesi",
        "content": """
<h2>1. Taraflar</h2>
<p>İşbu Sözleşme, BiHocam platformu üzerinden ders/kurs satın alan alıcı ("Alıcı") ile platformda hizmet sunan/aracılık eden BiHocam ("Satıcı") arasında akdedilmiştir.</p>

<h2>2. Sözleşme Konusu Ürün/Hizmet</h2>
<p>Sözleşmenin konusu, Alıcı'nın Satıcı'ya ait platform üzerinden elektronik ortamda siparişini verdiği online eğitim/canlı ders hizmetinin satışı ve teslimi ile ilgili olarak Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin saptanmasıdır.</p>

<h2>3. Cayma Hakkı</h2>
<p>Dijital olarak anında ifa edilen veya gayri maddi mallara ilişkin hizmetlerde (online canlı dersler, izlenebilir kurs paketleri) cayma hakkı yönetmelik uyarınca kullanılamamaktadır.</p>
"""
    }
]


async def seed_default_pages(db: AsyncSession):
    """Platformun varsayılan kurumsal sayfalarını veritabanına seed eder."""
    try:
        for page_data in DEFAULT_PAGES:
            # Slug kontrolü (varsa ezme, yoksa ekle)
            stmt = select(Page).where(Page.slug == page_data["slug"])
            result = await db.execute(stmt)
            existing_page = result.scalar_one_or_none()
            
            if not existing_page:
                new_page = Page(
                    slug=page_data["slug"],
                    title=page_data["title"],
                    content=page_data["content"],
                    is_active=True
                )
                db.add(new_page)
                logger.info(f"Seeded corporate page: {page_data['title']} ({page_data['slug']})")
        await db.commit()
    except Exception as e:
        await db.rollback()
        logger.error(f"Error seeding corporate pages: {e}", exc_info=True)
        raise e
