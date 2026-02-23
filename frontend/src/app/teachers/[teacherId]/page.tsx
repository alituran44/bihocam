"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Avatar from "@/components/Avatar";
import { teachersApi } from "@/lib/api";

type TeacherInfo = {
  id: string;
  full_name: string;
  email: string;
  bio?: string | null;
  expertise_tags?: string[] | null;
  social_links?: {
    linkedin?: string | null;
    twitter?: string | null;
    instagram?: string | null;
    website?: string | null;
  } | null;
  avatar_url?: string | null;
};

type Course = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  price?: number;
  discount_price?: number | null;
  thumbnail_path?: string | null;
  lessons?: Array<{ id: string }>;
  teacher?: TeacherInfo | null;
};

type TeacherProfileResponse = {
  teacher: TeacherInfo;
  courses: Course[];
};

export default function TeacherProfilePage() {
  const params = useParams();
  const teacherId = params.teacherId as string;

  const { data, isLoading, error } = useQuery<TeacherProfileResponse>({
    queryKey: ["teacher", teacherId],
    queryFn: () => teachersApi.get(teacherId),
    enabled: !!teacherId,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/teachers" className="inline-flex items-center gap-2 text-teal-100 hover:text-white transition-colors mb-6 text-sm font-medium">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Tüm Eğitmenler
          </Link>

          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-12 bg-white/20 rounded-xl w-64 mb-4" />
              <div className="h-6 bg-white/20 rounded-lg w-96" />
            </div>
          ) : error || !data ? (
            <div className="text-white">
              <h1 className="text-3xl font-bold mb-2">Eğitmen Bulunamadı</h1>
              <p className="text-teal-100">Aradığınız eğitmen mevcut değil.</p>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <Avatar
                src={data.teacher.avatar_url}
                name={data.teacher.full_name}
                size="xl"
                showBorder
                borderColor="border-white/30"
                className="shadow-lg"
              />
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{data.teacher.full_name}</h1>
                <p className="text-teal-100 mb-3">{data.teacher.email}</p>
                <div className="flex items-center gap-4 text-teal-100 flex-wrap">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                    </svg>
                    <span className="font-medium">{data.courses?.length || 0} yayınlanmış kurs</span>
                  </div>
                  {data.teacher.social_links && (
                    <div className="flex items-center gap-3">
                      {data.teacher.social_links.linkedin && (
                        <a
                          href={data.teacher.social_links.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                          title="LinkedIn"
                        >
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                          </svg>
                        </a>
                      )}
                      {data.teacher.social_links.twitter && (
                        <a
                          href={data.teacher.social_links.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                          title="Twitter"
                        >
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                          </svg>
                        </a>
                      )}
                      {data.teacher.social_links.instagram && (
                        <a
                          href={data.teacher.social_links.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                          title="Instagram"
                        >
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                          </svg>
                        </a>
                      )}
                      {data.teacher.social_links.website && (
                        <a
                          href={data.teacher.social_links.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                          title="Website"
                        >
                          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-8">
        {isLoading ? (
          <div className="space-y-6">
            <div className="h-8 bg-gray-200 rounded-xl w-48 animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
                  <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          </div>
        ) : error || !data ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Eğitmen profili yüklenemedi</h2>
            <p className="text-gray-600 mb-6">Bir hata oluştu. Lütfen daha sonra tekrar deneyin.</p>
            <Link
              href="/teachers"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-teal-500/30 transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Eğitmenlere Dön
            </Link>
          </div>
        ) : (
          <>
            {/* Eğitmen Bilgileri Kartı */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm mb-8">
              <div className="flex items-start gap-6 flex-col sm:flex-row">
                <Avatar
                  src={data.teacher.avatar_url}
                  name={data.teacher.full_name}
                  size="xl"
                  showBorder
                  borderColor="border-teal-100"
                  className="shadow-lg flex-shrink-0"
                />
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Hakkında</h2>
                  {data.teacher.bio ? (
                    <p className="text-gray-600 leading-relaxed mb-4 whitespace-pre-wrap">{data.teacher.bio}</p>
                  ) : (
                    <p className="text-gray-600 leading-relaxed mb-4">
                      {data.teacher.full_name} alanında uzman bir eğitmendir. {data.courses?.length || 0} yayınlanmış kursu ile öğrencilerine kaliteli eğitim sunmaktadır.
                    </p>
                  )}
                  {data.teacher.expertise_tags && data.teacher.expertise_tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {data.teacher.expertise_tags.map((tag, idx) => (
                        <span key={idx} className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg className="w-5 h-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {data.teacher.email}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg className="w-5 h-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                      </svg>
                      {data.courses?.length || 0} Kurs
                    </div>
                  </div>
                  {data.teacher.social_links && (
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                      <span className="text-sm font-medium text-gray-700">Sosyal Medya:</span>
                      {data.teacher.social_links.linkedin && (
                        <a
                          href={data.teacher.social_links.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-lg bg-teal-50 hover:bg-teal-100 flex items-center justify-center transition-colors group"
                          title="LinkedIn"
                        >
                          <svg className="w-5 h-5 text-teal-600 group-hover:text-teal-700" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                          </svg>
                        </a>
                      )}
                      {data.teacher.social_links.twitter && (
                        <a
                          href={data.teacher.social_links.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-lg bg-teal-50 hover:bg-teal-100 flex items-center justify-center transition-colors group"
                          title="Twitter"
                        >
                          <svg className="w-5 h-5 text-teal-600 group-hover:text-teal-700" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                          </svg>
                        </a>
                      )}
                      {data.teacher.social_links.instagram && (
                        <a
                          href={data.teacher.social_links.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-lg bg-teal-50 hover:bg-teal-100 flex items-center justify-center transition-colors group"
                          title="Instagram"
                        >
                          <svg className="w-5 h-5 text-teal-600 group-hover:text-teal-700" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                          </svg>
                        </a>
                      )}
                      {data.teacher.social_links.website && (
                        <a
                          href={data.teacher.social_links.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-lg bg-teal-50 hover:bg-teal-100 flex items-center justify-center transition-colors group"
                          title="Website"
                        >
                          <svg className="w-5 h-5 text-teal-600 group-hover:text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Kurslar Bölümü */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">Kurslar</h2>
                  <p className="text-gray-600">{data.courses?.length || 0} yayınlanmış kurs</p>
                </div>
              </div>

              {!data.courses?.length ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Henüz kurs yok</h3>
                  <p className="text-gray-600">Bu eğitmenin henüz yayınlanmış kursu bulunmuyor.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.courses.map((course) => (
                    <Link
                      key={course.id}
                      href={`/courses/${course.slug}`}
                      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg hover:border-teal-200 transition-all"
                    >
                      {/* Thumbnail */}
                      <div className="aspect-video bg-gradient-to-br from-teal-100 to-teal-200 relative overflow-hidden">
                        {course.thumbnail_path ? (
                          <img
                            src={course.thumbnail_path}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-12 h-12 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                            </svg>
                          </div>
                        )}
                        {course.discount_price && (
                          <span className="absolute top-3 left-3 px-2.5 py-1 bg-orange-500 text-white text-xs font-bold rounded-lg shadow-lg">
                            %{Math.round((1 - (Number(course.discount_price) / Number(course.price || 1))) * 100)} İndirim
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <h3 className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors line-clamp-2 mb-2 min-h-[48px]">
                          {course.title}
                        </h3>
                        {course.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-4">{course.description}</p>
                        )}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                              </svg>
                              <span>{course.lessons?.length || 0} ders</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-teal-600 font-semibold text-sm group-hover:gap-3 transition-all">
                            İncele
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                        {course.price !== undefined && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">Fiyat</span>
                              <div className="font-bold text-gray-900">
                                {course.discount_price ? (
                                  <>
                                    <span>₺{Number(course.discount_price).toFixed(2)}</span>
                                    <span className="text-sm text-gray-400 line-through font-normal ml-2">₺{Number(course.price).toFixed(2)}</span>
                                  </>
                                ) : course.price === 0 ? (
                                  <span className="text-teal-600">Ücretsiz</span>
                                ) : (
                                  <span>₺{Number(course.price).toFixed(2)}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
