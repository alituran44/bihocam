"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teachersApi } from "@/lib/api";
import Avatar from "@/components/Avatar";

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
  teacher?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string | null;
  } | null;
};

export default function StudentLiveClassesPage() {
  const queryClient = useQueryClient();

  // Get student bookings
  const { data: bookings, isLoading } = useQuery<Reservation[]>({
    queryKey: ["student-bookings"],
    queryFn: () => teachersApi.getMyBookings(),
  });

  return (
    <div className="space-y-8 p-1">
      {/* Header */}
      <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Canlı Derslerim</h1>
        <p className="text-slate-500 font-medium text-sm">
          Eğitmenlerinizden talep ettiğiniz derslerin durumunu takip edin, onaylanan dersleriniz için ders saatinde linklere tıklayarak sınıfa katılın.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-[2rem] border border-slate-100 p-6 sm:p-8 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight mb-6 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
          Rezervasyon Geçmişi & Ders Girişleri
        </h2>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : !bookings?.length ? (
          <div className="text-center py-16 bg-slate-50 rounded-[2rem] border border-slate-100 max-w-2xl mx-auto space-y-4">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto text-3xl">
              📅
            </div>
            <h3 className="text-lg font-bold text-slate-700">Henüz Canlı Ders Rezervasyonunuz Yok</h3>
            <p className="text-slate-500 text-sm font-semibold max-w-sm mx-auto leading-relaxed">
              Eğitmenlerimizden birebir özel ders talep etmek için Eğitmenler sayfamızı ziyaret edip müsait saatleri inceleyebilirsiniz.
            </p>
            <div className="pt-2">
              <a
                href="/teachers"
                className="inline-flex px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all text-xs"
              >
                Eğitmenleri Keşfet →
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="p-5 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-200 transition-colors"
              >
                {/* Left side: Teacher avatar, Date/Time, Price */}
                <div className="flex items-start gap-4">
                  <Avatar
                    src={booking.teacher?.avatar_url}
                    name={booking.teacher?.full_name || "Eğitmen"}
                    size="md"
                    className="shadow-sm ring-2 ring-white flex-shrink-0"
                  />
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-slate-800 text-base">{booking.teacher?.full_name || "Eğitmen"}</h3>
                    <div className="text-xs font-bold text-slate-500 flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1">📅 {booking.date}</span>
                      <span className="flex items-center gap-1">⏰ {booking.start_time} - {booking.end_time}</span>
                      <span className="text-teal-600 font-extrabold">₺{(booking.discount_price || booking.price).toFixed(0)} / Ders</span>
                    </div>
                    {booking.student_notes && (
                      <p className="text-xs font-semibold text-slate-400 mt-2 bg-white/60 border border-slate-100 p-2 rounded-xl italic">
                        Notunuz: "{booking.student_notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Right side: Status and entrance action button */}
                <div className="flex items-center gap-4 self-end md:self-auto">
                  {booking.status === "pending" ? (
                    <span className="px-3.5 py-1.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-xl text-xs font-bold tracking-wide uppercase">
                      Onay Bekliyor
                    </span>
                  ) : booking.status === "approved" ? (
                    <div className="flex flex-col md:items-end gap-2">
                      <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-xs font-bold tracking-wide uppercase text-center inline-block">
                        Onaylandı
                      </span>
                      {booking.meeting_link ? (
                        <a
                          href={booking.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all text-center"
                        >
                          Derse Katıl 🚪
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-bold italic">
                          Ders linki eğitmen tarafından henüz girilmedi
                        </span>
                      )}
                    </div>
                  ) : booking.status === "rejected" ? (
                    <span className="px-3.5 py-1.5 bg-slate-100 text-slate-500 border border-slate-200/50 rounded-xl text-xs font-bold tracking-wide uppercase">
                      Reddedildi
                    </span>
                  ) : (
                    <span className="px-3.5 py-1.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-xs font-bold tracking-wide uppercase">
                      İptal Edildi
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
