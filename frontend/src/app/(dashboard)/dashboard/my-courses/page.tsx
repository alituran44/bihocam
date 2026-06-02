"use client";

import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { coursesApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_path: string | null;
  price: number;
  discount_price: number | null;
  status: "draft" | "pending_review" | "rejected" | "published" | "archived";
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  lessons: Array<{ id: string }>;
}

export default function MyCoursesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Öğretmenin kendi kurslarını getir
  const { data: myCourses, isLoading } = useQuery<Course[]>({
    queryKey: ["my-courses"],
    queryFn: () => coursesApi.getMyCourses(0, 100),
    enabled: !!user && (user.role === "teacher" || user.role === "admin"),
  });

  // Arşivden çıkarma mutation
  const unarchiveMutation = useMutation({
    mutationFn: (courseId: string) => coursesApi.unarchiveCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-courses"] });
      alert("Kurs başarıyla arşivden çıkarıldı ve yayınlandı!");
    },
    onError: (error: any) => {
      const detail = error?.response?.data?.detail;
      if (typeof detail === "string") {
        alert(detail);
      } else if (detail?.message) {
        alert(detail.message);
      } else {
        alert("Kurs arşivden çıkarılırken bir hata oluştu.");
      }
    },
  });

  if (isLoading) {
    return (
      <div>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded mb-2 animate-pulse" />
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden animate-pulse">
              <div className="h-40 bg-gray-200" />
              <div className="p-6 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Eğitimlerim</h1>
          <p className="text-gray-600">Oluşturduğun kursları buradan yönetebilirsin.</p>
        </div>
        {user?.is_verified ? (
          <Link
            href="/dashboard/my-courses/new"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:shadow-lg hover:shadow-teal-500/30 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Yeni Kurs
          </Link>
        ) : (
          <button
            disabled
            title="Kurs oluşturabilmek için belgelerinizin onaylanması gerekmektedir."
            className="inline-flex items-center gap-2 bg-gray-200 text-gray-400 px-5 py-2.5 rounded-xl font-semibold text-sm cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Yeni Kurs
          </button>
        )}
      </div>

      {/* Unverified Warning Banner */}
      {!user?.is_verified && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0 text-amber-600 text-xl">
            ⚠️
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-800 mb-1">Hesabınız Henüz Onaylanmadı</p>
            <p className="text-xs text-amber-700 leading-relaxed">
              Kurs ve ders oluşturabilmek için eğitmen belgelerinizin (CV, mezuniyet belgesi, adli sicil kaydı) admin tarafından onaylanması gerekmektedir.
            </p>
            <Link
              href="/dashboard/teacher/profile?tab=account-info"
              className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-amber-700 hover:text-amber-900 underline"
            >
              Belgeleri yüklemek için tıklayın →
            </Link>
          </div>
        </div>
      )}

      {!myCourses || myCourses.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center shadow-sm">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Henüz kursun yok</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {user?.is_verified
              ? "İlk kursunu oluşturarak bilgini paylaşabilir ve gelir elde edebilirsin."
              : "Kurs oluşturmak için önce eğitmen belgelerinizin onaylanması gerekmektedir."}
          </p>
          {user?.is_verified ? (
            <Link
              href="/dashboard/my-courses/new"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:shadow-lg hover:shadow-teal-500/30 text-white px-6 py-3 rounded-xl font-semibold transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              İlk Kursunu Oluştur
            </Link>
          ) : (
            <Link
              href="/dashboard/teacher/profile?tab=account-info"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:shadow-lg text-white px-6 py-3 rounded-xl font-semibold transition-all"
            >
              Belgelerimi Yükle →
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {myCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-teal-300 hover:shadow-lg transition-all cursor-pointer"
              onClick={() => router.push(`/dashboard/my-courses/${course.id}`)}
            >
              <div className="h-40 bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center relative overflow-hidden">
                {course.thumbnail_path ? (
                  <img
                    src={course.thumbnail_path}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-16 h-16 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                )}
                <div className="absolute top-2 right-2">
                  {course.status === "published" ? (
                    <span className="bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-lg">
                      Yayında
                    </span>
                  ) : course.status === "pending_review" ? (
                    <span className="bg-orange-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-lg">
                      İncelemede
                    </span>
                  ) : course.status === "rejected" ? (
                    <span className="bg-red-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-lg">
                      Reddedildi
                    </span>
                  ) : course.status === "draft" ? (
                    <span className="bg-gray-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-lg">
                      Taslak
                    </span>
                  ) : (
                    <span className="bg-gray-400 text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-lg">
                      Arşiv
                    </span>
                  )}
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                  <span>{course.lessons.length} ders</span>
                  <span>
                    {course.discount_price ? (
                      <>
                        <span className="text-gray-900 font-semibold">₺{course.discount_price}</span>
                        <span className="text-gray-500 line-through ml-1">₺{course.price}</span>
                      </>
                    ) : (
                      <span className="text-gray-900 font-semibold">
                        {course.price === 0 ? "Ücretsiz" : `₺${course.price}`}
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/dashboard/my-courses/${course.id}`);
                    }}
                    className="flex-1 px-3 py-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:shadow-md text-white text-sm rounded-xl font-semibold transition-all"
                  >
                    Düzenle
                  </button>
                  {(course.status === "draft" || course.status === "rejected") && (
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (course.lessons.length === 0) {
                          alert("Kursu onaya göndermek için en az 1 ders eklemeniz gerekiyor.");
                          return;
                        }
                        if (confirm("Kursunuzu onaya göndermek istediğinize emin misiniz?")) {
                          try {
                            await coursesApi.submitForReview(course.id);
                            alert("Kursunuz başarıyla onaya gönderildi!");
                            window.location.reload();
                          } catch (err: any) {
                            const detail = err?.response?.data?.detail;
                            if (typeof detail === "string") {
                              alert(detail);
                            } else if (detail?.message) {
                              // Eksik alanları göster
                              if (detail.errors && Array.isArray(detail.errors) && detail.errors.length > 0) {
                                const errorList = detail.errors.map((e: string, i: number) => `${i + 1}. ${e}`).join("\n");
                                alert(`${detail.message}\n\n${errorList}`);
                              } else {
                                alert(detail.message);
                              }
                            } else {
                              alert("Kurs onaya gönderilirken bir hata oluştu.");
                            }
                          }
                        }
                      }}
                      className="px-3 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-md text-white text-sm rounded-xl font-semibold transition-all flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Onaya Gönder
                    </button>
                  )}
                  {course.status === "archived" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Kursu arşivden çıkarmak istediğinize emin misiniz? Kurs yayınlanacak.")) {
                          unarchiveMutation.mutate(course.id);
                        }
                      }}
                      disabled={unarchiveMutation.isPending}
                      className="px-3 py-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:shadow-md disabled:bg-gray-400 text-white text-sm rounded-xl font-semibold transition-all flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      {unarchiveMutation.isPending ? "Çıkarılıyor..." : "Arşivden Çıkar"}
                    </button>
                  )}
                  {course.status === "published" && (
                    <Link
                      href={`/courses/${course.slug}`}
                      onClick={(e) => e.stopPropagation()}
                      className="px-3 py-2 border-2 border-gray-200 hover:border-teal-300 hover:bg-teal-50 text-gray-700 text-sm rounded-xl font-semibold transition-all"
                    >
                      Görüntüle
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
