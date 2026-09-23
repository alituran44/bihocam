export function OrganizationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "EducationalOrganization"],
        "@id": "https://bihocam.com/#organization",
        "name": "BiHocam",
        "url": "https://bihocam.com",
        "logo": {
          "@type": "ImageObject",
          "@id": "https://bihocam.com/#logo",
          "url": "https://bihocam.com/logo.png",
          "contentUrl": "https://bihocam.com/logo.png",
          "caption": "BiHocam Eğitim Teknolojileri"
        },
        "description": "YKS, LGS ve tüm okul derslerinde doğrulanmış uzman eğitmenlerle canlı 1:1 dersler, özel ders talepleri ve akıllı öğrenme platformu.",
        "sameAs": [
          "https://www.instagram.com/bihocam",
          "https://twitter.com/bihocam",
          "https://www.linkedin.com/company/bihocam"
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+90-850-000-0000",
          "contactType": "customer service",
          "email": "iletisim@bihocam.com",
          "areaServed": "TR",
          "availableLanguage": ["Turkish", "English"]
        }
      },
      {
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
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
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
