import axios from "axios";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // P1-02: HttpOnly cookie'ler otomatik gönderilir
});

// Request interceptor
api.interceptors.request.use((config) => {
  // Cookie varsa axios withCredentials ile otomatik gönderir.
  // Fallback: localStorage'da token varsa header'a ekle (eski client uyumu)
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        // Eski localStorage token'larını temizle
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        // Auth store'u da temizle (P3-01 fix)
        try {
          const { useAuthStore } = require("./store");
          useAuthStore.getState().logout();
        } catch {}
        window.location.href = "/login";
      }
    }
    // Rate limiting (429) - show user-friendly message
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers["retry-after"];
      const message = retryAfter 
        ? `Çok fazla istek gönderildi. Lütfen ${retryAfter} saniye sonra tekrar deneyin.`
        : "Çok fazla istek gönderildi. Lütfen bir süre sonra tekrar deneyin.";
      error.message = message;
      return Promise.reject(error);
    }
    // Maintenance mode (503) - redirect to maintenance page
    if (error.response?.status === 503 && error.response?.data?.maintenance) {
      if (typeof window !== "undefined") {
        const maintenanceData = error.response.data;
        // Store maintenance info in sessionStorage for the maintenance page
        sessionStorage.setItem("maintenance_message", maintenanceData.message || "Site bakım modundadır.");
        if (maintenanceData.estimated_end) {
          sessionStorage.setItem("maintenance_estimated_end", maintenanceData.estimated_end);
        }
        // Only redirect if not already on maintenance page
        if (!window.location.pathname.includes("/maintenance")) {
          window.location.href = "/maintenance";
        }
      }
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);
    const { data } = await api.post("/auth/login", formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return data;
  },
  register: async (email: string, password: string, fullName: string, role: "student" | "teacher" = "student") => {
    const { data } = await api.post("/auth/register", {
      email,
      password,
      full_name: fullName,
      role,
    });
    return data;
  },
  getMe: async () => {
    const { data } = await api.get("/auth/me");
    return data;
  },
  logout: async () => {
    // P1-02: Backend cookie'leri temizler
    await api.post("/auth/logout");
    // Fallback: localStorage da temizle
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    }
  },
};

// ============================================================================
// EPIC-10: Type Definitions (EP10-FE-01)
// ============================================================================

// Lesson type union (EP10-BE-03)
export type LessonType = "video" | "pdf" | "document" | "presentation" | "quiz" | "live_lesson" | "text";

// Lesson Response Interface (EP10-BE-07)
export interface LessonResponse {
  id: string;
  title: string;
  description: string | null;
  lesson_type: LessonType;
  content_path: string | null;  // DEPRECATED: Use content_url instead
  content_url: string | null;  // NEW: Backend-provided access URL (signed/public)
  video_url: string | null;
  duration_seconds: number | null;
  order: number;
  is_preview: boolean;
  course_id: string;
  
  // Content metadata (EP10-BE-03)
  original_filename: string | null;
  file_size_bytes: number | null;
  mime_type: string | null;
  content_text: string | null;
  thumbnail_path: string | null;
  thumbnail_url: string | null;  // NEW: Backend-provided thumbnail URL
  
  // Live lesson fields (EP10-BE-06)
  live_lesson_url: string | null;
  live_lesson_at: string | null;  // ISO datetime string
  live_lesson_recording_path: string | null;
  live_lesson_recording_url: string | null;  // NEW: Backend-provided recording URL
  is_live_lesson_ended: boolean;
  
  // Access control (EP10-BE-07)
  can_access: boolean;
  requires_enrollment: boolean;
  
  // Timestamps
  created_at: string;
  updated_at: string | null;
}

// Lesson Update Interface (EP10-BE-05)
export interface LessonUpdate {
  title?: string;
  description?: string;
  lesson_type?: LessonType;
  is_preview?: boolean;
  video_url?: string;
  duration_seconds?: number;
  content_text?: string;
  live_lesson_url?: string;
  live_lesson_at?: string;  // ISO datetime string
  order?: number;
}

// Lesson Reorder Request (EP10-BE-05)
export interface LessonReorderRequest {
  lesson_ids: string[];
}

// Live Lesson Create Request (EP10-BE-06)
export interface CreateLiveLessonRequest {
  title: string;
  description?: string;
  live_lesson_url: string;
  live_lesson_at: string;  // ISO datetime string
  is_preview?: boolean;
  notify_students?: boolean;
}

// Live Lesson Reschedule Request (EP10-BE-06)
export interface LiveLessonRescheduleRequest {
  live_lesson_url?: string;
  live_lesson_at: string;  // ISO datetime string
  notify_students?: boolean;
}

// Content Stats Response (EP10-BE-09)
export interface ContentStats {
  total_lessons: number;
  total_duration_seconds: number;
  total_file_size_bytes: number;
  type_breakdown: Record<LessonType, number>;
  has_preview_lessons: boolean;
  preview_lesson_count: number;
  upcoming_live_lessons: number;
  completed_live_lessons: number;
}

// Upload Response (EP10-BE-04)
export interface UploadResponse {
  message: string;
  filename: string;
  path: string;
  url: string;  // Backend-provided access URL
  size: number;
  checksum?: string;
  lesson_type?: string;
  mime_type?: string;
}

// Courses API
export interface Course {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  short_description?: string | null;
  thumbnail_path?: string | null;
  price: number;
  discount_price?: number | null;
  is_free: boolean;
  level?: string | null;
  language?: string | null;
  status: string;
  is_featured: boolean;
  teacher_id: string;
  category_id?: string | null;
  created_at: string;
  updated_at: string;
  rating?: number | null;
  student_count?: number | null;
  lesson_count?: number | null;
  teacher?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface CourseStudent {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
}

export const coursesApi = {
  list: async (skip = 0, limit = 20) => {
    const { data } = await api.get("/courses", { params: { skip, limit } });
    return data;
  },
  get: async (id: string) => {
    const { data } = await api.get(`/courses/${id}`);
    return data;
  },
  getBySlug: async (slug: string) => {
    const { data } = await api.get(`/courses/slug/${slug}`);
    return data;
  },
  create: async (course: {
    title: string;
    slug: string;
    description?: string;
    price?: number;
    // Backend BE-10: kategori ataması için category_ids desteği
    category_ids?: string[];
  }) => {
    const { data } = await api.post("/courses", course);
    return data;
  },
  update: async (id: string, course: Partial<{ title: string; description: string; price: number; status?: string; category_ids?: string[] }>) => {
    const { data } = await api.patch(`/courses/${id}`, course);
    return data;
  },
  delete: async (id: string) => {
    const { data } = await api.delete(`/courses/${id}`);
    return data;
  },
  // EPIC-10: Enhanced Lesson List with Filtering (EP10-BE-10)
  getLessons: async (courseId: string, params?: {
    lesson_type?: LessonType;
    has_content?: boolean;
    is_live?: boolean;
    search?: string;
    sort?: "order" | "created_at" | "title";
    order?: "asc" | "desc";
  }): Promise<LessonResponse[]> => {
    const { data } = await api.get(`/courses/${courseId}/lessons`, { params });
    return data;
  },
  
  getLesson: async (courseId: string, lessonId: string): Promise<LessonResponse> => {
    const { data } = await api.get(`/courses/${courseId}/lessons/${lessonId}`);
    return data;
  },
  getSimilar: async (courseId: string, limit = 4) => {
    const { data } = await api.get(`/courses/${courseId}/similar`, { params: { limit } });
    return data;
  },
  
  // Featured courses (Admin)
  listFeatured: async (skip = 0, limit = 50): Promise<Course[]> => {
    const { data } = await api.get("/admin/featured-courses", { params: { skip, limit } });
    return data;
  },
  
  setFeatured: async (courseId: string, isFeatured: boolean): Promise<Course> => {
    const { data } = await api.post(`/admin/courses/${courseId}/featured`, null, {
      params: { is_featured: isFeatured },
    });
    return data;
  },
  
  // Public featured courses
  getFeaturedPublic: async (limit = 8): Promise<Course[]> => {
    const { data } = await api.get("/public/featured-courses", { params: { limit } });
    return data;
  },
  
  // Admin: Get all courses
  listAllAdmin: async (skip = 0, limit = 1000, status?: string): Promise<Course[]> => {
    const { data } = await api.get("/admin/courses/all", { params: { skip, limit, status } });
    return data;
  },
  getMyCourses: async (skip = 0, limit = 50) => {
    const { data } = await api.get("/courses/me", { params: { skip, limit } });
    return data;
  },
  listPendingCourses: async (skip = 0, limit = 50) => {
    const { data } = await api.get("/courses/admin/pending", { params: { skip, limit } });
    return data;
  },
  approveCourse: async (courseId: string, note?: string) => {
    const { data } = await api.post(`/courses/${courseId}/approve`, { note: note || null });
    return data;
  },
  rejectCourse: async (courseId: string, note: string) => {
    const { data } = await api.post(`/courses/${courseId}/reject`, { note });
    return data;
  },
  submitForReview: async (courseId: string) => {
    const { data } = await api.post(`/courses/${courseId}/submit-for-review`);
    return data;
  },
  unarchiveCourse: async (courseId: string) => {
    const { data } = await api.post(`/courses/${courseId}/unarchive`);
    return data;
  },
  getCourseReviewHistory: async (courseId: string) => {
    const { data } = await api.get(`/courses/${courseId}/review-history`);
    return data;
  },
  getCourseStudents: async (courseId: string): Promise<CourseStudent[]> => {
    const { data } = await api.get(`/courses/${courseId}/students`);
    return data;
  },
  addLesson: async (courseId: string, lesson: {
    title: string;
    description?: string;
    lesson_type: string;
    order: number;
    is_preview?: boolean;
  }) => {
    const { data } = await api.post(`/courses/${courseId}/lessons`, lesson);
    return data;
  },
  
  // EPIC-10: Lesson Management (EP10-BE-05)
  updateLesson: async (courseId: string, lessonId: string, data: LessonUpdate): Promise<LessonResponse> => {
    const { data: response } = await api.patch(`/courses/${courseId}/lessons/${lessonId}`, data);
    return response;
  },
  
  deleteLesson: async (courseId: string, lessonId: string): Promise<{ message: string }> => {
    const { data } = await api.delete(`/courses/${courseId}/lessons/${lessonId}`);
    return data;
  },
  
  reorderLessons: async (courseId: string, data: LessonReorderRequest): Promise<{ message: string; lesson_count: number }> => {
    const { data: response } = await api.put(`/courses/${courseId}/lessons/reorder`, data);
    return response;
  },
  
  // EPIC-10: Live Lesson Management (EP10-BE-06)
  createLiveLesson: async (courseId: string, data: CreateLiveLessonRequest): Promise<LessonResponse> => {
    const { data: response } = await api.post(`/courses/${courseId}/lessons/live`, data);
    return response;
  },
  
  rescheduleLiveLesson: async (courseId: string, lessonId: string, data: LiveLessonRescheduleRequest): Promise<LessonResponse> => {
    const { data: response } = await api.patch(`/courses/${courseId}/lessons/${lessonId}/reschedule`, data);
    return response;
  },
  
  cancelLiveLesson: async (courseId: string, lessonId: string): Promise<LessonResponse> => {
    const { data: response } = await api.post(`/courses/${courseId}/lessons/${lessonId}/cancel`);
    return response;
  },
  
  endLiveLesson: async (courseId: string, lessonId: string): Promise<LessonResponse> => {
    const { data: response } = await api.patch(`/courses/${courseId}/lessons/${lessonId}/end-live`);
    return response;
  },
  
  getLiveLessons: async (courseId: string, filter?: "upcoming" | "past" | "all"): Promise<LessonResponse[]> => {
    const { data } = await api.get(`/courses/${courseId}/live-lessons`, {
      params: filter ? { filter } : {},
    });
    return data;
  },
  
  // EPIC-10: Content Statistics (EP10-BE-09)
  getContentStats: async (courseId: string): Promise<ContentStats> => {
    const { data } = await api.get(`/courses/${courseId}/content-stats`);
    return data;
  },
};

// Media API
export const mediaApi = {
  // EPIC-10: Video Upload (EP10-BE-02)
  uploadVideo: async (lessonId: string, file: File, onProgress?: (progress: number) => void): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    
    const config: any = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    
    // Progress tracking (EP10-FE-01: AbortController support)
    if (onProgress) {
      config.onUploadProgress = (progressEvent: any) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      };
    }
    
    const { data } = await api.post(`/media/lessons/${lessonId}/upload-video`, formData, config);
    return data;
  },
  
  // EPIC-10: Use backend-provided URL instead of path manipulation (Security fix)
  getVideoUrl: (contentUrl: string | null, contentPath: string | null) => {
    // Prefer backend-provided content_url (signed/public URL)
    if (contentUrl) return contentUrl;
    // Fallback to content_path for backward compatibility
    if (!contentPath) return null;
    const filename = contentPath.split("/").pop();
    return `${API_URL}/media/videos/${filename}`;
  },
  
  deleteVideo: async (lessonId: string) => {
    const { data } = await api.delete(`/media/lessons/${lessonId}/video`);
    return data;
  },
  
  // EPIC-10: Document Upload (EP10-BE-04)
  uploadDocument: async (lessonId: string, file: File, onProgress?: (progress: number) => void): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    
    const config: any = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    
    if (onProgress) {
      config.onUploadProgress = (progressEvent: any) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      };
    }
    
    const { data } = await api.post(`/media/lessons/${lessonId}/upload-document`, formData, config);
    return data;
  },

  uploadGeneralDocument: async (file: File, onProgress?: (progress: number) => void): Promise<any> => {
    const formData = new FormData();
    formData.append("file", file);
    
    const config: any = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    
    if (onProgress) {
      config.onUploadProgress = (progressEvent: any) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      };
    }
    
    const { data } = await api.post("/media/upload-document", formData, config);
    return data;
  },
  
  // EPIC-10: Unified Content Upload (EP10-BE-04)
  uploadContent: async (lessonId: string, file: File, onProgress?: (progress: number) => void): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    
    const config: any = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    
    if (onProgress) {
      config.onUploadProgress = (progressEvent: any) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      };
    }
    
    const { data } = await api.post(`/media/lessons/${lessonId}/upload-content`, formData, config);
    return data;
  },
  
  deleteDocument: async (lessonId: string): Promise<{ message: string }> => {
    const { data } = await api.delete(`/media/lessons/${lessonId}/document`);
    return data;
  },
  
  // EPIC-10: Document URL (use backend-provided URL)
  getDocumentUrl: (contentUrl: string | null, filename: string | null) => {
    if (contentUrl) return contentUrl;
    if (!filename) return null;
    return `${API_URL}/media/documents/${filename}`;
  },
  
  // EPIC-10: Course Thumbnail Upload (EP10-BE-08)
  uploadCourseThumbnail: async (courseId: string, file: File, onProgress?: (progress: number) => void): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    
    const config: any = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    
    if (onProgress) {
      config.onUploadProgress = (progressEvent: any) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      };
    }
    
    const { data } = await api.post(`/media/courses/${courseId}/upload-thumbnail`, formData, config);
    return data;
  },
  
  deleteCourseThumbnail: async (courseId: string): Promise<{ message: string }> => {
    const { data } = await api.delete(`/media/courses/${courseId}/thumbnail`);
    return data;
  },
  
  // EPIC-10: Thumbnail URL (use backend-provided URL)
  getThumbnailUrl: (thumbnailUrl: string | null, thumbnailPath: string | null) => {
    if (thumbnailUrl) return thumbnailUrl;
    if (!thumbnailPath) return null;
    const filename = thumbnailPath.split("/").pop();
    return `${API_URL}/media/thumbnails/${filename}`;
  },
  
  // EPIC-10: Live Lesson Recording Upload (EP10-BE-06)
  uploadRecording: async (lessonId: string, file: File, onProgress?: (progress: number) => void): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    
    const config: any = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    
    if (onProgress) {
      config.onUploadProgress = (progressEvent: any) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      };
    }
    
    const { data } = await api.post(`/media/lessons/${lessonId}/upload-recording`, formData, config);
    return data;
  },
  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post("/media/users/me/upload-avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  },
  uploadPromoImage: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post("/media/teachers/me/upload-promo-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  },
  uploadPromoVideo: async (file: File, onProgress?: (p: number) => void) => {
    const formData = new FormData();
    formData.append("file", file);
    const config: any = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    if (onProgress) {
      config.onUploadProgress = (progressEvent: any) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      };
    }
    const { data } = await api.post("/media/teachers/me/upload-promo-video", formData, config);
    return data;
  },
  getAvatarUrl: (urlOrFilename: string): string => {
    // Eğer URL zaten tam URL ise (http:// ile başlıyorsa) direkt döndür
    if (urlOrFilename.startsWith("http://") || urlOrFilename.startsWith("https://")) {
      return urlOrFilename;
    }
    // Eğer /api/v1/ ile başlıyorsa, base URL ekle
    if (urlOrFilename.startsWith("/api/v1/")) {
      const baseUrl = API_URL.replace("/api/v1", "");
      return `${baseUrl}${urlOrFilename}`;
    }
    // Sadece filename ise, API_URL ile birleştir
    return `${API_URL}/media/avatars/${urlOrFilename}`;
  },
};

