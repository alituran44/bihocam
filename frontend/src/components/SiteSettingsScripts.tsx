"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { publicApi, siteSettingsApi } from "@/lib/api";

export default function SiteSettingsScripts() {
  // Public settings'ten SEO bilgilerini al (client-side) - artık SEO kodları public endpoint'te
  const { data: publicSettings } = useQuery({
    queryKey: ["public-settings"],
    queryFn: () => publicApi.getPublicSettings(),
    staleTime: 15 * 60 * 1000, // 15 dakika cache
  });

  useEffect(() => {
    if (!publicSettings) return;

    // SEO meta tags güncelle
    if (publicSettings.meta_description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.setAttribute("name", "description");
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute("content", publicSettings.meta_description);
    }

    if (publicSettings.meta_keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement("meta");
        metaKeywords.setAttribute("name", "keywords");
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute("content", publicSettings.meta_keywords);
    }

    // Favicon güncelle
    if (publicSettings.favicon_url) {
      let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (!favicon) {
        favicon = document.createElement("link");
        favicon.setAttribute("rel", "icon");
        document.head.appendChild(favicon);
      }
      favicon.setAttribute("href", publicSettings.favicon_url);
    }
  }, [publicSettings]);

  // SEO & Analytics kodları (publicSettings'ten - artık public endpoint'te)
  useEffect(() => {
    if (!publicSettings?.seo) return;

    const seo = publicSettings.seo as Record<string, string>;

    // Google Analytics
    if (seo.google_analytics_code && !document.querySelector('script[data-ga]')) {
      const script = document.createElement("script");
      script.setAttribute("data-ga", "true");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${seo.google_analytics_code}`;
      document.head.appendChild(script);

      const initScript = document.createElement("script");
      initScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${seo.google_analytics_code}');
      `;
      document.head.appendChild(initScript);
    }

    // Google Tag Manager
    if (seo.gtm_code && !document.querySelector('script[data-gtm]')) {
      const gtmScript = document.createElement("script");
      gtmScript.setAttribute("data-gtm", "true");
      gtmScript.innerHTML = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${seo.gtm_code}');
      `;
      document.head.appendChild(gtmScript);

      // GTM noscript
      const noscript = document.createElement("noscript");
      noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${seo.gtm_code}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
      document.body.insertBefore(noscript, document.body.firstChild);
    }

    // Google Search Console
    if (seo.google_search_console_code && !document.querySelector('meta[name="google-site-verification"]')) {
      const meta = document.createElement("meta");
      meta.setAttribute("name", "google-site-verification");
      meta.setAttribute("content", seo.google_search_console_code);
      document.head.appendChild(meta);
    }

    // Bing Webmaster
    if (seo.bing_webmaster_code && !document.querySelector('meta[name="msvalidate.01"]')) {
      const meta = document.createElement("meta");
      meta.setAttribute("name", "msvalidate.01");
      meta.setAttribute("content", seo.bing_webmaster_code);
      document.head.appendChild(meta);
    }

    // Yandex Metrica
    if (seo.yandex_metrica_code && !document.querySelector('script[data-yandex]')) {
      const script = document.createElement("script");
      script.setAttribute("data-yandex", "true");
      script.type = "text/javascript";
      script.innerHTML = `
        (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
        (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
        ym(${seo.yandex_metrica_code}, "init", {clickmap:true,trackLinks:true,accurateTrackBounce:true});
      `;
      document.head.appendChild(script);
    }
  }, [publicSettings]);

  // Custom Head HTML
  useEffect(() => {
    if (!publicSettings?.custom_code?.custom_head_html) return;

    let customHead = publicSettings.custom_code.custom_head_html as string;
    if (!customHead.trim()) return;

    // Eğer içerik zaten script tag'i içeriyorsa, sadece içeriği al
    if (customHead.includes("<script")) {
      const scriptMatch = customHead.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
      if (scriptMatch && scriptMatch[1]) {
        customHead = scriptMatch[1].trim();
      } else {
        customHead = customHead
          .replace(/<script[^>]*>/gi, "")
          .replace(/<\/script>/gi, "")
          .trim();
      }
    }

    // Eğer hala HTML tag'leri varsa, onları da temizle
    if (customHead.includes("<")) {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = customHead;
      const scripts = tempDiv.querySelectorAll("script");
      if (scripts.length > 0) {
        customHead = Array.from(scripts)
          .map((s) => s.textContent || s.innerText)
          .join("\n")
          .trim();
      } else {
        customHead = tempDiv.textContent || tempDiv.innerText || "";
      }
    }

    if (!customHead || !customHead.trim()) return;

    // Mevcut custom head script'i kontrol et
    let existingScript = document.querySelector('script[data-custom-head]');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement("script");
    script.setAttribute("data-custom-head", "true");
    script.textContent = customHead; // innerHTML yerine textContent kullan
    document.head.appendChild(script);
  }, [publicSettings]);

  // Custom Footer HTML & Live Chat
  useEffect(() => {
    if (!publicSettings?.custom_code) return;

    const customCode = publicSettings.custom_code as Record<string, string>;

    // Custom Footer HTML
    if (customCode.custom_footer_html) {
      let footerScript = document.querySelector('script[data-custom-footer]');
      if (footerScript) {
        footerScript.remove();
      }

      // Eğer içerik zaten script tag'i içeriyorsa, sadece içeriği al
      let footerContent = customCode.custom_footer_html.trim();
      
      // Script tag'lerini kaldır (açılış ve kapanış)
      if (footerContent.includes("<script")) {
        const scriptMatch = footerContent.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
        if (scriptMatch && scriptMatch[1]) {
          footerContent = scriptMatch[1].trim();
        } else {
          footerContent = footerContent
            .replace(/<script[^>]*>/gi, "")
            .replace(/<\/script>/gi, "")
            .trim();
        }
      }

      // Eğer hala HTML tag'leri varsa, onları da temizle
      if (footerContent.includes("<")) {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = footerContent;
        const scripts = tempDiv.querySelectorAll("script");
        if (scripts.length > 0) {
          footerContent = Array.from(scripts)
            .map((s) => s.textContent || s.innerText)
            .join("\n")
            .trim();
        } else {
          footerContent = tempDiv.textContent || tempDiv.innerText || "";
        }
      }

      if (footerContent && footerContent.trim()) {
        const script = document.createElement("script");
        script.setAttribute("data-custom-footer", "true");
        script.textContent = footerContent; // innerHTML yerine textContent kullan
        document.body.appendChild(script);
      }
    }

    // Live Chat JS
    if (customCode.live_chat_js) {
      let liveChatScript = document.querySelector('script[data-live-chat]');
      if (liveChatScript) {
        liveChatScript.remove();
      }

      // Eğer içerik zaten script tag'i içeriyorsa, sadece içeriği al
      let liveChatContent = customCode.live_chat_js.trim();
      
      // Script tag'lerini kaldır (açılış ve kapanış)
      if (liveChatContent.includes("<script")) {
        // Regex ile script tag'lerini ve içeriğini ayır
        const scriptMatch = liveChatContent.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
        if (scriptMatch && scriptMatch[1]) {
          liveChatContent = scriptMatch[1].trim();
        } else {
          // Eğer match bulunamazsa, manuel olarak temizle
          liveChatContent = liveChatContent
            .replace(/<script[^>]*>/gi, "")
            .replace(/<\/script>/gi, "")
            .trim();
        }
      }

      // Eğer hala HTML tag'leri varsa (script dışında), onları da temizle
      if (liveChatContent.includes("<")) {
        // Sadece script tag'leri değil, diğer HTML tag'lerini de temizle
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = liveChatContent;
        const scripts = tempDiv.querySelectorAll("script");
        if (scripts.length > 0) {
          liveChatContent = Array.from(scripts)
            .map((s) => s.textContent || s.innerText)
            .join("\n")
            .trim();
        } else {
          // Script yoksa, sadece text içeriği al
          liveChatContent = tempDiv.textContent || tempDiv.innerText || "";
        }
      }

      if (liveChatContent && liveChatContent.trim()) {
        const script = document.createElement("script");
        script.setAttribute("data-live-chat", "true");
        script.textContent = liveChatContent; // innerHTML yerine textContent kullan
        document.body.appendChild(script);
      }
    }
  }, [publicSettings]);

  return null;
}
