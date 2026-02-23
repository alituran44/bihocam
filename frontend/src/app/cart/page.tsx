"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { cartApi, couponsApi, ordersApi, type Coupon } from "@/lib/api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface CartItem {
  id: string;
  course_id: string;
  price_at_add: number;
  course: {
    id: string;
    title: string;
    slug: string;
    price: number;
    discount_price: number | null;
    thumbnail_path?: string | null;
    teacher?: {
      full_name: string;
    } | null;
  };
}

interface CartResponse {
  cart_items: CartItem[];
  subtotal: number;
  discount_amount: number;
  total: number;
  applied_campaign: Coupon | null;
  applicable_course_ids: string[];
  campaign_applicable_to?: string[]; // Alias for applicable_course_ids
}

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState("");

  const { data: cartData, isLoading } = useQuery<CartResponse | CartItem[]>({
    queryKey: ["cart"],
    queryFn: () => cartApi.getCart(true), // with_campaign = true
    enabled: isAuthenticated,
  });

  // Check if response is CartResponse (with campaign) or CartItem[] (without campaign)
  const isCartResponse = cartData && !Array.isArray(cartData);
  const cartItems = isCartResponse ? (cartData as CartResponse).cart_items : (cartData as CartItem[] || []);
  const appliedCampaign = isCartResponse ? (cartData as CartResponse).applied_campaign : null;
  const siteWideDiscount = isCartResponse ? Number((cartData as CartResponse).discount_amount || 0) : 0;
  const applicableCourseIds = isCartResponse ? ((cartData as CartResponse).applicable_course_ids || []) : [];

  // Fetch discount breakdown from active-campaign endpoint
  const { data: campaignData } = useQuery<{
    campaign: Coupon | null;
    applicable_course_ids: string[];
    discount_breakdown: Record<string, number>;
  }>({
    queryKey: ["cart-active-campaign"],
    queryFn: () => couponsApi.getCartActiveCampaign(),
    enabled: isAuthenticated && cartItems.length > 0,
  });

  const discountBreakdown = campaignData?.discount_breakdown || {};

  const removeMutation = useMutation({
    mutationFn: (itemId: string) => cartApi.removeFromCart(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const applyCouponMutation = useMutation({
    mutationFn: (code: string) => {
      const total = cartItems?.reduce((sum, item) => sum + item.price_at_add, 0) || 0;
      return couponsApi.validate({ code, cart_total: total });
    },
    onSuccess: (data) => {
      setAppliedCoupon({ code: data.coupon_code, discount: Number(data.discount_amount) });
      setCouponError("");
    },
    onError: (error: any) => {
      setCouponError(error.response?.data?.detail || "Kupon geçersiz");
      setAppliedCoupon(null);
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: () => {
      return ordersApi.create({
        coupon_code: appliedCoupon?.code || null,
        discount_amount: appliedCoupon?.discount || null,
        payment_method: "credit_card",
      });
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
      router.push(`/orders/${order.id}`);
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-12 rounded-2xl shadow-sm border border-gray-100 max-w-md mx-4">
          <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Giriş Yapmanız Gerekiyor</h1>
          <p className="text-gray-600 mb-6">Sepetinizi görmek için lütfen giriş yapın.</p>
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-teal-500/30 transition-all"
          >
            Giriş Yap
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded-xl w-1/4 mb-8"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = isCartResponse ? Number((cartData as CartResponse).subtotal || 0) : (cartItems?.reduce((sum, item) => sum + Number(item.price_at_add || 0), 0) || 0);
  const manualCouponDiscount = Number(appliedCoupon?.discount || 0);
  const totalDiscount = siteWideDiscount + manualCouponDiscount;
  const total = isCartResponse ? Number((cartData as CartResponse).total || 0) : (subtotal - totalDiscount);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sepetim</h1>
            <p className="text-gray-500">{cartItems?.length || 0} ürün</p>
          </div>
        </div>

        {!cartItems || cartItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Sepetiniz boş</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">Kursları keşfedin ve öğrenmeye başlamak için sepetinize ekleyin.</p>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-teal-500/30 transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Kursları Keşfet
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Sepet İçeriği - Sol Taraf */}
            <div className="lg:col-span-2 space-y-4">
              {/* Site-Wide Campaign Banner */}
              {appliedCampaign && (
                <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold bg-white/20 px-2 py-0.5 rounded">AKTİF KAMPANYA</span>
                        <span className="text-xs bg-white/20 px-2 py-0.5 rounded">Otomatik Uygulandı</span>
                      </div>
                      <h3 className="text-lg font-bold mb-1">
                        {appliedCampaign.campaign_name || "Site Geneli Kampanya"}
                      </h3>
                      {appliedCampaign.campaign_description && (
                        <p className="text-sm text-white/90">{appliedCampaign.campaign_description}</p>
                      )}
                      <p className="text-sm mt-2 font-semibold">
                        Toplam İndirim: <span className="text-2xl">-₺{Number(siteWideDiscount).toFixed(2)}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Cart Items */}
              {cartItems.map((item) => {
                const courseDiscount = discountBreakdown[item.course.id] || 0;
                const finalPrice = Number(item.course.discount_price || item.course.price) - courseDiscount;
                
                return (
                  <div key={item.id} className="bg-white rounded-xl border-2 border-gray-100 shadow-sm hover:shadow-md transition-all">
                    {/* Course Header */}
                    <div className="p-4 border-b border-gray-100 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          <span className="text-sm font-semibold text-gray-700">Eğitim Kursu</span>
                        </div>
                        <button
                          onClick={() => removeMutation.mutate(item.id)}
                          disabled={removeMutation.isPending}
                          className="text-gray-400 hover:text-red-600 transition-colors p-1"
                          title="Sepetten çıkar"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Course Content */}
                    <div className="p-6">
                      <div className="flex gap-6">
                        {/* Thumbnail */}
                        <div className="w-40 h-32 bg-gradient-to-br from-teal-100 to-teal-200 rounded-xl flex-shrink-0 overflow-hidden border-2 border-gray-100">
                          {item.course.thumbnail_path ? (
                            <img src={item.course.thumbnail_path} alt={item.course.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-12 h-12 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Course Details */}
                        <div className="flex-1 min-w-0">
                          <Link href={`/courses/${item.course.slug}`} className="hover:text-teal-600 transition-colors block">
                            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{item.course.title}</h3>
                          </Link>
                          
                          <div className="flex items-center gap-2 mb-3">
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="text-sm text-gray-600">{item.course.teacher?.full_name || "Eğitmen"}</span>
                          </div>

                          {/* Price Section */}
                          <div className="space-y-2">
                            <div className="flex items-baseline gap-3">
                              {item.course.discount_price ? (
                                <>
                                  <span className="text-2xl font-bold text-gray-900">₺{Number(item.course.discount_price).toFixed(2)}</span>
                                  <span className="text-base text-gray-400 line-through">₺{Number(item.course.price).toFixed(2)}</span>
                                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded">İndirimli</span>
                                </>
                              ) : (
                                <span className="text-2xl font-bold text-gray-900">₺{Number(item.course.price).toFixed(2)}</span>
                              )}
                            </div>

                            {/* Campaign Discount */}
                            {courseDiscount > 0 && (
                              <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
                                <svg className="w-5 h-5 text-purple-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-purple-900">Kampanya İndirimi</p>
                                  <p className="text-xs text-purple-700">{appliedCampaign?.campaign_name || "Site Geneli Kampanya"}</p>
                                </div>
                                <span className="text-lg font-bold text-emerald-600">-₺{Number(courseDiscount).toFixed(2)}</span>
                              </div>
                            )}

                            {/* Final Price */}
                            {courseDiscount > 0 && (
                              <div className="pt-2 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-semibold text-gray-700">Bu ürün için ödenecek tutar:</span>
                                  <span className="text-xl font-bold text-teal-600">₺{finalPrice.toFixed(2)}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Özet - Sağ Taraf (Hepsiburada Tarzı) */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border-2 border-gray-200 shadow-lg sticky top-24">
                {/* Header */}
                <div className="p-4 border-b-2 border-gray-200 bg-gray-50">
                  <h2 className="text-lg font-bold text-gray-900">Sipariş Özeti</h2>
                </div>

                <div className="p-4 space-y-4">
                  {/* Kupon Kodu */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-semibold text-gray-700">Kupon Kodu</label>
                      {appliedCoupon && (
                        <button
                          onClick={() => {
                            setAppliedCoupon(null);
                            setCouponCode("");
                            setCouponError("");
                          }}
                          className="text-xs text-red-600 hover:text-red-700 font-medium"
                        >
                          Kaldır
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="KUPON2024"
                        className="flex-1 px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                        disabled={!!appliedCoupon}
                      />
                      {!appliedCoupon && (
                        <button
                          onClick={() => applyCouponMutation.mutate(couponCode)}
                          disabled={!couponCode || applyCouponMutation.isPending}
                          className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50 font-medium text-sm"
                        >
                          Uygula
                        </button>
                      )}
                    </div>
                    {couponError && <p className="text-xs text-red-600 mt-1">{couponError}</p>}
                    {appliedCoupon && (
                      <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {appliedCoupon.code} uygulandı (-₺{Number(appliedCoupon.discount).toFixed(2)})
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Seçilen Ürünler */}
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                      Seçilen Ürünler ({cartItems.length})
                    </p>
                    <div className="space-y-2">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex items-start gap-2 text-sm">
                          <span className="text-gray-600 line-clamp-1 flex-1">{item.course.title}</span>
                          <span className="font-semibold text-gray-900 whitespace-nowrap">
                            ₺{Number(item.course.discount_price || item.course.price).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Fiyat Detayları */}
                  <div className="pt-3 border-t-2 border-gray-200 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Ürünler</span>
                      <span className="font-medium text-gray-900">₺{Number(subtotal).toFixed(2)}</span>
                    </div>
                    
                    {/* Site-Wide Campaign Discount */}
                    {siteWideDiscount > 0 && (
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-purple-900 flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Kampanya İndirimi
                          </span>
                          <span className="text-sm font-bold text-emerald-600">-₺{Number(siteWideDiscount).toFixed(2)}</span>
                        </div>
                        {appliedCampaign?.campaign_name && (
                          <p className="text-xs text-purple-700">{appliedCampaign.campaign_name}</p>
                        )}
                      </div>
                    )}

                    {/* Manual Coupon Discount */}
                    {appliedCoupon && manualCouponDiscount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-emerald-600">Kupon İndirimi</span>
                        <span className="font-medium text-emerald-600">-₺{Number(manualCouponDiscount).toFixed(2)}</span>
                      </div>
                    )}

                    {/* Total Discount Summary */}
                    {totalDiscount > 0 && (
                      <div className="pt-2 border-t border-gray-200">
                        <div className="flex justify-between">
                          <span className="text-sm font-semibold text-gray-700">Toplam İndirim</span>
                          <span className="text-sm font-bold text-emerald-600">-₺{Number(totalDiscount).toFixed(2)}</span>
                        </div>
                      </div>
                    )}

                    {/* Final Total */}
                    <div className="pt-3 border-t-2 border-gray-300">
                      <div className="flex justify-between items-center">
                        <span className="text-base font-bold text-gray-900">Toplam</span>
                        <span className="text-2xl font-bold text-teal-600">₺{Number(total).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Ödeme Butonu */}
                  <button
                    onClick={() => createOrderMutation.mutate()}
                    disabled={createOrderMutation.isPending}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 text-white py-4 rounded-lg font-bold text-base shadow-lg hover:shadow-xl transition-all"
                  >
                    {createOrderMutation.isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        İşleniyor...
                      </span>
                    ) : (
                      "Alışverişi Tamamla"
                    )}
                  </button>

                  {/* Güvenlik */}
                  <div className="pt-3 border-t border-gray-200 flex items-center justify-center gap-2 text-xs text-gray-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Güvenli ödeme ile korunuyorsunuz</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