// Cart API
export const cartApi = {
  getCart: async (withCampaign = false): Promise<any> => {
    const { data } = await api.get("/cart", {
      params: withCampaign ? { with_campaign: true } : {},
    });
    return data;
  },
  addToCart: async (courseId: string) => {
    const { data } = await api.post("/cart", { course_id: courseId });
    return data;
  },
  removeFromCart: async (itemId: string) => {
    const { data } = await api.delete(`/cart/${itemId}`);
    return data;
  },
  clearCart: async () => {
    const { data } = await api.delete("/cart");
    return data;
  },
};

// Coupons API
export interface Coupon {
  id: string;
  code: string;
  description?: string | null;
  coupon_type: "percentage" | "fixed";
  discount_value: number;
  max_discount?: number | null;
  trigger_type?: "manual" | "first_purchase" | "cart_value" | "category" | "site_wide";
  min_cart_value?: number | null;
  category_id?: string | null;
  // Site-wide campaign fields
  is_auto_apply?: boolean;
  auto_apply_priority?: number;
  campaign_name?: string | null;
  campaign_description?: string | null;
  target_course_ids?: string[] | null;
  valid_from: string;
  valid_until: string;
  usage_limit?: number | null;
  usage_limit_per_user?: number | null;
  used_count: number;
  is_active: boolean;
  created_by_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CouponCreate {
  code: string;
  description?: string | null;
  coupon_type: "percentage" | "fixed";
  discount_value: number;
  max_discount?: number | null;
  trigger_type?: "manual" | "first_purchase" | "cart_value" | "category" | "site_wide";
  min_cart_value?: number | null;
  category_id?: string | null;
  // Site-wide campaign fields
  is_auto_apply?: boolean;
  auto_apply_priority?: number;
  campaign_name?: string | null;
  campaign_description?: string | null;
  target_course_ids?: string[] | null;
  valid_from: string;
  valid_until: string;
  usage_limit?: number | null;
  usage_limit_per_user?: number | null;
  is_active?: boolean;
}

export interface CouponUpdate {
  description?: string | null;
  coupon_type?: "percentage" | "fixed";
  discount_value?: number;
  max_discount?: number | null;
  trigger_type?: "manual" | "first_purchase" | "cart_value" | "category" | "site_wide";
  min_cart_value?: number | null;
  category_id?: string | null;
  // Site-wide campaign fields
  is_auto_apply?: boolean;
  auto_apply_priority?: number;
  campaign_name?: string | null;
  campaign_description?: string | null;
  target_course_ids?: string[] | null;
  valid_from?: string;
  valid_until?: string;
  usage_limit?: number | null;
  usage_limit_per_user?: number | null;
  is_active?: boolean;
}

export interface CartActiveCampaignResponse {
  campaign: Coupon | null;
  applicable_course_ids: string[];
  discount_breakdown: Record<string, number>;
}

export const couponsApi = {
  list: async (
    skip = 0,
    limit = 20,
    filters?: {
      status?: string;
      trigger_type?: string;
      is_auto_apply?: boolean;
      q?: string;
    }
  ): Promise<Coupon[]> => {
    const { data } = await api.get("/admin/coupons", {
      params: { skip, limit, ...filters },
    });
    return data;
  },
  get: async (couponId: string): Promise<Coupon> => {
    const { data } = await api.get(`/admin/coupons/${couponId}`);
    return data;
  },
  create: async (coupon: CouponCreate): Promise<Coupon> => {
    const { data } = await api.post("/admin/coupons", coupon);
    return data;
  },
  update: async (couponId: string, coupon: CouponUpdate): Promise<Coupon> => {
    const { data } = await api.patch(`/admin/coupons/${couponId}`, coupon);
    return data;
  },
  delete: async (couponId: string): Promise<void> => {
    await api.delete(`/admin/coupons/${couponId}`);
  },
  validate: async (request: { code: string; cart_total: number }) => {
    const { data } = await api.post("/coupons/validate", request);
    return data;
  },
  // Site-wide campaign endpoints
  getActiveSiteWide: async (courseId?: string): Promise<Coupon[]> => {
    const { data } = await api.get("/coupons/public/active-site-wide", {
      params: courseId ? { course_id: courseId } : {},
    });
    return data;
  },
  getCartActiveCampaign: async (): Promise<CartActiveCampaignResponse> => {
    const { data } = await api.get("/cart/active-campaign");
    return data;
  },
};

// Payments API (PayTR iFrame entegrasyonu)
export const paymentsApi = {
  checkout: async (couponCode?: string | null, billingInfo?: { full_name: string; phone: string; address: string }) => {
    const params: Record<string, string> = {};
    if (couponCode) params.coupon_code = couponCode;
    if (billingInfo?.full_name) params.user_name = billingInfo.full_name;
    if (billingInfo?.phone) params.user_phone = billingInfo.phone;
    if (billingInfo?.address) params.user_address = billingInfo.address;
    const { data } = await api.post("/payments/checkout", null, { params });
    return data as {
      order_id: string;
      order_number: string;
      iframe_token: string;
      iframe_url: string;
      total: string;
    };
  },
  getStatus: async (orderId: string) => {
    const { data } = await api.get(`/payments/status/${orderId}`);
    return data as {
      order_id: string;
      order_number: string;
      status: string;
      payment_amount: string | null;
      payment_date: string | null;
    };
  },
  simulateCallback: async (orderNumber: string, status: "success" | "failed" = "success") => {
    const { data } = await api.post("/payments/simulate-callback", null, {
      params: { order_number: orderNumber, status },
    });
    return data;
  },
};

// Orders API
export const ordersApi = {
  create: async (order: {
    coupon_code?: string | null;
    payment_method?: string;
    notes?: string | null;
  }) => {
    const { data } = await api.post("/orders", order);
    return data;
  },
  list: async (skip = 0, limit = 20) => {
    const { data } = await api.get("/orders", { params: { skip, limit } });
    return data;
  },
  get: async (id: string) => {
    const { data } = await api.get(`/orders/${id}`);
    return data;
  },
  complete: async (id: string, transactionId?: string) => {
    const { data } = await api.patch(`/orders/${id}/complete`, {
      payment_gateway_transaction_id: transactionId,
    });
    return data;
  },
  // Admin endpoints
  listAll: async (params?: {
    skip?: number;
    limit?: number;
    status?: "pending" | "paid" | "failed" | "refunded" | "cancelled";
    q?: string;
    date_from?: string;
    date_to?: string;
  }) => {
    const { data } = await api.get("/admin/orders", { params });
    return data;
  },
  completeAdmin: async (id: string, transactionId?: string) => {
    const { data } = await api.patch(`/admin/orders/${id}/complete`, {
      payment_gateway_transaction_id: transactionId,
    });
    return data;
  },
  cancelAdmin: async (id: string) => {
    const { data } = await api.patch(`/admin/orders/${id}/cancel`);
    return data;
  },
  getDetail: async (id: string) => {
    const { data } = await api.get(`/admin/orders/${id}`);
    return data;
  },
  refundAdmin: async (id: string, payload: { amount?: number; reason?: string }) => {
    const { data } = await api.post(`/admin/orders/${id}/refund`, payload);
    return data;
  },
};

// Categories API
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  is_active: boolean;
  parent_id?: string | null;
  order: number;
  course_count?: number;
  children?: Category[];
  parent?: Category | null;
  created_at: string;
  updated_at: string;
}

export interface CategoryCreate {
  name: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  parent_id?: string | null;
  order?: number;
}

export interface CategoryUpdate {
  name?: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  parent_id?: string | null;
  order?: number;
  is_active?: boolean;
}

export const categoriesApi = {
  list: async (params?: {
    skip?: number;
    limit?: number;
    parent_id?: string | null;
    is_active?: boolean;
  }): Promise<Category[]> => {
    const { data } = await api.get("/categories", { params });
    return data;
  },
  getTree: async (is_active: boolean = true): Promise<Category[]> => {
    const { data } = await api.get("/categories/tree", {
      params: { is_active },
    });
    return data;
  },
  get: async (categoryId: string): Promise<Category> => {
    const { data } = await api.get(`/categories/${categoryId}`);
    return data;
  },
  create: async (data: CategoryCreate): Promise<Category> => {
    const { data: response } = await api.post("/categories", data);
    return response;
  },
  update: async (categoryId: string, data: CategoryUpdate): Promise<Category> => {
    const { data: response } = await api.put(`/categories/${categoryId}`, data);
    return response;
  },
  delete: async (categoryId: string, migrateToCategoryId?: string): Promise<void> => {
    await api.delete(`/categories/${categoryId}`, {
      data: { migrate_to_category_id: migrateToCategoryId },
    });
  },
  getCourseCategories: async (courseId: string): Promise<Category[]> => {
    const { data } = await api.get(`/courses/${courseId}/categories`);
    return data;
  },
  addCategoryToCourse: async (courseId: string, categoryId: string): Promise<void> => {
    await api.post(`/courses/${courseId}/categories`, { category_id: categoryId });
  },
  removeCategoryFromCourse: async (courseId: string, categoryId: string): Promise<void> => {
    await api.delete(`/courses/${courseId}/categories/${categoryId}`);
  },
};

// Enrollments API
export const enrollmentsApi = {
  myEnrollments: async () => {
    const { data } = await api.get("/enrollments/me");
    return data;
  },
};

// Lesson Progress API
export const lessonProgressApi = {
  get: async (courseId: string, lessonId: string) => {
    const { data } = await api.get(`/courses/${courseId}/lessons/${lessonId}/progress`);
    return data;
  },
  update: async (courseId: string, lessonId: string, progress: { watched_seconds?: number; is_completed?: boolean }) => {
    const { data } = await api.post(`/courses/${courseId}/lessons/${lessonId}/progress`, progress);
    return data;
  },
};

// Course Reviews API
export const courseReviewsApi = {
  list: async (courseId: string, skip = 0, limit = 20) => {
    const { data } = await api.get(`/courses/${courseId}/reviews`, { params: { skip, limit } });
    return data;
  },
  listAll: async (skip = 0, limit = 50, is_approved?: boolean) => {
    const params: Record<string, string | number | boolean> = { skip, limit };
    if (is_approved !== undefined) params.is_approved = is_approved;
    const { data } = await api.get(`/admin/reviews`, { params });
    return data;
  },
  getStats: async (courseId: string) => {
    const { data } = await api.get(`/courses/${courseId}/reviews/stats`);
    return data;
  },
  create: async (courseId: string, review: { rating: number; title?: string; comment?: string }) => {
    const { data } = await api.post(`/courses/${courseId}/reviews`, review);
    return data;
  },
  getMyReview: async (courseId: string) => {
    const { data } = await api.get(`/courses/${courseId}/reviews/me`);
    return data;
  },
};

