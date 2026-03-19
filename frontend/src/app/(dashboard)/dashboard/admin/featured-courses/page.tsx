"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Star,
  Search,
  X,
  CheckCircle2,
  XCircle,
  Loader2,
  BookOpen,
  User,
  DollarSign,
} from "lucide-react";
import { coursesApi } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

export default function AdminFeaturedCoursesPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  // Get all courses for selection
  const { data: allCourses, isLoading: allCoursesLoading } = useQuery<Course[]>({
    queryKey: ["admin-all-courses"],
    queryFn: () => coursesApi.listAllAdmin(0, 1000),
  });

  // Get featured courses
  const { data: featuredCourses, isLoading: featuredLoading } = useQuery<Course[]>({
    queryKey: ["admin-featured-courses"],
    queryFn: () => coursesApi.listFeatured(0, 100),
  });

  const featuredIds = new Set(featuredCourses?.map((c) => c.id) || []);

  // Set featured mutation
  const setFeaturedMutation = useMutation({
    mutationFn: ({ courseId, isFeatured }: { courseId: string; isFeatured: boolean }) =>
      coursesApi.setFeatured(courseId, isFeatured),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-featured-courses"] });
      queryClient.invalidateQueries({ queryKey: ["admin-all-courses"] });
      queryClient.invalidateQueries({ queryKey: ["featured-courses-public"] });
      toast.success("Kurs güncellendi");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Bir hata oluştu");
    },
  });

  const handleToggleFeatured = (courseId: string, currentStatus: boolean) => {
    setFeaturedMutation.mutate({ courseId, isFeatured: !currentStatus });
  };

  // Filter courses
  const filteredCourses = allCourses?.filter((course) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      course.title.toLowerCase().includes(query) ||
      course.teacher?.full_name?.toLowerCase().includes(query) ||
      course.slug.toLowerCase().includes(query)
    );
  }) || [];

  const isLoading = allCoursesLoading || featuredLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Popüler Kurslar Yönetimi</h1>
          <p className="text-gray-600 mt-1">
            Ana sayfada gösterilecek popüler kursları seçin
          </p>
        </div>
      </div>

      {/* Stats */}
      {featuredCourses && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <Star className="w-6 h-6 text-white fill-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Öne Çıkan Kurslar</p>
                <p className="text-2xl font-bold text-gray-900">{featuredCourses.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl p-4 border border-teal-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Toplam Kurs</p>
                <p className="text-2xl font-bold text-gray-900">{allCourses?.length || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Yayında Olan</p>
                <p className="text-2xl font-bold text-gray-900">
                  {allCourses?.filter((c) => c.status === "published").length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Kurs ara (başlık, eğitmen, slug)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Courses List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">Kurs bulunamadı</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, index) => {
            const isFeatured = featuredIds.has(course.id);
            const isPublished = course.status === "published";

            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white rounded-2xl border-2 overflow-hidden transition-all ${
                  isFeatured
                    ? "border-amber-400 shadow-lg shadow-amber-100"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {/* Course Image */}
                <Link href={`/courses/${course.slug}`} className="block">
                  <div className="relative w-full h-48 bg-gradient-to-br from-teal-100 to-emerald-100 overflow-hidden">
                    {course.thumbnail_path ? (
                      <Image
                        src={course.thumbnail_path}
                        alt={course.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-teal-300" />
                      </div>
                    )}
                    {isFeatured && (
                      <div className="absolute top-3 left-3 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg shadow-lg flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-white fill-white" />
                        <span className="text-xs font-bold text-white">ÖNE ÇIKAN</span>
                      </div>
                    )}
                    {!isPublished && (
                      <div className="absolute top-3 right-3 px-2 py-1 bg-gray-500 text-white text-xs font-semibold rounded-lg">
                        {course.status === "draft" && "Taslak"}
                        {course.status === "pending_review" && "Onay Bekliyor"}
                        {course.status === "rejected" && "Reddedildi"}
                        {course.status === "archived" && "Arşivlendi"}
                      </div>
                    )}
                  </div>
                </Link>

                {/* Course Info */}
                <div className="p-5">
                  <Link href={`/courses/${course.slug}`}>
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 hover:text-teal-600 transition-colors">
                      {course.title}
                    </h3>
                  </Link>

                  {course.teacher && (
                    <div className="flex items-center gap-2 mb-3">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{course.teacher.full_name}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="text-lg font-bold text-gray-900">
                        {course.discount_price ? (
                          <>
                            <span className="text-teal-600">₺{course.discount_price}</span>
                            <span className="text-sm text-gray-400 line-through ml-2">
                              ₺{course.price}
                            </span>
                          </>
                        ) : course.price === 0 ? (
                          <span className="text-teal-600">Ücretsiz</span>
                        ) : (
                          `₺${course.price}`
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Featured Toggle */}
                  <button
                    onClick={() => handleToggleFeatured(course.id, isFeatured)}
                    disabled={setFeaturedMutation.isPending || !isPublished}
                    className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                      isFeatured
                        ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:shadow-lg hover:shadow-amber-200"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    } ${!isPublished ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {setFeaturedMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isFeatured ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Öne Çıkanlardan Kaldır</span>
                      </>
                    ) : (
                      <>
                        <Star className="w-4 h-4" />
                        <span>Öne Çıkan Yap</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
