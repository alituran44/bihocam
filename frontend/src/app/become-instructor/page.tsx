"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuthStore } from "@/lib/store";
import { teacherApplicationsApi, authApi, type TeacherApplicationCreate } from "@/lib/api";
import { FileUpload } from "@/components/ui/FileUpload";

const BRANCH_OPTIONS = [
  "Matematik", "Fizik", "Kimya", "Biyoloji", "Yazılım", "Coğrafya", 
  "Fen Bilimleri", "Türkçe", "İngilizce", "Almanca", "Fransızca", 
  "Sosyal Bilgiler", "İspanyolca", "Rusça", "Felsefe"
];

const LEVEL_OPTIONS = ["İlkokul", "Ortaokul", "Lise", "Üniversite"];

export default function BecomeInstructorPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user, setUser, isAuthenticated, setToken } = useAuthStore();
  
  // Account registration states (only for guests)
  const [accountData, setAccountData] = useState({
    email: "",
    password: "",
    full_name: "",
  });

  // Application form states
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    address: "",
    birth_date: "",
    gender: "Kadın",
    experience_years: 1,
    bio: "",
    heard_from: "Sosyal Medya",
    cv_path: "",
    graduation_cert_path: "",
    criminal_record_path: "",
  });

  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);

  const [terms, setTerms] = useState({
    ageLimit: false,
    allTerms: false,
    agreement: false,
    sales: false,
    kvkk: false,
    privacy: false,
  });

  const [resubmitting, setResubmitting] = useState(false);

  // Sync user details if already logged in
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        full_name: prev.full_name || user.full_name || "",
        phone: prev.phone || user.phone || "",
        bio: prev.bio || user.bio || "",
      }));
    }
  }, [user]);

  // Fetch current user application if logged in
  const { data: application, isLoading: appLoading, refetch } = useQuery({
    queryKey: ["my-teacher-application"],
    queryFn: () => teacherApplicationsApi.getMyApplication(),
    enabled: isAuthenticated,
    retry: false,
  });

  // Submit application mutation
  const submitMutation = useMutation({
    mutationFn: async (data: TeacherApplicationCreate) => {
      // 1. If not authenticated, register and login first
      if (!isAuthenticated) {
        if (!accountData.email || !accountData.password || !accountData.full_name) {
          throw new Error("Lütfen tüm hesap kayıt bilgilerini doldurun.");
        }
        
        // Register as student first (standard flow)
        await authApi.register(accountData.email, accountData.password, accountData.full_name, "student");
        
        // Login to obtain cookie/token
        const loginRes = await authApi.login(accountData.email, accountData.password);
        if (loginRes.access_token) {
          localStorage.setItem("access_token", loginRes.access_token);
          setToken(loginRes.access_token);
        }
        
        // Fetch current user profile
        const freshUser = await authApi.getMe();
        setUser(freshUser);
      }

      // 2. Submit teacher application
      return teacherApplicationsApi.submitApplication(data);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["my-teacher-application"] });
      try {
        const updatedUser = await authApi.getMe();
        setUser(updatedUser);
      } catch (e) {}
      if (isAuthenticated) {
        refetch();
      } else {
        // Force reload page to fetch fresh state after auto-login
        window.location.reload();
      }
      alert("Eğitmen başvurunuz başarıyla gönderildi ve değerlendirmeye alındı!");
    },
    onError: (error: any) => {
      alert("Başvuru gönderilirken hata oluştu: " + (error.response?.data?.detail || error.message || "Bilinmeyen hata"));
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAccountData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: keyof typeof terms) => {
    setTerms((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleBranchToggle = (branch: string) => {
    setSelectedBranches((prev) =>
      prev.includes(branch) ? prev.filter((b) => b !== branch) : [...prev, branch]
    );
  };

  const handleLevelToggle = (level: string) => {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  const handleFileUpload = async (file: File, fieldName: "cv_path" | "graduation_cert_path" | "criminal_record_path") => {
    if (!isAuthenticated) {
      alert("Belge yüklemeden önce lütfen sisteme giriş yapın veya başvuruyu evraksız gönderip daha sonra profilinizden yükleyin.");
      return;
    }
    try {
      const result = await teacherApplicationsApi.uploadDocument(file);
      setFormData((prev) => ({ ...prev, [fieldName]: result.path }));
      alert("Belge başarıyla yüklendi!");
    } catch (e: any) {
      alert("Dosya yüklenirken hata oluştu: " + (e.message || "Lütfen geçerli bir belge formatı seçin."));
      throw e;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate branches and levels
    if (selectedBranches.length === 0) {
      alert("Lütfen en az bir Branş seçin.");
      return;
    }
    if (selectedLevels.length === 0) {
      alert("Lütfen en az bir Eğitim Kademesi seçin.");
      return;
    }

    // Validate terms
    if (!terms.ageLimit || !terms.allTerms || !terms.agreement || !terms.sales || !terms.kvkk || !terms.privacy) {
      alert("Lütfen tüm zorunlu Şartlar ve Onayları kabul edin.");
      return;
    }

    // Submit mutation
    submitMutation.mutate({
      ...formData,
      full_name: formData.full_name || accountData.full_name,
      branches: selectedBranches,
      levels: selectedLevels,
      experience_years: Number(formData.experience_years),
    });
  };

  // Dedicated submission update for documents
  const updateDocsMutation = useMutation({
    mutationFn: async (data: { cv_path?: string; graduation_cert_path?: string; criminal_record_path?: string }) => {
      // Direct call to PATCH endpoint we created
      const { data: response } = await authApi.api.patch("/teacher-applications/me/documents", data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-teacher-application"] });
      refetch();
      alert("Belgeleriniz başarıyla güncellendi!");
    },
    onError: (error: any) => {
      alert("Belge güncelleme hatası: " + (error.response?.data?.detail || error.message));
    }
  });

  const handleDocUpdateSubmit = () => {
    updateDocsMutation.mutate({
      cv_path: formData.cv_path || undefined,
      graduation_cert_path: formData.graduation_cert_path || undefined,
      criminal_record_path: formData.criminal_record_path || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      <Header />

      <main className="flex-grow pt-32 pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Benefit Cards Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative overflow-hidden bg-gradient-to-br from-pink-500 via-pink-600 to-rose-600 rounded-[2rem] p-8 text-white shadow-xl flex flex-col justify-between group hover:scale-[1.02] transition-all duration-300">
              <div className="space-y-4">
                <h3 className="text-2xl font-black leading-tight">Senin en iyi öğrencileri bulmanı sağlıyoruz.</h3>
                <p className="text-pink-50 text-sm font-medium leading-relaxed">
                  Böylece en iyi yaptığınız işi ders öğretmenliği yapabilirsiniz. istediğiniz zaman, istediğiniz yerde ders verebilirsiniz.
                </p>
              </div>
              <div className="mt-8 flex justify-center">
                <img src="/teacher_matching.png" alt="Öğrenci Eşleştirme" className="h-40 object-contain drop-shadow-2xl rounded-2xl group-hover:scale-105 transition-transform" />
              </div>
            </div>

            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-600 to-teal-700 rounded-[2rem] p-8 text-white shadow-xl flex flex-col justify-between group hover:scale-[1.02] transition-all duration-300">
              <div className="space-y-4">
                <h3 className="text-2xl font-black leading-tight">Yoğun İşlerle Biz İlgileneceğiz</h3>
                <p className="text-emerald-50 text-sm font-medium leading-relaxed">
                  Yapay zeka destekleri araçlarımız ile ders hazırlığı ve tekrarında size destek olurken siz öğrencileriniz ile daha yakından ilgilenebilirsiniz.
                </p>
              </div>
              <div className="mt-8 flex justify-center">
                <img src="/ai_helper.png" alt="Yapay Zeka Destekleri" className="h-40 object-contain drop-shadow-2xl rounded-2xl group-hover:scale-105 transition-transform" />
              </div>
            </div>

            <div className="relative overflow-hidden bg-gradient-to-br from-amber-400 via-orange-500 to-amber-500 rounded-[2rem] p-8 text-gray-900 shadow-xl flex flex-col justify-between group hover:scale-[1.02] transition-all duration-300">
              <div className="space-y-4">
                <h3 className="text-2xl font-black leading-tight">Mükemmel Yarı zamanlı iş ve kariyer başlangıcı</h3>
                <p className="text-orange-950 text-sm font-medium leading-relaxed">
                  Öğretmenlerimizin çoğunluğu halihazırda yarı zamanlı bir işte çalışıyor. Bu da ders vermeyi yan iş olarak harika bir seçenek haline getiriyor.
                </p>
              </div>
              <div className="mt-8 flex justify-center">
                <img src="/parttime_career.png" alt="Kariyer Başlangıcı" className="h-40 object-contain drop-shadow-2xl rounded-2xl group-hover:scale-105 transition-transform" />
              </div>
            </div>
          </div>

          {/* Conditional UI based on existing application status */}
          {isAuthenticated && appLoading && (
            <div className="bg-white rounded-3xl p-12 border border-gray-100 shadow-xl text-center">
              <div className="inline-block w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 mt-4 font-semibold">Başvuru durumu yükleniyor...</p>
            </div>
          )}

          {isAuthenticated && application && !resubmitting ? (
            <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] p-8 md:p-12 border border-gray-100 shadow-2xl space-y-8 text-center">
              <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl shadow-lg bg-teal-50">
                {application.status === "approved" ? "🎉" : application.status === "rejected" ? "❌" : "⏳"}
              </div>

              <h1 className="text-3xl font-black text-gray-900">
                {application.status === "approved"
                  ? "Tebrikler! Eğitmen Başvurunuz Onaylandı"
                  : application.status === "rejected"
                  ? "Eğitmen Başvurunuz Reddedildi"
                  : "Başvurunuz İnceleme Altında"}
              </h1>

              <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed font-medium">
                {application.status === "approved"
                  ? "Başvurunuz incelendi ve onaylandı. BiHocam bünyesinde eğitim vermeye başlayabilir, kurslar ve dersler oluşturabilirsiniz!"
                  : application.status === "rejected"
                  ? `Başvurunuz ne yazık ki onaylanmadı. Red sebebi: "${application.admin_note || "Belirtilmemiş"}". Bilgilerinizi düzenleyerek yeniden başvuruda bulunabilirsiniz.`
                  : "Eğitmen kadromuzun bir parçası olmak üzere yaptığınız başvuru alındı. Belgeleriniz ve bilgileriniz yöneticilerimiz tarafından incelenecektir."}
              </p>

              {/* Document upload status block (especially if pending/missing documents) */}
              {application.status !== "approved" && (
                <div className="bg-slate-50 border border-gray-200/60 rounded-3xl p-6 md:p-8 space-y-6 text-left max-w-2xl mx-auto">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📄</span>
                    <h3 className="text-lg font-bold text-gray-900">Eksik Belgeleri Yükle / Güncelle</h3>
                  </div>
                  <p className="text-sm text-gray-500 font-semibold leading-relaxed">
                    Eğitmen hesabınızın onaylanabilmesi için CV, Mezuniyet Belgesi ve Adli Sicil belgesinin tamamının sisteme yüklenmesi zorunludur. Eksik belgelerinizi aşağıdan tamamlayabilirsiniz:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-700 block">Özgeçmiş (CV) {application.cv_path ? "✓" : "*"}</label>
                      <FileUpload
                        accept=".pdf,.doc,.docx"
                        maxSizeMB={50}
                        onUpload={(file) => handleFileUpload(file, "cv_path")}
                        onRemove={() => setFormData(prev => ({ ...prev, cv_path: "" }))}
                        currentFile={formData.cv_path ? { name: formData.cv_path.split("/").pop() || "Özgeçmiş.pdf", size: 0 } : application.cv_path ? { name: "Yüklü_CV.pdf", size: 0 } : undefined}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-700 block">Diploma {application.graduation_cert_path ? "✓" : "*"}</label>
                      <FileUpload
                        accept=".pdf,.doc,.docx"
                        maxSizeMB={50}
                        onUpload={(file) => handleFileUpload(file, "graduation_cert_path")}
                        onRemove={() => setFormData(prev => ({ ...prev, graduation_cert_path: "" }))}
                        currentFile={formData.graduation_cert_path ? { name: formData.graduation_cert_path.split("/").pop() || "Mezuniyet_Belgesi.pdf", size: 0 } : application.graduation_cert_path ? { name: "Yüklü_Diploma.pdf", size: 0 } : undefined}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-700 block">Adli Sicil {application.criminal_record_path ? "✓" : "*"}</label>
                      <FileUpload
                        accept=".pdf,.doc,.docx"
                        maxSizeMB={50}
                        onUpload={(file) => handleFileUpload(file, "criminal_record_path")}
                        onRemove={() => setFormData(prev => ({ ...prev, criminal_record_path: "" }))}
                        currentFile={formData.criminal_record_path ? { name: formData.criminal_record_path.split("/").pop() || "Adli_Sicil_Belgesi.pdf", size: 0 } : application.criminal_record_path ? { name: "Yüklü_Adli_Sicil.pdf", size: 0 } : undefined}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-gray-200/50">
                    <button
                      type="button"
                      onClick={handleDocUpdateSubmit}
                      disabled={updateDocsMutation.isPending}
                      className="px-6 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 font-bold transition-all shadow-md text-sm disabled:opacity-50"
                    >
                      {updateDocsMutation.isPending ? "Kaydediliyor..." : "Belgeleri Kaydet"}
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-6 flex justify-center gap-4">
                {application.status === "rejected" && (
                  <button
                    onClick={() => setResubmitting(true)}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg font-bold transition-all"
                  >
                    Bilgileri Düzenle ve Yeniden Başvur
                  </button>
                )}
                <button
                  onClick={() => router.push("/")}
                  className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-bold transition-all"
                >
                  Ana Sayfaya Dön
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-gray-100 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-80 h-80 bg-teal-50/60 rounded-full blur-3xl -z-10"></div>
              <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-orange-50/60 rounded-full blur-3xl -z-10"></div>

              <div className="text-center max-w-2xl mx-auto mb-12">
                <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Öğretmen Başvuru Formu</h2>
                <p className="text-gray-500 text-sm font-semibold leading-relaxed">
                  Platformumuzda eğitmen olarak kurs açmak ve kazanç elde etmek için lütfen başvuru formunu doldurun.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-12">
                
                {/* GUEST ACCOUNT REGISTRATION FIELDS (Only if not logged in) */}
                {!isAuthenticated && (
                  <div className="space-y-6 bg-teal-50/30 p-6 md:p-8 rounded-2xl border-2 border-teal-500/20">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white text-sm font-bold">🔑</div>
                      <h3 className="text-xl font-bold text-gray-900">Hesap Kayıt Bilgileri</h3>
                    </div>
                    <p className="text-xs text-teal-800 font-semibold leading-normal">
                      Başvurunuz gönderildiğinde bu bilgilerle otomatik olarak üyeliğiniz oluşturulacak ve hesabınız açılacaktır.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Adı Soyadı *</label>
                        <input
                          type="text"
                          name="full_name"
                          value={accountData.full_name}
                          onChange={handleAccountChange}
                          required
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-medium text-gray-900 bg-white"
                          placeholder="Adınızı ve soyadınızı yazın"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">E-posta Adresi *</label>
                        <input
                          type="email"
                          name="email"
                          value={accountData.email}
                          onChange={handleAccountChange}
                          required
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-medium text-gray-900 bg-white"
                          placeholder="ornek@email.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Şifre *</label>
                        <input
                          type="password"
                          name="password"
                          value={accountData.password}
                          onChange={handleAccountChange}
                          required
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-medium text-gray-900 bg-white"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* SECTION 1: Kişisel Bilgiler */}
                <div className="space-y-6 bg-slate-50/50 p-6 md:p-8 rounded-2xl border border-gray-200/50">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-pink-500 flex items-center justify-center text-white text-sm font-bold">👤</div>
                    <h3 className="text-xl font-bold text-gray-900">Kişisel Bilgiler</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {isAuthenticated && (
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">İsim ve Soyisim *</label>
                        <input
                          type="text"
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-medium text-gray-900 bg-white"
                          placeholder="İsim ve soyisminizi yazın"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Telefon Numarası *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-medium text-gray-900 bg-white"
                        placeholder="0555 555 5555"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Doğum Tarihi *</label>
                      <input
                        type="date"
                        name="birth_date"
                        value={formData.birth_date}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-medium text-gray-900 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Cinsiyet *</label>
                      <div className="flex gap-6 mt-3">
                        {["Kadın", "Erkek"].map((g) => (
                          <label key={g} className="flex items-center gap-2 font-semibold text-gray-700 cursor-pointer">
                            <input
                              type="radio"
                              name="gender"
                              value={g}
                              checked={formData.gender === g}
                              onChange={handleInputChange}
                              className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                            />
                            {g}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Adres *</label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        rows={2}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-medium text-gray-900 resize-none bg-white"
                        placeholder="Adresinizi detaylıca yazın..."
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 2: Eğitim Bilgileri */}
                <div className="space-y-6 bg-slate-50/50 p-6 md:p-8 rounded-2xl border border-gray-200/50">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white text-sm font-bold">🎓</div>
                    <h3 className="text-xl font-bold text-gray-900">Eğitim Bilgileri</h3>
                  </div>

                  <div className="space-y-4">
                    {/* Branches Checklist */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">Branş *</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        {BRANCH_OPTIONS.map((branch) => (
                          <button
                            key={branch}
                            type="button"
                            onClick={() => handleBranchToggle(branch)}
                            className={`px-4 py-3 rounded-xl border text-sm font-semibold text-left transition-all ${
                              selectedBranches.includes(branch)
                                ? "bg-teal-500 border-teal-500 text-white shadow-md shadow-teal-500/10"
                                : "bg-white border-gray-200 text-gray-700 hover:border-teal-200"
                            }`}
                          >
                            <span className="mr-2">{selectedBranches.includes(branch) ? "✓" : "☐"}</span>
                            {branch}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Levels Checklist */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">Kademe *</label>
                      <div className="flex flex-wrap gap-3">
                        {LEVEL_OPTIONS.map((level) => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => handleLevelToggle(level)}
                            className={`px-6 py-3 rounded-xl border text-sm font-semibold transition-all ${
                              selectedLevels.includes(level)
                                ? "bg-teal-500 border-teal-500 text-white shadow-md"
                                : "bg-white border-gray-200 text-gray-700 hover:border-teal-200"
                            }`}
                          >
                            <span className="mr-2">{selectedLevels.includes(level) ? "✓" : "☐"}</span>
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      {/* Experience Dropdown */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Deneyim Yılı *</label>
                        <select
                          name="experience_years"
                          value={formData.experience_years}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-medium text-gray-900 bg-white"
                        >
                          <option value={1}>1-3 Yıl</option>
                          <option value={3}>3-5 Yıl</option>
                          <option value={5}>5-10 Yıl</option>
                          <option value={10}>10+ Yıl</option>
                        </select>
                      </div>
                    </div>

                    {/* Bio Textarea */}
                    <div className="pt-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Kendinizi Tanıtınız (Biyografi) *</label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        required
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-medium text-gray-900 resize-none bg-white"
                        placeholder="Eğitim tarzınız, geçmişiniz ve kendiniz hakkında..."
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 3: Diğer Bilgiler */}
                <div className="space-y-6 bg-slate-50/50 p-6 md:p-8 rounded-2xl border border-gray-200/50">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white text-sm font-bold">ℹ️</div>
                    <h3 className="text-xl font-bold text-gray-900">Diğer Bilgiler</h3>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">bihocam.com'dan nasıl haberdar oldunuz? *</label>
                    <select
                      name="heard_from"
                      value={formData.heard_from}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-medium text-gray-900 bg-white"
                    >
                      <option value="Google Aramalar">Google Aramalar</option>
                      <option value="Sosyal Medya">Sosyal Medya</option>
                      <option value="Öğretmen Arkadaşların Tavsiyesi">Öğretmen Arkadaşların Tavsiyesi</option>
                      <option value="Reklamlar">Reklamlar</option>
                      <option value="Diğer">Diğer</option>
                    </select>
                  </div>
                </div>

                {/* SECTION 4: Gerekli Evrak Yüklemeleri (Opsiyonel / İsteğe Bağlı) */}
                <div className="space-y-6 bg-slate-50/50 p-6 md:p-8 rounded-2xl border border-gray-200/50">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white text-sm font-bold">📂</div>
                    <h3 className="text-xl font-bold text-gray-900">Evrak Yükleme (İsteğe Bağlı)</h3>
                  </div>
                  <p className="text-xs text-blue-800 font-semibold leading-normal">
                    Evrak yüklemek ilk aşamada zorunlu değildir. Ancak hesabınızın onaylanabilmesi için daha sonra profilinizden bu belgeleri yüklemeniz gerekecektir.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Özgeçmiş CV */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">Özgeçmiş (CV)</label>
                      <FileUpload
                        accept=".pdf,.doc,.docx"
                        maxSizeMB={50}
                        onUpload={(file) => handleFileUpload(file, "cv_path")}
                        onRemove={() => setFormData(prev => ({ ...prev, cv_path: "" }))}
                        currentFile={formData.cv_path ? { name: formData.cv_path.split("/").pop() || "Özgeçmiş.pdf", size: 0 } : undefined}
                        disabled={!isAuthenticated}
                      />
                      {!isAuthenticated && <p className="text-[10px] text-orange-600 font-semibold">Kayıt olduktan sonra yükleyebilirsiniz</p>}
                    </div>

                    {/* Mezuniyet Belgesi */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">Mezuniyet Belgesi</label>
                      <FileUpload
                        accept=".pdf,.doc,.docx"
                        maxSizeMB={50}
                        onUpload={(file) => handleFileUpload(file, "graduation_cert_path")}
                        onRemove={() => setFormData(prev => ({ ...prev, graduation_cert_path: "" }))}
                        currentFile={formData.graduation_cert_path ? { name: formData.graduation_cert_path.split("/").pop() || "Mezuniyet_Belgesi.pdf", size: 0 } : undefined}
                        disabled={!isAuthenticated}
                      />
                      {!isAuthenticated && <p className="text-[10px] text-orange-600 font-semibold">Kayıt olduktan sonra yükleyebilirsiniz</p>}
                    </div>

                    {/* Adli Sicil Belgesi */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">Adli Sicil Belgesi</label>
                      <FileUpload
                        accept=".pdf,.doc,.docx"
                        maxSizeMB={50}
                        onUpload={(file) => handleFileUpload(file, "criminal_record_path")}
                        onRemove={() => setFormData(prev => ({ ...prev, criminal_record_path: "" }))}
                        currentFile={formData.criminal_record_path ? { name: formData.criminal_record_path.split("/").pop() || "Adli_Sicil_Belgesi.pdf", size: 0 } : undefined}
                        disabled={!isAuthenticated}
                      />
                      {!isAuthenticated && <p className="text-[10px] text-orange-600 font-semibold">Kayıt olduktan sonra yükleyebilirsiniz</p>}
                    </div>
                  </div>
                </div>

                {/* SECTION 5: Şartlar ve Onaylar */}
                <div className="space-y-4 bg-slate-50/50 p-6 md:p-8 rounded-2xl border border-gray-200/50">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span className="text-red-500">⚠</span> Şartlar ve Onaylar
                  </h3>
                  
                  <div className="space-y-3">
                    {[
                      { key: "ageLimit", label: "18 yaşından büyük olduğumu onaylıyorum. *" },
                      { key: "allTerms", label: "Tüm hüküm, koşul ve veri koruma kanunu yönergelerini kabul ediyorum. *" },
                      { key: "agreement", label: "Üyelik Sözleşmesini okudum ve kabul ediyorum. *" },
                      { key: "sales", label: "Mesafeli Satış Sözleşmesini okudum ve kabul ediyorum. *" },
                      { key: "kvkk", label: "KVKK Aydınlatma Metnini okudum ve kabul ediyorum. *" },
                      { key: "privacy", label: "Gizlilik ve Çerez Politikasını okudum ve kabul ediyorum. *" },
                    ].map((term) => (
                      <label key={term.key} className="flex items-start gap-3 text-sm font-semibold text-gray-600 cursor-pointer hover:text-gray-900">
                        <input
                          type="checkbox"
                          checked={terms[term.key as keyof typeof terms]}
                          onChange={() => handleCheckboxChange(term.key as keyof typeof terms)}
                          className="mt-1 w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                        />
                        {term.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={submitMutation.isPending}
                    className="px-8 py-3.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:shadow-lg font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitMutation.isPending ? "Gönderiliyor..." : "Kaydol ve Başvuruyu Tamamla"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
