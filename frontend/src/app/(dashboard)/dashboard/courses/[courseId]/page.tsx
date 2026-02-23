"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { coursesApi } from "@/lib/api";

interface Lesson {
  id: string;
  title: string;
  order: number;
}

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_path: string | null;
  lessons: Lesson[];
  teacher?: {
    id: string;
    full_name: string;
  } | null;
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const { data: course, isLoading } = useQuery<Course>({
    queryKey: ["course", courseId],
    queryFn: () => coursesApi.get(courseId),
    enabled: !!courseId,
  });

  // Eğer ders varsa, ilk derse yönlendirmeyi effect içinde yap
  useEffect(() => {
    if (!course || !course.lessons || course.lessons.length === 0) return;

    const sortedLessons = [...course.lessons].sort((a, b) => a.order - b.order);
    const firstLesson = sortedLessons[0];

    if (firstLesson) {
      router.replace(`/dashboard/courses/${courseId}/${firstLesson.id}`);
    }
  }, [course, courseId, router]);

  if (isLoading) {
    return (
      <div>
        <div className="h-8 w-64 bg-gray-200 rounded mb-6 animate-pulse" />
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="h-96 bg-gray-200 rounded-2xl animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="h-64 bg-gray-200 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Kurs bulunamadı</h1>
        <p className="text-gray-600 mb-6">
          Bu kurs silinmiş olabilir veya erişim yetkiniz olmayabilir.
        </p>
        <button
          onClick={() => router.push("/dashboard/courses")}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:shadow-lg hover:shadow-teal-500/30 text-white px-6 py-3 rounded-xl font-semibold transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kurslarıma Dön
        </button>
      </div>
    );
  }

  // Eğer ders varsa, effect yönlendirene kadar kısa bir yükleniyor ekranı göster
  if (course.lessons && course.lessons.length > 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Yönlendiriliyor...</p>
        </div>
      </div>
    );
  }

  // Eğer ders yoksa kurs detay sayfasına yönlendir
  return (
    <div>
      <div className="mb-6">
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <Link href="/dashboard/courses" className="hover:text-teal-600 transition-colors">
            Kurslarım
          </Link>
          <span>/</span>
          <span className="text-gray-900">{course.title}</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Henüz ders yok</h2>
        <p className="text-gray-600 mb-6">
          Bu kurs henüz içerik eklenmemiş. Lütfen daha sonra tekrar kontrol edin.
        </p>
        <Link
          href={`/courses/${course.slug}`}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:shadow-lg hover:shadow-teal-500/30 text-white px-6 py-3 rounded-xl font-semibold transition-all"
        >
          Kurs Sayfasına Git
        </Link>
      </div>
    </div>
  );
}
