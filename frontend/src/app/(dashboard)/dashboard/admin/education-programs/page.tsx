"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { 
  educationProgramsApi, 
  EducationProgram, 
  CurriculumSection, 
  FAQ, 
  Review 
} from "@/lib/api";

const CATEGORIES = ["TYT", "AYT", "YKS", "LGS", "YDT", "Diğer"];
const GRADIENTS = [
  { label: "Koyu Gri (Siyah)", value: "from-gray-900 via-gray-800 to-gray-700" },
  { label: "Kraliyet Moru", value: "from-purple-900 via-indigo-800 to-slate-900" },
  { label: "Okyanus Mavisi", value: "from-blue-900 via-cyan-800 to-teal-900" },
  { label: "Gün Batımı Turuncusu", value: "from-orange-700 via-amber-600 to-red-800" },
  { label: "Zümrüt Yeşili", value: "from-teal-900 via-emerald-800 to-slate-900" },
  { label: "Yakut Kırmızısı", value: "from-red-900 via-rose-800 to-slate-900" },
];

type MainTab = "programs" | "add" | "categories";
type BuilderTab = "general" | "learn" | "curriculum" | "faqs" | "reviews";

export default function AdminEducationProgramsPage() {
  return (
    <Suspense fallback={
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AdminEduContent />
    </Suspense>
  );
}

function AdminEduContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const tabParam = searchParams.get("tab") as MainTab | null;
  const validTabs: MainTab[] = ["programs", "add", "categories"];
  const [activeTab, setActiveTab] = useState<MainTab>(tabParam && validTabs.includes(tabParam) ? tabParam : "programs");
  
  const [programs, setPrograms] = useState<EducationProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("Tümü");

  // Rich Content Builder State
  const [builderTab, setBuilderTab] = useState<BuilderTab>("general");
  const [editingProgram, setEditingProgram] = useState<EducationProgram | null>(null);

  // Form State for Add / Edit
  const [formGeneral, setFormGeneral] = useState({
    title: "",
    slug: "",
    category: "TYT",
    gradient: "from-gray-900 via-gray-800 to-gray-700",
    price: 0,
    original_price: 0,
    hours: 0,
    lessons: 0,
    badge: "",
    description: "",
    active: true,
  });

  const [formWhatYouLearn, setFormWhatYouLearn] = useState<string[]>([]);
  const [formCurriculum, setFormCurriculum] = useState<CurriculumSection[]>([]);
  const [formFaqs, setFormFaqs] = useState<FAQ[]>([]);
  const [formReviews, setFormReviews] = useState<Review[]>([]);

  // Fetch Programs
  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const data = await educationProgramsApi.list({ include_inactive: true });
      setPrograms(data);
    } catch (error: any) {
      toast.error("Eğitim programları yüklenirken hata oluştu");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  // Update URL tab when activeTab changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (activeTab === "programs") {
      params.delete("tab");
    } else {
      params.set("tab", activeTab);
    }
    router.replace(`?${params.toString()}`);
  }, [activeTab, router]);

  // Fill forms when editing
  const startEdit = (prog: EducationProgram) => {
    setEditingProgram(prog);
    setFormGeneral({
      title: prog.title,
      slug: prog.slug,
      category: prog.category,
      gradient: prog.gradient || "from-gray-900 via-gray-800 to-gray-700",
      price: prog.price / 100,
      original_price: prog.original_price ? prog.original_price / 100 : 0,
      hours: prog.hours,
      lessons: prog.lessons,
      badge: prog.badge || "",
      description: prog.description || "",
      active: prog.active,
    });
    setFormWhatYouLearn(prog.what_you_learn || []);
    setFormCurriculum(prog.curriculum || []);
    setFormFaqs(prog.faqs || []);
    setFormReviews(prog.reviews || []);
    setBuilderTab("general");
    setActiveTab("add"); // use the add/edit form tab
  };

  // Reset forms for fresh creation
  const startAdd = () => {
    setEditingProgram(null);
    setFormGeneral({
      title: "",
      slug: "",
      category: "TYT",
      gradient: "from-gray-900 via-gray-800 to-gray-700",
      price: 0,
      original_price: 0,
      hours: 0,
      lessons: 0,
      badge: "",
      description: "",
      active: true,
    });
    setFormWhatYouLearn([]);
    setFormCurriculum([]);
    setFormFaqs([]);
    setFormReviews([]);
    setBuilderTab("general");
    setActiveTab("add");
  };

  // Save Program (Create or Update)
  const handleSaveProgram = async () => {
    if (!formGeneral.title || !formGeneral.slug) {
      toast.error("Lütfen başlık ve URL (slug) alanlarını doldurun");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...formGeneral,
        price: Math.round(formGeneral.price * 100),
        original_price: formGeneral.original_price > 0 ? Math.round(formGeneral.original_price * 100) : null,
        what_you_learn: formWhatYouLearn,
        curriculum: formCurriculum,
        faqs: formFaqs,
        reviews: formReviews,
      };

      if (editingProgram) {
        await educationProgramsApi.update(editingProgram.id, payload);
        toast.success("Eğitim programı başarıyla güncellendi");
      } else {
        await educationProgramsApi.create(payload);
        toast.success("Eğitim programı başarıyla oluşturuldu");
      }

      startAdd();
      setActiveTab("programs");
      fetchPrograms();
    } catch (error: any) {
      const errMsg = error.response?.data?.detail || "Program kaydedilirken hata oluştu";
      toast.error(errMsg);
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  // Toggle program active state directly from table
  const handleToggleActive = async (prog: EducationProgram) => {
    try {
      await educationProgramsApi.update(prog.id, { active: !prog.active });
      toast.success(`${prog.title} durumu güncellendi`);
      fetchPrograms();
    } catch (error) {
      toast.error("Durum güncellenirken hata oluştu");
    }
  };

  // Delete program
  const handleDeleteProgram = async (id: string) => {
    if (!window.confirm("Bu eğitim programını silmek istediğinize emin misiniz? Bu işlem geri alınamaz!")) {
      return;
    }

    try {
      await educationProgramsApi.delete(id);
      toast.success("Eğitim programı başarıyla silindi");
      fetchPrograms();
    } catch (error) {
      toast.error("Program silinirken hata oluştu");
    }
  };

  // Dynamic content list helper functions
  const addLearnItem = () => setFormWhatYouLearn([...formWhatYouLearn, ""]);
  const removeLearnItem = (idx: number) => setFormWhatYouLearn(formWhatYouLearn.filter((_, i) => i !== idx));
  const updateLearnItem = (idx: number, val: string) => {
    const next = [...formWhatYouLearn];
    next[idx] = val;
    setFormWhatYouLearn(next);
  };

  const addFaqItem = () => setFormFaqs([...formFaqs, { q: "", a: "" }]);
  const removeFaqItem = (idx: number) => setFormFaqs(formFaqs.filter((_, i) => i !== idx));
  const updateFaqItem = (idx: number, field: "q" | "a", val: string) => {
    const next = [...formFaqs];
    next[idx] = { ...next[idx], [field]: val };
    setFormFaqs(next);
  };

  const addReviewItem = () => setFormReviews([...formReviews, { name: "", score: 5, role: "Öğrenci", text: "", date: "Bugün" }]);
  const removeReviewItem = (idx: number) => setFormReviews(formReviews.filter((_, i) => i !== idx));
  const updateReviewItem = (idx: number, field: keyof Review, val: any) => {
    const next = [...formReviews];
    next[idx] = { ...next[idx], [field]: val };
    setFormReviews(next);
  };

  // Curriculum functions
  const addCurriculumSection = () => {
    setFormCurriculum([...formCurriculum, { title: "", lessonCount: 0, duration: "", items: [] }]);
  };
  const removeCurriculumSection = (sIdx: number) => {
    setFormCurriculum(formCurriculum.filter((_, i) => i !== sIdx));
  };
  const updateCurriculumSection = (sIdx: number, field: keyof CurriculumSection, val: any) => {
    const next = [...formCurriculum];
    next[sIdx] = { ...next[sIdx], [field]: val } as CurriculumSection;
    setFormCurriculum(next);
  };
  const addCurriculumLesson = (sIdx: number) => {
    const next = [...formCurriculum];
    next[sIdx].items = [...next[sIdx].items, ""];
    next[sIdx].lessonCount = next[sIdx].items.length;
    setFormCurriculum(next);
  };
  const removeCurriculumLesson = (sIdx: number, lIdx: number) => {
    const next = [...formCurriculum];
    next[sIdx].items = next[sIdx].items.filter((_, i) => i !== lIdx);
    next[sIdx].lessonCount = next[sIdx].items.length;
    setFormCurriculum(next);
  };
  const updateCurriculumLesson = (sIdx: number, lIdx: number, val: string) => {
    const next = [...formCurriculum];
    next[sIdx].items[lIdx] = val;
    setFormCurriculum(next);
  };

  const filtered = programs.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.slug.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "Tümü" || p.category === filterCat;
    return matchSearch && matchCat;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Top Heading */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/20 text-white font-bold text-xl">
            🎓
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Eğitim Programları Portalı</h1>
            <p className="text-sm text-gray-500 font-medium">Bütünsel müfredatları, FAQ'ları ve öğrenci yorumlarını zengin bir şekilde yönetin</p>
          </div>
        </div>

        {activeTab === "programs" && (
          <button
            onClick={startAdd}
            className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-xl hover:shadow-teal-500/20 hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            ➕ Yeni Program Ekle
          </button>
        )}
      </div>

      {/* Main Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-8 w-fit">
        <button
          onClick={() => { setActiveTab("programs"); setEditingProgram(null); }}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${activeTab === "programs" ? "bg-white text-teal-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          🎓 Programlar ({programs.length})
        </button>
        <button
          onClick={startAdd}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${activeTab === "add" && !editingProgram ? "bg-white text-teal-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          ➕ {editingProgram ? `Düzenle: ${editingProgram.title.slice(0, 20)}...` : "Yeni Program Ekle"}
        </button>
      </div>

      {/* ── 1. MAIN TAB: PROGRAMS TABLE ── */}
      {activeTab === "programs" && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Başlığa veya URL'ye göre program ara..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm shadow-sm"
              />
            </div>
            <select
              value={filterCat}
              onChange={e => setFilterCat(e.target.value)}
              className="px-4 py-3.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-semibold text-gray-700 shadow-sm"
            >
              <option value="Tümü">Tüm Kategoriler</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Table content */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Eğitim Programı</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Kategori</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Detaylar</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Fiyat</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Durum</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(prog => (
                    <tr key={prog.id} className="hover:bg-gray-50/40 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${prog.gradient || "from-gray-900 to-gray-700"} flex items-center justify-center shadow-md flex-shrink-0 text-white font-bold text-sm`}>
                            {prog.category[0]}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm hover:text-teal-600 transition-colors">
                              {prog.title}
                            </p>
                            <p className="text-xs text-gray-400 font-mono mt-0.5">/{prog.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-3 py-1.5 bg-teal-50 text-teal-700 text-xs font-bold rounded-lg border border-teal-100">
                          {prog.category}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-xs text-gray-500 space-y-0.5 font-medium">
                          <p>⏱ {prog.hours} saat · 📚 {prog.lessons} ders</p>
                          <p>🤖 {prog.what_you_learn?.length || 0} kazanım · ❓ {prog.faqs?.length || 0} SSS</p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div>
                          <p className="font-extrabold text-gray-900 text-sm">{(prog.price / 100).toLocaleString("tr-TR")} TL</p>
                          {prog.original_price && (
                            <p className="text-xs text-gray-400 line-through">{(prog.original_price / 100).toLocaleString("tr-TR")} TL</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <button
                          onClick={() => handleToggleActive(prog)}
                          className={`relative w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer inline-block ${prog.active ? "bg-teal-500" : "bg-gray-300"}`}
                        >
                          <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${prog.active ? "left-6" : "left-0.5"}`} />
                        </button>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => startEdit(prog)}
                            className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-colors cursor-pointer"
                            title="Tüm İçeriği Düzenle"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <Link
                            href={`/egitim-programlari/${prog.slug}`}
                            target="_blank"
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                            title="Sitede Görüntüle"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                          <button
                            onClick={() => handleDeleteProgram(prog.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                            title="Programı Sil"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!loading && filtered.length === 0 && (
                <div className="text-center py-20 text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-25" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <p className="text-sm font-semibold">Aradığınız kriterlere uygun program bulunamadı.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── 2. MAIN TAB: RICH PROGRAM BUILDER (ADD/EDIT) ── */}
      {activeTab === "add" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Builder Title Bar */}
          <div className="bg-gray-50 border-b border-gray-100 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-gray-900">
                {editingProgram ? `📝 Programı Düzenle: ${editingProgram.title}` : "➕ Yeni Zengin Eğitim Programı Oluştur"}
              </h2>
              <p className="text-xs text-gray-400 font-medium mt-1">Lütfen aşağıdaki sekmeleri takip ederek program içeriğini zenginleştirin</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { startAdd(); setActiveTab("programs"); }}
                className="px-5 py-2.5 border border-gray-200 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
              >
                İptal
              </button>
              <button
                onClick={handleSaveProgram}
                disabled={saving}
                className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-teal-500/10 hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {saving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>✓ {editingProgram ? "Değişiklikleri Kaydet" : "Programı Yayınla"}</>
                )}
              </button>
            </div>
          </div>

          {/* Builder Navigation Sub-Tabs */}
          <div className="flex border-b border-gray-100 bg-gray-50/20 overflow-x-auto whitespace-nowrap">
            {[
              { id: "general" as BuilderTab, label: "1. Genel Bilgiler", icon: "⚙️" },
              { id: "learn" as BuilderTab, label: "2. Neler Öğreneceksiniz?", icon: "💡" },
              { id: "curriculum" as BuilderTab, label: "3. Müfredat", icon: "📚" },
              { id: "faqs" as BuilderTab, label: "4. Soru & Cevap (SSS)", icon: "❓" },
              { id: "reviews" as BuilderTab, label: "5. Öğrenci Yorumları", icon: "💬" },
            ].map(sub => (
              <button
                key={sub.id}
                onClick={() => setBuilderTab(sub.id)}
                className={`flex items-center gap-2 px-6 py-4.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${builderTab === sub.id ? "border-teal-500 text-teal-600 bg-white" : "border-transparent text-gray-500 hover:text-gray-900"}`}
              >
                <span>{sub.icon}</span>
                {sub.label}
              </button>
            ))}
          </div>

          {/* Builder Body Panels */}
          <div className="p-6">
            
            {/* ── PANEL 1: GENERAL INFO ── */}
            {builderTab === "general" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Program Başlığı</label>
                    <input
                      type="text"
                      placeholder="TYT Tüm Dersler Eğitim Programı"
                      value={formGeneral.title}
                      onChange={e => setFormGeneral({ ...formGeneral, title: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">URL Adresi (slug)</label>
                    <input
                      type="text"
                      placeholder="tyt-tum-dersler"
                      value={formGeneral.slug}
                      onChange={e => setFormGeneral({ ...formGeneral, slug: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Fiyat (TL)</label>
                    <input
                      type="number"
                      placeholder="6499.50"
                      value={formGeneral.price || ""}
                      onChange={e => setFormGeneral({ ...formGeneral, price: Number(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">İndirim Öncesi Fiyat (TL, Opsiyonel)</label>
                    <input
                      type="number"
                      placeholder="8999.50"
                      value={formGeneral.original_price || ""}
                      onChange={e => setFormGeneral({ ...formGeneral, original_price: Number(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Toplam Süre (Saat)</label>
                    <input
                      type="number"
                      placeholder="280"
                      value={formGeneral.hours || ""}
                      onChange={e => setFormGeneral({ ...formGeneral, hours: Number(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Toplam Ders Sayısı</label>
                    <input
                      type="number"
                      placeholder="420"
                      value={formGeneral.lessons || ""}
                      onChange={e => setFormGeneral({ ...formGeneral, lessons: Number(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Kategori</label>
                    <select
                      value={formGeneral.category}
                      onChange={e => setFormGeneral({ ...formGeneral, category: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Rozet (Örn: "En Çok Satan")</label>
                    <input
                      type="text"
                      placeholder="Yeni, Popüler..."
                      value={formGeneral.badge}
                      onChange={e => setFormGeneral({ ...general => ({ ...general, badge: e.target.value }) })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Kart Tasarımı (Renk Gradyanı)</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {GRADIENTS.map(grad => (
                        <button
                          key={grad.value}
                          type="button"
                          onClick={() => setFormGeneral({ ...formGeneral, gradient: grad.value })}
                          className={`p-4 rounded-xl border text-left flex flex-col justify-between h-24 transition-all cursor-pointer ${formGeneral.gradient === grad.value ? "border-teal-500 ring-2 ring-teal-500/20" : "border-gray-200 hover:border-gray-300"}`}
                        >
                          <span className="text-xs font-bold text-gray-600 leading-tight">{grad.label}</span>
                          <div className={`h-4 w-full rounded bg-gradient-to-r ${grad.value} shadow-inner`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Program Tanıtım Açıklaması</label>
                    <textarea
                      rows={5}
                      placeholder="Bu eğitim programının kapsamını, hedeflerini detaylı bir şekilde açıklayın..."
                      value={formGeneral.description}
                      onChange={e => setFormGeneral({ ...formGeneral, description: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none font-medium text-sm leading-relaxed"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <button
                    type="button"
                    onClick={() => setFormGeneral({ ...formGeneral, active: !formGeneral.active })}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer ${formGeneral.active ? "bg-teal-500" : "bg-gray-300"}`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${formGeneral.active ? "left-6" : "left-0.5"}`} />
                  </button>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Program Durumu</p>
                    <p className="text-xs text-gray-500 font-medium">Bu program kamu kataloğunda görüntülensin mi?</p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setBuilderTab("learn")}
                    className="px-6 py-3 bg-teal-50 text-teal-700 text-sm font-bold rounded-xl hover:bg-teal-100 transition-colors cursor-pointer"
                  >
                    Kazanımlara Geç ➔
                  </button>
                </div>
              </div>
            )}

            {/* ── PANEL 2: WHAT YOU LEARN ── */}
            {builderTab === "learn" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Bu Eğitimde Neler Öğreneceksiniz?</h3>
                  <p className="text-xs text-gray-500 font-medium">Öğrencilerin eğitim detay sayfasında yeşil check işaretleriyle göreceği hedefleri ve kazanımları yazın.</p>
                </div>

                <div className="space-y-3">
                  {formWhatYouLearn.map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                      <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0 text-teal-600 font-bold border border-teal-100 text-sm">
                        ✓
                      </div>
                      <input
                        type="text"
                        placeholder="Örn: Limit ve süreklilik konularındaki tüm soru tiplerinde uzmanlaşma."
                        value={item}
                        onChange={e => updateLearnItem(idx, e.target.value)}
                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeLearnItem(idx)}
                        className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-red-100"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}

                  {formWhatYouLearn.length === 0 && (
                    <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
                      Henüz hiçbir öğrenim kazanımı eklemediniz.
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={addLearnItem}
                    className="w-full py-3 border-2 border-dashed border-teal-200 text-teal-600 font-bold text-sm rounded-xl hover:bg-teal-50/30 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    ➕ Yeni Kazanım Maddesi Ekle
                  </button>
                </div>

                <div className="flex justify-between pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setBuilderTab("general")}
                    className="px-6 py-3 border border-gray-200 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    ⬅ Genel Bilgiler
                  </button>
                  <button
                    type="button"
                    onClick={() => setBuilderTab("curriculum")}
                    className="px-6 py-3 bg-teal-50 text-teal-700 text-sm font-bold rounded-xl hover:bg-teal-100 transition-colors cursor-pointer"
                  >
                    Müfredat Planına Geç ➔
                  </button>
                </div>
              </div>
            )}

            {/* ── PANEL 3: CURRICULUM ── */}
            {builderTab === "curriculum" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Eğitim Müfredat Modülleri</h3>
                  <p className="text-xs text-gray-500 font-medium">Programın bölümlerini ve her bölümün altındaki derslerin listelerini dinamik olarak oluşturun.</p>
                </div>

                <div className="space-y-4">
                  {formCurriculum.map((section, sIdx) => (
                    <div key={sIdx} className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-4 shadow-sm relative">
                      <button
                        type="button"
                        onClick={() => removeCurriculumSection(sIdx)}
                        className="absolute top-4 right-4 text-xs font-bold text-red-500 hover:text-red-700 cursor-pointer"
                      >
                        Bölümü Sil ✕
                      </button>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-gray-500 mb-1">Bölüm / Modül Başlığı</label>
                          <input
                            type="text"
                            placeholder="Örn: Bölüm 1 - Sayılar ve İşlemler"
                            value={section.title}
                            onChange={e => updateCurriculumSection(sIdx, "title", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm font-bold focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Toplam Süre (Örn: "80 Saat")</label>
                          <input
                            type="text"
                            placeholder="Örn: 80 saat"
                            value={section.duration}
                            onChange={e => updateCurriculumSection(sIdx, "duration", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm font-medium focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Nested Lessons */}
                      <div className="space-y-2 bg-white rounded-xl p-4 border border-gray-100">
                        <p className="text-xs font-black text-gray-600 mb-2">Dersler & Konular ({section.items.length} ders)</p>
                        
                        {section.items.map((lesson, lIdx) => (
                          <div key={lIdx} className="flex gap-2">
                            <span className="text-xs text-gray-400 font-mono flex items-center justify-center w-6">
                              {lIdx + 1}.
                            </span>
                            <input
                              type="text"
                              placeholder="Örn: Sayılar ve İşlemlere Giriş"
                              value={lesson}
                              onChange={e => updateCurriculumLesson(sIdx, lIdx, e.target.value)}
                              className="flex-1 px-3 py-1.5 border border-gray-100 rounded-lg bg-gray-50 text-xs font-semibold focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => removeCurriculumLesson(sIdx, lIdx)}
                              className="text-red-500 hover:bg-red-50 p-1 rounded cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => addCurriculumLesson(sIdx)}
                          className="text-xs font-bold text-teal-600 hover:text-teal-700 cursor-pointer pt-2 flex items-center gap-1"
                        >
                          ➕ Bu Bölüme Yeni Ders Ekle
                        </button>
                      </div>
                    </div>
                  ))}

                  {formCurriculum.length === 0 && (
                    <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
                      Henüz hiçbir ders veya modül eklemediniz.
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={addCurriculumSection}
                    className="w-full py-3 border-2 border-dashed border-teal-200 text-teal-600 font-bold text-sm rounded-xl hover:bg-teal-50/30 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    ➕ Yeni Bölüm / Modül Ekle
                  </button>
                </div>

                <div className="flex justify-between pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setBuilderTab("learn")}
                    className="px-6 py-3 border border-gray-200 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    ⬅ Kazanımlar
                  </button>
                  <button
                    type="button"
                    onClick={() => setBuilderTab("faqs")}
                    className="px-6 py-3 bg-teal-50 text-teal-700 text-sm font-bold rounded-xl hover:bg-teal-100 transition-colors cursor-pointer"
                  >
                    Soru & Cevaplara Geç ➔
                  </button>
                </div>
              </div>
            )}

            {/* ── PANEL 4: FAQs ── */}
            {builderTab === "faqs" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Sıkça Sorulan Sorular</h3>
                  <p className="text-xs text-gray-500 font-medium">Bu eğitim programına özel akordeon menü halinde gösterilecek soru ve cevapları oluşturun.</p>
                </div>

                <div className="space-y-4">
                  {formFaqs.map((faq, idx) => (
                    <div key={idx} className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-3 relative shadow-sm">
                      <button
                        type="button"
                        onClick={() => removeFaqItem(idx)}
                        className="absolute top-4 right-4 text-red-500 hover:text-red-700 cursor-pointer"
                      >
                        Sil ✕
                      </button>

                      <div className="space-y-2">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Soru</label>
                          <input
                            type="text"
                            placeholder="Örn: Bu programa kimler katılmalı?"
                            value={faq.q}
                            onChange={e => updateFaqItem(idx, "q", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm font-bold focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Cevap</label>
                          <textarea
                            rows={2}
                            placeholder="Örn: Kurs, sıfırdan başlayan veya eksiklerini kapatmak isteyen öğrencilere uygundur."
                            value={faq.a}
                            onChange={e => updateFaqItem(idx, "a", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm font-semibold focus:outline-none resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {formFaqs.length === 0 && (
                    <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
                      Henüz hiçbir sıkça sorulan soru eklemediniz.
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={addFaqItem}
                    className="w-full py-3 border-2 border-dashed border-teal-200 text-teal-600 font-bold text-sm rounded-xl hover:bg-teal-50/30 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    ➕ Yeni Soru & Cevap Ekle
                  </button>
                </div>

                <div className="flex justify-between pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setBuilderTab("curriculum")}
                    className="px-6 py-3 border border-gray-200 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    ⬅ Müfredat Planı
                  </button>
                  <button
                    type="button"
                    onClick={() => setBuilderTab("reviews")}
                    className="px-6 py-3 bg-teal-50 text-teal-700 text-sm font-bold rounded-xl hover:bg-teal-100 transition-colors cursor-pointer"
                  >
                    Öğrenci Yorumlarına Geç ➔
                  </button>
                </div>
              </div>
            )}

            {/* ── PANEL 5: REVIEWS ── */}
            {builderTab === "reviews" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Öğrenci Referansları & Yorumları</h3>
                  <p className="text-xs text-gray-500 font-medium">Bu eğitim programına özel gerçekçi veya kurgusal başarılı öğrenci yorumları ekleyin.</p>
                </div>

                <div className="space-y-4">
                  {formReviews.map((rev, idx) => (
                    <div key={idx} className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-3 relative shadow-sm">
                      <button
                        type="button"
                        onClick={() => removeReviewItem(idx)}
                        className="absolute top-4 right-4 text-red-500 hover:text-red-700 cursor-pointer"
                      >
                        Sil ✕
                      </button>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Ad Soyad</label>
                          <input
                            type="text"
                            placeholder="Örn: Mustafa K."
                            value={rev.name}
                            onChange={e => updateReviewItem(idx, "name", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm font-bold focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Puan (1-5)</label>
                          <select
                            value={rev.score}
                            onChange={e => updateReviewItem(idx, "score", Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm font-bold focus:outline-none"
                          >
                            {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Yıldız</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Rol / Tarih</label>
                          <input
                            type="text"
                            placeholder="Örn: Öğrenci (2 gün önce)"
                            value={rev.role}
                            onChange={e => updateReviewItem(idx, "role", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm font-medium focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Yorum Metni</label>
                        <textarea
                          rows={2}
                          placeholder="Örn: Konu anlatımları inanılmaz akıcı, çok verim aldım."
                          value={rev.text}
                          onChange={e => updateReviewItem(idx, "text", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm font-semibold focus:outline-none resize-none"
                        />
                      </div>
                    </div>
                  ))}

                  {formReviews.length === 0 && (
                    <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
                      Henüz hiçbir yorum eklemediniz.
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={addReviewItem}
                    className="w-full py-3 border-2 border-dashed border-teal-200 text-teal-600 font-bold text-sm rounded-xl hover:bg-teal-50/30 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    ➕ Yeni Yorum Ekle
                  </button>
                </div>

                <div className="flex justify-between pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setBuilderTab("faqs")}
                    className="px-6 py-3 border border-gray-200 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    ⬅ Soru & Cevaplar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveProgram}
                    disabled={saving}
                    className="px-8 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-teal-500/20 hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                  >
                    {saving ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Kaydediliyor...
                      </>
                    ) : (
                      <>✓ {editingProgram ? "Değişiklikleri Kaydet" : "Programı Yayınla"}</>
                    )}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ── 3. MAIN TAB: CATEGORIES (PLACEHOLDER ORDER) ── */}
      {activeTab === "categories" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Kategori Sırası</h2>
          <p className="text-xs text-gray-400 mb-6 font-medium">Bu ekranda kategorilerin anasayfa ve portal üzerindeki listelenme sırasını sürükleyip bırakarak veya düğmeler yardımıyla yönetebilirsiniz.</p>
          
          <div className="space-y-2">
            {CATEGORIES.map((cat, i) => (
              <div key={cat} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-200/50 shadow-inner">
                <span className="w-8 h-8 bg-teal-100 text-teal-700 rounded-xl flex items-center justify-center text-xs font-bold shadow-sm">
                  {i + 1}
                </span>
                <span className="font-bold text-gray-900 flex-1">{cat}</span>
                <span className="text-xs text-gray-400 font-bold bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                  {programs.filter(p => p.category === cat && p.active).length} Aktif Program
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
