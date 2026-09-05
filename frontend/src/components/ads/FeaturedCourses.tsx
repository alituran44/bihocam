"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Star, TrendingUp, BookOpen, User, ArrowRight } from "lucide-react";
import { adDisplayApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import Image from "next/image";
import Link from "next/link";
import AdPlaceholder from "./AdPlaceholder";
import TiltCard3D from "@/components/3d/TiltCard3D";

interface FeaturedCoursesProps {
  limit?: number;
  categoryId?: string;
  className?: string;
  title?: string;
  showTitle?: boolean;
}

export default function FeaturedCourses({
  limit = 6,
  categoryId,
  className = "",
  title = "Öne Çıkan Kurslar",
  showTitle = true,
}: FeaturedCoursesProps) {
  const user = useAuthStore((state) => state.user);
  const isAdminOrTeacher = user?.role === "admin" || user?.role === "teacher";

  const { data: courses, isLoading } = useQuery({
    queryKey: ["featured-courses", limit, categoryId],
    queryFn: () =>
      adDisplayApi.getFeaturedCourses({
        limit,
        category_id: categoryId,
      }),
    staleTime: 5 * 60 * 1000, // 5 dakika
  });

  // Get placement info for placeholder (public endpoint)
  const { data: placement, isError: placementError } = useQuery({
    queryKey: ["placement-info", "featured_courses_homepage"],
    queryFn: () => adDisplayApi.getPlacementInfo("featured_courses_homepage"),
    staleTime: 10 * 60 * 1000, // 10 dakika
    retry: false, // Don't retry if not found
  });

  const clickMutation = useMutation({
    mutationFn: (campaignId: string) => adDisplayApi.trackClick(campaignId),
  });

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        {showTitle && (
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(limit)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden animate-pulse"
            >
              <div className="w-full h-48 bg-gray-200" />
              <div className="p-6 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-6 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show placeholder if no courses
  if (!courses || courses.length === 0) {
    if (placement) {
      // Get pricing info (backend returns pricing summary with all models)
      const pricing = placement.pricing;

      return (
        <section className={`space-y-8 ${className}`}>
          {showTitle && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{title}</h2>
                  <p className="text-gray-600 text-sm mt-1">En popüler ve öne çıkan kurslar</p>
                </div>
              </div>
            </div>
          )}
          <AdPlaceholder
            placementCode="featured_courses_homepage"
            placementName={placement.name}
            placementType="featured_course"
            className="min-h-[400px]"
            pricing={pricing}
          />
        </section>
      );
    }
    // If no placement info but admin/teacher, show simple placeholder
    if (isAdminOrTeacher && placementError) {
      // Placement not found, show basic placeholder
      return (
        <section className={`space-y-8 ${className}`}>
          {showTitle && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{title}</h2>
                  <p className="text-gray-600 text-sm mt-1">En popüler ve öne çıkan kurslar</p>
                </div>
              </div>
            </div>
          )}
          <AdPlaceholder
            placementCode="featured_courses_homepage"
            placementName="Öne Çıkan Kurslar"
            placementType="featured_course"
            className="min-h-[400px]"
          />
        </section>
      );
    }
    // Still loading placement info
    if (isAdminOrTeacher && !placementError) {
      return null;
    }
    return null;
  }

  return (
    <section className={`space-y-8 ${className}`}>
      {showTitle && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{title}</h2>
              <p className="text-gray-600 text-sm mt-1">En popüler ve öne çıkan kurslar</p>
            </div>
          </div>
          <Link
            href="/courses"
            className="hidden md:flex items-center gap-2 px-4 py-2 text-teal-600 hover:text-teal-700 font-semibold rounded-xl hover:bg-teal-50 transition-colors"
          >
            Tümünü Gör
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course, index) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <TiltCard3D maxTilt={7} glareOpacity={0.15} depth={12} className="h-full">
              <div className="group relative bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:border-teal-300 hover:shadow-xl transition-all duration-300 h-full">
                {/* Featured Badge */}
                <div className="absolute top-4 left-4 z-10 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg shadow-lg flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-white fill-white" />
                  <span className="text-xs font-bold text-white">ÖNE ÇIKAN</span>
                </div>

                {/* Course Image */}
                <Link
                  href={`/courses/${course.slug}`}
                  onClick={() => clickMutation.mutate(course.campaign_id)}
                  className="block relative w-full h-48 bg-gradient-to-br from-teal-100 to-emerald-100 overflow-hidden"
                >
                  {course.thumbnail_path ? (
                    <Image
                      src={course.thumbnail_path}
                      alt={course.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-teal-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>

                {/* Course Info */}
                <div className="p-6">
                  <Link
                    href={`/courses/${course.slug}`}
                    onClick={() => clickMutation.mutate(course.campaign_id)}
                    className="block"
                  >
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors">
                      {course.title}
                    </h3>
                  </Link>

                  {course.teacher && (
                    <div className="flex items-center gap-2 mb-4">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{course.teacher.full_name}</span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      {course.discount_price ? (
                        <>
                          <span className="text-2xl font-bold text-teal-600">
                            {Number(course.discount_price).toFixed(2)} TRY
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            {Number(course.price).toFixed(2)} TRY
                          </span>
                        </>
                      ) : (
                        <span className="text-2xl font-bold text-teal-600">
                          {Number(course.price).toFixed(2)} TRY
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/courses/${course.slug}`}
                      onClick={() => clickMutation.mutate(course.campaign_id)}
                      className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
                    >
                      İncele
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </TiltCard3D>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
