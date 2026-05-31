"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teachersApi, siteSettingsApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import Avatar from "@/components/Avatar";

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
  const [meetingLink, setMeetingLink] = useState<string>(user?.live_class_link || "");

  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [slotError, setSlotError] = useState("");

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
    mutationFn: (data: { live_class_price?: number | null; live_class_discount_price?: number | null; live_class_link?: string }) =>
      teachersApi.updateMyProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher", user?.id] });
      checkAuth(); // update auth store state
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
    },
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

    updateSettingsMutation.mutate({
      live_class_price: parsedPrice,
      live_class_discount_price: parsedDiscountPrice,
      live_class_link: meetingLink,
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
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Canlı Ders Saatlik Ücreti (₺)</label>
                <input
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Örn: 1000"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">İndirimli Saatlik Ücret (₺ - İsteğe Bağlı)</label>
                <input
                  type="number"
                  min="0"
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                  placeholder="Örn: 850"
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
                  min={new Date().toISOString().split("T")[0]}
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
