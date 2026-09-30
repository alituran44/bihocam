"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  teachersApi,
  siteSettingsApi,
  teacherProfileApi,
  type GroupLessonTier,
  type TeacherProfileUpdate,
} from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import Avatar from "@/components/Avatar";
import { toast } from "sonner";

type AvailabilitySlot = {
  id: string;
  teacher_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
};

type Reservation = {
  id: string;
  teacher_id: string;
  student_id: string;
  date: string;
  start_time: string;
  end_time: string;
  price: number;
  discount_price?: number | null;
  lesson_mode?: "individual" | "group";
  group_size?: number | null;
  group_tier_id?: string | null;
  status: "pending" | "approved" | "rejected" | "cancelled";
  meeting_link?: string | null;
  student_notes?: string | null;
  student?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string | null;
  } | null;
};

export default function TeacherLiveClassesPage() {
  const queryClient = useQueryClient();
  const { user, checkAuth } = useAuthStore();

  // Availability form state
  const [slotDate, setSlotDate] = useState("");
  const [slotStart, setSlotStart] = useState("09:00");
  const [slotEnd, setSlotEnd] = useState("10:00");

  // Profile Settings Form State
  const [price, setPrice] = useState<string>(user?.live_class_price?.toString() || "");
  const [discountPrice, setDiscountPrice] = useState<string>(user?.live_class_discount_price?.toString() || "");
  const [faceToFacePrice, setFaceToFacePrice] = useState<string>(user?.face_to_face_price?.toString() || "");
  const [meetingLink, setMeetingLink] = useState<string>(user?.live_class_link || "");
  const [groupTiers, setGroupTiers] = useState<GroupLessonTier[]>([]);

  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [slotError, setSlotError] = useState("");
  const [minDate, setMinDate] = useState("");

  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setMinDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  // Sync with profile query
  const { data: profileData } = useQuery({
    queryKey: ["my-teacher-profile"],
    queryFn: () => teacherProfileApi.getMyProfile(),
  });

  useEffect(() => {
    if (profileData) {
      if (profileData.live_class_price !== undefined && profileData.live_class_price !== null) {
        setPrice(profileData.live_class_price.toString());
      }
      if (profileData.live_class_discount_price !== undefined && profileData.live_class_discount_price !== null) {
        setDiscountPrice(profileData.live_class_discount_price.toString());
      }
      if (profileData.face_to_face_price !== undefined && profileData.face_to_face_price !== null) {
        setFaceToFacePrice(profileData.face_to_face_price.toString());
      }
      if (profileData.live_class_link) {
        setMeetingLink(profileData.live_class_link);
      }
      if (profileData.group_lesson_prices) {
        setGroupTiers(profileData.group_lesson_prices);
      }
    } else if (user) {
      if (user.live_class_price !== undefined && user.live_class_price !== null) {
        setPrice(user.live_class_price.toString());
      }
      if (user.live_class_discount_price !== undefined && user.live_class_discount_price !== null) {
        setDiscountPrice(user.live_class_discount_price.toString());
      }
      if (user.face_to_face_price !== undefined && user.face_to_face_price !== null) {
        setFaceToFacePrice(user.face_to_face_price.toString());
      }
      if (user.live_class_link) {
        setMeetingLink(user.live_class_link);
      }
      if (user.group_lesson_prices) {
        setGroupTiers(user.group_lesson_prices as GroupLessonTier[]);
      }
    }
  }, [profileData, user]);

  // Group tier management helpers
  const handleAddGroupPreset = (count: number) => {
    const existing = groupTiers.find((t) => t.max_students === count);
    if (existing) {
      toast.info(`${count} kişilik grup kademesi zaten mevcut.`);
      return;
    }
    const base = parseFloat(price) || 1000;
    const ratio = count === 3 ? 0.6 : count === 5 ? 0.45 : 0.35;
    const estPrice = Math.round((base * ratio) / 50) * 50 || 300;

    const newTier: GroupLessonTier = {
      tier_id: `tier_${count}_${Date.now()}`,
      title: `${count} Kişilik Grup`,
      min_students: Math.max(2, count - 1),
      max_students: count,
      price_per_student: estPrice,
      discount_price: null,
      is_active: true,
    };
    setGroupTiers([...groupTiers, newTier]);
    toast.success(`${count} Kişilik Grup şablonu eklendi.`);
  };

  const handleAddCustomGroup = () => {
    const newTier: GroupLessonTier = {
      tier_id: `tier_custom_${Date.now()}`,
      title: "Özel Grup Dersi",
      min_students: 2,
      max_students: 4,
      price_per_student: 500,
      discount_price: null,
      is_active: true,
    };
    setGroupTiers([...groupTiers, newTier]);
  };

  const handleUpdateTier = (tierId: string, field: keyof GroupLessonTier, value: any) => {
    setGroupTiers(
      groupTiers.map((t) => (t.tier_id === tierId ? { ...t, [field]: value } : t))
    );
  };

  const handleRemoveTier = (tierId: string) => {
    setGroupTiers(groupTiers.filter((t) => t.tier_id !== tierId));
  };

  // Get teacher availability
  const { data: slots, isLoading: slotsLoading } = useQuery<AvailabilitySlot[]>({
    queryKey: ["my-availability"],
    queryFn: () => teachersApi.getMyAvailability(),
  });

  // Get received reservations
  const { data: reservations, isLoading: reservationsLoading } = useQuery<Reservation[]>({
    queryKey: ["teacher-reservations"],
    queryFn: () => teachersApi.getTeacherReservations(),
  });

  // Get platform settings for commission rates
  const { data: siteSettings } = useQuery({
    queryKey: ["site-settings-public"],
    queryFn: () => siteSettingsApi.get().catch(() => ({ platform: { live_class_commission_rate: 0.15 } })),
  });

  // Get commission rate
  const commissionRate = siteSettings?.platform?.live_class_commission_rate !== undefined
    ? Number(siteSettings.platform.live_class_commission_rate)
    : 0.15; // fallback %15

  // Update Settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (data: TeacherProfileUpdate) =>
      teachersApi.updateMyProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["my-teacher-profile"] });
      checkAuth(); // update auth store state
      setSettingsSuccess(true);
      toast.success("Ders ayarları ve grup fiyatları başarıyla kaydedildi.");
      setTimeout(() => setSettingsSuccess(false), 3000);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Ayarlar kaydedilirken bir hata oluştu.");
    }
  });

  // Create slot mutation
  const createSlotMutation = useMutation({
    mutationFn: (data: { slots: { date: string; start_time: string; end_time: string }[] }) =>
      teachersApi.createAvailability(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-availability"] });
      setSlotDate("");
      setSlotError("");
    },
  });

  // Delete slot mutation
  const deleteSlotMutation = useMutation({
    mutationFn: (slotId: string) => teachersApi.deleteAvailability(slotId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-availability"] });
    },
  });

  // Update reservation status mutation
  const updateReservationStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "approved" | "rejected" | "cancelled" }) =>
      teachersApi.updateReservationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-reservations"] });
      queryClient.invalidateQueries({ queryKey: ["my-availability"] });
    },
  });

  // Form handlers
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = price === "" ? null : parseFloat(price);
    const parsedDiscountPrice = discountPrice === "" ? null : parseFloat(discountPrice);
    const parsedFaceToFacePrice = faceToFacePrice === "" ? null : parseFloat(faceToFacePrice);

    updateSettingsMutation.mutate({
      live_class_price: parsedPrice,
      live_class_discount_price: parsedDiscountPrice,
      face_to_face_price: parsedFaceToFacePrice,
      live_class_link: meetingLink,
      group_lesson_prices: groupTiers,
    });
  };

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotDate) {
      setSlotError("Lütfen bir tarih seçiniz");
      return;
    }

    // Verify time logic
    if (slotStart >= slotEnd) {
      setSlotError("Bitiş saati başlangıç saatinden büyük olmalıdır");
      return;
    }

    createSlotMutation.mutate({
      slots: [{ date: slotDate, start_time: slotStart, end_time: slotEnd }],
    });
  };

  // Compute Net Earnings
  const activePrice = discountPrice !== "" ? parseFloat(discountPrice) : price !== "" ? parseFloat(price) : 0;
  const netEarning = activePrice * (1 - commissionRate);

  return (
    <div className="space-y-8 p-1">
      {/* Header */}
      <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Canlı Ders & Müsaitlik Yönetimi</h1>
        <p className="text-slate-500 font-medium text-sm">
          Saatlik canlı ders ücretlerinizi tanımlayın, takvim üzerinden boş saat dilimlerinizi girin ve öğrencilerden gelen ders rezervasyon taleplerini onaylayın.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Column: Settings and Slots Creator */}
        <div className="xl:col-span-5 space-y-8">
          
          {/* Section 1: Settings Form */}
          <div className="bg-white rounded-[2rem] border border-slate-100 p-6 sm:p-8 shadow-sm relative overflow-hidden">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight mb-5 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              Canlı Ders Ayarları
            </h2>

            <form onSubmit={handleSaveSettings} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Online Canlı Ders Saatlik Ücreti (₺)</label>
                <input
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Örn: 500"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Yüz Yüze Ders Saatlik Ücreti (₺ - İsteğe Bağlı)</label>
                <input
                  type="number"
                  min="0"
                  value={faceToFacePrice}
                  onChange={(e) => setFaceToFacePrice(e.target.value)}
                  placeholder="Örn: 750 (Boş bırakılırsa anlaşmalı/belirtilmedi görünür)"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">İndirimli Online Saatlik Ücret (₺ - İsteğe Bağlı)</label>
                <input
                  type="number"
                  min="0"
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                  placeholder="Örn: 450"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Canlı Ders Görüşme Linki (Zoom / Meet vb.)</label>
                <input
                  type="url"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://zoom.us/j/..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-semibold text-slate-800"
                />
                <span className="text-[11px] text-slate-400 font-medium mt-1.5 block leading-tight">
                  Rezervasyon talebini onayladığınızda bu link otomatik olarak öğrenciye iletilecektir.
                </span>
              </div>

              {/* Dynamic Net Earnings Box */}
              {activePrice > 0 && (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col gap-1 justify-center">
                  <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">KOMİSYON DÜŞÜLDÜKTEN SONRA</div>
                  <div className="text-slate-800 font-extrabold text-base flex items-baseline gap-1">
                    Net Kazancınız: <span className="text-teal-600 font-black text-xl">₺{netEarning.toFixed(2)}</span> / Saat
                  </div>
                  <div className="text-[10px] font-semibold text-slate-400">
                    Platform Hizmet Komisyonu: %{(commissionRate * 100).toFixed(0)}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={updateSettingsMutation.isPending}
                className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-2xl font-bold shadow-lg shadow-teal-500/10 hover:shadow-teal-500/20 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 text-sm"
              >
                {updateSettingsMutation.isPending ? "Kaydediliyor..." : "Ayarları Kaydet"}
              </button>

              {settingsSuccess && (
                <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 text-teal-700 font-bold text-xs text-center">
                  Ayarlarınız başarıyla kaydedilmiştir.
                </div>
              )}
            </form>
          </div>

          {/* Section 1.5: Group Lesson Pricing */}
          <div className="bg-white rounded-[2rem] border border-slate-100 p-6 sm:p-8 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between gap-3 mb-2">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                Grup Dersi Fiyatlandırması
              </h2>
              <span className="px-2.5 py-1 bg-amber-50 text-amber-800 text-[10px] font-extrabold uppercase rounded-lg border border-amber-200/60">
                Kişi Başı Ücret
              </span>
            </div>
            <p className="text-slate-500 font-medium text-xs mb-5 leading-relaxed">
              Öğrencilerin 3, 5, 7 vb. kişilik gruplarla ders almasını sağlayın. Belirleyeceğiniz kişi başı saatlik ücretle öğrenciler daha avantajlı fiyata erişirken, siz toplamda kat kat daha yüksek saatlik ciro kazanırsınız.
            </p>

            {/* Quick Add Preset Buttons */}
            <div className="space-y-2 mb-6">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide">Hızlı Grup Şablonu Ekle</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleAddGroupPreset(3)}
                  className="px-3 py-2.5 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 hover:text-amber-800 transition-all text-center"
                >
                  + 3 Kişilik
                </button>
                <button
                  type="button"
                  onClick={() => handleAddGroupPreset(5)}
                  className="px-3 py-2.5 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 hover:text-amber-800 transition-all text-center"
                >
                  + 5 Kişilik
                </button>
                <button
                  type="button"
                  onClick={() => handleAddGroupPreset(7)}
                  className="px-3 py-2.5 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 hover:text-amber-800 transition-all text-center"
                >
                  + 7 Kişilik
                </button>
                <button
                  type="button"
                  onClick={handleAddCustomGroup}
                  className="px-3 py-2.5 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 hover:text-blue-800 transition-all text-center"
                >
                  + Özel Kademe
                </button>
              </div>
            </div>

            {/* Tiers List */}
            {groupTiers.length === 0 ? (
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center space-y-2 mb-6">
                <div className="text-2xl">👥</div>
                <div className="text-xs font-bold text-slate-700">Henüz grup dersi kademesi eklemediniz</div>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Yukarıdaki butonlarla 3, 5 veya 7 kişilik hazır grup şablonları ekleyerek grup dersi açabilirsiniz.
                </p>
              </div>
            ) : (
              <div className="space-y-4 mb-6">
                {groupTiers.map((tier) => {
                  const effectiveRate = tier.discount_price || tier.price_per_student;
                  const totalGross = effectiveRate * tier.max_students;
                  const totalNet = totalGross * (1 - commissionRate);

                  return (
                    <div
                      key={tier.tier_id}
                      className={`p-4 rounded-2xl border transition-all ${
                        tier.is_active
                          ? "bg-slate-50/80 border-slate-200/80"
                          : "bg-slate-50/40 border-slate-100 opacity-60"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <input
                          type="text"
                          value={tier.title}
                          onChange={(e) => handleUpdateTier(tier.tier_id, "title", e.target.value)}
                          placeholder="Grup Başlığı"
                          className="font-extrabold text-sm text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:outline-none px-1 py-0.5"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdateTier(tier.tier_id, "is_active", !tier.is_active)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors ${
                              tier.is_active
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {tier.is_active ? "Aktif" : "Pasif"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveTier(tier.tier_id)}
                            className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Kademeyi Sil"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Min Kişi</label>
                          <input
                            type="number"
                            min="2"
                            max="50"
                            value={tier.min_students}
                            onChange={(e) => handleUpdateTier(tier.tier_id, "min_students", parseInt(e.target.value) || 2)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Max Kişi</label>
                          <input
                            type="number"
                            min={tier.min_students}
                            max="50"
                            value={tier.max_students}
                            onChange={(e) => handleUpdateTier(tier.tier_id, "max_students", parseInt(e.target.value) || tier.min_students)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Kişi Başı (₺)</label>
                          <input
                            type="number"
                            min="0"
                            value={tier.price_per_student}
                            onChange={(e) => handleUpdateTier(tier.tier_id, "price_per_student", parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">İndirimli (₺)</label>
                          <input
                            type="number"
                            min="0"
                            value={tier.discount_price ?? ""}
                            placeholder="İsteğe Bağlı"
                            onChange={(e) => handleUpdateTier(tier.tier_id, "discount_price", e.target.value ? parseFloat(e.target.value) : null)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>

                      {/* Live Revenue Preview */}
                      <div className="bg-amber-50/70 border border-amber-200/50 rounded-xl p-2.5 text-[11px] text-amber-900 font-bold flex flex-wrap items-center justify-between gap-2">
                        <span>
                          👥 {tier.max_students} Öğrenci Dolduğunda:{" "}
                          <span className="font-black text-slate-900">₺{totalGross.toLocaleString("tr-TR")}</span> / saat
                        </span>
                        <span className="text-emerald-700">
                          Net Kazancınız: ₺{totalNet.toLocaleString("tr-TR")}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={updateSettingsMutation.isPending}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-2xl font-bold shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 text-sm"
            >
              {updateSettingsMutation.isPending ? "Kaydediliyor..." : "Grup Dersi Fiyatlarını Kaydet"}
            </button>
          </div>

          {/* Section 2: Slot Planner Form */}
          <div className="bg-white rounded-[2rem] border border-slate-100 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight mb-5 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
              Yeni Müsaitlik Slotu Ekle
            </h2>

            <form onSubmit={handleAddSlot} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Ders Tarihi</label>
                <input
                  type="date"
                  min={minDate}
                  value={slotDate}
                  onChange={(e) => setSlotDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-semibold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Başlangıç Saati</label>
                  <input
                    type="time"
                    value={slotStart}
                    onChange={(e) => setSlotStart(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Bitiş Saati</label>
                  <input
                    type="time"
                    value={slotEnd}
                    onChange={(e) => setSlotEnd(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-semibold text-slate-800"
                  />
                </div>
              </div>

              {slotError && (
                <p className="text-xs font-bold text-rose-500">{slotError}</p>
              )}

              <button
                type="submit"
                disabled={createSlotMutation.isPending}
                className="w-full py-3.5 bg-slate-900 text-white rounded-2xl font-bold shadow-md hover:bg-slate-800 transition-colors disabled:opacity-50 text-sm"
              >
                {createSlotMutation.isPending ? "Ekleniyor..." : "Takvime Slot Ekle"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Availability Calendar List and Received Reservations */}
        <div className="xl:col-span-7 space-y-8">
          
          {/* Part 1: Gelen Rezervasyon Talepleri */}
          <div className="bg-white rounded-[2rem] border border-slate-100 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight mb-6 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
              Gelen Rezervasyon İstekleri
            </h2>

            {reservationsLoading ? (
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-16 bg-slate-50 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : !reservations?.length ? (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-slate-400 font-bold text-sm">Henüz gelen bir rezervasyon talebi bulunmuyor.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                {reservations.map((res) => (
                  <div
                    key={res.id}
                    className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    {/* Student Info & Slot Time */}
                    <div className="flex items-start gap-3">
                      <Avatar
                        src={res.student?.avatar_url}
                        name={res.student?.full_name || "Öğrenci"}
                        size="md"
                        className="shadow-sm flex-shrink-0"
                      />
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-800">{res.student?.full_name || "Öğrenci"}</div>
                        <div className="text-xs text-slate-500 font-semibold flex items-center gap-1.5 flex-wrap">
                          <span>📅 {res.date}</span>
                          <span>⏰ {res.start_time} - {res.end_time}</span>
                          <span className="text-teal-600 font-extrabold">₺{res.price.toFixed(0)}</span>
                          {res.lesson_mode === "group" ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black">
                              👥 Grup Dersi ({res.group_size || 3} Kişi)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold">
                              🧑 Birebir
                            </span>
                          )}
                        </div>
                        {res.student_notes && (
                          <div className="text-[11px] bg-white border border-slate-100 p-2 rounded-lg text-slate-500 font-medium italic mt-1.5 max-w-sm leading-tight">
                            " {res.student_notes} "
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions and Status Badges */}
                    <div className="flex items-center gap-2 self-end md:self-auto">
                      {res.status === "pending" ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateReservationStatusMutation.mutate({ id: res.id, status: "approved" })}
                            disabled={updateReservationStatusMutation.isPending}
                            className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-emerald-500/10"
                          >
                            Onayla
                          </button>
                          <button
                            onClick={() => updateReservationStatusMutation.mutate({ id: res.id, status: "rejected" })}
                            disabled={updateReservationStatusMutation.isPending}
                            className="px-3.5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-rose-500/10"
                          >
                            Reddet
                          </button>
                        </div>
                      ) : res.status === "approved" ? (
                        <div className="space-y-1 text-right">
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-extrabold tracking-wide uppercase inline-block">
                            Onaylandı
                          </span>
                          {res.meeting_link && (
                            <a
                              href={res.meeting_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-blue-600 font-bold hover:underline block leading-none"
                            >
                              Ders Linkine Git
                            </a>
                          )}
                        </div>
                      ) : res.status === "rejected" ? (
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-extrabold tracking-wide uppercase">
                          Reddedildi
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-rose-50 text-rose-500 rounded-lg text-xs font-extrabold tracking-wide uppercase">
                          İptal Edildi
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Part 2: Müsaitlik Slotlarım Listesi */}
          <div className="bg-white rounded-[2rem] border border-slate-100 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight mb-6 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
              Takvimdeki Müsaitlik Slotlarım
            </h2>

            {slotsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 bg-slate-50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : !slots?.length ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-slate-400 font-bold text-sm">Takvimde henüz müsait bir zaman dilimi eklemediniz.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {slots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100/50 hover:bg-slate-100/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 font-black">
                        📅
                      </div>
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-700 text-sm">{slot.date}</div>
                        <div className="text-xs text-slate-500 font-semibold">
                          Saat: {slot.start_time} - {slot.end_time}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {slot.is_booked ? (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-[10px] font-extrabold tracking-wide uppercase">
                          Rezerve Edildi
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded-lg text-[10px] font-extrabold tracking-wide uppercase">
                            Boş Slot
                          </span>
                          <button
                            onClick={() => deleteSlotMutation.mutate(slot.id)}
                            disabled={deleteSlotMutation.isPending}
                            className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                            title="Slotu Sil"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
