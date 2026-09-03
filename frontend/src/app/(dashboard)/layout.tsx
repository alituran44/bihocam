"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { messagesApi } from "@/lib/api";
import Avatar from "@/components/Avatar";
import AnnouncementBanner from "@/components/AnnouncementBanner";

// Unread message count badge component
function UnreadMessageBadge() {
  const { data: unreadCountData } = useQuery({
    queryKey: ["unread-count"],
    queryFn: () => messagesApi.getUnreadCount(),
    refetchInterval: 30000, // Poll every 30 seconds
  });

  const unreadCount = unreadCountData?.unread_count || 0;

  if (unreadCount === 0) return null;

  return (
    <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-semibold min-w-[20px] text-center">
      {unreadCount > 99 ? "99+" : unreadCount}
    </span>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    courses: true,
    users: true,
    analytics: true,
    financial: true,
    notifications: true,
    announcements: true,
    ads: true,
    blog: true,
    settings: true,
    crm: true,
    contact: true,
    payment: true,
    programs: true,
  });
  
  const isActive = (path: string) => pathname === path;
  const startsWithPath = (path: string) => pathname?.startsWith(path);

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

    if (!isAuthenticated && !token) {
      router.push("/login");
    }

    setCheckingAuth(false);
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50/30 to-blue-50/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600 font-medium">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Base navigation items
  const baseNavItems = [
    {
      href: "/dashboard",
      label: "Ana Sayfa",
      active: isActive("/dashboard"),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
  ];

  // Teacher specific items
  const teacherItems =
    user?.role === "teacher"
      ? [
          {
            href: "/dashboard/my-courses",
            label: "Kurslarım",
            active: startsWithPath("/dashboard/my-courses"),
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            ),
          },
          {
            href: "/dashboard/ai-studio",
            label: "AI Eğitim Stüdyosu",
            active: startsWithPath("/dashboard/ai-studio"),
            icon: (
              <span className="text-base">✨</span>
            ),
          },
          {
            href: "/dashboard/teacher/profile",
            label: "Profil & Finansal",
            active: startsWithPath("/dashboard/teacher/profile"),
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            ),
          },
          {
            href: "/dashboard/teacher/withdrawals",
            label: "Çekim Talepleri",
            active: startsWithPath("/dashboard/teacher/withdrawals"),
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ),
          },
          {
            href: "/dashboard/teacher/sales",
            label: "Satışlarım",
            active: startsWithPath("/dashboard/teacher/sales"),
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 17l6-6 4 4 8-8M14 7h7v7"
                />
              </svg>
            ),
          },
          {
            href: "/dashboard/teacher/students",
            label: "Öğrencilerim",
            active: startsWithPath("/dashboard/teacher/students"),
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ),
          },
          {
            href: "/dashboard/teacher/reviews",
            label: "Yorumlar",
            active: startsWithPath("/dashboard/teacher/reviews"),
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                />
              </svg>
            ),
          },
          {
            href: "/dashboard/teacher/analytics",
            label: "Analizlerim",
            active: startsWithPath("/dashboard/teacher/analytics"),
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            ),
          },
          {
            href: "/dashboard/teacher/ads",
            label: "Reklam Kampanyaları",
            active: startsWithPath("/dashboard/teacher/ads"),
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                />
              </svg>
            ),
          },
          {
            href: "/dashboard/blog/posts",
            label: "Blog Yazılarım",
            active: startsWithPath("/dashboard/blog/posts"),
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            ),
          },
          {
            href: "/dashboard/teacher/live-classes",
            label: "Canlı Ders Yönetimi",
            active: startsWithPath("/dashboard/teacher/live-classes"),
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            ),
          },
          {
            href: "/dashboard/teacher/homeworks",
            label: "Ödev Yönetimi",
            active: startsWithPath("/dashboard/teacher/homeworks"),
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            ),
          },
          {
            href: "/dashboard/teacher/quizzes",
            label: "Test Yönetimi",
            active: startsWithPath("/dashboard/teacher/quizzes"),
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
          },
          {
            href: "/dashboard/teacher/mock-exams",
            label: "Deneme Yönetimi",
            active: startsWithPath("/dashboard/teacher/mock-exams"),
            icon: (
              <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            ),
          },
          {
            href: "/dashboard/teacher/library",
            label: "Kütüphane Yönetimi",
            active: startsWithPath("/dashboard/teacher/library"),
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20" />
              </svg>
            ),
          },
        ]
      : [];

  // Student specific items (sadece student için)
  const studentItems =
    user?.role === "student"
      ? [
          {
            href: "/dashboard/courses",
            label: "Kayıtlı Kurslarım",
            active: startsWithPath("/dashboard/courses"),
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            ),
          },
          {
            href: "/dashboard/ai-studio",
            label: "AI Çalışma Odası",
            active: startsWithPath("/dashboard/ai-studio"),
            icon: (
              <span className="text-base">✨</span>
            ),
          },
          {
            href: "/dashboard/my-certificates",
            label: "Sertifikalarım",
            active: startsWithPath("/dashboard/my-certificates"),
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
            ),
          },
          {
            href: "/dashboard/my-reviews",
            label: "Yorumlarım",
            active: startsWithPath("/dashboard/my-reviews"),
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                />
              </svg>
            ),
          },
          {
            href: "/dashboard/orders",
            label: "Siparişlerim",
            active: startsWithPath("/dashboard/orders"),
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            ),
          },
          // EPIC-10: Canlı Dersler (opsiyonel - öğrenci için)
          {
            href: "/dashboard/live-lessons",
            label: "Canlı Dersler",
            active: startsWithPath("/dashboard/live-lessons"),
            icon: (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            ),
          },

          {
            href: "/dashboard/student/live-classes",
            label: "Canlı Derslerim",
            active: startsWithPath("/dashboard/student/live-classes"),
            icon: (
              <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            ),
          },
          {
            href: "/dashboard/student/assigned-quizzes",
            label: "Atanan Testler",
            active: startsWithPath("/dashboard/student/assigned-quizzes"),
            icon: (
              <svg className="w-5 h-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            ),
          },
          {
            href: "/dashboard/student/mock-exams",
            label: "Deneme Sınavları",
            active: startsWithPath("/dashboard/student/mock-exams"),
            icon: (
              <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            ),
          },
        ]
      : [];

  // Admin grouped navigation
  const adminGroups =
    user?.role === "admin"
      ? [
          {
            key: "courses",
            label: "Kurslar",
            icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            ),
            items: [
              {
                href: "/dashboard/admin/courses",
                label: "Tüm Kurslar",
                active: startsWithPath("/dashboard/admin/courses") && !startsWithPath("/dashboard/admin/courses/pending"),
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                ),
              },
              {
                href: "/dashboard/admin/courses/pending",
                label: "Bekleyen Eğitimler",
                active: startsWithPath("/dashboard/admin/courses/pending"),
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
              },
              {
                href: "/dashboard/categories",
                label: "Kategoriler",
                active: startsWithPath("/dashboard/categories"),
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h10M4 14h7M4 18h4" />
                  </svg>
                ),
              },
            ],
          },
          {
            key: "users",
            label: "Kullanıcılar",
            icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ),
            items: [
              {
                href: "/dashboard/admin/users",
                label: "Kullanıcı Yönetimi",
                active: startsWithPath("/dashboard/admin/users"),
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ),
              },
              {
                href: "/dashboard/admin/teachers",
                label: "Eğitmen Yönetimi",
                active: startsWithPath("/dashboard/admin/teachers"),
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                ),
              },
              {
                href: "/dashboard/admin/teacher-applications",
                label: "Eğitmen Başvuruları",
                active: startsWithPath("/dashboard/admin/teacher-applications"),
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
              },
              {
                href: "/dashboard/admin/students",
                label: "Öğrenciler",
                active: startsWithPath("/dashboard/admin/students"),
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ),
              },
              {
                href: "/dashboard/admin/reviews",
                label: "Yorumlar",
                active: startsWithPath("/dashboard/admin/reviews"),
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                ),
              },
            ],
          },
          {
            key: "analytics",
            label: "Analitik",
            icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            ),
            items: [
              {
                href: "/dashboard/admin/analytics",
                label: "Genel Bakış",
                active: startsWithPath("/dashboard/admin/analytics") && !startsWithPath("/dashboard/admin/analytics/categories") && !startsWithPath("/dashboard/admin/analytics/courses") && !startsWithPath("/dashboard/admin/analytics/students") && !startsWithPath("/dashboard/admin/analytics/teachers") && !startsWithPath("/dashboard/admin/analytics/timeseries"),
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
              },
              {
                href: "/dashboard/admin/analytics/categories",
                label: "Kategori Analizi",
                active: startsWithPath("/dashboard/admin/analytics/categories"),
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h10M4 14h7M4 18h4" />
                  </svg>
                ),
              },
              {
                href: "/dashboard/admin/analytics/courses",
                label: "Kurs Performansı",
                active: startsWithPath("/dashboard/admin/analytics/courses"),
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                ),
              },
              {
                href: "/dashboard/admin/analytics/students",
                label: "Öğrenci Analizi",
                active: startsWithPath("/dashboard/admin/analytics/students"),
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ),
              },
              {
                href: "/dashboard/admin/analytics/teachers",
                label: "Eğitmen Performansı",
                active: startsWithPath("/dashboard/admin/analytics/teachers"),
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                ),
              },
              {
                href: "/dashboard/admin/analytics/timeseries",
                label: "Zaman Serisi Analizi",
                active: startsWithPath("/dashboard/admin/analytics/timeseries"),
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                ),
              },
            ],
          },
          {
            key: "blog",
            label: "Blog",
            icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            ),
            items: [
              {
                href: "/dashboard/blog/posts",
                label: "Blog Yazıları",
                active: startsWithPath("/dashboard/blog/posts"),
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
              },
              ...(user?.role === "admin"
                ? [
                    {
                      href: "/dashboard/admin/blog/categories",
                      label: "Kategoriler",
                      active: startsWithPath("/dashboard/admin/blog/categories"),
                      icon: (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      ),
                    },
                    {
                      href: "/dashboard/admin/blog/tags",
                      label: "Etiketler",
                      active: startsWithPath("/dashboard/admin/blog/tags"),
                      icon: (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      ),
                    },
                    {
                      href: "/dashboard/admin/blog/stats",
                      label: "Blog İstatistikleri",
                      active: startsWithPath("/dashboard/admin/blog/stats"),
                      icon: (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      ),
                    },
                    {
                      href: "/dashboard/admin/blog/pending",
                      label: "Onay Bekleyen Yazılar",
                      active: startsWithPath("/dashboard/admin/blog/pending"),
                      icon: (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ),
                    },
                  ]
                : []),
            ],
          },
          {
            key: "financial",
            label: "Finansal",
            icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            items: [
              {
                href: "/dashboard/admin/orders",
                label: "Sipariş Yönetimi",
                active: startsWithPath("/dashboard/admin/orders"),
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                ),
              },
              {
                href: "/dashboard/admin/coupons",
                label: "Kupon Yönetimi",
                active: startsWithPath("/dashboard/admin/coupons"),
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 7l-2-2-2 2m-2 6l2 2 2-2m7-1a2 2 0 00-2-2H7a2 2 0 00-2 2v4a2 2 0 002 2h10a2 2 0 002-2v-4zM7 9h10a2 2 0 012 2v0a2 2 0 01-2 2H7a2 2 0 01-2-2v0a2 2 0 012-2z" />
                  </svg>
                ),
              },
              {
                href: "/dashboard/admin/withdrawals",
                label: "Çekim Talepleri",
                active: startsWithPath("/dashboard/admin/withdrawals"),
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
              {
                href: "/dashboard/admin/bank-accounts",
                label: "Banka Hesabı Talepleri",
                active: startsWithPath("/dashboard/admin/bank-accounts"),
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                ),
              },
            ],
          },
          {
            key: "notifications",
            label: "Bildirim",
            icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            ),
            items: [
              {
                href: "/dashboard/admin/notifications",
                label: "Bildirim Oluştur",
                active: startsWithPath("/dashboard/admin/notifications"),
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                ),
              },
              {
                href: "/dashboard/admin/notifications/logs",
                label: "Bildirim Logları",
                active: startsWithPath("/dashboard/admin/notifications/logs"),
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
              },
              {
                href: "/dashboard/admin/email-logs",
                label: "Email Logları",
                active: startsWithPath("/dashboard/admin/email-logs"),
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
              },
            ],
          },
          {
            key: "announcements",
            label: "Duyurular",
            icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            ),
            items: [
              {
                href: "/dashboard/admin/announcements",
                label: "Duyuru Yönetimi",
                active: startsWithPath("/dashboard/admin/announcements"),
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                ),
              },
              {
                href: "/dashboard/admin/popups",
                label: "Pop-up Duyuruları",
                active: startsWithPath("/dashboard/admin/popups"),
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                ),
              },
            ],
          },
          {
            key: "ads",
            label: "Reklam",
            icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
            ),
            items: [
              {
                href: "/dashboard/admin/ads/featured-courses",
                label: "Öne Çıkan Kurslar (Reklam)",
                active: startsWithPath("/dashboard/admin/ads/featured-courses"),
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                ),
              },
              {
                href: "/dashboard/admin/ads/campaigns",
                label: "Tüm Kampanyalar",
                active: startsWithPath("/dashboard/admin/ads/campaigns") && !startsWithPath("/dashboard/admin/ads/featured-courses") && !startsWithPath("/dashboard/admin/ads/placements") && !startsWithPath("/dashboard/admin/ads/pricing") && !startsWithPath("/dashboard/admin/ads/approvals") && !startsWithPath("/dashboard/admin/ads/analytics"),
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
              },
              {
                href: "/dashboard/admin/ads/approvals",
                label: "Kampanya Onayları",
                active: startsWithPath("/dashboard/admin/ads/approvals"),
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
              {
                href: "/dashboard/admin/ads/placements",
                label: "Reklam Yerleşimleri",
                active: startsWithPath("/dashboard/admin/ads/placements"),
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                ),
              },
              {
                href: "/dashboard/admin/ads/pricing",
                label: "Reklam Fiyatlandırması",
                active: startsWithPath("/dashboard/admin/ads/pricing"),
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
              {
                href: "/dashboard/admin/ads/analytics",
                label: "Reklam Analitikleri",
                active: startsWithPath("/dashboard/admin/ads/analytics"),
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ),
              },
            ],
          },
          {
            key: "settings",
            label: "Ayarlar",
            icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            ),
            items: [
              {
                href: "/dashboard/admin/settings/general",
                label: "Genel",
                active: startsWithPath("/dashboard/admin/settings/general"),
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                ),
              },
              {
                href: "/dashboard/admin/settings/email",
                label: "E-posta",
                active: startsWithPath("/dashboard/admin/settings/email"),
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.945a2 2 0 002.22 0L21 8m-18 8h18a2 2 0 002-2V8a2 2 0 00-2-2H3a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                ),
              },
              {
                href: "/dashboard/admin/settings/advanced",
                label: "Gelişmiş",
                active: startsWithPath("/dashboard/admin/settings/advanced"),
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                ),
              },
            ],
          },
          {
            key: "crm",
            label: "CRM",
            icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16h6M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2h-3.172a2 2 0 01-1.414-.586l-.828-.828A2 2 0 0012.172 4H11.828a2 2 0 00-1.414.586l-.828.828A2 2 0 018.172 6H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            ),
            items: [
              {
                href: "/dashboard/admin/crm/audiences/create",
                label: "Kitle Oluşturma",
                active: startsWithPath("/dashboard/admin/crm/audiences/create"),
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3M5 20h9a2 2 0 002-2v-1a6 6 0 10-12 0v1a2 2 0 002 2zm3-14a4 4 0 100 8 4 4 0 000-8z" />
                  </svg>
                ),
              },
              {
                href: "/dashboard/admin/crm/audiences",
                label: "Kitle Görüntüleme",
                active: startsWithPath("/dashboard/admin/crm/audiences") && !startsWithPath("/dashboard/admin/crm/audiences/create"),
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-1a4 4 0 00-5.356-3.77M9 20H4v-1a4 4 0 015.356-3.77M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 6a2 2 0 11-4 0 2 2 0 014 0zM7 13a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ),
              },
              {
                href: "/dashboard/admin/crm/templates",
                label: "Mail Template Önizleme",
                active: startsWithPath("/dashboard/admin/crm/templates") && !startsWithPath("/dashboard/admin/crm/templates/create"),
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.945a2 2 0 002.22 0L21 8m-18 8h18a2 2 0 002-2V8a2 2 0 00-2-2H3a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                ),
              },
              {
                href: "/dashboard/admin/crm/templates/create",
                label: "Mail Şablon Oluşturma",
                active: startsWithPath("/dashboard/admin/crm/templates/create"),
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                ),
              },
              {
                href: "/dashboard/admin/crm/campaigns",
                label: "Kampanya Başlat",
                active: startsWithPath("/dashboard/admin/crm/campaigns"),
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5l-7 7 7 7M4 12h16" />
                  </svg>
                ),
              },
            ],
          },
          // EPIC-10: İçerik Yönetimi
          {
            key: "content",
            label: "İçerik Yönetimi",
            icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            ),
            items: [
              {
                href: "/dashboard/admin/content",
                label: "İçerik İstatistikleri",
                active: startsWithPath("/dashboard/admin/content"),
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
              },
              {
                href: "/dashboard/admin/quizzes",
                label: "Quiz Yönetimi",
                active: startsWithPath("/dashboard/admin/quizzes"),
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                ),
              },
              {
                href: "/dashboard/admin/mock-exams",
                label: "Deneme Yönetimi",
                active: startsWithPath("/dashboard/admin/mock-exams"),
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
              },
              {
                href: "/dashboard/admin/homeworks",
                label: "Ödev Yönetimi",
                active: startsWithPath("/dashboard/admin/homeworks"),
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
              },
            ],
          },
          // İletişim Yönetimi
          {
            key: "contact",
            label: "İletişim",
            icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.945a2 2 0 002.22 0L21 8m-18 8h18a2 2 0 002-2V8a2 2 0 00-2-2H3a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
            ),
            items: [
              {
                href: "/dashboard/admin/contact",
                label: "İletişim Bilgileri",
                active: isActive("/dashboard/admin/contact"),
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
              },
              {
                href: "/dashboard/admin/contact?tab=faq",
                label: "SSS Yönetimi",
                active: false,
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
              {
                href: "/dashboard/admin/contact?tab=messages",
                label: "Gelen Mesajlar",
                active: false,
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                ),
              },
            ],
          },
          // Ödeme & Destek Ayarları
          {
            key: "payment",
            label: "Ödeme & Destek",
            icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            ),
            items: [
              {
                href: "/dashboard/admin/payment-settings",
                label: "Banka Hesapları",
                active: isActive("/dashboard/admin/payment-settings"),
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                ),
              },
              {
                href: "/dashboard/admin/payment-settings?tab=whatsapp",
                label: "WhatsApp Ayarları",
                active: false,
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                ),
              },
              {
                href: "/dashboard/admin/payment-settings?tab=aichat",
                label: "AI Canlı Destek",
                active: false,
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                ),
              },
            ],
          },
          // Eğitim Programları
          {
            key: "programs",
            label: "Eğitim Programları",
            icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            ),
            items: [
              {
                href: "/dashboard/admin/education-programs",
                label: "Tüm Programlar",
                active: isActive("/dashboard/admin/education-programs"),
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                ),
              },
              {
                href: "/dashboard/admin/education-programs?tab=add",
                label: "Yeni Program Ekle",
                active: false,
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                ),
              },
              {
                href: "/dashboard/admin/education-programs?tab=categories",
                label: "Kategori Sıralaması",
                active: false,
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                  </svg>
                ),
              },
            ],
          },
        ]
      : [];

  const commonNavItems = [
    {
      href: "/dashboard/messages",
      label: "Mesajlar",
      active: startsWithPath("/dashboard/messages"),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      ),
    },
    {
      href: "/dashboard/notifications",
      label: "Bildirimler",
      active: startsWithPath("/dashboard/notifications") && !startsWithPath("/dashboard/admin/notifications"),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      ),
    },
    {
      href: "/dashboard/settings",
      label: "Ayarlar",
      active: startsWithPath("/dashboard/settings"),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  const socialGroup = {
    key: "social",
    label: "Etkileşim ve Takip",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
      </svg>
    ),
    items: [
      {
        href: "/dashboard/social/reels",
        label: "Klipler (Reels)",
        active: startsWithPath("/dashboard/social/reels"),
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
      {
        href: "/dashboard/social/saved",
        label: "Kaydedilenler",
        active: startsWithPath("/dashboard/social/saved"),
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        ),
      },
      {
        href: user?.role === "admin" ? "/dashboard/admin/popcasts" : user?.role === "teacher" ? "/dashboard/teacher/popcasts" : "/dashboard/student/popcasts",
        label: "Popcast",
        active: startsWithPath("/dashboard/admin/popcasts") || startsWithPath("/dashboard/teacher/popcasts") || startsWithPath("/dashboard/student/popcasts"),
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        ),
      },
      ...(user?.role === "teacher" || user?.role === "admin"
        ? [
            {
              href: "/dashboard/social/studio",
              label: "İçerik Stüdyosu",
              active: startsWithPath("/dashboard/social/studio"),
              icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              ),
            },
          ]
        : []),
      {
        href: "/dashboard/social/network",
        label: "Takipçi & Takip",
        active: startsWithPath("/dashboard/social/network"),
        icon: (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-blue-50/10">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-72 bg-white/95 backdrop-blur-xl border-r border-gray-200/50 shadow-xl z-20">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200/50 bg-gradient-to-br from-teal-500/5 to-blue-500/5">
          <Link href="/" className="flex flex-col items-start gap-1 group">
            <img src="/logo.png" alt="BiHocam Logo" className="h-10 w-auto object-contain" />
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1.5 ml-1">
              {user?.role === "admin" ? "Admin Panel" : user?.role === "teacher" ? "Eğitmen Paneli" : "Öğrenci Paneli"}
            </p>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-200px)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {/* Base Items */}
          {baseNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                item.active
                  ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/30"
                  : "text-gray-700 hover:bg-gradient-to-r hover:from-teal-50 hover:to-blue-50 hover:text-teal-700"
              }`}
            >
              <div className={`${item.active ? "text-white" : "text-gray-500 group-hover:text-teal-600"}`}>
                {item.icon}
              </div>
              <span className="font-semibold">{item.label}</span>
            </Link>
          ))}

          {/* Teacher Items */}
          {teacherItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                item.active
                  ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/30"
                  : "text-gray-700 hover:bg-gradient-to-r hover:from-teal-50 hover:to-blue-50 hover:text-teal-700"
              }`}
            >
              <div className={`${item.active ? "text-white" : "text-gray-500 group-hover:text-teal-600"}`}>
                {item.icon}
              </div>
              <span className="font-semibold">{item.label}</span>
            </Link>
          ))}

          {/* Student Items */}
          {studentItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                item.active
                  ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/30"
                  : "text-gray-700 hover:bg-gradient-to-r hover:from-teal-50 hover:to-blue-50 hover:text-teal-700"
              }`}
            >
              <div className={`${item.active ? "text-white" : "text-gray-500 group-hover:text-teal-600"}`}>
                {item.icon}
              </div>
              <span className="font-semibold">{item.label}</span>
            </Link>
          ))}

          {/* Admin Groups */}
          {adminGroups.map((group) => {
            const isExpanded = expandedGroups[group.key];
            const hasActiveItem = group.items.some((item) => item.active);

            return (
              <div key={group.key} className="space-y-1">
                <button
                  onClick={() => toggleGroup(group.key)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                    hasActiveItem
                      ? "bg-gradient-to-r from-teal-50 to-blue-50 text-teal-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`${hasActiveItem ? "text-teal-600" : "text-gray-500 group-hover:text-teal-600"}`}>
                      {group.icon}
                    </div>
                    <span className="font-semibold text-sm">{group.label}</span>
                  </div>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""} ${
                      hasActiveItem ? "text-teal-600" : "text-gray-400"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isExpanded && (
                  <div className="ml-4 space-y-1 border-l-2 border-gray-200 pl-2">
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group ${
                          item.active
                            ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md shadow-teal-500/20 ml-2"
                            : "text-gray-600 hover:bg-teal-50 hover:text-teal-700 hover:ml-1"
                        }`}
                      >
                        <div className={`${item.active ? "text-white" : "text-gray-400 group-hover:text-teal-600"}`}>
                          {item.icon}
                        </div>
                        <span className="font-medium text-sm">{item.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}


          {/* Social Group */}
          <div className="space-y-1">
            <button
              onClick={() => toggleGroup("social")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                socialGroup.items.some((item) => item.active)
                  ? "bg-gradient-to-r from-teal-50 to-blue-50 text-teal-700"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`${socialGroup.items.some((item) => item.active) ? "text-teal-600" : "text-gray-500 group-hover:text-teal-600"}`}>
                  {socialGroup.icon}
                </div>
                <span className="font-semibold text-base">{socialGroup.label}</span>
              </div>
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${expandedGroups["social"] !== false ? "rotate-180" : ""} ${
                  socialGroup.items.some((item) => item.active) ? "text-teal-600" : "text-gray-400"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedGroups["social"] !== false && (
              <div className="ml-4 space-y-1 border-l-2 border-gray-200 pl-2">
                {socialGroup.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group ${
                      item.active
                        ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md shadow-teal-500/20 ml-2"
                        : "text-gray-600 hover:bg-teal-50 hover:text-teal-700 hover:ml-1"
                    }`}
                  >
                    <div className={`${item.active ? "text-white" : "text-gray-400 group-hover:text-teal-600"}`}>
                      {item.icon}
                    </div>
                    <span className="font-medium text-sm">{item.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Common Items */}
          {commonNavItems.map((item) => {
            // Special handling for messages link with unread count badge
            const isMessagesLink = item.href === "/dashboard/messages";
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                  item.active
                    ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/30"
                    : "text-gray-700 hover:bg-gradient-to-r hover:from-teal-50 hover:to-blue-50 hover:text-teal-700"
                }`}
              >
                <div className={`${item.active ? "text-white" : "text-gray-500 group-hover:text-teal-600"}`}>
                  {item.icon}
                </div>
                <span className="font-semibold">{item.label}</span>
                {isMessagesLink && <UnreadMessageBadge />}
              </Link>
            );
          })}
        </nav>

        {/* User Card */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200/50 bg-gradient-to-br from-gray-50/80 to-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-3 p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-200">
            <Avatar
              src={(user as any)?.avatar_url}
              name={user?.full_name || "User"}
              size="sm"
              className="ring-2 ring-teal-500/20"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.full_name}</p>
              <p className="text-xs text-gray-500 capitalize font-medium">
                {user?.role === "teacher" ? "Eğitmen" : user?.role === "admin" ? "Admin" : "Öğrenci"}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110"
              title="Çıkış Yap"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-72">
        {/* Top Bar */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
          <div className="flex items-center justify-between px-8 py-4">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {pathname === "/dashboard" && "Kontrol Paneli"}
                {startsWithPath("/dashboard/my-courses") && "Kurslarım"}
                {startsWithPath("/dashboard/admin/courses/pending") && "Bekleyen Eğitimler"}
                {startsWithPath("/dashboard/admin/courses/") && "Kurs İnceleme"}
                {startsWithPath("/dashboard/categories") && "Kategoriler"}
                {startsWithPath("/dashboard/courses") && "Kayıtlı Kurslarım"}
                {startsWithPath("/dashboard/orders") && "Siparişlerim"}
                {startsWithPath("/dashboard/admin/orders") && "Sipariş Yönetimi"}
                {startsWithPath("/dashboard/admin/coupons") && "Kupon Yönetimi"}
                {startsWithPath("/dashboard/teacher/sales") && "Satışlarım"}
                {startsWithPath("/dashboard/teacher/library") && "Kütüphane Yönetimi"}
                {startsWithPath("/dashboard/ai-studio") && "AI Eğitim Stüdyosu"}
                {startsWithPath("/dashboard/teacher/homeworks") && "Ödev Yönetimi"}
                {startsWithPath("/dashboard/teacher/quizzes") && "Test Yönetimi"}
                {startsWithPath("/dashboard/admin/homeworks") && "Ödev Yönetimi (Yönetici)"}
                {startsWithPath("/dashboard/admin/quizzes") && "Quiz Yönetimi (Yönetici)"}
                {startsWithPath("/dashboard/settings") && "Ayarlar"}
                {startsWithPath("/dashboard/admin/announcements") && "Duyuru Yönetimi"}
                {startsWithPath("/dashboard/admin/popups") && "Pop-up Duyuruları"}
                {startsWithPath("/dashboard/blog/posts") && (user?.role === "admin" ? "Blog Yazıları" : "Blog Yazılarım")}
                {startsWithPath("/dashboard/admin/blog/categories") && "Blog Kategorileri"}
                {startsWithPath("/dashboard/admin/blog/tags") && "Blog Etiketleri"}
                {startsWithPath("/dashboard/admin/blog/stats") && "Blog İstatistikleri"}
                {startsWithPath("/dashboard/admin/blog/pending") && "Onay Bekleyen Yazılar"}
                {startsWithPath("/dashboard/admin/settings/general") && "Genel Ayarlar"}
                {startsWithPath("/dashboard/admin/settings/email") && "E-posta Ayarları"}
                {startsWithPath("/dashboard/admin/settings/advanced") && "Gelişmiş Ayarlar"}
                {startsWithPath("/dashboard/admin/notifications") && !startsWithPath("/dashboard/admin/notifications/logs") && "Bildirim Oluştur"}
                {startsWithPath("/dashboard/admin/notifications/logs") && "Bildirim Logları"}
                {startsWithPath("/dashboard/admin/email-templates") && "Email Şablonları"}
                {startsWithPath("/dashboard/admin/email-logs") && "Email Logları"}
                {startsWithPath("/dashboard/admin/crm/templates/create") && "CRM Mail Şablon Oluşturma"}
                {startsWithPath("/dashboard/admin/crm/templates") && !startsWithPath("/dashboard/admin/crm/templates/create") && "CRM Mail Template Önizleme"}
                {startsWithPath("/dashboard/admin/crm/campaigns") && "CRM Kampanya Başlat"}
                {startsWithPath("/dashboard/admin/crm/audiences/create") && "CRM Kitle Oluşturma"}
                {startsWithPath("/dashboard/admin/crm/audiences") && !startsWithPath("/dashboard/admin/crm/audiences/create") && "CRM Kitle Görüntüleme"}
                {startsWithPath("/dashboard/admin/teachers") && "Eğitmen Yönetimi"}
                {startsWithPath("/dashboard/admin/users") && "Kullanıcı Yönetimi"}
                {startsWithPath("/dashboard/admin/withdrawals") && "Çekim Talepleri"}
                {startsWithPath("/dashboard/admin/bank-accounts") && "Banka Hesabı Talepleri"}
                {startsWithPath("/dashboard/notifications") && !startsWithPath("/dashboard/admin/notifications") && "Bildirimler"}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {/* Quick Actions */}
              {user?.role === "admin" && (
                <Link
                  href="/dashboard/admin/courses/pending"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-200 text-sm font-semibold relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <svg className="w-4 h-4 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="relative z-10">Bekleyen Eğitimler</span>
                </Link>
              )}
              {(user?.role === "teacher" || user?.role === "admin") && (
                <Link
                  href="/dashboard/my-courses/new"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:shadow-lg hover:shadow-teal-500/30 transition-all duration-200 text-sm font-semibold relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-teal-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <svg className="w-4 h-4 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="relative z-10">Yeni Kurs</span>
                </Link>
              )}
              <Link
                href="/courses"
                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:border-teal-300 hover:bg-teal-50 transition-all duration-200 text-sm font-semibold"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Kursları Keşfet
              </Link>
            </div>
          </div>
        </header>

        {/* Announcement Banner */}
        <AnnouncementBanner />

        {/* Page Content */}
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}



