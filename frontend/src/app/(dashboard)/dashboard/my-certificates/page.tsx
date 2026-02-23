"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Download, Eye, Share2, CheckCircle, Calendar, BookOpen, TrendingUp, ExternalLink } from "lucide-react";
import Link from "next/link";
import { certificatesApi, Certificate } from "@/lib/api";

/**
 * AESTHETIC DIRECTION: Luxury Editorial / Trophy Cabinet
 * 
 * Design Philosophy:
 * - Elegant serif typography mixed with modern sans-serif
 * - Deep jewel tones (emerald, gold, deep blue) for prestige
 * - Asymmetric card layouts with diagonal accents
 * - Generous negative space
 * - Tactile, dimensional shadows suggesting physical certificates
 * - Metallic gold accents for achievement highlights
 * - Magazine-style layout with large imagery
 */

export default function MyCertificatesPage() {
  const [selectedFilter, setSelectedFilter] = useState<"all" | "recent">("all");
  
  const { data: certificates, isLoading } = useQuery({
    queryKey: ["my-certificates"],
    queryFn: () => certificatesApi.getMyCertificates(),
  });

  const handleDownload = async (certificateId: string, certificateNumber: string) => {
    try {
      // Get API base URL from environment or use default
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
      
      // Backend returns HTML, we'll open it in a new window for printing
      const response = await fetch(`${apiBaseUrl}/api/v1/certificates/${certificateId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Sertifika indirilemedi');
      }
      
      const htmlContent = await response.text();
      
      // Create a new window with the HTML content
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Wait for content to load, then trigger print
        setTimeout(() => {
          if (printWindow) {
            printWindow.print();
          }
        }, 500);
      } else {
        alert('Popup engelleyici nedeniyle pencere açılamadı. Lütfen popup engelleyiciyi kapatıp tekrar deneyin.');
      }
    } catch (error) {
      console.error("Sertifika indirme hatası:", error);
      alert('Sertifika indirilemedi. Lütfen tekrar deneyin.');
    }
  };

  const handleShare = (certificate: Certificate) => {
    const shareUrl = `${window.location.origin}/verify-certificate/${certificate.id}`;
    if (navigator.share) {
      navigator.share({
        title: `Sertifika - ${certificate.course_title}`,
        text: `${certificate.course_title} kursunu başarıyla tamamladım!`,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Doğrulama linki kopyalandı!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-emerald-50/30 to-amber-50/30">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto"
          >
            <Award className="w-16 h-16 text-emerald-600" />
          </motion.div>
          <p className="text-lg font-serif text-slate-600">Sertifikalarınız yükleniyor...</p>
        </div>
      </div>
    );
  }

  const filteredCertificates = certificates?.filter((cert) => {
    if (selectedFilter === "recent") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return new Date(cert.issued_at) > thirtyDaysAgo;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-amber-50/30">
      {/* Header Section - Editorial Style */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-800 to-emerald-700">
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-300 to-transparent rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-teal-300 to-transparent rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-6"
          >
            {/* Trophy Icon with Glow */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-block relative"
            >
              <div className="absolute inset-0 bg-amber-400/30 blur-2xl rounded-full animate-pulse" />
              <Award className="w-24 h-24 text-amber-300 relative" strokeWidth={1.5} />
            </motion.div>

            {/* Main Title - Serif Font for Elegance */}
            <div>
              <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-4 tracking-tight">
                Başarı Belgeleri
              </h1>
              <p className="text-xl text-emerald-100 font-light max-w-2xl mx-auto leading-relaxed">
                Tamamladığınız eğitimler ve kazandığınız sertifikalar
              </p>
            </div>

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center gap-8 pt-6"
            >
              <div className="text-center">
                <div className="text-4xl font-bold text-amber-300 mb-1">{certificates?.length || 0}</div>
                <div className="text-sm text-emerald-200 uppercase tracking-wider">Sertifika</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-amber-300 mb-1">
                  {certificates?.reduce((sum, cert) => sum + cert.total_lessons, 0) || 0}
                </div>
                <div className="text-sm text-emerald-200 uppercase tracking-wider">Ders Tamamlandı</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-amber-300 mb-1">
                  {certificates && certificates.length > 0
                    ? Math.round(
                        certificates.reduce((sum, cert) => sum + cert.completion_percentage, 0) /
                          certificates.length
                      )
                    : 0}
                  %
                </div>
                <div className="text-sm text-emerald-200 uppercase tracking-wider">Ortalama Başarı</div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Diagonal Cut */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-br from-slate-50 via-emerald-50/30 to-amber-50/30 transform -skew-y-2 translate-y-1/2" />
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedFilter("all")}
              className={`px-6 py-2.5 rounded-full font-medium transition-all duration-200 ${
                selectedFilter === "all"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              Tümü
            </button>
            <button
              onClick={() => setSelectedFilter("recent")}
              className={`px-6 py-2.5 rounded-full font-medium transition-all duration-200 ${
                selectedFilter === "recent"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              Son 30 Gün
            </button>
          </div>
        </div>
      </div>

      {/* Certificates Grid - Asymmetric Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {filteredCertificates && filteredCertificates.length > 0 ? (
          <AnimatePresence>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCertificates.map((certificate, index) => (
                <motion.div
                  key={certificate.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="group relative"
                >
                  {/* Certificate Card - Premium Design */}
                  <div className="relative bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-100">
                    {/* Decorative Corner Accent */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400 via-amber-300 to-transparent opacity-20 rounded-bl-full transform translate-x-8 -translate-y-8" />
                    
                    {/* Success Badge */}
                    <div className="absolute top-4 left-4 z-10">
                      <div className="flex items-center gap-2 bg-emerald-500 text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                        <CheckCircle className="w-4 h-4" />
                        {certificate.completion_percentage}%
                      </div>
                    </div>

                    {/* Certificate Icon/Visual */}
                    <div className="relative h-48 bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(16,185,129,0.1),transparent_70%)]" />
                      <Award className="w-24 h-24 text-emerald-600 opacity-40" strokeWidth={1} />
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500" />
                    </div>

                    {/* Certificate Details */}
                    <div className="p-6 space-y-4">
                      {/* Course Title - Serif for Elegance */}
                      <h3 className="text-xl font-serif font-bold text-slate-800 line-clamp-2 leading-tight">
                        {certificate.course_title}
                      </h3>

                      {/* Certificate Number - Monospace */}
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                          {certificate.certificate_number}
                        </span>
                      </div>

                      {/* Meta Information */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>{new Date(certificate.issued_at).toLocaleDateString("tr-TR")}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <BookOpen className="w-4 h-4 text-slate-400" />
                          <span>{certificate.completed_lessons} / {certificate.total_lessons} Ders</span>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-slate-100 pt-4">
                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDownload(certificate.id, certificate.certificate_number)}
                            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-2.5 px-4 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                          >
                            <Download className="w-4 h-4" />
                            İndir
                          </button>
                          <button
                            onClick={() => handleShare(certificate)}
                            className="flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-2.5 px-4 rounded-lg hover:bg-slate-200 transition-all duration-200 font-medium"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          <Link
                            href={`/verify-certificate/${certificate.id}`}
                            className="flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-2.5 px-4 rounded-lg hover:bg-slate-200 transition-all duration-200 font-medium"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/0 to-teal-500/0 group-hover:from-emerald-500/5 group-hover:to-teal-500/5 transition-all duration-300 pointer-events-none" />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="max-w-md mx-auto space-y-6">
              <div className="inline-block p-6 bg-white rounded-full shadow-lg">
                <Award className="w-16 h-16 text-slate-300" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-serif font-bold text-slate-800">Henüz Sertifikanız Yok</h3>
              <p className="text-slate-600 leading-relaxed">
                Bir kursu tamamladığınızda otomatik olarak sertifikanız oluşturulacak ve burada görünecek.
              </p>
              <Link
                href="/dashboard/courses"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-3 rounded-full hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
              >
                Kurslarıma Git
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
