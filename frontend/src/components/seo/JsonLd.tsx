export function OrganizationJsonLd() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": "https://bihocam.com/#organization",
    "name": "BiHocam",
    "legalName": "BiHocam Eğitim Teknolojileri",
    "url": "https://bihocam.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://bihocam.com/logo.png",
      "contentUrl": "https://bihocam.com/logo.png",
      "caption": "BiHocam Eğitim Teknolojileri"
    },
    "image": "https://bihocam.com/logo.png",
    "description": "YKS, LGS ve tüm okul derslerinde doğrulanmış uzman eğitmenlerle canlı 1:1 dersler, özel ders talepleri ve akıllı öğrenme platformu.",
    "sameAs": [
      "https://www.instagram.com/bihocam",
      "https://twitter.com/bihocam",
      "https://www.linkedin.com/company/bihocam"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+90-850-840-5543",
      "contactType": "customer service",
      "email": "iletisim@bihocam.com",
      "areaServed": "TR",
      "availableLanguage": ["Turkish", "English"]
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Çanakkale",
      "addressCountry": "TR"
    }
  };

  const corporateSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://bihocam.com/#corp",
    "name": "BiHocam",
    "url": "https://bihocam.com",
    "logo": "https://bihocam.com/logo.png",
    "description": "Türkiye'nin Yeni Nesil Akıllı Özel Ders ve Canlı Eğitim Platformu"
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://bihocam.com/#website",
    "url": "https://bihocam.com",
    "name": "BiHocam",
    "publisher": {
      "@id": "https://bihocam.com/#organization"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://bihocam.com/courses?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(corporateSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}

export function FaqJsonLd({
  faqs,
}: {
  faqs: { q: string; a: string }[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