// Teachers API
export const teachersApi = {
  list: async (skip = 0, limit = 20) => {
    const { data } = await api.get("/teachers", { params: { skip, limit } });
    return data;
  },
  get: async (teacherId: string) => {
    const { data } = await api.get(`/teachers/${teacherId}`);
    return data;
  },
  getAvailability: async (teacherId: string) => {
    const { data } = await api.get(`/teachers/${teacherId}/availability`);
    return data;
  },
  bookLiveClass: async (teacherId: string, payload: { availability_id: string; student_notes?: string }) => {
    const { data } = await api.post(`/teachers/${teacherId}/book-live-class`, payload);
    return data;
  },
  getMyAvailability: async () => {
    const { data } = await api.get("/teachers/me/availability");
    return data;
  },
  createAvailability: async (payload: { slots: { date: string; start_time: string; end_time: string }[] }) => {
    const { data } = await api.post("/teachers/me/availability", payload);
    return data;
  },
  deleteAvailability: async (slotId: string) => {
    const { data } = await api.delete(`/teachers/me/availability/${slotId}`);
    return data;
  },
  getTeacherReservations: async () => {
    const { data } = await api.get("/teachers/me/reservations");
    return data;
  },
  updateReservationStatus: async (reservationId: string, status: "approved" | "rejected" | "cancelled") => {
    const { data } = await api.put(`/teachers/me/reservations/${reservationId}/status`, null, {
      params: { status },
    });
    return data;
  },
  getMyBookings: async () => {
    const { data } = await api.get("/teachers/my-bookings");
    return data;
  },
  getLibrary: async (teacherId: string) => {
    const { data } = await api.get(`/teachers/${teacherId}/library`);
    return data;
  },
  getMyLibrary: async () => {
    const { data } = await api.get("/teachers/me/library");
    return data;
  },
  addLibraryItem: async (item: any) => {
    const { data } = await api.post("/teachers/me/library", item);
    return data;
  },
  uploadLibraryFile: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post("/teachers/me/library/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
  deleteLibraryItem: async (itemId: string) => {
    const { data } = await api.delete(`/teachers/me/library/${itemId}`);
    return data;
  },
};

// Notifications API
export interface Notification {
  id: string;
  user_id: string;
  sender_id?: string | null;
  sender_name?: string | null;
  notification_type: string;
  title: string;
  message: string;
  data?: Record<string, unknown> | null;
  is_read: boolean;
  read_at?: string | null;
  priority: "low" | "medium" | "high" | "urgent";
  action_url?: string | null;
  action_label?: string | null;
  created_at: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  unread_count: number;
}

export interface NotificationPreferences {
  email_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
  preferences: Record<string, string[]>;
  quiet_hours_start?: string | null;
  quiet_hours_end?: string | null;
}

export interface UnreadCountResponse {
  total: number;
  by_priority: Record<string, number>;
}

export interface NotificationCreatePayload {
  notification_type:
    | "course_update"
    | "new_lesson"
    | "course_announcement"
    | "org_announcement"
    | "org_course_update"
    | "admin_to_teacher"
    | "system_announcement"
    | "maintenance"
    | "live_lesson_reminder"
    | "live_lesson_starting"
    | "live_lesson_cancelled"
    | "order_confirmed"
    | "payment_success"
    | "certificate_earned"
    | "course_submitted"
    | "course_approved"
    | "course_rejected"
    | "course_resubmitted";
  title: string;
  message: string;
  data?: Record<string, unknown> | null;
  priority?: "low" | "medium" | "high" | "urgent";
  action_url?: string | null;
  action_label?: string | null;
  user_ids?: string[] | null;
  role?: "admin" | "staff" | "organization" | "teacher" | "student" | null;
  organization_id?: string | null;
  delivery_channels?: string[];
}

// Users API (admin seçim listeleri için)
export interface UserSummary {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "staff" | "organization" | "teacher" | "student";
  is_active: boolean;
  is_verified: boolean;
  avatar_url?: string | null;
}

export interface UserListItem {
  id: string;
  full_name: string;
  email: string;
  role: "admin" | "staff" | "organization" | "teacher" | "student";
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
}

export interface UserListResponse {
  total: number;
  items: UserListItem[];
  skip: number;
  limit: number;
}

export interface PasswordResetRequest {
  mode: "magic_link" | "temporary_password";
  temporary_password?: string;
}

export interface PasswordResetResponse {
  message: string;
  magic_link?: string | null;
  temporary_password?: string | null;
}

export const usersApi = {
  list: async (params?: {
    skip?: number;
    limit?: number;
    role?: "admin" | "staff" | "organization" | "teacher" | "student";
    q?: string;
    status?: "active" | "inactive";
    created_from?: string;
    created_to?: string;
    sort_by?: "created_at" | "full_name" | "last_login_at";
    sort_order?: "asc" | "desc";
  }): Promise<UserListResponse> => {
    const { data } = await api.get("/admin/users", { params });
    return data;
  },
  get: async (userId: string): Promise<UserSummary> => {
    const { data } = await api.get(`/admin/users/${userId}`);
    return data;
  },
  update: async (
    userId: string,
    userData: {
      full_name?: string;
      email?: string;
      role?: string;
      is_active?: boolean;
      is_verified?: boolean;
      phone?: string;
    }
  ): Promise<UserSummary> => {
    const { data } = await api.put(`/admin/users/${userId}`, userData);
    return data;
  },
  deactivate: async (userId: string): Promise<UserSummary> => {
    const { data } = await api.post(`/admin/users/${userId}/deactivate`);
    return data;
  },
  activate: async (userId: string): Promise<UserSummary> => {
    const { data } = await api.post(`/admin/users/${userId}/activate`);
    return data;
  },
  delete: async (userId: string): Promise<{ message: string; user_id: string }> => {
    const { data } = await api.delete(`/admin/users/${userId}`);
    return data;
  },
  resetPassword: async (userId: string, resetRequest: PasswordResetRequest): Promise<PasswordResetResponse> => {
    const { data } = await api.post(`/admin/users/${userId}/reset-password`, resetRequest);
    return data;
  },
};

export const notificationsApi = {
  list: async (params?: {
    skip?: number;
    limit?: number;
    is_read?: boolean;
    notification_type?: string;
    priority?: string;
  }): Promise<NotificationListResponse> => {
    const { data } = await api.get("/notifications", { params });
    return data;
  },
  markAsRead: async (notificationId: string): Promise<Notification> => {
    const { data } = await api.put(`/notifications/${notificationId}/read`);
    return data;
  },
  markAllAsRead: async (): Promise<number> => {
    const { data } = await api.put("/notifications/read-all");
    return data;
  },
  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    const { data } = await api.get("/notifications/unread-count");
    return data;
  },
  getPreferences: async (): Promise<NotificationPreferences> => {
    const { data } = await api.get("/notifications/preferences");
    return data;
  },
  updatePreferences: async (
    body: Partial<NotificationPreferences> & {
      preferences?: Record<string, string[]>;
    }
  ): Promise<NotificationPreferences> => {
    const { data } = await api.put("/notifications/preferences", body);
    return data;
  },
  create: async (body: NotificationCreatePayload): Promise<Notification[]> => {
    const { data } = await api.post("/notifications", body);
    return data;
  },
  listAll: async (skip = 0, limit = 50, notification_type?: string, priority?: string): Promise<Notification[]> => {
    const params: Record<string, string | number | boolean> = { skip, limit };
    if (notification_type) params.notification_type = notification_type;
    if (priority) params.priority = priority;
    const { data } = await api.get("/notifications/admin/all", { params });
    return data;
  },
};

