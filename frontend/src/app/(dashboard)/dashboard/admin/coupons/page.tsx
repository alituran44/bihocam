"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { couponsApi, type Coupon, type CouponCreate, type CouponUpdate, coursesApi, categoriesApi, type Category } from "@/lib/api";

// Course interface for course selection
interface Course {
  id: string;
  title: string;
  price: number;
  teacher?: {
    id: string;
    full_name: string;
  } | null;
}

const initialForm: CouponCreate = {
  code: "",
  description: "",
  coupon_type: "percentage",
  discount_value: 10,
  trigger_type: "manual",
  valid_from: new Date().toISOString().split("T")[0],
  valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  is_active: true,
  is_auto_apply: false,
  auto_apply_priority: 0,
  campaign_name: null,
  campaign_description: null,
  target_course_ids: null,
};

export default function AdminCouponsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [form, setForm] = useState<CouponCreate>(initialForm);
  const [targetCourseMode, setTargetCourseMode] = useState<"all" | "specific">("all");
  const [courseSearch, setCourseSearch] = useState("");

  const [filterTriggerType, setFilterTriggerType] = useState<string>("all");
  const [filterAutoApply, setFilterAutoApply] = useState<boolean | null>(null);

  const { data: coupons, isLoading } = useQuery({
    queryKey: ["admin-coupons", filterTriggerType, filterAutoApply],
    queryFn: () => couponsApi.list(0, 100, {
      trigger_type: filterTriggerType !== "all" ? filterTriggerType : undefined,
      is_auto_apply: filterAutoApply !== null ? filterAutoApply : undefined,
    }),
  });

  // Fetch courses for target course selection
  const { data: allCourses = [] } = useQuery<Course[]>({
    queryKey: ["admin-all-courses"],
    queryFn: () => coursesApi.listAllAdmin(0, 1000, "published"),
    enabled: showForm && form.trigger_type === "site_wide" && targetCourseMode === "specific",
  });

  // Fetch categories for category-based coupons
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.list({ is_active: true }),
    enabled: showForm && (form.trigger_type === "category" || form.trigger_type === "manual"),
  });

  const createMutation = useMutation({
    mutationFn: (couponData?: CouponCreate) => couponsApi.create(couponData || form),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      setShowForm(false);
      setEditingCoupon(null);
      setForm(initialForm);
      setTargetCourseMode("all");
      setCourseSearch("");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { id: string; data: CouponUpdate }) => couponsApi.update(payload.id, payload.data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      setShowForm(false);
      setEditingCoupon(null);
      setForm(initialForm);
    },
  });

  const disableMutation = useMutation({
    mutationFn: (couponId: string) => couponsApi.delete(couponId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
    },
  });

  const startEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    const isSiteWide = coupon.trigger_type === "site_wide";
    const hasTargetCourses = coupon.target_course_ids && coupon.target_course_ids.length > 0;
    
    setForm({
      code: coupon.code,
      description: coupon.description || "",
      coupon_type: coupon.coupon_type,
      discount_value: Number(coupon.discount_value),
      max_discount: coupon.max_discount ?? undefined,
      trigger_type: coupon.trigger_type || "manual",
      valid_from: coupon.valid_from.split("T")[0],
      valid_until: coupon.valid_until.split("T")[0],
      min_cart_value: coupon.min_cart_value ?? undefined,
      usage_limit: coupon.usage_limit ?? undefined,
      usage_limit_per_user: coupon.usage_limit_per_user ?? undefined,
      is_active: coupon.is_active,
      // Site-wide fields
      is_auto_apply: coupon.is_auto_apply ?? false,
      auto_apply_priority: coupon.auto_apply_priority ?? 0,
      campaign_name: coupon.campaign_name || null,
      campaign_description: coupon.campaign_description || null,
      target_course_ids: coupon.target_course_ids || null,
    });
    
    if (isSiteWide) {
      setTargetCourseMode(hasTargetCourses ? "specific" : "all");
    }
    
    setShowForm(true);
  };

  const handleSubmit = () => {
    // Prepare form data
    const baseData = {
      valid_from: new Date(form.valid_from).toISOString(),
      valid_until: new Date(form.valid_until).toISOString(),
      description: form.description || null,
      max_discount: form.max_discount ?? null,
      min_cart_value: form.min_cart_value ?? null,
      category_id: form.trigger_type === "site_wide" ? null : (form.trigger_type === "category" ? (form.category_id || null) : form.category_id ?? null),
      usage_limit: form.usage_limit ?? null,
      usage_limit_per_user: form.usage_limit_per_user ?? null,
      is_active: form.is_active ?? true,
      // Site-wide fields
      is_auto_apply: form.trigger_type === "site_wide" ? (form.is_auto_apply ?? false) : false,
      auto_apply_priority: form.trigger_type === "site_wide" ? (form.auto_apply_priority ?? 0) : 0,
      campaign_name: form.trigger_type === "site_wide" ? (form.campaign_name || null) : null,
      campaign_description: form.trigger_type === "site_wide" ? (form.campaign_description || null) : null,
      target_course_ids: form.trigger_type === "site_wide" 
        ? (targetCourseMode === "all" ? null : (form.target_course_ids && form.target_course_ids.length > 0 ? form.target_course_ids : null))
        : null,
    };

    if (editingCoupon) {
      updateMutation.mutate({
        id: editingCoupon.id,
        data: {
          ...baseData,
          coupon_type: form.coupon_type,
          discount_value: form.discount_value,
          trigger_type: form.trigger_type,
        } as CouponUpdate,
      });
      return;
    }
    
    // Create new coupon
    const createData: CouponCreate = {
      code: form.code,
      coupon_type: form.coupon_type,
      discount_value: form.discount_value,
      trigger_type: form.trigger_type || "manual",
      ...baseData,
    };
    
    createMutation.mutate(createData);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50/30 to-orange-50/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600 font-medium">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-orange-50/20">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-500 rounded-3xl mb-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxLjUiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="relative px-8 py-12">
      <div className="flex items-center justify-between">
        <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
                Kupon Yönetimi
              </h1>
              <p className="text-teal-100 text-lg">
                {coupons ? `${coupons.length} kupon` : "İndirim kampanyalarını oluştur ve yönet"}
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-32 h-32 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center">
                <svg className="w-16 h-16 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-white/80 backdrop-blur-xl rounded-xl p-1 shadow-lg border border-white/20 flex gap-1">
            <select
              value={filterTriggerType}
              onChange={(e) => setFilterTriggerType(e.target.value)}
              className="px-4 py-2 rounded-lg border-0 bg-transparent text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">Tüm Tipler</option>
              <option value="manual">Manuel</option>
              <option value="site_wide">Site Geneli</option>
              <option value="cart_value">Sepet Tutarı</option>
              <option value="category">Kategori</option>
              <option value="first_purchase">İlk Alışveriş</option>
            </select>
          </div>
          
          {filterTriggerType === "site_wide" && (
            <div className="bg-white/80 backdrop-blur-xl rounded-xl p-1 shadow-lg border border-white/20 flex gap-1">
              <select
                value={filterAutoApply === null ? "all" : filterAutoApply ? "true" : "false"}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilterAutoApply(value === "all" ? null : value === "true");
                }}
                className="px-4 py-2 rounded-lg border-0 bg-transparent text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">Tümü</option>
                <option value="true">Otomatik Uygulanan</option>
                <option value="false">Manuel Uygulanan</option>
              </select>
            </div>
          )}
        </div>

        {/* Create Button */}
        <div className="bg-white/80 backdrop-blur-xl rounded-xl p-1 shadow-lg border border-white/20 flex gap-1">
        <button
            className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
              !showForm
                ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md"
                : "text-gray-600 hover:text-teal-600 hover:bg-gray-50"
            }`}
          onClick={() => {
            if (showForm && editingCoupon) {
              setEditingCoupon(null);
              setForm(initialForm);
              setTargetCourseMode("all");
              setCourseSearch("");
            }
              setShowForm(!showForm);
          }}
        >
            {showForm ? "✕ Formu Kapat" : "+ Yeni Kupon"}
        </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 mb-8 overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-500 px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{editingCoupon ? "Kuponu Düzenle" : "Yeni Kupon Oluştur"}</h2>
                <p className="text-teal-100 text-sm mt-0.5">{editingCoupon ? "Mevcut kupon bilgilerini güncelle" : "Yeni bir indirim kampanyası oluştur"}</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Temel Bilgiler */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-1 w-8 rounded-full bg-gradient-to-r from-teal-600 to-emerald-500"></div>
                <h3 className="text-lg font-bold text-gray-900">Temel Bilgiler</h3>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <span>Kupon Kodu</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                    </div>
          <input
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white text-base font-medium shadow-sm transition-all focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-100 disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="Örn: YAZ2024"
            value={form.code}
            disabled={Boolean(editingCoupon)}
            onChange={(e) => setForm((s) => ({ ...s, code: e.target.value.toUpperCase() }))}
          />
                  </div>
                  <p className="text-xs text-gray-500">Kupon kodu otomatik olarak büyük harfe dönüştürülür</p>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <span>İndirim Tipi</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
          <select
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white text-base font-medium shadow-sm transition-all focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-100 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNSA3LjVMIDEwIDEyLjVMIDE1IDcuNSIgc3Ryb2tlPSIjNkI3Mjc4IiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+')] bg-no-repeat bg-[right_1rem_center]"
            value={form.coupon_type}
            onChange={(e) => setForm((s) => ({ ...s, coupon_type: e.target.value as "percentage" | "fixed" }))}
          >
                      <option value="percentage">Yüzde (%)</option>
                      <option value="fixed">Sabit Tutar (₺)</option>
          </select>
                  </div>
                  <p className="text-xs text-gray-500">Yüzde veya sabit tutar indirimi seçin</p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <span>Kampanya Tipi</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <select
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white text-base font-medium shadow-sm transition-all focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-100 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNSA3LjVMIDEwIDEyLjVMIDE1IDcuNSIgc3Ryb2tlPSIjNkI3Mjc4IiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+')] bg-no-repeat bg-[right_1rem_center]"
                      value={form.trigger_type || "manual"}
                      onChange={(e) => {
                        const newTriggerType = e.target.value as "manual" | "site_wide" | "cart_value" | "category" | "first_purchase";
                        setForm((s) => ({
                          ...s,
                          trigger_type: newTriggerType,
                          // Reset site-wide fields if not site_wide
                          is_auto_apply: newTriggerType === "site_wide" ? (s.is_auto_apply ?? false) : false,
                          campaign_name: newTriggerType === "site_wide" ? (s.campaign_name || null) : null,
                          campaign_description: newTriggerType === "site_wide" ? (s.campaign_description || null) : null,
                          target_course_ids: newTriggerType === "site_wide" ? (s.target_course_ids || null) : null,
                          // Reset category_id for site_wide (must be null)
                          category_id: newTriggerType === "site_wide" ? undefined : (newTriggerType === "category" ? undefined : (s.category_id || undefined)),
                          // Reset min_cart_value for cart_value (should be set by user)
                          // min_cart_value stays as is, user will set it
                        }));
                        if (newTriggerType !== "site_wide") {
                          setTargetCourseMode("all");
                        }
                      }}
                    >
                      <option value="manual">Manuel Kullanım (Kod ile)</option>
                      <option value="site_wide">Site Geneli Kampanya (Otomatik)</option>
                      <option value="cart_value">Sepet Tutarına Göre</option>
                      <option value="category">Kategori Bazlı</option>
                      <option value="first_purchase">İlk Alışveriş</option>
                    </select>
                  </div>
                  <p className="text-xs text-gray-500">
                    {form.trigger_type === "site_wide" 
                      ? "Site geneli kampanya - Tüm kurslarda veya belirli kurslarda otomatik uygulanır"
                      : "Kuponun nasıl tetikleneceğini seçin"}
                  </p>
                </div>
              </div>
            </div>

            {/* İndirim Detayları */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-1 w-8 rounded-full bg-gradient-to-r from-teal-600 to-emerald-500"></div>
                <h3 className="text-lg font-bold text-gray-900">İndirim Detayları</h3>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <span>İndirim Değeri</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-500 font-medium">
                        {form.coupon_type === "percentage" ? "%" : "₺"}
                      </span>
                    </div>
          <input
                      className="w-full pl-10 pr-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white text-base font-medium shadow-sm transition-all focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-100"
            type="number"
            min={0}
            step="0.01"
                      placeholder={form.coupon_type === "percentage" ? "10" : "50"}
            value={form.discount_value}
            onChange={(e) => setForm((s) => ({ ...s, discount_value: Number(e.target.value) }))}
          />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <span>Maks. İndirim (₺)</span>
                    <span className="text-xs text-gray-500 font-normal">(Opsiyonel)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-500 font-medium">₺</span>
                    </div>
          <input
                      className="w-full pl-10 pr-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white text-base font-medium shadow-sm transition-all focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-100"
            type="number"
            min={0}
            step="0.01"
                      placeholder="Sınırsız"
            value={form.max_discount ?? ""}
            onChange={(e) => setForm((s) => ({ ...s, max_discount: e.target.value ? Number(e.target.value) : undefined }))}
          />
                  </div>
                  <p className="text-xs text-gray-500">Yüzde indirimlerde maksimum limit</p>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <span>Min. Sepet Tutarı (₺)</span>
                    <span className={`text-xs font-normal ${form.trigger_type === "cart_value" ? "text-red-500" : "text-gray-500"}`}>
                      {form.trigger_type === "cart_value" ? "*" : "(Opsiyonel)"}
                    </span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-500 font-medium">₺</span>
                    </div>
          <input
                      className="w-full pl-10 pr-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white text-base font-medium shadow-sm transition-all focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-100"
            type="number"
            min={0}
            step="0.01"
                      placeholder="Minimum yok"
            value={form.min_cart_value ?? ""}
            onChange={(e) => setForm((s) => ({ ...s, min_cart_value: e.target.value ? Number(e.target.value) : undefined }))}
            required={form.trigger_type === "cart_value"}
          />
                  </div>
                  <p className="text-xs text-gray-500">
                    {form.trigger_type === "cart_value" 
                      ? "Sepet tutarına göre tetiklenen kuponlar için minimum sepet tutarı gereklidir"
                      : "Kuponun geçerli olacağı minimum sepet tutarı"}
                  </p>
                </div>
              </div>
            </div>

            {/* Category Selection - For category-based and optional for manual */}
            {(form.trigger_type === "category" || form.trigger_type === "manual") && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-1 w-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-500"></div>
                  <h3 className="text-lg font-bold text-gray-900">Kategori Ayarları</h3>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <span>Kategori</span>
                      <span className={`text-xs font-normal ${form.trigger_type === "category" ? "text-red-500" : "text-gray-500"}`}>
                        {form.trigger_type === "category" ? "*" : "(Opsiyonel)"}
                      </span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                      <select
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white text-base font-medium shadow-sm transition-all focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNSA3LjVMIDEwIDEyLjVMIDE1IDcuNSIgc3Ryb2tlPSIjNkI3Mjc4IiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+')] bg-no-repeat bg-[right_1rem_center]"
                        value={form.category_id || ""}
                        onChange={(e) => setForm((s) => ({ ...s, category_id: e.target.value || undefined }))}
                        required={form.trigger_type === "category"}
                      >
                        <option value="">Kategori Seçin {form.trigger_type === "category" ? "(Zorunlu)" : "(Opsiyonel)"}</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <p className="text-xs text-gray-500">
                      {form.trigger_type === "category" 
                        ? "Bu kupon sadece seçili kategorideki kurslarda geçerlidir"
                        : "Manuel kuponlar için kategori seçimi opsiyoneldir"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* First Purchase Info */}
            {form.trigger_type === "first_purchase" && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-1 w-8 rounded-full bg-gradient-to-r from-amber-600 to-orange-500"></div>
                  <h3 className="text-lg font-bold text-gray-900">İlk Alışveriş Kampanyası</h3>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">İlk Alışveriş Kampanyası</p>
                      <p className="text-xs text-gray-600">
                        Bu kupon sadece daha önce hiç satın alma yapmamış kullanıcılar için geçerlidir. 
                        Sistem otomatik olarak kullanıcının ilk alışverişini tespit eder ve kuponu uygular.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Cart Value Info */}
            {form.trigger_type === "cart_value" && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-1 w-8 rounded-full bg-gradient-to-r from-cyan-600 to-blue-500"></div>
                  <h3 className="text-lg font-bold text-gray-900">Sepet Tutarı Kampanyası</h3>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-200">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-cyan-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">Sepet Tutarına Göre Tetiklenme</p>
                      <p className="text-xs text-gray-600">
                        Bu kupon, sepet tutarı belirlediğiniz minimum değere ulaştığında otomatik olarak uygulanır. 
                        Minimum sepet tutarı yukarıdaki "Min. Sepet Tutarı" alanından ayarlanmalıdır.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Kullanım ve Tarih */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-1 w-8 rounded-full bg-gradient-to-r from-teal-600 to-emerald-500"></div>
                <h3 className="text-lg font-bold text-gray-900">Kullanım ve Tarih</h3>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <span>Kullanım Limiti</span>
                    <span className="text-xs text-gray-500 font-normal">(Opsiyonel)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
          <input
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white text-base font-medium shadow-sm transition-all focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-100"
            type="number"
            min={0}
            step="1"
                      placeholder="Sınırsız"
            value={form.usage_limit ?? ""}
            onChange={(e) => setForm((s) => ({ ...s, usage_limit: e.target.value ? Number(e.target.value) : undefined }))}
          />
                  </div>
                  <p className="text-xs text-gray-500">Toplam kullanım sayısı limiti</p>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <span>Başlangıç Tarihi</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white text-base font-medium shadow-sm transition-all focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-100"
                      type="date"
                      value={form.valid_from}
                      onChange={(e) => setForm((s) => ({ ...s, valid_from: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <span>Bitiş Tarihi</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
          <input
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white text-base font-medium shadow-sm transition-all focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-100"
                      type="date"
                      value={form.valid_until}
                      onChange={(e) => setForm((s) => ({ ...s, valid_until: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Site-Wide Campaign Settings */}
            {form.trigger_type === "site_wide" && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-1 w-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-500"></div>
                  <h3 className="text-lg font-bold text-gray-900">Site Geneli Kampanya Ayarları</h3>
                </div>
                <div className="space-y-6">
                  {/* Campaign Name & Description */}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <span>Kampanya Adı</span>
                        <span className="text-xs text-gray-500 font-normal">(Opsiyonel)</span>
                      </label>
                      <input
                        className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white text-base font-medium shadow-sm transition-all focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100"
                        placeholder="Örn: Yaz İndirimi 2024"
                        value={form.campaign_name || ""}
                        onChange={(e) => setForm((s) => ({ ...s, campaign_name: e.target.value || null }))}
                      />
                      <p className="text-xs text-gray-500">Kampanya için görünen başlık</p>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <span>Otomatik Uygulama Önceliği</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white text-base font-medium shadow-sm transition-all focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100"
                        placeholder="0"
                        value={form.auto_apply_priority ?? 0}
                        onChange={(e) => setForm((s) => ({ ...s, auto_apply_priority: Number(e.target.value) || 0 }))}
                      />
                      <p className="text-xs text-gray-500">Yüksek öncelik = önce uygulanır (varsayılan: 0)</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <span>Kampanya Açıklaması</span>
                      <span className="text-xs text-gray-500 font-normal">(Opsiyonel)</span>
                    </label>
                    <textarea
                      className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base font-medium shadow-sm transition-all focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100 resize-none"
                      placeholder="Kampanya detayları (müşterilere gösterilir)"
                      rows={3}
                      value={form.campaign_description || ""}
                      onChange={(e) => setForm((s) => ({ ...s, campaign_description: e.target.value || null }))}
                    />
                  </div>

                  {/* Auto-Apply Toggle */}
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
                    <input
                      id="auto-apply"
                      type="checkbox"
                      checked={form.is_auto_apply ?? false}
                      onChange={(e) => setForm((s) => ({ ...s, is_auto_apply: e.target.checked }))}
                      className="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-2 focus:ring-purple-500/20"
                    />
                    <label htmlFor="auto-apply" className="flex-1 text-sm font-semibold text-gray-700 cursor-pointer">
                      Otomatik Uygula - Sepete eklendiğinde otomatik olarak kampanya uygulanır
                    </label>
                  </div>

                  {/* Target Courses */}
                  <div className="space-y-4 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Kampanya Geçerliliği
                    </label>
                    
                    <div className="flex gap-4 mb-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="targetCourseMode"
                          value="all"
                          checked={targetCourseMode === "all"}
                          onChange={(e) => {
                            setTargetCourseMode("all");
                            setForm((s) => ({ ...s, target_course_ids: null }));
                          }}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Tüm Kurslarda Geçerli</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="targetCourseMode"
                          value="specific"
                          checked={targetCourseMode === "specific"}
                          onChange={(e) => {
                            setTargetCourseMode("specific");
                            if (!form.target_course_ids) {
                              setForm((s) => ({ ...s, target_course_ids: [] }));
                            }
                          }}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Belirli Kurslarda Geçerli</span>
                      </label>
                    </div>

                    {targetCourseMode === "specific" && (
                      <div className="space-y-3">
                        {/* Course Search */}
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            placeholder="Kurs ara..."
                            value={courseSearch}
                            onChange={(e) => setCourseSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-base font-medium shadow-sm transition-all focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100"
                          />
                        </div>

                        {/* Course List */}
                        <div className="max-h-60 overflow-y-auto rounded-xl border-2 border-gray-200 bg-white p-3 space-y-2">
                          {allCourses
                            .filter((course) =>
                              course.title.toLowerCase().includes(courseSearch.toLowerCase())
                            )
                            .map((course) => {
                              const isSelected = form.target_course_ids?.includes(course.id) || false;
                              return (
                                <label
                                  key={course.id}
                                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer border-2 border-transparent hover:border-purple-200 transition-all"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => {
                                      const currentIds = form.target_course_ids || [];
                                      if (e.target.checked) {
                                        setForm((s) => ({
                                          ...s,
                                          target_course_ids: [...currentIds, course.id],
                                        }));
                                      } else {
                                        setForm((s) => ({
                                          ...s,
                                          target_course_ids: currentIds.filter((id) => id !== course.id),
                                        }));
                                      }
                                    }}
                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 rounded"
                                  />
                                  <div className="flex-1">
                                    <p className="text-sm font-semibold text-gray-900">{course.title}</p>
                                    <p className="text-xs text-gray-500">
                                      {course.teacher?.full_name || "Eğitmen"} • {course.price} ₺
                                    </p>
                                  </div>
                                </label>
                              );
                            })}
                          {allCourses.filter((course) =>
                            course.title.toLowerCase().includes(courseSearch.toLowerCase())
                          ).length === 0 && (
                            <p className="text-sm text-gray-500 text-center py-4">Kurs bulunamadı</p>
                          )}
                        </div>

                        {/* Selected Courses */}
                        {form.target_course_ids && form.target_course_ids.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {form.target_course_ids.map((courseId) => {
                              const course = allCourses.find((c) => c.id === courseId);
                              if (!course) return null;
                              return (
                                <span
                                  key={courseId}
                                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-100 text-purple-800 text-sm font-semibold border border-purple-200"
                                >
                                  {course.title}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setForm((s) => ({
                                        ...s,
                                        target_course_ids: s.target_course_ids?.filter((id) => id !== courseId) || null,
                                      }));
                                    }}
                                    className="hover:text-purple-900"
                                  >
                                    ✕
                                  </button>
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Açıklama ve Durum */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-1 w-8 rounded-full bg-gradient-to-r from-teal-600 to-emerald-500"></div>
                <h3 className="text-lg font-bold text-gray-900">Ek Bilgiler</h3>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <span>Açıklama</span>
                    <span className="text-xs text-gray-500 font-normal">(Opsiyonel)</span>
                  </label>
                  <textarea
                    className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-base font-medium shadow-sm transition-all focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-100 resize-none"
                    placeholder="Kupon açıklaması (müşterilere gösterilir)"
                    rows={3}
                    value={form.description ?? ""}
                    onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
          />
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 border-2 border-teal-200">
            <input
              id="coupon-active"
              type="checkbox"
              checked={form.is_active ?? true}
              onChange={(e) => setForm((s) => ({ ...s, is_active: e.target.checked }))}
                    className="h-5 w-5 rounded border-gray-300 text-teal-600 focus:ring-2 focus:ring-teal-500/20"
            />
                  <label htmlFor="coupon-active" className="flex-1 text-sm font-semibold text-gray-700 cursor-pointer">
                    Kupon aktif ve kullanılabilir durumda
            </label>
          </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t-2 border-gray-100">
            {editingCoupon && (
              <button
                onClick={() => {
                  setEditingCoupon(null);
                  setForm(initialForm);
                  setTargetCourseMode("all");
                  setCourseSearch("");
                  setShowForm(false);
                }}
                  className="rounded-xl border-2 border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:border-gray-400"
                >
                  İptal
                </button>
              )}
              <button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending || !form.code}
                className="rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-500/30 transition-all hover:from-teal-700 hover:to-emerald-700 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Kaydediliyor...</span>
                  </>
                ) : editingCoupon ? (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Kuponu Güncelle</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Kuponu Oluştur</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coupons List */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        {/* List Header */}
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 px-8 py-6 border-b-2 border-teal-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
                <div>
                <h2 className="text-2xl font-bold text-gray-900">Kuponlar</h2>
                <p className="text-sm text-gray-600 mt-0.5">Toplam {(coupons || []).length} kupon</p>
              </div>
            </div>
                  </div>
                  </div>

        {/* Coupons Grid */}
        <div className="p-6">
          {(coupons || []).length === 0 ? (
            <div className="flex min-h-[300px] items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100/50">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-lg">
                  <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-lg font-semibold text-gray-700 mb-2">Henüz kupon oluşturulmamış</p>
                <p className="text-sm text-gray-500">Yukarıdaki butona tıklayarak ilk kuponunu oluştur</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {(coupons || []).map((coupon, idx) => {
                const limitText = coupon.usage_limit ? `${coupon.used_count}/${coupon.usage_limit}` : `${coupon.used_count}/∞`;
                const isExpired = new Date(coupon.valid_until) < new Date();
                const usagePercent = coupon.usage_limit ? (coupon.used_count / coupon.usage_limit) * 100 : 0;
                const daysRemaining = Math.ceil((new Date(coupon.valid_until).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

                return (
                  <div
                    key={coupon.id}
                    className="group relative overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-lg hover:shadow-2xl hover:border-teal-300 transition-all duration-300 transform hover:-translate-y-1"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    {/* Gradient Accent Bar */}
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500"></div>

                    <div className="p-6 pt-8">
                      <div className="flex items-start justify-between gap-6">
                        {/* Left Section - Main Info */}
                        <div className="flex-1 min-w-0">
                          {/* Code and Status */}
                          <div className="flex items-center gap-3 mb-4 flex-wrap">
                            <div className="relative">
                              <span className="inline-flex items-center rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 px-5 py-2.5 font-mono text-xl font-bold text-white shadow-lg">
                                {coupon.code}
                              </span>
                              {coupon.is_active && !isExpired && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-md"></div>
                              )}
                            </div>
                            
                            {/* Site-Wide Badge */}
                            {coupon.trigger_type === "site_wide" && (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white border-2 border-purple-300 px-3.5 py-1.5 text-xs font-bold shadow-md">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Site Geneli
                                {coupon.is_auto_apply && (
                                  <span className="ml-1 px-1.5 py-0.5 rounded bg-white/20 text-[10px]">Otomatik</span>
                                )}
                              </span>
                            )}
                            
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border-2 px-3.5 py-1.5 text-xs font-bold ${
                                coupon.is_active && !isExpired
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                  : isExpired
                                    ? "bg-rose-50 text-rose-800 border-rose-300"
                                    : "bg-slate-50 text-slate-800 border-slate-300"
                              }`}
                            >
                              <span className={`w-2 h-2 rounded-full ${
                                coupon.is_active && !isExpired ? "bg-emerald-500" : isExpired ? "bg-rose-500" : "bg-slate-500"
                              }`}></span>
                              {coupon.is_active && !isExpired ? "Aktif" : isExpired ? "Süresi Dolmuş" : "Pasif"}
                            </span>
                            {!isExpired && coupon.is_active && daysRemaining > 0 && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-800 border-2 border-amber-200 px-3 py-1 text-xs font-semibold">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {daysRemaining} gün kaldı
                              </span>
                            )}
                          </div>

                          {/* Discount Info */}
                          <div className="mb-4 p-4 rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50 border-2 border-teal-100">
                            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-500 flex items-center justify-center shadow-md">
                                  <span className="text-white font-bold text-lg">
                                    {coupon.coupon_type === "percentage" ? "%" : "₺"}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">İndirim</p>
                                  <p className="text-2xl font-bold text-gray-900">
                                    {coupon.coupon_type === "percentage" ? `${coupon.discount_value}%` : `${coupon.discount_value} ₺`}
                                  </p>
                                </div>
                              </div>
                              {coupon.max_discount && (
                                <div className="h-12 w-px bg-gray-300"></div>
                              )}
                              {coupon.max_discount && (
                                <div>
                                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Maks. İndirim</p>
                                  <p className="text-lg font-bold text-teal-700">{coupon.max_discount} ₺</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Description */}
                          {coupon.description && (
                            <div className="mb-4 p-3 rounded-lg bg-gray-50 border border-gray-200">
                              <p className="text-sm text-gray-700">{coupon.description}</p>
                            </div>
                          )}

                          {/* Details Grid */}
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                              <div className="flex items-center gap-2 mb-1">
                                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Kullanım</p>
                              </div>
                              <p className="text-base font-bold text-gray-900">{limitText}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                              <div className="flex items-center gap-2 mb-1">
                                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Geçerlilik</p>
                              </div>
                              <p className="text-sm font-semibold text-gray-900">
                                {formatDate(coupon.valid_from)} - {formatDate(coupon.valid_until)}
                              </p>
                            </div>
                          </div>

                          {/* Usage Progress */}
                          {coupon.usage_limit && (
                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Kullanım İlerlemesi</span>
                                <span className="text-sm font-bold text-teal-700">{Math.round(usagePercent)}%</span>
                              </div>
                              <div className="h-3 overflow-hidden rounded-full bg-gray-200 shadow-inner">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500 transition-all duration-500 shadow-md"
                                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Right Section - Actions */}
                        <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => startEdit(coupon)}
                            className="group/btn flex items-center justify-center gap-2 rounded-xl border-2 border-blue-300 bg-blue-50 px-5 py-3 text-sm font-bold text-blue-700 shadow-sm transition-all hover:bg-blue-100 hover:border-blue-400 hover:shadow-md hover:scale-105"
                  >
                            <svg className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                    Düzenle
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Bu kuponu pasif etmek istiyor musunuz?")) {
                        disableMutation.mutate(coupon.id);
                      }
                    }}
                    disabled={disableMutation.isPending}
                            className="group/btn flex items-center justify-center gap-2 rounded-xl border-2 border-rose-300 bg-rose-50 px-5 py-3 text-sm font-bold text-rose-700 shadow-sm transition-all hover:bg-rose-100 hover:border-rose-400 hover:shadow-md hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                          >
                            {disableMutation.isPending ? (
                              <div className="w-4 h-4 border-2 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <svg className="w-4 h-4 group-hover/btn:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                              </svg>
                            )}
                    Pasif Et
                  </button>
                </div>
                      </div>
                    </div>

                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            );
          })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
