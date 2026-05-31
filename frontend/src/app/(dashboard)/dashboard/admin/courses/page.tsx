"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { 
  coursesApi, 
  categoriesApi, 
  Category,
  teacherApplicationsApi
} from "@/lib/api";

interface Course {
  id: string;
  title: string;
  slug: string;
  price: number;
  discount_price: number | null;
  status: "draft" | "pending_review" | "published" | "rejected";
  teacher?: { id: string; full_name: string; email?: string } | null;
  categories?: Category[];
  created_at?: string;
  description?: string;
  thumbnail_path: string | null;
}

export default function AdminCourseManagementPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCat, setFilterCat] = useState("all");

  // Edit State
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formFields, setFormFields] = useState({
    title: "",
    slug: "",
    price: 0,
    discount_price: 0,
    status: "draft" as "draft" | "pending_review" | "published" | "rejected",
    description: "",
    category_ids: [] as string[],
    thumbnail_path: "",
  });

  // Fetch all courses and categories
  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesData, categoriesData] = await Promise.all([
        coursesApi.listAllAdmin(),
        categoriesApi.list({ is_active: true })
      ]);
      setCourses(coursesData as any[]);
      setCategories(categoriesData);
    } catch (error) {
      toast.error("Veriler yüklenirken hata oluştu");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const res = await teacherApplicationsApi.uploadImage(file);
      const url = res.url || res.path;
      setFormFields(prev => ({ ...prev, thumbnail_path: url }));
      toast.success("Kurs resmi başarıyla yüklendi!");
    } catch (error) {
      toast.error("Görsel yüklenirken hata oluştu");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  // Open Edit Dialog
  const handleOpenEdit = (course: Course) => {
    setEditingCourse(course);
    setFormFields({
      title: course.title,
      slug: course.slug,
      price: course.price,
      discount_price: course.discount_price || 0,
      status: course.status,
      description: course.description || "",
      category_ids: course.categories?.map(c => c.id) || [],
      thumbnail_path: course.thumbnail_path || "",
    });
  };

  // Close Edit Dialog
  const handleCloseEdit = () => {
    setEditingCourse(null);
  };

  // Save changes
  const handleSave = async () => {
    if (!editingCourse) return;
    if (!formFields.title || !formFields.slug) {
      toast.error("Başlık ve URL alanları boş bırakılamaz");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        title: formFields.title,
        description: formFields.description,
        price: Number(formFields.price),
        discount_price: formFields.discount_price > 0 ? Number(formFields.discount_price) : null,
        status: formFields.status,
        category_ids: formFields.category_ids,
        thumbnail_path: formFields.thumbnail_path || null,
      };

      await coursesApi.update(editingCourse.id, payload);
      toast.success("Kurs başarıyla güncellendi");
      handleCloseEdit();
      fetchData();
    } catch (error: any) {
      const msg = error.response?.data?.detail || "Kurs güncellenirken hata oluştu";
      toast.error(msg);
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  // Quick action: Approve (Publish) course
  const handleApprove = async (id: string) => {
    try {
      await coursesApi.update(id, { status: "published" });
      toast.success("Eğitim başarıyla onaylandı ve yayınlandı!");
      fetchData();
    } catch (error) {
      toast.error("Eğitim onaylanırken bir hata oluştu.");
    }
  };

  // Quick action: Reject course
  const handleReject = async (id: string) => {
    const note = window.prompt("Lütfen reddetme gerekçesini yazınız:");
    if (note === null) return; // cancelled
    try {
      await coursesApi.update(id, { status: "rejected" });
      toast.success("Eğitim başvurusu reddedildi.");
      fetchData();
    } catch (error) {
      toast.error("İşlem gerçekleştirilemedi.");
    }
  };

  // Delete course
  const handleDelete = async (id: string) => {
    if (!window.confirm("Bu eğitimi kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz!")) {
      return;
    }

    try {
      await coursesApi.delete(id);
      toast.success("Eğitim başarıyla silindi");
      fetchData();
    } catch (error) {
      toast.error("Eğitim silinirken bir hata oluştu.");
    }
  };

  // Multi-select categories helper
  const handleToggleCategory = (catId: string) => {
    const current = [...formFields.category_ids];
    if (current.includes(catId)) {
      setFormFields({
        ...formFields,
        category_ids: current.filter(id => id !== catId),
      });
    } else {
      setFormFields({
        ...formFields,
        category_ids: [...current, catId],
      });
    }
  };

  // Filter courses
  const filteredCourses = useMemo(() => {
    return courses.filter(c => {
      const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || 
                          c.teacher?.full_name?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === "all" || c.status === filterStatus;
      const matchCat = filterCat === "all" || c.categories?.some(cat => cat.id === filterCat);
      return matchSearch && matchStatus && matchCat;
    });
  }, [courses, search, filterStatus, filterCat]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: courses.length,
      published: courses.filter(c => c.status === "published").length,
      pending: courses.filter(c => c.status === "pending_review").length,
      draft: courses.filter(c => c.status === "draft").length,
    };
  }, [courses]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-teal-500/10">
            📚
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Kurs Yönetimi</h1>
            <p className="text-sm text-gray-500 font-medium">Platformdaki tüm eğitmen kurslarını, onayları ve içerikleri yönetin</p>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Toplam Eğitim", value: stats.total, color: "from-teal-500 to-emerald-500", icon: "📚" },
          { label: "Yayınlananlar", value: stats.published, color: "from-blue-500 to-indigo-500", icon: "✅" },
          { label: "Onay Bekleyenler", value: stats.pending, color: "from-amber-500 to-orange-500", icon: "⏳" },
          { label: "Taslaklar", value: stats.draft, color: "from-slate-400 to-slate-500", icon: "📝" },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between hover:shadow-md transition-all">
            <div>
              <p className="text-2xl font-black text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 font-bold mt-1 uppercase tracking-wider">{stat.label}</p>
            </div>
            <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-xl shadow-lg flex-shrink-0 text-white`}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Controls & Search */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Kurs başlığı veya eğitmen adı ile ara..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm shadow-sm"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-4 py-3.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-semibold text-gray-700 shadow-sm cursor-pointer"
        >
          <option value="all">Tüm Durumlar</option>
          <option value="published">Yayında</option>
          <option value="pending_review">Onay Bekliyor</option>
          <option value="draft">Taslak</option>
          <option value="rejected">Reddedildi</option>
        </select>
        <select
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
          className="px-4 py-3.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-semibold text-gray-700 shadow-sm cursor-pointer"
        >
          <option value="all">Tüm Kategoriler</option>
          {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
        </select>
      </div>

      {/* Courses List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Eğitim Detayı</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Eğitmen</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Kategoriler</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Fiyat</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Durum</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredCourses.map(course => (
                  <tr key={course.id} className="hover:bg-gray-50/40 transition-colors">
                    <td className="px-6 py-5">
                      <div>
                        <p className="font-bold text-gray-900 text-sm leading-snug">{course.title}</p>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">/{course.slug}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-semibold text-gray-700">
                      {course.teacher?.full_name || "Bilinmeyen Eğitmen"}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-1">
                        {course.categories && course.categories.length > 0 ? (
                          course.categories.map(cat => (
                            <span key={cat.id} className="px-2 py-1 bg-teal-50 text-teal-700 text-[10px] font-bold rounded-md border border-teal-100">
                              {cat.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400 font-medium">Kategori Yok</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="font-extrabold text-gray-900 text-sm">₺{course.price}</p>
                      {course.discount_price && (
                        <p className="text-xs text-gray-400 line-through">₺{course.discount_price}</p>
                      )}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full uppercase tracking-wider ${
                        course.status === "published" ? "bg-emerald-100 text-emerald-800" :
                        course.status === "pending_review" ? "bg-amber-100 text-amber-800 animate-pulse" :
                        course.status === "draft" ? "bg-slate-100 text-slate-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {course.status === "published" ? "Yayında" :
                         course.status === "pending_review" ? "Bekliyor" :
                         course.status === "draft" ? "Taslak" : "Reddedildi"}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {course.status === "pending_review" && (
                          <>
                            <button
                              onClick={() => handleApprove(course.id)}
                              className="px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-bold rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
                              title="Onayla ve Yayınla"
                            >
                              Onayla
                            </button>
                            <button
                              onClick={() => handleReject(course.id)}
                              className="px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
                              title="Başvuruyu Reddet"
                            >
                              Reddet
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleOpenEdit(course)}
                          className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-colors cursor-pointer"
                          title="Detayları Düzenle"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(course.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                          title="Kalıcı Olarak Sil"
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

            {filteredCourses.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-25" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p className="text-sm font-semibold">Gösterilecek eğitim kaydı bulunamadı.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Course Modal overlay */}
      {editingCourse && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-gray-900">Eğitimi Düzenle</h3>
                <p className="text-xs text-gray-400 font-semibold mt-0.5">Kurs meta verilerini ve kategorilerini yapılandırın</p>
              </div>
              <button
                onClick={handleCloseEdit}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-200/50 rounded-xl transition-all font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Eğitim Başlığı</label>
                  <input
                    type="text"
                    value={formFields.title}
                    onChange={e => setFormFields({ ...formFields, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">URL Adresi (slug)</label>
                  <input
                    type="text"
                    value={formFields.slug}
                    onChange={e => setFormFields({ ...formFields, slug: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Yayın Durumu</label>
                  <select
                    value={formFields.status}
                    onChange={e => setFormFields({ ...formFields, status: e.target.value as any })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold text-sm"
                  >
                    <option value="draft">Taslak</option>
                    <option value="pending_review">Onay Bekliyor</option>
                    <option value="published">Yayında (Onaylı)</option>
                    <option value="rejected">Reddedildi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Fiyat (₺)</label>
                  <input
                    type="number"
                    value={formFields.price}
                    onChange={e => setFormFields({ ...formFields, price: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">İndirimli Fiyat (₺, Opsiyonel)</label>
                  <input
                    type="number"
                    value={formFields.discount_price || ""}
                    onChange={e => setFormFields({ ...formFields, discount_price: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Açıklama</label>
                  <textarea
                    rows={4}
                    value={formFields.description}
                    onChange={e => setFormFields({ ...formFields, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-sm leading-relaxed resize-none"
                    placeholder="Eğitim hakkında kısa tanıtım metni..."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Kurs Görseli (Kapak Resmi)</label>
                  <div className="flex flex-col sm:flex-row gap-4 items-center bg-gray-50 border border-gray-200 rounded-2xl p-4">
                    {formFields.thumbnail_path ? (
                      <div className="relative w-32 h-20 bg-gray-200 rounded-xl overflow-hidden shadow border border-gray-300/50 flex-shrink-0">
                        <img 
                          src={formFields.thumbnail_path} 
                          alt="Kurs kapağı" 
                          className="w-full h-full object-cover" 
                        />
                        <button
                          type="button"
                          onClick={() => setFormFields({ ...formFields, thumbnail_path: "" })}
                          className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow transition-colors cursor-pointer text-xs flex items-center justify-center w-5 h-5 font-bold"
                          title="Görseli Kaldır"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="w-32 h-20 bg-gray-200 border border-gray-300 rounded-xl flex items-center justify-center text-gray-400 flex-shrink-0 text-xs font-bold">
                        Görsel Yok
                      </div>
                    )}
                    
                    <div className="flex-1 space-y-3 w-full">
                      <div className="flex items-center gap-2">
                        <label className="px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-bold rounded-xl border border-teal-200 cursor-pointer shadow-sm transition-all flex items-center gap-2">
                          {uploading ? (
                            <>
                              <span className="w-3 h-3 border-2 border-teal-700 border-t-transparent rounded-full animate-spin" />
                              Yükleniyor...
                            </>
                          ) : (
                            <>📸 Dosya Seç & Yükle</>
                          )}
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleImageUpload}
                            disabled={uploading}
                          />
                        </label>
                        {formFields.thumbnail_path && <span className="text-xs text-emerald-600 font-bold">✓ Hazır</span>}
                      </div>
                      <input
                        type="text"
                        placeholder="Veya görsel URL'sini buraya yapıştırın..."
                        value={formFields.thumbnail_path}
                        onChange={e => setFormFields({ ...formFields, thumbnail_path: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 bg-white rounded-lg text-xs font-medium focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">İlişkili Kategoriler (Çoklu Seçim)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 border border-gray-200 rounded-xl p-3 bg-gray-50/50 max-h-48 overflow-y-auto">
                    {categories.map(cat => {
                      const isSelected = formFields.category_ids.includes(cat.id);
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handleToggleCategory(cat.id)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-left flex items-center justify-between cursor-pointer ${
                            isSelected ? "bg-teal-50 text-teal-700 border-teal-300" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <span>{cat.name}</span>
                          {isSelected && <span className="text-teal-600">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={handleCloseEdit}
                className="px-5 py-2.5 border border-gray-200 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
              >
                İptal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 bg-gradient-to-r from-teal-50 to-teal-600 bg-teal-600 text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {saving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>✓ Güncellemeleri Kaydet</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