export interface SiteSettingsData {
  general?: Record<string, unknown>;
  smtp?: Record<string, unknown>;
  platform?: Record<string, unknown>;
  seo?: Record<string, unknown>;
  custom_code?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface PublicSettingsData {
  site_title?: string | null;
  logo_url?: string | null;
  favicon_url?: string | null;
  footer_text?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
  seo?: Record<string, unknown>; // SEO kodları (public)
  custom_code?: Record<string, unknown>; // Custom kodlar (public)
  platform?: Record<string, unknown>; // Platform ayarları (maintenance mode için)
}

export interface SiteAnnouncement {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "maintenance";
  is_active: boolean;
  starts_at: string | null;
  expires_at: string | null;
  target_audience: string | null;
  priority: number;
  is_dismissible: boolean;
  created_at: string;
  updated_at: string;
}

export interface SiteAnnouncementCreate {
  title: string;
  message: string;
  type?: "info" | "warning" | "maintenance";
  is_active?: boolean;
  starts_at?: string | null;
  expires_at?: string | null;
  target_audience?: string | null;
  priority?: number;
  is_dismissible?: boolean;
}

export interface SiteAnnouncementUpdate {
  title?: string;
  message?: string;
  type?: "info" | "warning" | "maintenance";
  is_active?: boolean;
  starts_at?: string | null;
  expires_at?: string | null;
  target_audience?: string | null;
  priority?: number;
  is_dismissible?: boolean;
}

export interface EmailTemplateMeta {
  template_name: string;
  title: string;
  description: string;
  default_subject: string;
  variables: string[];
}

export interface EmailTemplatePreviewResponse {
  template_name: string;
  subject: string;
  html_body: string;
  plain_body?: string | null;
}

export interface EmailCustomTemplate {
  id: string;
  name: string;
  subject: string;
  html_body: string;
  plain_body?: string | null;
  description?: string | null;
  variables: string[];
  created_at: string;
  updated_at: string;
}

export interface EmailCampaignSegment {
  key: string;
  title: string;
  description: string;
}

export interface EmailCustomCampaignSegment {
  id: string;
  name: string;
  description?: string | null;
  user_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface EmailCampaignRecipientPreviewItem {
  id: string;
  full_name?: string | null;
  email: string;
  role?: string | null;
}

export interface EmailCampaignRecipientPreviewResponse {
  total_recipients: number;
  sample_recipients: EmailCampaignRecipientPreviewItem[];
  role_breakdown?: Record<string, number>;
}

export interface EmailLogItem {
  id: string;
  notification_id?: string | null;
  to_email: string;
  subject: string;
  template_name?: string | null;
  status: "pending" | "sent" | "failed" | "retrying";
  attempt_count: number;
  last_error?: string | null;
  sent_at?: string | null;
  created_at: string;
}

export interface EmailLogListResponse {
  items: EmailLogItem[];
  total: number;
  skip: number;
  limit: number;
  stats: Record<string, number>;
}

export const siteSettingsApi = {
  get: async (): Promise<SiteSettingsData> => {
    const { data } = await api.get("/admin/settings");
    return data;
  },
  update: async (payload: Partial<SiteSettingsData>): Promise<SiteSettingsData> => {
    const { data } = await api.put("/admin/settings", payload);
    return data;
  },
  sendTestEmail: async (payload: {
    to_email: string;
    subject?: string;
    template_name?: string;
    context?: Record<string, unknown>;
  }): Promise<{ success: boolean; message: string }> => {
    const { data } = await api.post("/admin/settings/email-test", payload);
    return data;
  },
  listEmailTemplates: async (): Promise<EmailTemplateMeta[]> => {
    const { data } = await api.get("/admin/crm/system-templates");
    return data;
  },
  previewEmailTemplate: async (payload: {
    template_name: string;
    subject?: string;
    context?: Record<string, unknown>;
  }): Promise<EmailTemplatePreviewResponse> => {
    const { data } = await api.post("/admin/crm/system-templates/preview", payload);
    return data;
  },
  sendTemplateTest: async (payload: {
    to_email: string;
    template_name: string;
    subject?: string;
    context?: Record<string, unknown>;
  }): Promise<{ success: boolean; message: string }> => {
    const { data } = await api.post("/admin/crm/system-templates/test", payload);
    return data;
  },
  listCustomTemplates: async (): Promise<EmailCustomTemplate[]> => {
    const { data } = await api.get("/admin/crm/templates");
    return data;
  },
  createCustomTemplate: async (payload: {
    name: string;
    subject: string;
    html_body: string;
    plain_body?: string;
    description?: string;
    variables?: string[];
  }): Promise<EmailCustomTemplate> => {
    const { data } = await api.post("/admin/crm/templates", payload);
    return data;
  },
  updateCustomTemplate: async (
    templateId: string,
    payload: Partial<{
      name: string;
      subject: string;
      html_body: string;
      plain_body: string;
      description: string;
      variables: string[];
    }>
  ): Promise<EmailCustomTemplate> => {
    const { data } = await api.put(`/admin/crm/templates/${templateId}`, payload);
    return data;
  },
  deleteCustomTemplate: async (templateId: string): Promise<{ success: boolean; message: string }> => {
    const { data } = await api.delete(`/admin/crm/templates/${templateId}`);
    return data;
  },
  sendCampaign: async (payload: {
    template_id?: string;
    subject?: string;
    html_body?: string;
    plain_body?: string;
    segment_key?: string;
    custom_segment_id?: string;
    role?: "admin" | "staff" | "organization" | "teacher" | "student";
    user_ids?: string[];
    context?: Record<string, unknown>;
    schedule_at?: string;
  }): Promise<{ success: boolean; queued_count: number; message: string; scheduled_for?: string | null }> => {
    const { data } = await api.post("/admin/crm/campaigns/send", payload);
    return data;
  },
  listCampaignSegments: async (): Promise<EmailCampaignSegment[]> => {
    const { data } = await api.get("/admin/crm/campaigns/segments");
    return data;
  },
  listCustomCampaignSegments: async (): Promise<EmailCustomCampaignSegment[]> => {
    const { data } = await api.get("/admin/crm/audiences");
    return data;
  },
  createCustomCampaignSegment: async (payload: {
    name: string;
    description?: string;
    user_ids: string[];
  }): Promise<EmailCustomCampaignSegment> => {
    const { data } = await api.post("/admin/crm/audiences", payload);
    return data;
  },
  deleteCustomCampaignSegment: async (segmentId: string): Promise<{ success: boolean; message: string }> => {
    const { data } = await api.delete(`/admin/crm/audiences/${segmentId}`);
    return data;
  },
  updateCustomCampaignSegment: async (
    segmentId: string,
    payload: Partial<{
      name: string;
      description: string;
      user_ids: string[];
    }>
  ): Promise<EmailCustomCampaignSegment> => {
    const { data } = await api.put(`/admin/crm/audiences/${segmentId}`, payload);
    return data;
  },
  exportAudienceCsv: async (segmentId: string): Promise<string> => {
    const { data } = await api.get(`/admin/crm/audiences/${segmentId}/export-csv`, {
      responseType: "text",
      headers: { Accept: "text/csv" },
    });
    return data;
  },
  importAudienceCsv: async (
    segmentId: string,
    file: File,
    mode: "merge" | "replace" = "merge"
  ): Promise<{ success: boolean; message: string; segment: EmailCustomCampaignSegment }> => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post(`/admin/crm/audiences/${segmentId}/import-csv`, formData, {
      params: { mode },
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
  previewCampaignRecipients: async (payload: {
    segment_key?: string;
    custom_segment_id?: string;
    role?: "admin" | "staff" | "organization" | "teacher" | "student";
    user_ids?: string[];
    sample_limit?: number;
  }): Promise<EmailCampaignRecipientPreviewResponse> => {
    const { data } = await api.post("/admin/crm/campaigns/preview-recipients", payload);
    return data;
  },
};

export const emailLogsApi = {
  list: async (params?: {
    skip?: number;
    limit?: number;
    status?: "pending" | "sent" | "failed" | "retrying";
    email?: string;
    from_date?: string;
    to_date?: string;
  }): Promise<EmailLogListResponse> => {
    const { data } = await api.get("/admin/email-logs", { params });
    return data;
  },
  retry: async (emailLogId: string): Promise<{ success: boolean; message: string; email_log_id: string }> => {
    const { data } = await api.post(`/admin/email-logs/${emailLogId}/retry`);
    return data;
  },
  workerHealth: async (): Promise<{ ok: boolean; queued: number; delayed: number }> => {
    const { data } = await api.get("/admin/email-logs/worker-health");
    return data;
  },
};

// Quizzes API
export interface Quiz {
  id: string;
  lesson_id?: string | null;
  title: string;
  description?: string | null;
  pdf_path?: string | null;
  passing_score: number;
  time_limit_minutes?: number | null;
  max_attempts?: number | null;
  shuffle_questions: boolean;
  show_correct_answers: boolean;
  number_of_options?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  questions?: QuizQuestion[];
  course_id?: string | null;
}

export interface QuizListItem {
  id: string;
  title: string;
  lesson_id?: string | null;
  question_count: number;
  attempt_count: number;
  number_of_options?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  is_approved: boolean;
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: "multiple_choice" | "true_false" | "short_answer";
  options?: Record<string, string> | null;
  correct_answer: string;
  points: number;
  explanation?: string | null;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  assignment_id?: string | null;
  status: "in_progress" | "completed" | "abandoned";
  total_questions: number;
  correct_answers: number;
  score_percentage: number;
  points_earned: number;
  total_points: number;
  started_at: string;
  completed_at?: string | null;
  time_taken_seconds?: number | null;
  answers?: QuizAttemptAnswer[];
  created_at: string;
  updated_at: string;
}

export interface QuizAttemptAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  answer_text: string;
  is_correct: boolean;
  points_earned: number;
  answered_at: string;
}

export interface QuizAssignmentCreate {
  quiz_id: string;
  course_id?: string | null;
  student_id?: string | null;
  due_date?: string | null;
}

export interface QuizAssignment {
  id: string;
  quiz_id: string;
  teacher_id: string;
  course_id?: string | null;
  student_id?: string | null;
  due_date?: string | null;
  created_at: string;
  quiz?: Quiz | null;
  my_attempt?: QuizAttempt | null;
  student?: { id: string; full_name: string; email: string } | null;
}

export interface QuizCreate {
  lesson_id?: string | null;
  course_id?: string | null;
  title: string;
  description?: string | null;
  passing_score?: number;
  time_limit_minutes?: number | null;
  max_attempts?: number | null;
  shuffle_questions?: boolean;
  show_correct_answers?: boolean;
  number_of_options?: number | null;
  start_date?: string | null;
  end_date?: string | null;
}

export interface QuizUpdate {
  title?: string;
  description?: string | null;
  passing_score?: number;
  time_limit_minutes?: number | null;
  max_attempts?: number | null;
  shuffle_questions?: boolean;
  show_correct_answers?: boolean;
}

export interface QuizQuestionCreate {
  question_type: "multiple_choice" | "true_false" | "short_answer";
  question_text: string;
  options?: Record<string, string> | null;
  correct_answer: string;
  points?: number;
  explanation?: string | null;
}

export interface QuizQuestionUpdate {
  question_type?: "multiple_choice" | "true_false" | "short_answer";
  question_text?: string;
  options?: Record<string, string> | null;
  correct_answer?: string;
  points?: number;
  explanation?: string | null;
}

export const quizzesApi = {
  create: async (quiz: QuizCreate): Promise<Quiz> => {
    const { data } = await api.post("/quizzes", quiz);
    return data;
  },
  get: async (quizId: string): Promise<Quiz> => {
    const { data } = await api.get(`/quizzes/${quizId}`);
    return data;
  },
  update: async (quizId: string, quiz: QuizUpdate): Promise<Quiz> => {
    const { data } = await api.put(`/quizzes/${quizId}`, quiz);
    return data;
  },
  delete: async (quizId: string): Promise<void> => {
    await api.delete(`/quizzes/${quizId}`);
  },
  list: async (params?: {
    course_id?: string;
    lesson_id?: string;
    skip?: number;
    limit?: number;
  }): Promise<QuizListItem[]> => {
    const { data } = await api.get("/quizzes", { params });
    return data;
  },
  getQuestions: async (quizId: string): Promise<QuizQuestion[]> => {
    const { data } = await api.get(`/quizzes/${quizId}/questions`);
    return data;
  },
  addQuestion: async (quizId: string, question: QuizQuestionCreate): Promise<QuizQuestion> => {
    const { data } = await api.post(`/quizzes/${quizId}/questions`, question);
    return data;
  },
  updateQuestion: async (
    quizId: string,
    questionId: string,
    question: QuizQuestionUpdate
  ): Promise<QuizQuestion> => {
    const { data } = await api.put(`/quizzes/${quizId}/questions/${questionId}`, question);
    return data;
  },
  deleteQuestion: async (quizId: string, questionId: string): Promise<void> => {
    await api.delete(`/quizzes/${quizId}/questions/${questionId}`);
  },
  reorderQuestions: async (
    quizId: string,
    questionIds: string[]
  ): Promise<QuizQuestion[]> => {
    const { data } = await api.put(`/quizzes/${quizId}/questions/reorder`, {
      question_ids: questionIds,
    });
    return data;
  },
  bulkAddQuestions: async (
    quizId: string,
    questions: QuizQuestionCreate[]
  ): Promise<QuizQuestion[]> => {
    const { data } = await api.post(`/quizzes/${quizId}/questions/bulk`, {
      questions,
    });
    return data;
  },
  startAttempt: async (quizId: string, assignmentId?: string): Promise<QuizAttempt> => {
    const { data } = await api.post(`/quizzes/${quizId}/attempt`, null, {
      params: assignmentId ? { assignment_id: assignmentId } : undefined,
    });
    return data;
  },
  saveAttemptProgress: async (
    attemptId: string,
    answers: Array<{ question_id: string; answer_text: string }>
  ): Promise<QuizAttempt> => {
    const { data } = await api.put(`/quizzes/attempts/${attemptId}/progress`, {
      answers,
    });
    return data;
  },
  abandonAttempt: async (attemptId: string): Promise<QuizAttempt> => {
    const { data } = await api.put(`/quizzes/attempts/${attemptId}/abandon`);
    return data;
  },
  submitAttempt: async (
    attemptId: string,
    answers: Array<{ question_id: string; answer_text: string }>
  ): Promise<QuizAttempt> => {
    const { data } = await api.post(`/quizzes/attempts/${attemptId}/submit`, answers);
    return data;
  },
  getAttempt: async (attemptId: string, includeQuestions?: boolean): Promise<QuizAttempt> => {
    const { data } = await api.get(`/quizzes/attempts/${attemptId}`, {
      params: includeQuestions ? { include_questions: true } : undefined,
    });
    return data;
  },
  listMyAttempts: async (quizId: string): Promise<QuizAttempt[]> => {
    const { data } = await api.get(`/quizzes/${quizId}/attempts/my`);
    return data;
  },
  assign: async (payload: QuizAssignmentCreate): Promise<QuizAssignment> => {
    const { data } = await api.post("/quizzes/assignments", payload);
    return data;
  },
  listMyAssignments: async (): Promise<QuizAssignment[]> => {
    const { data } = await api.get("/quizzes/assignments/my");
    return data;
  },
  listTeacherAssignments: async (params?: { quiz_id?: string }): Promise<QuizAssignment[]> => {
    const { data } = await api.get("/quizzes/assignments/teacher/my", { params });
    return data;
  },
  getAssignment: async (assignmentId: string): Promise<QuizAssignment> => {
    const { data } = await api.get(`/quizzes/assignments/${assignmentId}`);
    return data;
  },
  approve: async (quizId: string): Promise<Quiz> => {
    const { data } = await api.post(`/quizzes/${quizId}/approve`);
    return data;
  },
  reject: async (quizId: string): Promise<Quiz> => {
    const { data } = await api.post(`/quizzes/${quizId}/reject`);
    return data;
  },
};

// EPIC-5: Teacher Profile & Financial APIs
export interface TeacherProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  bio?: string | null;
  expertise_tags?: string[] | null;
  social_links?: {
    linkedin?: string | null;
    twitter?: string | null;
    instagram?: string | null;
    website?: string | null;
  } | null;
  avatar_url?: string | null;
  promo_images?: string[] | null;
  promo_video?: string | null;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  tax_info?: {
    iban?: string;
    company_type?: string;
    tc_kimlik?: string;
    address?: string;
    city?: string;
    district?: string;
    exemption_status?: string;
    document_path?: string;
    document_barcode?: string;
  } | null;
}

export interface TeacherProfileUpdate {
  full_name?: string;
  phone?: string;
  bio?: string;
  expertise_tags?: string[];
  social_links?: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    website?: string;
  };
  avatar_url?: string;
  promo_images?: string[];
  promo_video?: string;
  tax_info?: {
    iban?: string;
    company_type?: string;
    tc_kimlik?: string;
    address?: string;
    city?: string;
    district?: string;
    exemption_status?: string;
    document_path?: string;
    document_barcode?: string;
  } | null;
}

export interface BankAccount {
  id: string;
  teacher_id?: string; // For admin view
  bank_name: string;
  iban_masked?: string; // For teacher view
  iban?: string; // For admin view
  account_holder_name: string;
  is_default: boolean;
  status: "pending" | "approved" | "rejected";
  review_note?: string | null;
  created_at: string;
  approved_at?: string | null;
  rejected_at?: string | null;
}

export interface BankAccountCreate {
  bank_name: string;
  iban: string;
  account_holder_name: string;
  is_default?: boolean;
}

export interface BankAccountUpdate {
  bank_name?: string;
  iban?: string;
  account_holder_name?: string;
  is_default?: boolean;
}

export interface TeacherEarning {
  id: string;
  teacher_id: string;
  course_id?: string | null;
  order_id?: string | null;
  withdrawal_request_id?: string | null;
  amount: number;
  currency: string;
  gross_amount?: number | null;
  commission_rate?: number | null;
  commission_amount?: number | null;
  type: "earning" | "withdrawal" | "adjustment" | "commission";
  description?: string | null;
  reference_id?: string | null;
  created_at: string;
}

export interface TeacherEarningSummary {
  total_earnings: number;
  total_withdrawals: number;
  total_adjustments: number;
  available_balance: number;
  pending_withdrawals: number;
  currency: string;
}

export interface WithdrawalRequest {
  id: string;
  teacher_id: string;
  bank_account_id: string;
  bank_account_info?: {
    bank_name: string;
    iban_masked?: string;
    iban?: string;
  } | null;
  amount: number;
  currency: string;
  status: "pending" | "approved" | "rejected" | "paid";
  admin_note?: string | null;
  requested_at: string;
  processed_at?: string | null;
  paid_at?: string | null;
}

export interface WithdrawalRequestCreate {
  bank_account_id: string;
  amount: number;
}

export const teacherProfileApi = {
  getMyProfile: async (): Promise<TeacherProfile> => {
    const { data } = await api.get("/teachers/me/profile");
    return data;
  },
  updateMyProfile: async (profile: TeacherProfileUpdate): Promise<TeacherProfile> => {
    const { data } = await api.put("/teachers/me/profile", profile);
    return data;
  },
  getTeacherProfile: async (teacherId: string): Promise<TeacherProfile> => {
    const { data } = await api.get(`/admin/teachers/${teacherId}/profile`);
    return data;
  },
  updateTeacherProfile: async (teacherId: string, profile: TeacherProfileUpdate): Promise<TeacherProfile> => {
    const { data } = await api.put(`/admin/teachers/${teacherId}/profile`, profile);
    return data;
  },
};

export const bankAccountsApi = {
  list: async (): Promise<BankAccount[]> => {
    const { data } = await api.get("/teachers/me/bank-accounts");
    return data;
  },
  create: async (account: BankAccountCreate): Promise<BankAccount> => {
    const { data } = await api.post("/teachers/me/bank-accounts", account);
    return data;
  },
  delete: async (accountId: string): Promise<void> => {
    await api.delete(`/teachers/me/bank-accounts/${accountId}`);
  },
  update: async (accountId: string, account: BankAccountUpdate): Promise<BankAccount> => {
    const { data } = await api.put(`/teachers/me/bank-accounts/${accountId}`, account);
    return data;
  },
  setDefault: async (accountId: string): Promise<BankAccount> => {
    const { data } = await api.post(`/teachers/me/bank-accounts/${accountId}/set-default`);
    return data;
  },
  // Admin endpoints
  listAll: async (params?: {
    status?: "pending" | "approved" | "rejected";
    teacher_id?: string;
  }): Promise<BankAccount[]> => {
    const { data } = await api.get("/admin/teachers/bank-accounts", { params });
    return data;
  },
  createForTeacher: async (teacherId: string, account: BankAccountCreate): Promise<BankAccount> => {
    const { data } = await api.post(`/admin/teachers/${teacherId}/bank-accounts`, account);
    return data;
  },
  approve: async (accountId: string, reviewNote?: string): Promise<BankAccount> => {
    const { data } = await api.post(`/admin/teachers/bank-accounts/${accountId}/approve`, { review_note: reviewNote });
    return data;
  },
  reject: async (accountId: string, reviewNote: string): Promise<BankAccount> => {
    const { data } = await api.post(`/admin/teachers/bank-accounts/${accountId}/reject`, { review_note: reviewNote });
    return data;
  },
};

// Students API (Admin)
export interface StudentListItem {
  id: string;
  full_name: string;
  email: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  last_login_at: string | null;
  enrollment_count: number;
  order_count: number;
  last_activity_at: string | null;
}

export interface StudentListResponse {
  total: number;
  items: StudentListItem[];
  skip: number;
  limit: number;
}

export interface StudentDetail {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  last_login_at: string | null;
  enrollments: Array<{
    id: string;
    course: {
      id: string;
      title: string;
      slug: string | null;
      teacher_name: string | null;
    } | null;
    progress_percentage: number;
    completion_rate: number;
    total_lessons: number;
    completed_lessons: number;
    enrolled_at: string;
    last_accessed_at: string | null;
    completed_at: string | null;
  }>;
  orders: Array<{
    id: string;
    order_number: string;
    total_amount: number;
    status: string;
    created_at: string;
  }>;
  stats: {
    total_enrollments: number;
    total_orders: number;
    total_spent: number;
    completed_courses: number;
    average_completion_rate: number;
  };
}

export const studentsApi = {
  list: async (params?: {
    skip?: number;
    limit?: number;
    q?: string;
  }): Promise<StudentListResponse> => {
    const { data } = await api.get("/admin/students", { params });
    return data;
  },
  get: async (studentId: string): Promise<StudentDetail> => {
    const { data } = await api.get(`/admin/students/${studentId}`);
    return data;
  },
};

// Reviews API
export interface ReviewListItem {
  id: string;
  user_id: string;
  course_id: string;
  enrollment_id: string | null;
  rating: number;
  title: string | null;
  comment: string | null;
  is_approved: boolean;
  is_helpful_count: number;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
  approved_by_admin_id: string | null;
  moderation_note: string | null;
  teacher_reply: string | null;
  teacher_reply_at: string | null;
  user: {
    id: string;
    full_name: string;
    email: string;
  };
  course: {
    id: string;
    title: string;
    slug: string | null;
  } | null;
}

export interface ReviewApproveRequest {
  moderation_note?: string | null;
}

export interface ReviewRejectRequest {
  moderation_note?: string | null;
}

export interface TeacherReplyRequest {
  reply_text: string;
}

export const reviewsApi = {
  // Admin endpoints
  listAdmin: async (params?: {
    skip?: number;
    limit?: number;
    is_approved?: boolean | null;
  }): Promise<ReviewListItem[]> => {
    const { data } = await api.get("/admin/reviews", { params });
    return data;
  },
  approve: async (reviewId: string, request: ReviewApproveRequest) => {
    const { data } = await api.post(`/admin/reviews/${reviewId}/approve`, request);
    return data;
  },
  reject: async (reviewId: string, request: ReviewRejectRequest) => {
    const { data } = await api.post(`/admin/reviews/${reviewId}/reject`, request);
    return data;
  },
  delete: async (reviewId: string) => {
    const { data } = await api.delete(`/admin/reviews/${reviewId}`);
    return data;
  },
  // Teacher endpoints
  reply: async (courseId: string, reviewId: string, request: TeacherReplyRequest) => {
    const { data } = await api.post(`/courses/${courseId}/reviews/${reviewId}/reply`, request);
    return data;
  },
  // Get teacher's course reviews
  getTeacherReviews: async (params?: {
    course_id?: string;
    skip?: number;
    limit?: number;
  }) => {
    const { data } = await api.get("/teachers/me/reviews", { params });
    return data;
  },
  // Get teacher's students
  getTeacherStudents: async (params?: {
    course_id?: string;
    skip?: number;
    limit?: number;
  }) => {
    const { data } = await api.get("/admin/students/teachers/students", { params });
    return data;
  },
};

export const teacherEarningsApi = {
  listMyEarnings: async (params?: {
    skip?: number;
    limit?: number;
    type?: "earning" | "withdrawal" | "adjustment" | "commission";
    from_date?: string;
    to_date?: string;
  }): Promise<TeacherEarning[]> => {
    const { data } = await api.get("/teachers/me/earnings", { params });
    return data;
  },
  getMyEarningsSummary: async (): Promise<TeacherEarningSummary> => {
    const { data } = await api.get("/teachers/me/earnings/summary");
    return data;
  },
  // Legacy aliases
  list: async (params?: {
    skip?: number;
    limit?: number;
    type?: "earning" | "withdrawal" | "adjustment" | "commission";
    from_date?: string;
    to_date?: string;
  }): Promise<TeacherEarning[]> => {
    const { data } = await api.get("/teachers/me/earnings", { params });
    return data;
  },
  getSummary: async (): Promise<TeacherEarningSummary> => {
    const { data } = await api.get("/teachers/me/earnings/summary");
    return data;
  },
  getBalance: async (): Promise<TeacherEarningSummary> => {
    const { data } = await api.get("/teachers/me/balance");
    return data;
  },
  // Admin endpoints
  listTeacherEarnings: async (
    teacherId: string,
    params?: {
      skip?: number;
      limit?: number;
      type?: "earning" | "withdrawal" | "adjustment" | "commission";
      from_date?: string;
      to_date?: string;
    }
  ): Promise<TeacherEarning[]> => {
    const { data } = await api.get(`/teachers/admin/teachers/${teacherId}/earnings`, { params });
    return data;
  },
  getTeacherEarningsSummary: async (teacherId: string): Promise<TeacherEarningSummary> => {
    const { data } = await api.get(`/teachers/admin/teachers/${teacherId}/earnings/summary`);
    return data;
  },
  // Admin bakiye düzeltmesi
  adjustUserBalance: async (userId: string, adjustment: { amount: number; description: string; currency?: string }): Promise<TeacherEarning> => {
    const { data } = await api.post(`/teachers/admin/users/${userId}/balance/adjust`, adjustment);
    return data;
  },
};

export interface TeacherSaleItem {
  order_id: string;
  order_number: string;
  created_at: string;
  course_id: string;
  course_title: string;
  student_id: string;
  student_name: string;
  student_email: string;
  gross_amount: number;
  commission_amount: number;
  net_earning: number;
  status: string;
}

export interface TeacherSalesSummary {
  total_sales_count: number;
  total_revenue: number;
  this_month_revenue: number;
  average_order_amount: number;
  currency: string;
}

export const teacherSalesApi = {
  list: async (params?: { skip?: number; limit?: number; from_date?: string; to_date?: string }): Promise<TeacherSaleItem[]> => {
    const { data } = await api.get("/teachers/me/sales", { params });
    return data;
  },
  summary: async (): Promise<TeacherSalesSummary> => {
    const { data } = await api.get("/teachers/me/sales/summary");
    return data;
  },
};

export const withdrawalsApi = {
  listMyWithdrawals: async (): Promise<WithdrawalRequest[]> => {
    const { data } = await api.get("/teachers/me/withdrawals");
    return data;
  },
  create: async (request: WithdrawalRequestCreate): Promise<WithdrawalRequest> => {
    const { data } = await api.post("/teachers/me/withdrawals", request);
    return data;
  },
  cancel: async (withdrawalId: string): Promise<void> => {
    await api.delete(`/teachers/me/withdrawals/${withdrawalId}`);
  },
  // Legacy alias
  list: async (): Promise<WithdrawalRequest[]> => {
    const { data } = await api.get("/teachers/me/withdrawals");
    return data;
  },
  getBalance: async (): Promise<TeacherEarningSummary> => {
    const { data } = await api.get("/teachers/me/balance");
    return data;
  },
  // Admin endpoints
  listAll: async (params?: {
    status?: "pending" | "approved" | "rejected" | "paid";
    teacher_id?: string;
  }): Promise<WithdrawalRequest[]> => {
    const { data } = await api.get("/admin/withdrawals", { params });
    return data;
  },
  approve: async (withdrawalId: string, adminNote?: string): Promise<WithdrawalRequest> => {
    const { data } = await api.post(`/admin/withdrawals/${withdrawalId}/approve`, { admin_note: adminNote });
    return data;
  },
  markPaid: async (withdrawalId: string): Promise<WithdrawalRequest> => {
    const { data } = await api.post(`/admin/withdrawals/${withdrawalId}/mark-paid`);
    return data;
  },
  reject: async (withdrawalId: string, adminNote: string): Promise<WithdrawalRequest> => {
    const { data } = await api.post(`/admin/withdrawals/${withdrawalId}/reject`, { admin_note: adminNote });
    return data;
  },
};

// Reports API
export interface OverviewStats {
  total_revenue: number;
  last_30_days_revenue: number;
  last_30_days_revenue_change: number | null;
  active_students: number;
  active_teachers: number;
  total_courses: number;
  published_courses: number;
  total_orders: number;
  total_orders_last_30_days: number;
  currency: string;
}

export interface TimeSeriesDataPoint {
  label: string;
  value: number;
  count?: number;
}

export interface EarningsReport {
  group_by: "course" | "teacher";
  interval: "daily" | "weekly" | "monthly";
  date_from: string;
  date_to: string;
  data: TimeSeriesDataPoint[];
  total_revenue: number;
  total_count: number;
}

export interface TopCourseItem {
  course_id: string;
  course_title: string;
  total_revenue: number;
  total_sales: number;
  average_rating: number | null;
}

export interface TeacherStats {
  total_courses: number;
  total_students: number;
  total_sales: number;
  total_revenue: number;
  this_month_revenue: number;
  last_month_revenue: number;
  revenue_change_percentage: number | null;
  average_rating: number | null;
  total_reviews: number;
  top_courses: TopCourseItem[];
  monthly_revenue_trend: TimeSeriesDataPoint[];
  currency: string;
}

export interface CategoryAnalyticsItem {
  category_id: string;
  category_name: string;
  total_courses: number;
  total_revenue: number;
  total_sales: number;
  average_rating: number | null;
  total_enrollments: number;
}

export interface CategoryAnalytics {
  data: CategoryAnalyticsItem[];
  total_revenue: number;
  total_courses: number;
  total_sales: number;
}

export interface CoursePerformanceItem {
  course_id: string;
  course_title: string;
  teacher_name: string;
  total_revenue: number;
  total_sales: number;
  total_enrollments: number;
  completion_rate: number | null;
  average_rating: number | null;
  refund_rate: number | null;
}

export interface CoursePerformance {
  data: CoursePerformanceItem[];
  total_revenue: number;
  total_courses: number;
  total_sales: number;
}

export interface StudentAnalyticsItem {
  student_id: string;
  student_name: string;
  student_email: string;
  total_enrollments: number;
  completed_courses: number;
  total_spent: number;
  average_completion_rate: number | null;
  last_activity_at: string | null;
  enrolled_at: string;
  total_lessons_watched: number;
  total_watch_time_minutes: number;
}

export interface StudentAnalytics {
  data: StudentAnalyticsItem[];
  total_students: number;
  total_enrollments: number;
  total_revenue: number;
  average_completion_rate: number | null;
}

export interface TeacherPerformanceItem {
  teacher_id: string;
  teacher_name: string;
  total_courses: number;
  published_courses: number;
  total_students: number;
  total_revenue: number;
  total_sales: number;
  average_rating: number | null;
  total_reviews: number;
  average_completion_rate: number | null;
  refund_rate: number | null;
}

export interface TeacherPerformance {
  data: TeacherPerformanceItem[];
  total_teachers: number;
  total_revenue: number;
  total_courses: number;
  total_students: number;
}

export const reportsApi = {
  // Admin endpoints
  getOverview: async (): Promise<OverviewStats> => {
    const { data } = await api.get("/admin/reports/overview");
    return data;
  },
  getEarningsReport: async (params: {
    group_by: "course" | "teacher";
    interval: "daily" | "weekly" | "monthly";
    date_from: string;
    date_to: string;
  }): Promise<EarningsReport> => {
    const { data } = await api.get("/admin/reports/earnings", { params });
    return data;
  },
  getCategoryAnalytics: async (params?: {
    date_from?: string;
    date_to?: string;
  }): Promise<CategoryAnalytics> => {
    const { data } = await api.get("/admin/reports/category-analytics", { params });
    return data;
  },
  getCoursePerformance: async (params?: {
    limit?: number;
    date_from?: string;
    date_to?: string;
  }): Promise<CoursePerformance> => {
    const { data } = await api.get("/admin/reports/course-performance", { params });
    return data;
  },
  getStudentAnalytics: async (params?: {
    limit?: number;
    date_from?: string;
    date_to?: string;
  }): Promise<StudentAnalytics> => {
    const { data } = await api.get("/admin/reports/student-analytics", { params });
    return data;
  },
  getTeacherPerformance: async (params?: {
    limit?: number;
    date_from?: string;
    date_to?: string;
  }): Promise<TeacherPerformance> => {
    const { data } = await api.get("/admin/reports/teacher-performance", { params });
    return data;
  },
  // Teacher endpoints
  getTeacherStats: async (): Promise<TeacherStats> => {
    const { data } = await api.get("/teachers/me/stats");
    return data;
  },
};

export const publicApi = {
  getPublicSettings: async (): Promise<PublicSettingsData> => {
    const { data } = await api.get("/settings/public");
    return data;
  },
};

export const announcementsApi = {
  list: async (params?: {
    is_active?: boolean;
    type?: "info" | "warning" | "maintenance";
    skip?: number;
    limit?: number;
  }): Promise<SiteAnnouncement[]> => {
    const { data } = await api.get("/admin/announcements", { params });
    return data;
  },
  get: async (id: string): Promise<SiteAnnouncement> => {
    const { data } = await api.get(`/admin/announcements/${id}`);
    return data;
  },
  create: async (payload: SiteAnnouncementCreate): Promise<SiteAnnouncement> => {
    const { data } = await api.post("/admin/announcements", payload);
    return data;
  },
  update: async (id: string, payload: SiteAnnouncementUpdate): Promise<SiteAnnouncement> => {
    const { data } = await api.put(`/admin/announcements/${id}`, payload);
    return data;
  },
  delete: async (id: string): Promise<{ message: string }> => {
    const { data } = await api.delete(`/admin/announcements/${id}`);
    return data;
  },
  getActive: async (target_audience?: string): Promise<SiteAnnouncement[]> => {
    const { data } = await api.get("/announcements/active", {
      params: target_audience ? { target_audience } : undefined,
    });
    return data;
  },
};

// EPIC-10: Admin Content Management API
export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  metadata: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface StorageMetrics {
  total_file_size_bytes: number;
  total_content_items: number;
  type_breakdown: Record<string, { count: number; total_size_bytes: number }>;
  recent_uploads_count: number;
  quota_stats: {
    total_users: number;
    total_quota_bytes: number;
    total_used_bytes: number;
    avg_usage_percentage: number;
  };
}

export interface StorageQuota {
  user_id: string;
  quota_bytes: number;
  used_bytes: number;
  user_name?: string;
  user_email?: string;
}

export const adminContentApi = {
  // Audit Logs
  listAuditLogs: async (params?: {
    skip?: number;
    limit?: number;
    action?: string;
    resource_type?: string;
    user_id?: string;
    created_from?: string;
    created_to?: string;
  }): Promise<{ total: number; skip: number; limit: number; logs: AuditLog[] }> => {
    const { data } = await api.get("/admin/audit-logs", { params });
    return data;
  },

  // Storage Metrics
  getStorageMetrics: async (): Promise<StorageMetrics> => {
    const { data } = await api.get("/admin/storage-metrics");
    return data;
  },

  // Storage Quotas
  listStorageQuotas: async (params?: {
    skip?: number;
    limit?: number;
  }): Promise<{ total: number; skip: number; limit: number; quotas: StorageQuota[] }> => {
    const { data } = await api.get("/admin/storage-quotas", { params });
    return data;
  },
};

// EPIC-11: Certificate System Types
export interface CertificateTemplate {
  id: string;
  name: string;
  description?: string;
  template_type: "default" | "premium" | "modern" | "elegant";
  background_image?: string;
  logo_image?: string;
  signature_image?: string;
  config?: {
    font_family?: string;
    font_size_title?: number;
    font_size_body?: number;
    primary_color?: string;
    secondary_color?: string;
    text_align?: string;
    show_qr_code?: boolean;
    show_logo?: boolean;
    show_signature?: boolean;
  };
  created_by_id: string;
  is_system_template: boolean;
  is_active: boolean;
  course_id?: string;
  created_at: string;
  updated_at: string;
  created_by_name?: string;
  course_title?: string;
}

export interface Certificate {
  id: string;
  certificate_number: string;
  user_id: string;
  course_id: string;
  issued_at: string;
  completion_date: string;
  total_lessons: number;
  completed_lessons: number;
  completion_percentage: number;
  pdf_path?: string;
  pdf_generated_at?: string;
  is_revoked: boolean;
  revoked_at?: string;
  revocation_reason?: string;
  student_name: string;
  student_email?: string;
  course_title: string;
  teacher_name: string;
}

export interface CertificateVerification {
  is_valid: boolean;
  certificate_number?: string;
  student_name?: string;
  course_title?: string;
  issued_at?: string;
  is_revoked: boolean;
  revocation_reason?: string;
  verified_at: string;
}

// EPIC-11: Certificate System API
export const certificatesApi = {
  // Student endpoints
  getMyCertificates: async (params?: { course_id?: string }): Promise<Certificate[]> => {
    const { data } = await api.get("/certificates/my-certificates", { params });
    return data;
  },
  
  getCertificate: async (id: string): Promise<Certificate> => {
    const { data } = await api.get(`/certificates/${id}`);
    return data;
  },
  
  downloadCertificate: async (id: string): Promise<Blob> => {
    const { data } = await api.get(`/certificates/${id}/download`, {
      responseType: "blob",
    });
    return data;
  },
  
  // Public verification (no auth required)
  verifyCertificate: async (id: string): Promise<CertificateVerification> => {
    const { data } = await api.get(`/certificates/verify/${id}`);
    return data;
  },
  
  // Admin/Teacher endpoints
  getTemplates: async (params?: {
    course_id?: string;
    template_type?: string;
    is_active?: boolean;
  }): Promise<CertificateTemplate[]> => {
    const { data } = await api.get("/certificates/templates", { params });
    return data;
  },
  
  getTemplate: async (id: string): Promise<CertificateTemplate> => {
    const { data } = await api.get(`/certificates/templates/${id}`);
    return data;
  },
  
  createTemplate: async (payload: {
    name: string;
    description?: string;
    template_type?: "default" | "premium" | "modern" | "elegant";
    config?: Record<string, any>;
    course_id?: string;
  }): Promise<CertificateTemplate> => {
    const { data } = await api.post("/certificates/templates", payload);
    return data;
  },
  
  updateTemplate: async (
    id: string,
    payload: Partial<{
      name: string;
      description: string;
      template_type: string;
      config: Record<string, any>;
      is_active: boolean;
    }>
  ): Promise<CertificateTemplate> => {
    const { data } = await api.put(`/certificates/templates/${id}`, payload);
    return data;
  },
  
  deleteTemplate: async (id: string): Promise<void> => {
    await api.delete(`/certificates/templates/${id}`);
  },
  
  uploadTemplateBackground: async (id: string, file: File): Promise<{ background_image: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post(`/certificates/templates/${id}/upload-background`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
  
  uploadTemplateLogo: async (id: string, file: File): Promise<{ logo_image: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post(`/certificates/templates/${id}/upload-logo`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
  
  uploadTemplateSignature: async (id: string, file: File): Promise<{ signature_image: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post(`/certificates/templates/${id}/upload-signature`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
  
  generateCertificate: async (enrollmentId: string, forceRegenerate?: boolean): Promise<Certificate> => {
    const { data } = await api.post(
      `/certificates/generate/${enrollmentId}`,
      {},
      { params: forceRegenerate ? { force_regenerate: true } : undefined }
    );
    return data;
  },
  
  revokeCertificate: async (id: string, reason: string): Promise<Certificate> => {
    const { data } = await api.post(`/certificates/${id}/revoke`, { reason });
    return data;
  },
  
  getCertificatesForCourse: async (
    courseId: string,
    params?: { page?: number; page_size?: number }
  ): Promise<Certificate[]> => {
    const { data } = await api.get(`/certificates/courses/${courseId}/certificates`, { params });
    return data;
  },
};

// ============================================================================
// EPIC-15: Popup Announcements API
// ============================================================================

export type PopupType = "info" | "promotion" | "announcement" | "warning";

export interface PopupAnnouncement {
  id: string;
  title: string;
  message: string;
  popup_type: PopupType;
  is_active: boolean;
  starts_at: string | null;
  expires_at: string | null;
  target_audience: string;
  priority: number;
  is_dismissible: boolean;
  show_once_per_user: boolean;
  dismiss_duration_days: number | null;
  image_url: string | null;
  button_text: string | null;
  button_link_url: string | null;
  button_link_target: string;
  width: number;
  height: number | null;
  position: "center" | "top" | "bottom" | "top_left" | "top_right" | "bottom_left" | "bottom_right";
  overlay_opacity: number;
  created_by_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PopupAnnouncementCreate {
  title: string;
  message: string;
  popup_type?: PopupType;
  is_active?: boolean;
  starts_at?: string | null;
  expires_at?: string | null;
  target_audience?: string;
  priority?: number;
  is_dismissible?: boolean;
  show_once_per_user?: boolean;
  dismiss_duration_days?: number | null;
  image_url?: string | null;
  button_text?: string | null;
  button_link_url?: string | null;
  button_link_target?: string;
  width?: number;
  height?: number | null;
  position?: "center" | "top" | "bottom" | "top_left" | "top_right" | "bottom_left" | "bottom_right";
  overlay_opacity?: number;
}

export interface PopupAnnouncementUpdate extends Partial<PopupAnnouncementCreate> {}

export interface PopupAnnouncementListResponse {
  id: string;
  title: string;
  popup_type: PopupType;
  is_active: boolean;
  starts_at: string | null;
  expires_at: string | null;
  target_audience: string;
  priority: number;
  created_at: string;
  updated_at: string;
}

export const popupAnnouncementsApi = {
  // Admin endpoints
  create: async (popup: PopupAnnouncementCreate): Promise<PopupAnnouncement> => {
    const { data } = await api.post("/admin/popups", popup);
    return data;
  },

  list: async (params?: {
    is_active?: boolean;
    popup_type?: PopupType;
    target_audience?: string;
    skip?: number;
    limit?: number;
  }): Promise<PopupAnnouncementListResponse[]> => {
    const { data } = await api.get("/admin/popups", { params });
    return data;
  },

  get: async (popupId: string): Promise<PopupAnnouncement> => {
    const { data } = await api.get(`/admin/popups/${popupId}`);
    return data;
  },

  update: async (popupId: string, data: PopupAnnouncementUpdate): Promise<PopupAnnouncement> => {
    const { data: response } = await api.put(`/admin/popups/${popupId}`, data);
    return response;
  },

  delete: async (popupId: string): Promise<void> => {
    await api.delete(`/admin/popups/${popupId}`);
  },

  activate: async (popupId: string): Promise<PopupAnnouncement> => {
    const { data } = await api.post(`/admin/popups/${popupId}/activate`);
    return data;
  },

  deactivate: async (popupId: string): Promise<PopupAnnouncement> => {
    const { data } = await api.post(`/admin/popups/${popupId}/deactivate`);
    return data;
  },

  // Public endpoint
  getActive: async (params?: {
    target_audience?: string;
    dismissed_ids?: string;
  }): Promise<PopupAnnouncement | null> => {
    try {
      const { data } = await api.get("/public/popups/active", { params });
      return data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },
};

// ============================================================================
// EPIC-14: Ad Campaigns API
// ============================================================================

export type CampaignStatus = "draft" | "pending_approval" | "active" | "paused" | "completed" | "rejected" | "cancelled";
export type CampaignType = "featured_course" | "course_promotion" | "banner_ad";
export type PricingModel = "fixed_daily" | "per_impression" | "per_click" | "hybrid";
export type ApprovalStatus = "pending" | "approved" | "rejected";
export type PaymentStatus = "pending" | "paid" | "refunded";
export type PlacementType = "banner" | "featured_course" | "sidebar" | "inline" | "popup";

export interface AdPlacement {
  id: string;
  name: string;
  code: string;
  description?: string;
  placement_type: PlacementType;
  location: string;
  width: number;
  height: number;
  max_ads: number;
  is_active: boolean;
  priority: number;
  targeting_options?: Record<string, any>;
  created_at: string;
  updated_at: string;
  pricing?: {
    fixed_daily?: number;
    per_impression?: number;
    per_click?: number;
  };
  active_campaigns_count?: number;
}

export interface AdPricing {
  id: string;
  placement_id: string;
  pricing_model: PricingModel;
  price_per_day?: number;
  price_per_impression?: number;
  price_per_click?: number;
  min_daily_budget?: number;
  max_daily_budget?: number;
  min_campaign_duration_days: number;
  max_campaign_duration_days?: number;
  discount_percentage: number;
  is_active: boolean;
  effective_from: string;
  effective_until?: string;
  created_by_id: string;
  updated_by_id?: string;
  created_at: string;
  updated_at: string;
}

export interface AdCampaign {
  id: string;
  teacher_id: string;
  course_id: string;
  placement_id: string;
  name: string;
  status: CampaignStatus;
  campaign_type: CampaignType;
  banner_image_url?: string;
  banner_link_url?: string;
  banner_alt_text?: string;
  start_date: string;
  end_date: string;
  daily_budget?: number;
  total_budget: number;
  spent_amount: number;
  pricing_model: PricingModel;
  price_per_day: number;
  price_per_impression?: number;
  price_per_click?: number;
  target_categories?: string[];
  target_tags?: string[];
  is_targeted: boolean;
  approval_status: ApprovalStatus;
  payment_status: PaymentStatus;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  approved_by_id?: string;
  approved_at?: string;
  rejection_reason?: string;
  payment_transaction_id?: string;
  created_at: string;
  updated_at: string;
  teacher?: { id: string; full_name: string };
  course?: { id: string; title: string; slug: string; thumbnail_path?: string };
  placement?: AdPlacement;
  approved_by?: { id: string; full_name: string };
}

export interface AdCampaignCreate {
  name: string;
  campaign_type: CampaignType;
  placement_id: string;
  course_id?: string;
  banner_image_url?: string;
  banner_link_url?: string;
  banner_alt_text?: string;
  start_date: string;
  end_date: string;
  daily_budget?: number;
  total_budget: number;
  payment_method?: string;
  pricing_model?: PricingModel;
  target_categories?: string[];
  target_tags?: string[];
  is_targeted?: boolean;
}

export interface AdCampaignUpdate extends Partial<AdCampaignCreate> {}

export interface AdCampaignListResponse {
  id: string;
  name: string;
  campaign_type: CampaignType;
  status: CampaignStatus;
  approval_status: ApprovalStatus;
  placement_id: string;
  course_id: string;
  start_date: string;
  end_date: string;
  total_budget: number;
  spent_amount: number;
  impressions: number;
  clicks: number;
  ctr: number;
  created_at: string;
  updated_at: string;
  placement?: AdPlacement;
  course?: { id: string; title: string; slug: string };
}

export interface AdCampaignAnalytics {
  campaign_id: string;
  date_from: string;
  date_to: string;
  total_impressions: number;
  total_clicks: number;
  total_conversions: number;
  total_spent: number;
  average_ctr: number;
  average_conversion_rate: number;
  average_cpc: number;
  average_cpm: number;
  daily_analytics: Array<{
    date: string;
    impressions: number;
    clicks: number;
    conversions: number;
    spent_amount: number;
    ctr: number;
    conversion_rate: number;
    cpc: number;
    cpm: number;
  }>;
}

export interface CampaignCostCalculation {
  calculated_cost: number;
  breakdown: {
    pricing_model: PricingModel;
    days: number;
    price_per_day?: number;
    price_per_impression?: number;
    price_per_click?: number;
    discount_percentage: number;
    calculated_cost: number;
  };
  pricing_info: {
    id: string;
    pricing_model: PricingModel;
    price_per_day?: number;
    price_per_impression?: number;
    price_per_click?: number;
    discount_percentage: number;
  };
}

export interface AdBalance {
  available_balance: number;
  pending_amounts: number;
  currency: string;
}

export const adCampaignsApi = {
  // Teacher endpoints
  create: async (campaign: AdCampaignCreate): Promise<AdCampaign> => {
    const { data } = await api.post("/ads/campaigns", campaign);
    return data;
  },

  list: async (params?: {
    status?: CampaignStatus;
    placement_id?: string;
    course_id?: string;
    skip?: number;
    limit?: number;
  }): Promise<AdCampaignListResponse[]> => {
    const { data } = await api.get("/ads/campaigns", { params });
    return data;
  },

  get: async (campaignId: string): Promise<AdCampaign> => {
    const { data } = await api.get(`/ads/campaigns/${campaignId}`);
    return data;
  },

  update: async (campaignId: string, data: AdCampaignUpdate): Promise<AdCampaign> => {
    const { data: response } = await api.put(`/ads/campaigns/${campaignId}`, data);
    return response;
  },

  delete: async (campaignId: string): Promise<void> => {
    await api.delete(`/ads/campaigns/${campaignId}`);
  },

  pause: async (campaignId: string): Promise<AdCampaign> => {
    const { data } = await api.post(`/ads/campaigns/${campaignId}/pause`);
    return data;
  },

  resume: async (campaignId: string): Promise<AdCampaign> => {
    const { data } = await api.post(`/ads/campaigns/${campaignId}/resume`);
    return data;
  },

  getAnalytics: async (
    campaignId: string,
    params?: {
      date_from?: string;
      date_to?: string;
      group_by?: "day" | "week" | "month";
    }
  ): Promise<AdCampaignAnalytics> => {
    const { data } = await api.get(`/ads/campaigns/${campaignId}/analytics`, { params });
    return data;
  },

  getPlacements: async (): Promise<AdPlacement[]> => {
    const { data } = await api.get("/ads/placements");
    return data;
  },

  getPlacementPricing: async (
    placementId: string,
    params: {
      start_date: string;
      end_date: string;
    }
  ): Promise<CampaignCostCalculation> => {
    const { data } = await api.get(`/ads/placements/${placementId}/pricing`, { params });
    return data;
  },

  getBalance: async (): Promise<AdBalance> => {
    const { data } = await api.get("/ads/balance");
    return data;
  },

  // Admin endpoints
  listAll: async (params?: {
    status?: CampaignStatus;
    teacher_id?: string;
    placement_id?: string;
    approval_status?: ApprovalStatus;
    skip?: number;
    limit?: number;
  }): Promise<AdCampaign[]> => {
    const { data } = await api.get("/admin/ads/campaigns", { params });
    return data;
  },

  getAdmin: async (campaignId: string): Promise<AdCampaign> => {
    const { data } = await api.get(`/admin/ads/campaigns/${campaignId}`);
    return data;
  },

  approve: async (campaignId: string, notes?: string): Promise<AdCampaign> => {
    const { data } = await api.post(`/admin/ads/campaigns/${campaignId}/approve`, { notes });
    return data;
  },

  reject: async (campaignId: string, reason: string): Promise<AdCampaign> => {
    const { data } = await api.post(`/admin/ads/campaigns/${campaignId}/reject`, { reason });
    return data;
  },

  updateAdmin: async (campaignId: string, data: AdCampaignUpdate): Promise<AdCampaign> => {
    const { data: response } = await api.put(`/admin/ads/campaigns/${campaignId}`, data);
    return response;
  },

  deleteAdmin: async (campaignId: string): Promise<void> => {
    await api.delete(`/admin/ads/campaigns/${campaignId}`);
  },

  getStats: async (): Promise<{
    total_campaigns: number;
    active_campaigns: number;
    pending_approval: number;
    total_revenue: number;
    total_budget: number;
    currency: string;
  }> => {
    const { data } = await api.get("/admin/ads/campaigns/stats");
    return data;
  },
};

export const adPlacementsApi = {
  // Admin endpoints
  create: async (placement: {
    name: string;
    code: string;
    description?: string;
    placement_type: PlacementType;
    location: string;
    width: number;
    height: number;
    max_ads?: number;
    is_active?: boolean;
    priority?: number;
    targeting_options?: Record<string, any>;
  }): Promise<AdPlacement> => {
    const { data } = await api.post("/admin/ads/placements", placement);
    return data;
  },

  list: async (params?: {
    is_active?: boolean;
    placement_type?: PlacementType;
    location?: string;
    skip?: number;
    limit?: number;
  }): Promise<AdPlacement[]> => {
    const { data } = await api.get("/admin/ads/placements", { params });
    return data;
  },

  get: async (placementId: string): Promise<AdPlacement> => {
    const { data } = await api.get(`/admin/ads/placements/${placementId}`);
    return data;
  },

  update: async (placementId: string, data: Partial<AdPlacement>): Promise<AdPlacement> => {
    const { data: response } = await api.put(`/admin/ads/placements/${placementId}`, data);
    return response;
  },

  delete: async (placementId: string): Promise<void> => {
    await api.delete(`/admin/ads/placements/${placementId}`);
  },
};

export const adPricingApi = {
  // Admin endpoints
  create: async (pricing: {
    placement_id: string;
    pricing_model: PricingModel;
    price_per_day?: number;
    price_per_impression?: number;
    price_per_click?: number;
    min_daily_budget?: number;
    max_daily_budget?: number;
    min_campaign_duration_days?: number;
    max_campaign_duration_days?: number;
    discount_percentage?: number;
    is_active?: boolean;
    effective_from: string;
    effective_until?: string;
  }): Promise<AdPricing> => {
    const { data } = await api.post("/admin/ads/pricing", pricing);
    return data;
  },

  list: async (params?: {
    placement_id?: string;
    is_active?: boolean;
    pricing_model?: PricingModel;
    skip?: number;
    limit?: number;
  }): Promise<AdPricing[]> => {
    const { data } = await api.get("/admin/ads/pricing", { params });
    return data;
  },

  get: async (pricingId: string): Promise<AdPricing> => {
    const { data } = await api.get(`/admin/ads/pricing/${pricingId}`);
    return data;
  },

  update: async (pricingId: string, data: Partial<AdPricing>): Promise<AdPricing> => {
    const { data: response } = await api.put(`/admin/ads/pricing/${pricingId}`, data);
    return response;
  },

  delete: async (pricingId: string): Promise<void> => {
    await api.delete(`/admin/ads/pricing/${pricingId}`);
  },

  getPlacementHistory: async (placementId: string): Promise<AdPricing[]> => {
    const { data } = await api.get(`/admin/ads/pricing/placement/${placementId}`);
    return data;
  },

  calculateCost: async (params: {
    placement_id: string;
    start_date: string;
    end_date: string;
    pricing_model: PricingModel;
  }): Promise<CampaignCostCalculation> => {
    const { data } = await api.post("/admin/ads/pricing/calculate", params);
    return data;
  },
};

export const adDisplayApi = {
  // Public endpoints
  getAdsForPlacement: async (params: {
    placement_code: string;
    category_id?: string;
    limit?: number;
  }): Promise<Array<{
    campaign_id: string;
    campaign_type: CampaignType;
    banner_image_url?: string;
    banner_link_url?: string;
    banner_alt_text?: string;
    course_id?: string;
    course?: {
      id: string;
      title: string;
      slug: string;
      description?: string;
      thumbnail_path?: string;
      price: number;
      discount_price?: number;
      teacher?: {
        id: string;
        full_name: string;
      };
      lesson_count?: number;
    };
  }>> => {
    const { data } = await api.get(`/public/ads/placement/${params.placement_code}`, {
      params: { category_id: params.category_id, limit: params.limit },
    });
    return data;
  },

  trackClick: async (campaignId: string): Promise<{ success: boolean }> => {
    const { data } = await api.post(`/public/ads/click/${campaignId}`);
    return data;
  },

  getFeaturedCourses: async (params?: {
    limit?: number;
    category_id?: string;
  }): Promise<Array<{
    id: string;
    title: string;
    slug: string;
    thumbnail_path?: string;
    price: number;
    discount_price?: number;
    teacher?: {
      id: string;
      full_name: string;
    };
    campaign_id: string;
  }>> => {
    const { data } = await api.get("/public/ads/featured-courses", { params });
    return data;
  },

  getPlacementInfo: async (placementCode: string): Promise<{
    id: string;
    name: string;
    code: string;
    placement_type: PlacementType;
    width: number;
    height: number;
    pricing?: {
      fixed_daily?: number;
      per_impression?: number;
      per_click?: number;
    };
  }> => {
    const { data } = await api.get(`/public/ads/placement-info/${placementCode}`);
    return data;
  },
};

// ============================================================================
// EPIC-BLOG: Blog API Types & Client
// ============================================================================

export type BlogPostStatus = "draft" | "pending_review" | "published" | "archived";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image_url: string | null;
  author_id: string;
  author: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    bio: string | null;
  };
  status: BlogPostStatus;
  published_at: string | null;
  view_count: number;
  is_featured: boolean;
  is_pinned: boolean;
  allow_comments: boolean;
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    color: string | null;
  }>;
  tags: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  seo_meta_title: string | null;
  seo_meta_description: string | null;
  seo_meta_keywords: string | null;
  seo_og_title: string | null;
  seo_og_description: string | null;
  seo_og_image_url: string | null;
  seo_twitter_card: string | null;
  seo_canonical_url: string | null;
  seo_schema_json: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface BlogPostCreate {
  title: string;
  slug?: string;
  excerpt?: string | null;
  content: string;
  featured_image_url?: string | null;
  status?: BlogPostStatus;
  published_at?: string | null;
  is_featured?: boolean;
  is_pinned?: boolean;
  allow_comments?: boolean;
  category_ids?: string[];
  tag_ids?: string[];
  seo_meta_title?: string | null;
  seo_meta_description?: string | null;
  seo_meta_keywords?: string | null;
  seo_og_title?: string | null;
  seo_og_description?: string | null;
  seo_og_image_url?: string | null;
  seo_twitter_card?: string | null;
  seo_canonical_url?: string | null;
  seo_schema_json?: Record<string, any> | null;
}

export interface BlogPostUpdate {
  title?: string;
  slug?: string;
  excerpt?: string | null;
  content?: string;
  featured_image_url?: string | null;
  status?: BlogPostStatus;
  published_at?: string | null;
  is_featured?: boolean;
  is_pinned?: boolean;
  allow_comments?: boolean;
  category_ids?: string[] | null;
  tag_ids?: string[] | null;
  seo_meta_title?: string | null;
  seo_meta_description?: string | null;
  seo_meta_keywords?: string | null;
  seo_og_title?: string | null;
  seo_og_description?: string | null;
  seo_og_image_url?: string | null;
  seo_twitter_card?: string | null;
  seo_canonical_url?: string | null;
  seo_schema_json?: Record<string, any> | null;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  parent_id: string | null;
  parent: BlogCategory | null;
  children: BlogCategory[];
  order: number;
  is_active: boolean;
  seo_meta_title: string | null;
  seo_meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogCategoryCreate {
  name: string;
  slug?: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  parent_id?: string | null;
  order?: number;
  is_active?: boolean;
  seo_meta_title?: string | null;
  seo_meta_description?: string | null;
}

export interface BlogCategoryUpdate {
  name?: string;
  slug?: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  parent_id?: string | null;
  order?: number;
  is_active?: boolean;
  seo_meta_title?: string | null;
  seo_meta_description?: string | null;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface BlogTagCreate {
  name: string;
  slug?: string;
  description?: string | null;
}

export interface BlogTagUpdate {
  name?: string;
  slug?: string;
  description?: string | null;
}

export interface BlogStats {
  total_posts: number;
  published_posts: number;
  draft_posts: number;
  total_views: number;
  top_posts: Array<{
    id: string;
    title: string;
    view_count: number;
    author: string | null;
  }>;
  top_categories: Array<{
    id: string;
    name: string;
    post_count: number;
  }>;
  top_tags: Array<{
    id: string;
    name: string;
    usage_count: number;
  }>;
}

export const blogPostsApi = {
  create: async (post: BlogPostCreate): Promise<BlogPost> => {
    const { data } = await api.post("/blog/posts", post);
    return data;
  },

  list: async (params?: {
    status?: BlogPostStatus;
    author_id?: string;
    category_id?: string;
    tag_id?: string;
    search?: string;
    featured?: boolean;
    pinned?: boolean;
    skip?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: "asc" | "desc";
  }): Promise<BlogPost[]> => {
    const { data } = await api.get("/blog/posts", { params });
    return data;
  },

  get: async (postId: string): Promise<BlogPost> => {
    const { data } = await api.get(`/blog/posts/${postId}`);
    return data;
  },

  getBySlug: async (slug: string): Promise<BlogPost> => {
    const { data } = await api.get(`/blog/posts/slug/${slug}`);
    return data;
  },

  update: async (postId: string, data: BlogPostUpdate): Promise<BlogPost> => {
    const { data: response } = await api.put(`/blog/posts/${postId}`, data);
    return response;
  },

  delete: async (postId: string): Promise<void> => {
    await api.delete(`/blog/posts/${postId}`);
  },

  publish: async (postId: string): Promise<BlogPost> => {
    const { data } = await api.post(`/blog/posts/${postId}/publish`);
    return data;
  },

  unpublish: async (postId: string): Promise<BlogPost> => {
    const { data } = await api.post(`/blog/posts/${postId}/unpublish`);
    return data;
  },

  getMyPosts: async (params?: {
    status?: BlogPostStatus;
    skip?: number;
    limit?: number;
  }): Promise<BlogPost[]> => {
    const { data } = await api.get("/blog/posts/me", { params });
    return data;
  },
};

export const blogCategoriesApi = {
  create: async (category: BlogCategoryCreate): Promise<BlogCategory> => {
    const { data } = await api.post("/blog/categories", category);
    return data;
  },

  list: async (params?: {
    parent_id?: string | null;
    is_active?: boolean;
    skip?: number;
    limit?: number;
  }): Promise<BlogCategory[]> => {
    const { data } = await api.get("/blog/categories", { params });
    return data;
  },

  get: async (categoryId: string): Promise<BlogCategory> => {
    const { data } = await api.get(`/blog/categories/${categoryId}`);
    return data;
  },

  getBySlug: async (slug: string): Promise<BlogCategory> => {
    const { data } = await api.get(`/blog/categories/slug/${slug}`);
    return data;
  },

  update: async (categoryId: string, data: BlogCategoryUpdate): Promise<BlogCategory> => {
    const { data: response } = await api.put(`/blog/categories/${categoryId}`, data);
    return response;
  },

  delete: async (categoryId: string): Promise<void> => {
    await api.delete(`/blog/categories/${categoryId}`);
  },

  getPosts: async (
    categoryId: string,
    params?: {
      status?: BlogPostStatus;
      skip?: number;
      limit?: number;
    }
  ): Promise<BlogPost[]> => {
    const { data } = await api.get(`/blog/categories/${categoryId}/posts`, { params });
    return data;
  },
};

export const blogTagsApi = {
  create: async (tag: BlogTagCreate): Promise<BlogTag> => {
    const { data } = await api.post("/blog/tags", tag);
    return data;
  },

  list: async (params?: {
    search?: string;
    min_usage_count?: number;
    skip?: number;
    limit?: number;
    sort?: "usage_count" | "name";
  }): Promise<BlogTag[]> => {
    const { data } = await api.get("/blog/tags", { params });
    return data;
  },

  get: async (tagId: string): Promise<BlogTag> => {
    const { data } = await api.get(`/blog/tags/${tagId}`);
    return data;
  },

  getBySlug: async (slug: string): Promise<BlogTag> => {
    const { data } = await api.get(`/blog/tags/slug/${slug}`);
    return data;
  },

  update: async (tagId: string, data: BlogTagUpdate): Promise<BlogTag> => {
    const { data: response } = await api.put(`/blog/tags/${tagId}`, data);
    return response;
  },

  delete: async (tagId: string): Promise<void> => {
    await api.delete(`/blog/tags/${tagId}`);
  },

  getPopular: async (limit?: number): Promise<BlogTag[]> => {
    const { data } = await api.get("/blog/tags/popular", { params: { limit } });
    return data;
  },

  getPosts: async (
    tagId: string,
    params?: {
      status?: BlogPostStatus;
      skip?: number;
      limit?: number;
    }
  ): Promise<BlogPost[]> => {
    const { data } = await api.get(`/blog/tags/${tagId}/posts`, { params });
    return data;
  },
};

export const blogAdminApi = {
  listAllPosts: async (params?: {
    status?: BlogPostStatus;
    author_id?: string;
    category_id?: string;
    tag_id?: string;
    search?: string;
    skip?: number;
    limit?: number;
  }): Promise<BlogPost[]> => {
    const { data } = await api.get("/admin/blog/posts", { params });
    return data;
  },

  getPost: async (postId: string): Promise<BlogPost> => {
    const { data } = await api.get(`/admin/blog/posts/${postId}`);
    return data;
  },

  updatePost: async (postId: string, data: BlogPostUpdate): Promise<BlogPost> => {
    const { data: response } = await api.put(`/admin/blog/posts/${postId}`, data);
    return response;
  },

  deletePost: async (postId: string): Promise<void> => {
    await api.delete(`/admin/blog/posts/${postId}`);
  },

  featurePost: async (postId: string): Promise<BlogPost> => {
    const { data } = await api.post(`/admin/blog/posts/${postId}/feature`);
    return data;
  },

  unfeaturePost: async (postId: string): Promise<BlogPost> => {
    const { data } = await api.post(`/admin/blog/posts/${postId}/unfeature`);
    return data;
  },

  pinPost: async (postId: string): Promise<BlogPost> => {
    const { data } = await api.post(`/admin/blog/posts/${postId}/pin`);
    return data;
  },

  unpinPost: async (postId: string): Promise<BlogPost> => {
    const { data } = await api.post(`/admin/blog/posts/${postId}/unpin`);
    return data;
  },

  getStats: async (): Promise<BlogStats> => {
    const { data } = await api.get("/admin/blog/stats");
    return data;
  },

  listPendingPosts: async (params?: {
    skip?: number;
    limit?: number;
  }): Promise<BlogPost[]> => {
    const { data } = await api.get("/admin/blog/posts/pending", { params });
    return data;
  },

  approvePost: async (postId: string): Promise<BlogPost> => {
    const { data } = await api.post(`/admin/blog/posts/${postId}/approve`);
    return data;
  },

  rejectPost: async (postId: string, rejectionReason?: string): Promise<BlogPost> => {
    const { data } = await api.post(`/admin/blog/posts/${postId}/reject`, {
      rejection_reason: rejectionReason,
    });
    return data;
  },
};

export const blogPublicApi = {
  list: async (params?: {
    category_slug?: string;
    tag_slug?: string;
    search?: string;
    featured?: boolean;
    skip?: number;
    limit?: number;
  }): Promise<BlogPost[]> => {
    const { data } = await api.get("/public/blog", { params });
    return data;
  },

  getBySlug: async (slug: string): Promise<BlogPost> => {
    const { data } = await api.get(`/public/blog/${slug}`);
    return data;
  },

  getCategories: async (): Promise<BlogCategory[]> => {
    const { data } = await api.get("/public/blog/categories");
    return data;
  },

  getCategory: async (slug: string, params?: { skip?: number; limit?: number }): Promise<{
    category: BlogCategory;
    posts: BlogPost[];
    total: number;
  }> => {
    const { data } = await api.get(`/public/blog/categories/${slug}`, { params });
    return data;
  },

  getTags: async (params?: { popular?: boolean; limit?: number }): Promise<BlogTag[]> => {
    const { data } = await api.get("/public/blog/tags", { params });
    return data;
  },

  getTag: async (slug: string, params?: { skip?: number; limit?: number }): Promise<{
    tag: BlogTag;
    posts: BlogPost[];
    total: number;
  }> => {
    const { data } = await api.get(`/public/blog/tags/${slug}`, { params });
    return data;
  },

  getAuthor: async (authorId: string, params?: { skip?: number; limit?: number }): Promise<{
    author: {
      id: string;
      full_name: string;
      avatar_url: string | null;
      bio: string | null;
    };
    posts: BlogPost[];
    total: number;
  }> => {
    const { data } = await api.get(`/public/blog/authors/${authorId}`, { params });
    return data;
  },

  search: async (params: {
    q: string;
    category_id?: string;
    tag_id?: string;
    skip?: number;
    limit?: number;
  }): Promise<BlogPost[]> => {
    const { data } = await api.get("/public/blog/search", { params });
    return data;
  },
};

// ============================================================================
// EPIC-12: Messaging API (EP12-FE-05)
// ============================================================================

export interface MessageRecipient {
  id: string;
  full_name: string;
  avatar: string | null;
  role: "student" | "teacher" | "admin";
  label: string; // "Support" for admin in student view
}

export interface Conversation {
  id: string;
  participant1_id: string;
  participant2_id: string;
  participant1_role: string;
  participant2_role: string;
  course_id: string | null;
  subject: string | null;
  conversation_type: string;
  last_message_at: string | null;
  last_message_preview: string | null;
  unread_count: number;
  is_archived: boolean;
  is_closed: boolean;
  created_at: string;
  participant1_name: string;
  participant1_avatar: string | null;
  participant2_name: string;
  participant2_avatar: string | null;
  other_participant_id: string;
  other_participant_name: string;
  other_participant_avatar: string | null;
  other_participant_role: string;
  other_participant_label: string;
  course_title: string | null;
  latest_messages?: Message[];
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_role: string;
  content: string;
  attachment_url: string | null;
  attachment_filename: string | null;
  attachment_size: number | null;
  is_read: boolean;
  read_at: string | null;
  is_deleted: boolean;
  deleted_at: string | null;
  is_flagged: boolean;
  flag_reason: string | null;
  created_at: string;
  sender_name: string;
  sender_avatar: string | null;
}

export interface ConversationListResponse {
  conversations: Conversation[];
  total: number;
}

export interface MessageListResponse {
  messages: Message[];
  total: number;
  limit: number;
  offset: number;
}

export interface UnreadCountResponse {
  unread_count: number;
}

export const messagesApi = {
  // KVKK Compliant recipient listing
  getAvailableRecipients: async (params?: {
    search?: string;
  }): Promise<MessageRecipient[]> => {
    const { data } = await api.get("/messages/recipients", { params });
    return data;
  },

  getConversations: async (params?: {
    include_archived?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<ConversationListResponse> => {
    const { data } = await api.get("/messages/conversations", { params });
    return data;
  },

  getConversation: async (id: string): Promise<Conversation> => {
    const { data } = await api.get(`/messages/conversations/${id}`);
    return data;
  },

  createConversation: async (data: {
    recipient_id: string;
    course_id?: string;
    subject?: string;
  }): Promise<Conversation> => {
    const { data: response } = await api.post("/messages/conversations", data);
    return response;
  },

  getMessages: async (
    conversationId: string,
    params: { limit: number; offset: number }
  ): Promise<MessageListResponse> => {
    const { data } = await api.get(
      `/messages/conversations/${conversationId}/messages`,
      { params }
    );
    return data;
  },

  sendMessage: async (
    conversationId: string,
    data: { content: string; attachment?: File }
  ): Promise<Message> => {
    const formData = new FormData();
    formData.append("content", data.content);
    if (data.attachment) {
      formData.append("attachment", data.attachment);
    }
    const { data: response } = await api.post(
      `/messages/conversations/${conversationId}/messages`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response;
  },

  markAsRead: async (conversationId: string): Promise<void> => {
    await api.post(`/messages/conversations/${conversationId}/read`);
  },

  archiveConversation: async (conversationId: string): Promise<void> => {
    await api.post(`/messages/conversations/${conversationId}/archive`);
  },

  deleteMessage: async (messageId: string): Promise<void> => {
    await api.delete(`/messages/messages/${messageId}`);
  },

  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    const { data } = await api.get("/messages/unread-count");
    return data;
  },

  poll: async (params: {
    since: string; // ISO datetime string
    timeout?: number;
  }): Promise<{
    conversations: Conversation[];
    has_new_messages: boolean;
  }> => {
    const { data } = await api.get("/messages/poll", { params });
    return data;
  },
};

export interface TeacherApplicationCreate {
  full_name: string;
  phone: string;
  address: string;
  birth_date: string;
  gender: string;
  branches: string[];
  levels: string[];
  experience_years: number;
  bio: string;
  heard_from: string;
  cv_path: string;
  graduation_cert_path: string;
  criminal_record_path: string;
}

export interface TeacherApplication {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address: string;
  birth_date: string;
  gender: string;
  branches: string[];
  levels: string[];
  experience_years: number;
  bio: string;
  heard_from: string;
  cv_path: string;
  graduation_cert_path: string;
  criminal_record_path: string;
  status: "pending" | "approved" | "rejected";
  admin_note: string | null;
  created_at: string;
  updated_at: string;
}

export const teacherApplicationsApi = {
  submitApplication: async (data: TeacherApplicationCreate): Promise<TeacherApplication> => {
    const { data: response } = await api.post("/teacher-applications", data);
    return response;
  },
  getMyApplication: async (): Promise<TeacherApplication> => {
    const { data } = await api.get("/teacher-applications/me");
    return data;
  },
  uploadDocument: async (file: File): Promise<{ path: string; url: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post("/media/upload-document", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
  uploadImage: async (file: File): Promise<{ path: string; url: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post("/media/upload-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
  listApplications: async (params?: { status?: string }): Promise<TeacherApplication[]> => {
    const { data } = await api.get("/teacher-applications", { params });
    return data;
  },
  reviewApplication: async (
    id: string,
    data: { status: "approved" | "rejected"; admin_note?: string }
  ): Promise<TeacherApplication> => {
    const { data: response } = await api.post(`/teacher-applications/${id}/review`, data);
    return response;
  },
};

export const pagesApi = {
  getAll: async (includeInactive = false): Promise<any[]> => {
    const { data } = await api.get("/pages", { params: { include_inactive: includeInactive } });
    return data;
  },
  getBySlug: async (slug: string): Promise<any> => {
    const { data } = await api.get(`/pages/${slug}`);
    return data;
  },
  create: async (pageData: any): Promise<any> => {
    const { data } = await api.post("/pages", pageData);
    return data;
  },
  update: async (slug: string, pageData: any): Promise<any> => {
    const { data } = await api.put(`/pages/${slug}`, pageData);
    return data;
  },
  delete: async (slug: string): Promise<any> => {
    const { data } = await api.delete(`/pages/${slug}`);
    return data;
  },
};

export const homeworksApi = {
  create: async (homeworkData: any): Promise<any> => {
    const { data } = await api.post("/homeworks", homeworkData);
    return data;
  },
  list: async (courseId: string): Promise<any[]> => {
    const { data } = await api.get("/homeworks", { params: { course_id: courseId } });
    return data;
  },
  submit: async (homeworkId: string, submissionData: any): Promise<any> => {
    const { data } = await api.post(`/homeworks/${homeworkId}/submit`, submissionData);
    return data;
  },
  getSubmissions: async (homeworkId: string): Promise<any[]> => {
    const { data } = await api.get(`/homeworks/${homeworkId}/submissions`);
    return data;
  },
  grade: async (submissionId: string, gradeData: any): Promise<any> => {
    const { data } = await api.post(`/homeworks/submissions/${submissionId}/grade`, gradeData);
    return data;
  },
  assign: async (homeworkId: string, assignData: { student_id?: string | null; due_date: string }): Promise<any> => {
    const { data } = await api.post(`/homeworks/${homeworkId}/assign`, assignData);
    return data;
  },
};

export const examsApi = {
  create: async (examData: any): Promise<any> => {
    const { data } = await api.post("/exams", examData);
    return data;
  },
  list: async (courseId: string): Promise<any[]> => {
    const { data } = await api.get("/exams", { params: { course_id: courseId } });
    return data;
  },
  addQuestion: async (examId: string, questionData: any): Promise<any> => {
    const { data } = await api.post(`/exams/${examId}/questions`, questionData);
    return data;
  },
  startAttempt: async (examId: string): Promise<any> => {
    const { data } = await api.post(`/exams/${examId}/attempt`);
    return data;
  },
  submitAttempt: async (attemptId: string, attemptAnswers: any): Promise<any> => {
    const { data } = await api.post(`/exams/attempts/${attemptId}/submit`, attemptAnswers);
    return data;
  },
};

// ── Education Programs API ──
export interface CurriculumSection {
  title: string;
  lessonCount: number;
  duration: string;
  items: (string | { title: string; lesson_type: string })[];
}

export interface FAQ {
  q: string;
  a: string;
}

export interface Review {
  name: string;
  score: number;
  role: string;
  text: string;
  date: string;
}

export interface EducationProgram {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  short_description?: string;
  category: string;
  gradient: string;
  price: number;
  original_price?: number;
  kontenjan?: number;
  start_date?: string;
  rating: number;
  review_count: number;
  students: number;
  hours: number;
  lessons: number;
  badge?: string;
  description: string;
  what_you_learn: string[];
  curriculum_intro?: string;
  curriculum: CurriculumSection[];
  faqs: FAQ[];
  reviews: Review[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const educationProgramsApi = {
  list: async (params?: { category?: string; include_inactive?: boolean }): Promise<EducationProgram[]> => {
    const { data } = await api.get("/education-programs", { params });
    return data;
  },
  getBySlug: async (slug: string): Promise<EducationProgram> => {
    const { data } = await api.get(`/education-programs/slug/${slug}`);
    return data;
  },
  getById: async (id: string): Promise<EducationProgram> => {
    const { data } = await api.get(`/education-programs/${id}`);
    return data;
  },
  create: async (payload: any): Promise<EducationProgram> => {
    const { data } = await api.post("/education-programs", payload);
    return data;
  },
  update: async (id: string, payload: any): Promise<EducationProgram> => {
    const { data } = await api.patch(`/education-programs/${id}`, payload);
    return data;
  },
  delete: async (id: string): Promise<any> => {
    const { data } = await api.delete(`/education-programs/${id}`);
    return data;
  },
};

export interface SocialPostResponse {
  id: string;
  user_id: string;
  content?: string;
  media_url?: string;
  media_type: "video" | "image" | "text";
  created_at: string;
  likes_count: number;
  saves_count: number;
  is_liked_by_me: boolean;
  is_saved_by_me: boolean;
  user?: any; // To hold user response
}

export const socialApi = {
  getReels: async (skip: number = 0, limit: number = 10): Promise<SocialPostResponse[]> => {
    const { data } = await api.get("/social/posts/reels", { params: { skip, limit } });
    return data;
  },
  createPost: async (payload: { content?: string; media_url?: string; media_type: string }): Promise<SocialPostResponse> => {
    const { data } = await api.post("/social/posts", payload);
    return data;
  },
  likePost: async (postId: string) => {
    const { data } = await api.post(`/social/posts/${postId}/like`);
    return data;
  },
  unlikePost: async (postId: string) => {
    const { data } = await api.delete(`/social/posts/${postId}/like`);
    return data;
  },
  savePost: async (postId: string) => {
    const { data } = await api.post(`/social/posts/${postId}/save`);
    return data;
  },
  unsavePost: async (postId: string) => {
    const { data } = await api.delete(`/social/posts/${postId}/save`);
    return data;
  },
  getSavedPosts: async (): Promise<any[]> => {
    const { data } = await api.get("/social/posts/saved");
    return data;
  },
  followUser: async (userId: string) => {
    const { data } = await api.post(`/social/follow/${userId}`);
    return data;
  },
  unfollowUser: async (userId: string) => {
    const { data } = await api.delete(`/social/follow/${userId}`);
    return data;
  },
  getFollowers: async () => {
    const { data } = await api.get("/social/followers");
    return data;
  },
  getFollowing: async () => {
    const { data } = await api.get("/social/following");
    return data;
  },
};

// ── Popcast API ──
export type PopcastStatus = "draft" | "pending_review" | "approved" | "rejected";

export interface PopcastResponse {
  id: string;
  title: string;
  description: string | null;
  audio_url: string;
  cover_image_url: string | null;
  duration: number;
  status: PopcastStatus;
  admin_note: string | null;
  teacher_id: string;
  created_at: string;
  updated_at: string;
  teacher?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  } | null;
  is_favorited: boolean;
}

export const popcastsApi = {
  list: async (params?: { skip?: number; limit?: number; search?: string }): Promise<PopcastResponse[]> => {
    const { data } = await api.get("/popcasts", { params });
    return data;
  },
  getMe: async (): Promise<PopcastResponse[]> => {
    const { data } = await api.get("/popcasts/me");
    return data;
  },
  create: async (payload: { title: string; description?: string; audio_url: string; cover_image_url?: string; duration: number }): Promise<PopcastResponse> => {
    const { data } = await api.post("/popcasts", payload);
    return data;
  },
  update: async (id: string, payload: Partial<{ title: string; description: string; audio_url: string; cover_image_url: string; duration: number; status: PopcastStatus }>): Promise<PopcastResponse> => {
    const { data } = await api.patch(`/popcasts/${id}`, payload);
    return data;
  },
  delete: async (id: string): Promise<{ message: string }> => {
    const { data } = await api.delete(`/popcasts/${id}`);
    return data;
  },
  uploadAudio: async (file: File): Promise<{ filename: string; path: string; url: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post("/popcasts/upload-audio", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
  uploadCover: async (file: File): Promise<{ filename: string; path: string; url: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post("/popcasts/upload-cover", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
  favorite: async (id: string): Promise<{ message: string; success: boolean }> => {
    const { data } = await api.post(`/popcasts/${id}/favorite`);
    return data;
  },
  unfavorite: async (id: string): Promise<{ message: string; success: boolean }> => {
    const { data } = await api.post(`/popcasts/${id}/unfavorite`);
    return data;
  },
  getFavorites: async (): Promise<PopcastResponse[]> => {
    const { data } = await api.get("/popcasts/favorites");
    return data;
  },
  adminListAll: async (statusFilter?: PopcastStatus): Promise<PopcastResponse[]> => {
    const params = statusFilter ? { status: statusFilter } : {};
    const { data } = await api.get("/popcasts/admin/all", { params });
    return data;
  },
  adminReview: async (id: string, payload: { status: PopcastStatus; admin_note?: string }): Promise<PopcastResponse> => {
    const { data } = await api.post(`/popcasts/${id}/review`, payload);
    return data;
  },
};

