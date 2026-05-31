"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi, notificationsApi, siteSettingsApi, api, teacherProfileApi, bankAccountsApi, teacherApplicationsApi, mediaApi, API_URL, type BankAccount } from "@/lib/api";

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
}

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "notifications" | "payment">("profile");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Payment setting states
  const [paytrActive, setPaytrActive] = useState(false);
  const [paytrMerchantId, setPaytrMerchantId] = useState("");
  const [paytrMerchantKey, setPaytrMerchantKey] = useState("");
  const [paytrMerchantSalt, setPaytrMerchantSalt] = useState("");
  const [paytrTestMode, setPaytrTestMode] = useState(true);

  const [bankActive, setBankActive] = useState(false);
  const [bankName, setBankName] = useState("");
  const [bankReceiver, setBankReceiver] = useState("");
  const [bankIban, setBankIban] = useState("");

  const [courseCommission, setCourseCommission] = useState("20");
  const [liveClassCommission, setLiveClassCommission] = useState("15");

  // Profile form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");

  // Teacher profile states
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bankNameForm, setBankNameForm] = useState("");
  const [ibanForm, setIbanForm] = useState("");
  const [holderNameForm, setHolderNameForm] = useState("");

  const [cvPath, setCvPath] = useState("");
  const [gradCertPath, setGradCertPath] = useState("");
  const [crimRecordPath, setCrimRecordPath] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState<Record<string, boolean>>({});

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { data: user, isLoading } = useQuery<UserProfile>({
    queryKey: ["me"],
    queryFn: () => authApi.getMe(),
  });

  const { data: bankAccounts, refetch: refetchBankAccounts } = useQuery<BankAccount[]>({
    queryKey: ["my-bank-accounts"],
    queryFn: () => bankAccountsApi.list(),
    enabled: user?.role === "teacher",
  });

  const { data: application, refetch: refetchApplication } = useQuery({
    queryKey: ["my-teacher-application"],
    queryFn: async () => {
      try {
        return await teacherApplicationsApi.getMyApplication();
      } catch (err: any) {
        if (err.response?.status === 404) {
          return null;
        }
        throw err;
      }
    },
    enabled: user?.role === "teacher",
  });

  const { data: notifPrefs } = useQuery({
    queryKey: ["notification-preferences"],
    queryFn: () => notificationsApi.getPreferences(),
  });

  const { data: siteSettings, refetch: refetchSettings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => siteSettingsApi.get(),
    enabled: user?.role === "admin",
  });

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      setPhone(user.phone || "");
      setBio(user.bio || "");
      setAvatarUrl(user.avatar_url || "");
    }
  }, [user]);

  useEffect(() => {
    if (application) {
      setCvPath(application.cv_path || "");
      setGradCertPath(application.graduation_cert_path || "");
      setCrimRecordPath(application.criminal_record_path || "");
    }
  }, [application]);

  useEffect(() => {
    if (siteSettings?.platform) {
      const p = siteSettings.platform as Record<string, any>;
      setPaytrActive(!!p.paytr_active);
      setPaytrMerchantId(p.paytr_merchant_id || "");
      setPaytrMerchantKey(p.paytr_merchant_key || "");
      setPaytrMerchantSalt(p.paytr_merchant_salt || "");
      setPaytrTestMode(p.paytr_test_mode !== false);

      setBankActive(!!p.bank_active);
      setBankName(p.bank_name || "");
      setBankReceiver(p.bank_receiver || "");
      setBankIban(p.bank_iban || "");

      const courseComm = p.course_commission_rate !== undefined ? Math.round(p.course_commission_rate * 100).toString() : "20";
      const liveComm = p.live_class_commission_rate !== undefined ? Math.round(p.live_class_commission_rate * 100).toString() : "15";
      setCourseCommission(courseComm);
      setLiveClassCommission(liveComm);
    }
  }, [siteSettings]);

  const updatePaymentSettingsMutation = useMutation({
    mutationFn: async () => {
      const currentPlatform = siteSettings?.platform || {};
      const updatedPlatform = {
        ...currentPlatform,
        paytr_active: paytrActive,
        paytr_merchant_id: paytrMerchantId,
        paytr_merchant_key: paytrMerchantKey,
        paytr_merchant_salt: paytrMerchantSalt,
        paytr_test_mode: paytrTestMode,
        bank_active: bankActive,
        bank_name: bankName,
        bank_receiver: bankReceiver,
        bank_iban: bankIban,
        course_commission_rate: parseFloat(courseCommission) / 100,
        live_class_commission_rate: parseFloat(liveClassCommission) / 100,
      };
      return siteSettingsApi.update({
        platform: updatedPlatform,
      });
    },
    onSuccess: () => {
      setMessage("Ödeme ayarları başarıyla kaydedildi!");
      setError(null);
      refetchSettings();
    },
    onError: () => {
      setError("Ödeme ayarları kaydedilirken hata oluştu.");
      setMessage(null);
    },
  });

  const tabs = useMemo(() => {
    const list = [
      { key: "profile" as const, label: "Profil Bilgileri" },
      { key: "password" as const, label: "Şifre Değiştir" },
      { key: "notifications" as const, label: "Bildirim Tercihleri" },
    ];
    if (user?.role === "admin") {
      list.push({ key: "payment" as const, label: "Ödeme Ayarları" });
    }
    return list;
  }, [user?.role]);

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      if (user?.role === "teacher") {
        return teacherProfileApi.updateMyProfile({
          full_name: fullName,
          phone: phone || undefined,
          bio: bio || undefined,
          avatar_url: avatarUrl || undefined,
        });
      }
      const { data } = await api.put("/auth/me", {
        full_name: fullName,
        phone: phone || null,
        bio: bio || null,
      });
      return data;
    },
    onSuccess: () => {
      setMessage("Profil başarıyla güncellendi!");
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: () => {
      setError("Profil güncellenirken bir hata oluştu");
      setMessage(null);
    },
  });

  const addBankAccountMutation = useMutation({
    mutationFn: async (data: { bank_name: string; iban: string; account_holder_name: string }) => {
      return bankAccountsApi.create(data);
    },
    onSuccess: () => {
      setMessage("Banka hesabı başarıyla eklendi ve onay bekliyor.");
      setError(null);
      setBankNameForm("");
      setIbanForm("");
      setHolderNameForm("");
      refetchBankAccounts();
    },
    onError: (err: any) => {
      setError("Banka hesabı eklenirken hata oluştu: " + (err.response?.data?.detail || err.message));
      setMessage(null);
    },
  });

  const handleAvatarUpload = async (file: File) => {
    setIsUploadingAvatar(true);
    try {
      const result = await mediaApi.uploadAvatar(file);
      setAvatarUrl(result.url);
      
      // Save it using the update mutation
      if (user?.role === "teacher") {
        await teacherProfileApi.updateMyProfile({
          avatar_url: result.url,
        });
      } else {
        await api.put("/auth/me", {
          full_name: fullName,
          phone: phone || null,
          bio: bio || null,
          avatar_url: result.url,
        });
      }
      
      setMessage("Profil fotoğrafı başarıyla güncellendi!");
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["me"] });
    } catch (err: any) {
      setError("Profil fotoğrafı yüklenirken hata oluştu: " + (err.response?.data?.detail || err.message));
      setMessage(null);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleDocumentUpload = async (docType: "cv" | "graduation" | "criminal", file: File) => {
    setIsUploadingDoc((prev) => ({ ...prev, [docType]: true }));
    try {
      const uploadResult = await teacherApplicationsApi.uploadDocument(file);
      
      const docsUpdate: Record<string, string> = {};
      if (docType === "cv") {
        setCvPath(uploadResult.path);
        docsUpdate.cv_path = uploadResult.path;
      } else if (docType === "graduation") {
        setGradCertPath(uploadResult.path);
        docsUpdate.graduation_cert_path = uploadResult.path;
      } else if (docType === "criminal") {
        setCrimRecordPath(uploadResult.path);
        docsUpdate.criminal_record_path = uploadResult.path;
      }

      if (!application) {
        await teacherApplicationsApi.submitApplication({
          full_name: fullName || user?.full_name || "",
          phone: phone || user?.phone || "0000000000",
          address: "Ayarlar menüsünden yüklendi",
          birth_date: "1990-01-01",
          gender: "Belirtilmemiş",
          branches: ["Genel"],
          levels: ["Genel"],
          experience_years: 1,
          bio: bio || "Eğitmen profili",
          heard_from: "Sistem Ayarları",
          cv_path: docType === "cv" ? uploadResult.path : "",
          graduation_cert_path: docType === "graduation" ? uploadResult.path : "",
          criminal_record_path: docType === "criminal" ? uploadResult.path : "",
        });
      } else {
        await api.patch("/teacher-applications/me/documents", docsUpdate);
      }

      setMessage("Belge başarıyla yüklendi!");
      setError(null);
      refetchApplication();
    } catch (err: any) {
      setError("Belge yüklenirken hata oluştu: " + (err.response?.data?.detail || err.message));
      setMessage(null);
    } finally {
      setIsUploadingDoc((prev) => ({ ...prev, [docType]: false }));
    }
  };

  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      if (newPassword !== confirmPassword) throw new Error("Şifreler eşleşmiyor");
      if (newPassword.length < 8) throw new Error("Şifre en az 8 karakter olmalıdır");
      const { data } = await api.put("/auth/me/password", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      return data;
    },
    onSuccess: () => {
      setMessage("Şifre başarıyla değiştirildi!");
      setError(null);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (err: Error) => {
      setError(err.message || "Şifre değiştirilirken bir hata oluştu");
      setMessage(null);
    },
  });

  const updateNotifPrefsMutation = useMutation({
    mutationFn: async (prefs: Record<string, boolean>) => {
      return notificationsApi.updatePreferences(prefs);
    },
    onSuccess: () => {
      setMessage("Bildirim tercihleri güncellendi!");
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
    },
    onError: () => {
      setError("Bildirim tercihleri güncellenirken bir hata oluştu");
      setMessage(null);
    },
  });

  // Role-based notification preferences
  const notificationOptions = useMemo(() => {
    const isTeacher = user?.role === "teacher";
    const isAdmin = user?.role === "admin" || user?.role === "staff";

    const common = [
      { key: "push_notifications", label: "Push bildirimleri", desc: "Tarayıcı üzerinden anlık bildirimler alın" },
      { key: "email_marketing", label: "Pazarlama e-postaları", desc: "Kampanya ve duyurular hakkında bilgi alın" },
    ];

    const studentPrefs = [
      { key: "email_on_course_update", label: "Kurs güncellemelerinde e-posta", desc: "Kayıtlı olduğunuz kursa yeni içerik eklendiğinde" },
      { key: "email_on_announcement", label: "Duyurularda e-posta", desc: "Platform duyuruları ve haberler hakkında" },
    ];

    const teacherPrefs = [
      { key: "email_on_new_enrollment", label: "Yeni kayıtta e-posta", desc: "Bir öğrenci kursunuza kayıt olduğunda" },
      { key: "email_on_new_review", label: "Yeni yorumda e-posta", desc: "Kursunuza yeni bir yorum yazıldığında" },
      { key: "email_on_new_sale", label: "Yeni satışta e-posta", desc: "Kursunuz satıldığında bildirim alın" },
    ];

    const adminPrefs = [
      { key: "email_on_new_enrollment", label: "Yeni kayıtta e-posta", desc: "Platforma yeni bir kayıt olduğunda" },
      { key: "email_on_new_review", label: "Yeni yorumda e-posta", desc: "Onay bekleyen yeni bir yorum geldiğinde" },
      { key: "email_on_new_sale", label: "Yeni satışta e-posta", desc: "Platformda yeni bir satış gerçekleştiğinde" },
      { key: "email_on_withdrawal_request", label: "Çekim talebinde e-posta", desc: "Eğitmen yeni bir çekim talebi oluşturduğunda" },
    ];

    if (isAdmin) return [...adminPrefs, ...common];
    if (isTeacher) return [...teacherPrefs, ...common];
    return [...studentPrefs, ...common];
  }, [user?.role]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-gray-400">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-500 rounded-3xl mb-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxLjUiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="relative px-8 py-12">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center text-white text-3xl font-bold">
              {user?.full_name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
                Hesap Ayarları
              </h1>
              <p className="text-teal-100 text-lg">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-200 text-emerald-700 text-sm font-medium">
          {message}
        </div>
      )}
      {error && (
        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-4 border border-red-200 text-red-700 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 px-6">
          <nav className="flex gap-6">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setMessage(null); setError(null); }}
                className={`py-4 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-teal-600 text-teal-700"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 md:p-8">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className={user?.role === "teacher" ? "grid grid-cols-1 lg:grid-cols-2 gap-8" : "max-w-2xl space-y-6"}>
              
              {/* Left Column (Main Form fields) */}
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Ad Soyad</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">E-posta</label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-1">E-posta adresi değiştirilemez</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Telefon</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+90 5XX XXX XX XX"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">Hakkında</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    placeholder="Kendinizi kısaca tanıtın..."
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-sm"
                  />
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <button
                    onClick={() => updateProfileMutation.mutate()}
                    disabled={updateProfileMutation.isPending}
                    className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-teal-700 hover:to-emerald-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl"
                  >
                    {updateProfileMutation.isPending ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                  </button>
                  <div className="text-sm text-gray-500">
                    Rol: <span className="font-semibold text-teal-700 capitalize">{user?.role}</span>
                  </div>
                </div>
              </div>

              {/* Right Column (Only for Teachers) */}
              {user?.role === "teacher" && (
                <div className="space-y-8">
                  
                  {/* 1. Profile Avatar Upload */}
                  <div className="bg-slate-50 border border-gray-200 rounded-2xl p-6 space-y-4">
                    <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <span>📸</span> Profil Fotoğrafı
                    </h4>
                    <div className="flex items-center gap-4">
                      <div className="relative group w-20 h-20 rounded-full overflow-hidden border-2 border-teal-500 flex-shrink-0 bg-teal-50 flex items-center justify-center">
                        {avatarUrl ? (
                          <img
                            src={mediaApi.getAvatarUrl(avatarUrl)}
                            className="w-full h-full object-cover"
                            alt="Profile"
                          />
                        ) : (
                          <div className="w-full h-full bg-teal-50 flex items-center justify-center text-teal-600 text-2xl font-bold">
                            {fullName?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <input
                          type="file"
                          accept="image/*"
                          id="settings-avatar-input"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleAvatarUpload(e.target.files[0]);
                            }
                          }}
                        />
                        <label
                          htmlFor="settings-avatar-input"
                          className="inline-block px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold hover:border-teal-500 hover:text-teal-600 cursor-pointer shadow-sm transition-all"
                        >
                          {isUploadingAvatar ? "Yükleniyor..." : "Fotoğraf Seç ve Yükle"}
                        </label>
                        <p className="text-[10px] text-gray-400">Önerilen: Kare biçiminde, maksimum 5MB (JPG, PNG)</p>
                      </div>
                    </div>
                  </div>

                  {/* 2. Bank & IBAN Account */}
                  <div className="bg-slate-50 border border-gray-200 rounded-2xl p-6 space-y-4">
                    <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <span>🏦</span> Banka & IBAN Bilgileri
                    </h4>
                    {bankAccounts && bankAccounts.length > 0 ? (
                      (() => {
                        const defaultAccount = bankAccounts.find((a) => a.is_default) || bankAccounts[0];
                        return (
                          <div className="bg-white border border-emerald-100 rounded-xl p-4 space-y-2 shadow-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-gray-900">{defaultAccount.bank_name}</span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  defaultAccount.status === "approved"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                    : defaultAccount.status === "rejected"
                                    ? "bg-red-50 text-red-700 border border-red-100"
                                    : "bg-amber-50 text-amber-700 border border-amber-100"
                                }`}
                              >
                                {defaultAccount.status === "approved"
                                  ? "Onaylandı"
                                  : defaultAccount.status === "rejected"
                                  ? "Reddedildi"
                                  : "Beklemede"}
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-500 font-semibold">{defaultAccount.account_holder_name}</p>
                            <p className="text-xs font-mono text-gray-900 bg-gray-50 p-2 rounded border border-gray-100 tracking-wider">
                              {defaultAccount.iban}
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                window.location.href = "/dashboard/teacher/profile?tab=bank-accounts";
                              }}
                              className="text-[10px] text-teal-600 font-bold hover:underline block pt-1"
                            >
                              Tüm Banka Hesaplarını Yönet ➜
                            </button>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="space-y-3">
                        <p className="text-[10px] text-gray-500 leading-relaxed">
                          Ödemelerinizi alabilmek için banka hesabınızı ekleyin.
                        </p>
                        <div className="grid grid-cols-1 gap-3">
                          <input
                            type="text"
                            placeholder="Banka Adı (Örn: Ziraat Bankası)"
                            value={bankNameForm}
                            onChange={(e) => setBankNameForm(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white"
                          />
                          <input
                            type="text"
                            placeholder="Hesap Sahibi Adı Soyadı"
                            value={holderNameForm}
                            onChange={(e) => setHolderNameForm(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white"
                          />
                          <input
                            type="text"
                            placeholder="IBAN Numarası (TR...)"
                            value={ibanForm}
                            onChange={(e) => {
                              let val = e.target.value.toUpperCase().replace(/\s/g, "");
                              if (val.startsWith("TR") && val.length > 2) {
                                val =
                                  val.slice(0, 2) +
                                  " " +
                                  val.slice(2, 4) +
                                  " " +
                                  val.slice(4, 8) +
                                  " " +
                                  val.slice(8, 12) +
                                  " " +
                                  val.slice(12, 16) +
                                  " " +
                                  val.slice(16, 20) +
                                  " " +
                                  val.slice(20, 24) +
                                  " " +
                                  val.slice(24, 26);
                              }
                              setIbanForm(val.trim());
                            }}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-mono bg-white tracking-wider"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!bankNameForm || !holderNameForm || !ibanForm) {
                                alert("Lütfen tüm alanları doldurun.");
                                return;
                              }
                              addBankAccountMutation.mutate({
                                bank_name: bankNameForm,
                                account_holder_name: holderNameForm,
                                iban: ibanForm.replace(/\s/g, ""),
                              });
                            }}
                            disabled={addBankAccountMutation.isPending}
                            className="w-full py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white text-xs font-bold rounded-xl hover:shadow-md transition-all disabled:opacity-50"
                          >
                            {addBankAccountMutation.isPending ? "Ekleniyor..." : "Banka Hesabı Ekle"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3. Teacher Documents */}
                  <div className="bg-slate-50 border border-gray-200 rounded-2xl p-6 space-y-4">
                    <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <span>📄</span> Eğitmen Belgeleri
                    </h4>
                    <p className="text-[10px] text-gray-500 leading-relaxed">
                      Hesabınızın onaylı kalması ve denetimler için evraklarınızı güncel tutun. Mezuniyet belgesi, CV veya sertifikalarınızı yükleyebilirsiniz.
                    </p>
                    <div className="space-y-3">
                      
                      {/* CV Upload */}
                      <div className="border border-gray-150 bg-white rounded-xl p-3 shadow-sm space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-700">Özgeçmiş (CV)</span>
                          {cvPath ? (
                            <a
                              href={cvPath.startsWith("http") ? cvPath : `${API_URL.replace("/api/v1", "")}/${cvPath}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-teal-600 font-bold hover:underline flex items-center gap-1"
                            >
                              <span>📥</span> İndir
                            </a>
                          ) : (
                            <span className="text-[10px] text-red-500 font-semibold">Eksik</span>
                          )}
                        </div>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          id="settings-cv-input"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleDocumentUpload("cv", e.target.files[0]);
                            }
                          }}
                        />
                        <label
                          htmlFor="settings-cv-input"
                          className="w-full block py-1.5 border-2 border-dashed border-gray-200 hover:border-teal-500 rounded-lg text-center cursor-pointer text-[10px] font-bold text-gray-500 hover:text-teal-600 transition-colors"
                        >
                          {isUploadingDoc["cv"] ? "Yükleniyor..." : cvPath ? "Dosyayı Güncelle" : "Özgeçmiş Yükle (.pdf, .doc)"}
                        </label>
                      </div>

                      {/* Graduation Certificate Upload */}
                      <div className="border border-gray-150 bg-white rounded-xl p-3 shadow-sm space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-700">Mezuniyet Belgesi / Diploma</span>
                          {gradCertPath ? (
                            <a
                              href={gradCertPath.startsWith("http") ? gradCertPath : `${API_URL.replace("/api/v1", "")}/${gradCertPath}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-teal-600 font-bold hover:underline flex items-center gap-1"
                            >
                              <span>📥</span> İndir
                            </a>
                          ) : (
                            <span className="text-[10px] text-red-500 font-semibold">Eksik</span>
                          )}
                        </div>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          id="settings-grad-input"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleDocumentUpload("graduation", e.target.files[0]);
                            }
                          }}
                        />
                        <label
                          htmlFor="settings-grad-input"
                          className="w-full block py-1.5 border-2 border-dashed border-gray-200 hover:border-teal-500 rounded-lg text-center cursor-pointer text-[10px] font-bold text-gray-500 hover:text-teal-600 transition-colors"
                        >
                          {isUploadingDoc["graduation"] ? "Yükleniyor..." : gradCertPath ? "Dosyayı Güncelle" : "Belge Yükle (.pdf, .png, .jpg)"}
                        </label>
                      </div>

                      {/* Criminal Record Upload */}
                      <div className="border border-gray-150 bg-white rounded-xl p-3 shadow-sm space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-700">Adli Sicil Kaydı</span>
                          {crimRecordPath ? (
                            <a
                              href={crimRecordPath.startsWith("http") ? crimRecordPath : `${API_URL.replace("/api/v1", "")}/${crimRecordPath}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-teal-600 font-bold hover:underline flex items-center gap-1"
                            >
                              <span>📥</span> İndir
                            </a>
                          ) : (
                            <span className="text-[10px] text-red-500 font-semibold">Eksik</span>
                          )}
                        </div>
                        <input
                          type="file"
                          accept=".pdf"
                          id="settings-criminal-input"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleDocumentUpload("criminal", e.target.files[0]);
                            }
                          }}
                        />
                        <label
                          htmlFor="settings-criminal-input"
                          className="w-full block py-1.5 border-2 border-dashed border-gray-200 hover:border-teal-500 rounded-lg text-center cursor-pointer text-[10px] font-bold text-gray-500 hover:text-teal-600 transition-colors"
                        >
                          {isUploadingDoc["criminal"] ? "Yükleniyor..." : crimRecordPath ? "Dosyayı Güncelle" : "Adli Sicil Belgesi Yükle (.pdf)"}
                        </label>
                      </div>

                    </div>
                  </div>

                </div>
              )}

            </div>
          )}

          {/* Password Tab */}
          {activeTab === "password" && (
            <div className="max-w-2xl space-y-6">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Mevcut Şifre</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Yeni Şifre</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">En az 8 karakter</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Yeni Şifre (Tekrar)</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-sm"
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-500 mt-1 font-medium">Şifreler eşleşmiyor</p>
                )}
              </div>

              <button
                onClick={() => changePasswordMutation.mutate()}
                disabled={!currentPassword || !newPassword || !confirmPassword || changePasswordMutation.isPending}
                className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-teal-700 hover:to-emerald-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl"
              >
                {changePasswordMutation.isPending ? "Değiştiriliyor..." : "Şifreyi Değiştir"}
              </button>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="max-w-2xl space-y-1">
              {notificationOptions.map((pref, index) => (
                <div
                  key={pref.key}
                  className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0"
                  style={{ animation: `fadeInUp 0.3s ease-out ${index * 30}ms forwards` }}
                >
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{pref.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{pref.desc}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={(notifPrefs as Record<string, boolean>)?.[pref.key] ?? true}
                      onChange={(e) => {
                        updateNotifPrefsMutation.mutate({ [pref.key]: e.target.checked });
                      }}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                </div>
              ))}
            </div>
          )}

          {/* Payment Settings Tab */}
          {activeTab === "payment" && user?.role === "admin" && (
            <div className="space-y-10 max-w-3xl">
              
              {/* 1. PayTR Credit Card Integration */}
              <div className="bg-slate-50/50 border border-gray-200/60 rounded-3xl p-6 md:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💳</span>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Kredi Kartı (PayTR) Entegrasyonu</h3>
                      <p className="text-xs text-gray-400 font-semibold mt-0.5">PayTR API parametrelerini dinamik olarak yapılandırın</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={paytrActive}
                      onChange={(e) => setPaytrActive(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                </div>

                {paytrActive && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Merchant ID (Mağaza Numarası) *</label>
                      <input
                        type="text"
                        value={paytrMerchantId}
                        onChange={(e) => setPaytrMerchantId(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-sm"
                        placeholder="Örn: 123456"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Merchant Key *</label>
                      <input
                        type="text"
                        value={paytrMerchantKey}
                        onChange={(e) => setPaytrMerchantKey(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-sm"
                        placeholder="Mağaza API Key"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Merchant Salt *</label>
                      <input
                        type="text"
                        value={paytrMerchantSalt}
                        onChange={(e) => setPaytrMerchantSalt(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-sm"
                        placeholder="Mağaza API Salt"
                      />
                    </div>

                    <div className="md:col-span-2 flex items-center justify-between py-2 border-t border-gray-200/50">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">Test Modu</div>
                        <div className="text-xs text-gray-400">PayTR test ortamını kullan (Sanbox modu)</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={paytrTestMode}
                          onChange={(e) => setPaytrTestMode(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Bank Wire / EFT Account Settings */}
              <div className="bg-slate-50/50 border border-gray-200/60 rounded-3xl p-6 md:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🏦</span>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Banka Havalesi / EFT Ayarları</h3>
                      <p className="text-xs text-gray-400 font-semibold mt-0.5">Havale ile ödemeler için resmi banka hesap ayrıntıları</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={bankActive}
                      onChange={(e) => setBankActive(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                </div>

                {bankActive && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Banka Adı *</label>
                      <input
                        type="text"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-sm"
                        placeholder="Örn: Garanti BBVA"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Alıcı Adı *</label>
                      <input
                        type="text"
                        value={bankReceiver}
                        onChange={(e) => setBankReceiver(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-sm"
                        placeholder="Firma veya Şahıs Ünvanı"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-sm font-semibold text-gray-700 mb-1.5 block">IBAN Numarası *</label>
                      <input
                        type="text"
                        value={bankIban}
                        onChange={(e) => setBankIban(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-sm font-mono"
                        placeholder="TR00 0000 0000 0000 0000 0000 00"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Commission Rates Settings */}
              <div className="bg-slate-50/50 border border-gray-200/60 rounded-3xl p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
                  <span className="text-2xl">📊</span>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Komisyon Oranları</h3>
                    <p className="text-xs text-gray-400 font-semibold mt-0.5">Eğitmen satışlarından alınacak platform komisyon yüzdeleri</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Kurs Satış Komisyonu (%) *</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={courseCommission}
                      onChange={(e) => setCourseCommission(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-sm"
                      placeholder="Örn: 20"
                    />
                    <p className="text-xs text-gray-400 mt-1">Eğitmenlerin sattığı video kurslardan alınacak komisyon oranı (örn. %20 için 20 yazın)</p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Canlı Ders Komisyonu (%) *</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={liveClassCommission}
                      onChange={(e) => setLiveClassCommission(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-sm"
                      placeholder="Örn: 15"
                    />
                    <p className="text-xs text-gray-400 mt-1">Eğitmenlerin canlı ders rezervasyonlarından alınacak komisyon oranı (örn. %15 için 15 yazın)</p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => updatePaymentSettingsMutation.mutate()}
                  disabled={updatePaymentSettingsMutation.isPending}
                  className="px-8 py-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold rounded-2xl hover:from-teal-700 hover:to-emerald-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl"
                >
                  {updatePaymentSettingsMutation.isPending ? "Ayarlar Kaydediliyor..." : "Ödeme Ayarlarını Kaydet"}
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
