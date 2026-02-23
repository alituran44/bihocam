"use client";

/**
 * EPIC-10: Student Live Lessons Page (EP10-FE-10)
 * 
 * Page for students to view all upcoming live lessons from their enrolled courses
 */

import { useQuery } from "@tanstack/react-query";
import { coursesApi, enrollmentsApi, type LessonResponse } from "@/lib/api";
import { LiveLessonCard } from "@/components/content/LiveLessonCard";
import Link from "next/link";

interface Enrollment {
  id: string;
  course: {
    id: string;
    title: string;
    slug: string;
    teacher?: {
      id: string;
      full_name: string;
    } | null;
  };
}

export default function StudentLiveLessonsPage() {
  // Get student's enrollments
  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery<Enrollment[]>({
    queryKey: ["my-enrollments"],
    queryFn: () => enrollmentsApi.myEnrollments(),
  });

  // Get live lessons for each enrolled course
  const courseIds = enrollments?.map((e) => e.course.id) || [];
  const liveLessonsQueries = useQuery({
    queryKey: ["live-lessons", courseIds],
    queryFn: async () => {
      if (courseIds.length === 0) return [];
      
      // Fetch live lessons for all enrolled courses
      const promises = courseIds.map((courseId) =>
        coursesApi.getLiveLessons(courseId, "upcoming").catch(() => [])
      );
      const results = await Promise.all(promises);
      
      // Flatten and combine with course info
      const allLessons: Array<LessonResponse & { course: Enrollment["course"] }> = [];
      results.forEach((lessons, index) => {
        const course = enrollments![index].course;
        lessons.forEach((lesson) => {
          allLessons.push({ ...lesson, course });
        });
      });
      
      // Sort by live_lesson_at (upcoming first)
      return allLessons.sort((a, b) => {
        if (!a.live_lesson_at) return 1;
        if (!b.live_lesson_at) return -1;
        return new Date(a.live_lesson_at).getTime() - new Date(b.live_lesson_at).getTime();
      });
    },
    enabled: courseIds.length > 0 && !!enrollments,
  });

  const liveLessons = liveLessonsQueries.data || [];
  const isLoading = enrollmentsLoading || liveLessonsQueries.isLoading;

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Canlı Dersler</h1>
          <p className="text-gray-600">Yaklaşan canlı derslerinizi görüntüleyin</p>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (liveLessons.length === 0) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Canlı Dersler</h1>
          <p className="text-gray-600">Yaklaşan canlı derslerinizi görüntüleyin</p>
        </div>
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-16 text-center">
          <svg className="w-24 h-24 mx-auto mb-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Yaklaşan canlı ders yok</h3>
          <p className="text-gray-600 mb-6">
            Kayıtlı olduğunuz kurslarda şu anda yaklaşan canlı ders bulunmuyor.
          </p>
          <Link
            href="/dashboard/courses"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:shadow-lg hover:shadow-teal-500/30 text-white px-6 py-3 rounded-lg font-medium transition-all"
          >
            Kurslarıma Git
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Canlı Dersler</h1>
        <p className="text-gray-600">
          {liveLessons.length} yaklaşan canlı ders bulundu
        </p>
      </div>

      <div className="space-y-6">
        {liveLessons.map((lesson) => (
          <div key={lesson.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Link
                      href={`/courses/${lesson.course.slug}`}
                      className="text-sm font-medium text-teal-600 hover:text-teal-700"
                    >
                      {lesson.course.title}
                    </Link>
                    {lesson.course.teacher && (
                      <span className="text-sm text-gray-500">
                        • {lesson.course.teacher.full_name}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{lesson.title}</h3>
                  {lesson.description && (
                    <p className="text-gray-600 mb-4">{lesson.description}</p>
                  )}
                </div>
              </div>
              
              <LiveLessonCard
                title=""
                description=""
                liveLessonUrl={lesson.live_lesson_url}
                liveLessonAt={lesson.live_lesson_at}
                isEnded={lesson.is_live_lesson_ended || false}
                recordingUrl={lesson.live_lesson_recording_url}
                className="border-t border-gray-200 pt-4 mt-4"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
