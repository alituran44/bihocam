"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import DOMPurify from "isomorphic-dompurify";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { pagesApi } from "@/lib/api";

const CORPORATE_LINKS = [
  { label: "Hakkımızda", href: "/pages/hakkimizda", slug: "hakkimizda" },
  { label: "Üyelik Sözleşmesi", href: "/pages/uyelik-sozlesmesi", slug: "uyelik-sozlesmesi" },
  { label: "Gizlilik ve Çerez Politikası", href: "/pages/gizlilik", slug: "gizlilik" },
  { label: "KVKK Aydınlatma Metni", href: "/pages/KVKK-aydinlatma-metni", slug: "kvkk-aydinlatma-metni" },
  { label: "Mesafeli Satış Sözleşmesi", href: "/pages/mesafeli-satis-sozlesmesi", slug: "mesafeli-satis-sozlesmesi" },
];

export default function PublicPageDetail() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.slug as string) || "";

  // Query for fetching dynamic page content by slug
  const { data: page, isLoading, error } = useQuery({
    queryKey: ["public-page", slug],
    queryFn: () => pagesApi.getBySlug(slug),
    retry: false,
  });

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      <Header />

      <main className="flex-grow pt-32 pb-24 relative overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/5 rounded-full filter blur-3xl -z-10"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full filter blur-3xl -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Sidebar Navigation */}
            <aside className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl space-y-4">
                <h3 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-3">
                  Kurumsal Menü
                </h3>
                <nav className="flex flex-col gap-2">
                  {CORPORATE_LINKS.map((link) => {
                    const isActive = link.slug === slug.toLowerCase();
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                          isActive
                            ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20"
                            : "text-gray-600 hover:bg-gray-50 hover:text-teal-600"
                        }`}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Extra banner */}
              <div className="bg-gradient-to-br from-teal-500 to-indigo-600 rounded-3xl p-6 text-white shadow-xl space-y-4">
                <h4 className="font-black text-lg">Online Eğitimde Lider!</h4>
                <p className="text-teal-100 text-xs font-semibold leading-relaxed">
                  Uzman eğitmen kadromuzla, birebir canlı dersler ve modern yapay zeka asistanı desteğiyle hedefinize ulaşın.
                </p>
                <Link
                  href="/courses"
                  className="inline-block px-5 py-2.5 bg-white text-teal-600 text-xs font-bold rounded-xl hover:shadow-lg transition-all"
                >
                  Kursları Keşfet
                </Link>
              </div>
            </aside>

            {/* Page Content Panel */}
            <article className="lg:col-span-8">
              {isLoading ? (
                <div className="bg-white rounded-3xl p-16 border border-gray-100 shadow-xl text-center space-y-4">
                  <div className="inline-block w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-500 font-semibold">Sayfa yükleniyor...</p>
                </div>
              ) : error || !page || !page.is_active ? (
                <div className="bg-white rounded-3xl p-16 border border-gray-100 shadow-xl text-center space-y-6">
                  <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-3xl mx-auto shadow-inner">
                    ⚠️
                  </div>
                  <h2 className="text-2xl font-black text-gray-900">Sayfa Bulunamadı</h2>
                  <p className="text-gray-500 font-semibold max-w-sm mx-auto text-sm leading-relaxed">
                    Aradığınız kurumsal sayfa kaldırılmış veya geçici olarak kullanım dışı bırakılmış olabilir.
                  </p>
                  <button
                    onClick={() => router.push("/")}
                    className="px-6 py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-colors shadow-md text-sm"
                  >
                    Ana Sayfaya Dön
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-2xl space-y-8">
                  <div className="border-b border-gray-100 pb-6 space-y-2">
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                      {page.title}
                    </h1>
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                      <span>Son Güncelleme:</span>
                      <span>
                        {new Date(page.updated_at).toLocaleDateString("tr-TR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Prose style HTML container */}
                  <div
                    className="prose prose-teal max-w-none text-gray-700 leading-relaxed space-y-6 
                      prose-headings:font-black prose-headings:text-gray-900 
                      prose-h2:text-2xl prose-h2:border-b prose-h2:border-gray-50 prose-h2:pb-2 prose-h2:mt-8
                      prose-p:text-base prose-p:font-medium
                      prose-ul:list-disc prose-ul:pl-6 prose-ul:space-y-2
                      prose-li:text-sm prose-li:font-semibold"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(page.content) }}
                  />
                </div>
              )}
            </article>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
