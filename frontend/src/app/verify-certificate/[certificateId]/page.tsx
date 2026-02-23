"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Shield, CheckCircle2, XCircle, AlertTriangle, Calendar, Award, User, BookOpen, Lock, Sparkles, Share2, Download, Globe } from "lucide-react";
import { certificatesApi } from "@/lib/api";
import { useParams } from "next/navigation";
import Link from "next/link";

/**
 * AESTHETIC DIRECTION: Premium Shareable Certificate / Social Media Ready
 * 
 * Design Philosophy:
 * - Instagram/Twitter post quality - designed to be shared
 * - Premium, luxury feel with BiHocam branding prominently displayed
 * - Teal-orange gradient palette with sophisticated touches
 * - Large, bold typography for impact
 * - Professional yet celebratory - achievement-focused
 * - Watermark-style branding for authenticity
 * - Optimized for screenshots and social sharing
 * - Memorable visual identity that stands out in feeds
 */

export default function VerifyCertificatePage() {
  const params = useParams();
  const certificateId = params.certificateId as string;

  const { data: verification, isLoading, error } = useQuery({
    queryKey: ["certificate-verification", certificateId],
    queryFn: () => certificatesApi.verifyCertificate(certificateId),
    retry: false,
  });

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `BiHocam Sertifika Doğrulama - ${verification?.course_title || 'Sertifika'}`,
        text: `${verification?.student_name || 'Kullanıcı'} adlı kişi ${verification?.course_title || 'bir kursu'} başarıyla tamamladı!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link kopyalandı!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 mx-auto"
          >
            <Shield className="w-20 h-20 text-teal-500" strokeWidth={1.5} />
          </motion.div>
          <div className="space-y-2">
            <p className="text-xl font-semibold text-gray-800">Sertifika Doğrulanıyor...</p>
            <p className="text-sm text-gray-500">Lütfen bekleyin, belge kimlik doğrulaması yapılıyor</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !verification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-orange-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <div className="w-20 h-20 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Doğrulama Başarısız</h2>
          <p className="text-gray-600">Sertifika bulunamadı veya geçersiz. Lütfen sertifika numarasını kontrol edin.</p>
        </motion.div>
      </div>
    );
  }

  const isValid = verification?.is_valid && !verification?.is_revoked;
  const verificationTime = new Date().toLocaleString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-orange-50">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-teal-100/20 to-orange-100/20 rounded-full blur-3xl" />
      </div>

      {/* Premium Header with BiHocam Branding */}
      <div className="relative z-10 bg-white/90 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              {/* BiHocam Logo */}
              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl shadow-teal-500/30 group-hover:shadow-2xl group-hover:shadow-teal-500/40 transition-all duration-300 group-hover:scale-105">
                    <span className="text-white font-bold text-2xl">B</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-white shadow-lg"></div>
                </div>
                <div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
                    Bi<span className="text-teal-600">Hocam</span>
                  </span>
                  <p className="text-xs text-gray-500 font-medium -mt-1">Sertifika Doğrulama</p>
                </div>
              </Link>
            </div>
            
            {/* Share Button */}
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 hover:-translate-y-0.5"
            >
              <Share2 className="w-4 h-4" />
              <span className="font-semibold text-sm">Paylaş</span>
            </button>
          </motion.div>
        </div>
      </div>

      {/* Main Content - Shareable Card */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Premium Certificate Card - Optimized for Sharing */}
          <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100 relative">
            {/* BiHocam Watermark Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-[20rem] font-black text-teal-500 select-none" style={{ fontFamily: 'system-ui' }}>
                  BiHocam
                </div>
              </div>
            </div>

            {/* Status Hero Section */}
            <div className={`relative overflow-hidden ${
              isValid 
                ? "bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-600" 
                : "bg-gradient-to-br from-red-500 via-red-600 to-rose-700"
            }`}>
              {/* Animated Pattern Overlay */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `radial-gradient(circle at 3px 3px, white 1.5px, transparent 0)`,
                  backgroundSize: '50px 50px'
                }} />
              </div>

              {/* Floating Orbs */}
              <div className="absolute top-10 right-20 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse" />
              <div className="absolute bottom-10 left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

              <div className="relative p-12 md:p-16 text-center">
                {/* Status Icon with Premium Effects */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="inline-block relative mb-8"
                >
                  {/* Outer Glow Rings */}
                  <div className={`absolute inset-0 rounded-full ${
                    isValid ? "bg-teal-400" : "bg-red-400"
                  } opacity-30 blur-3xl animate-pulse`} style={{ transform: 'scale(1.5)' }} />
                  <div className={`absolute inset-0 rounded-full ${
                    isValid ? "bg-teal-300" : "bg-red-300"
                  } opacity-20 blur-2xl animate-pulse`} style={{ transform: 'scale(1.2)', animationDelay: '0.5s' }} />
                  
                  {/* Main Icon Circle */}
                  <div className="relative w-40 h-40 md:w-48 md:h-48 bg-white/20 backdrop-blur-md rounded-full border-4 border-white/40 flex items-center justify-center shadow-2xl">
                    {isValid ? (
                      <CheckCircle2 className="w-24 h-24 md:w-28 md:h-28 text-white" strokeWidth={2.5} />
                    ) : (
                      <XCircle className="w-24 h-24 md:w-28 md:h-28 text-white" strokeWidth={2.5} />
                    )}
                  </div>

                  {/* Sparkle Accents for Valid Certificates */}
                  {isValid && (
                    <>
                      <motion.div
                        animate={{ rotate: 360, scale: [1, 1.3, 1] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute -top-4 -right-4"
                      >
                        <Sparkles className="w-8 h-8 text-yellow-300 drop-shadow-lg" fill="currentColor" />
                      </motion.div>
                      <motion.div
                        animate={{ rotate: -360, scale: [1, 1.2, 1] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute -bottom-4 -left-4"
                      >
                        <Sparkles className="w-6 h-6 text-yellow-300 drop-shadow-lg" fill="currentColor" />
                      </motion.div>
                      <motion.div
                        animate={{ rotate: 180, scale: [1, 1.25, 1] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                        className="absolute top-1/2 -right-8"
                      >
                        <Sparkles className="w-5 h-5 text-yellow-300 drop-shadow-lg" fill="currentColor" />
                      </motion.div>
                    </>
                  )}
                </motion.div>

                {/* Status Text - Large and Bold */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-4"
                >
                  <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight drop-shadow-lg">
                    {isValid ? "SERTİFİKA GEÇERLİ" : "SERTİFİKA GEÇERSİZ"}
                  </h2>
                  <p className="text-white/95 text-xl md:text-2xl max-w-3xl mx-auto font-medium leading-relaxed">
                    {isValid 
                      ? "Bu sertifika BiHocam tarafından doğrulanmış ve geçerlidir." 
                      : verification?.is_revoked 
                        ? "Bu sertifika iptal edilmiştir." 
                        : "Bu sertifika doğrulanamadı."}
                  </p>
                </motion.div>

                {/* Verification Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-8 inline-flex items-center gap-3 bg-white/20 backdrop-blur-md px-6 py-3 rounded-full border border-white/30 shadow-lg"
                >
                  <Shield className="w-5 h-5 text-white" />
                  <span className="text-white font-semibold">Doğrulama: {verificationTime}</span>
                </motion.div>
              </div>
            </div>

            {/* Certificate Details - Premium Layout */}
            {verification && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="p-8 md:p-12 relative"
              >
                {/* Section Header */}
                <div className="flex items-center gap-4 mb-10">
                  <div className="p-3 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-lg">
                    <Award className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900">Sertifika Detayları</h3>
                    <p className="text-gray-500 text-sm mt-1">BiHocam Onaylı Sertifika Bilgileri</p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  {verification.certificate_number && (
                    <div className="group p-6 bg-gradient-to-br from-gray-50 to-teal-50/30 rounded-2xl border-2 border-gray-200 hover:border-teal-400 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-teal-500/10 rounded-xl group-hover:bg-teal-500/20 transition-colors">
                          <Lock className="w-6 h-6 text-teal-600" />
                        </div>
                        <div className="flex-1">
                          <dt className="text-sm font-bold text-gray-600 mb-2 uppercase tracking-wide">Sertifika Numarası</dt>
                          <dd className="text-xl font-mono font-bold text-gray-900">
                            {verification.certificate_number}
                          </dd>
                        </div>
                      </div>
                    </div>
                  )}

                  {verification.student_name && (
                    <div className="group p-6 bg-gradient-to-br from-gray-50 to-orange-50/30 rounded-2xl border-2 border-gray-200 hover:border-orange-400 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-orange-500/10 rounded-xl group-hover:bg-orange-500/20 transition-colors">
                          <User className="w-6 h-6 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <dt className="text-sm font-bold text-gray-600 mb-2 uppercase tracking-wide">Alıcı</dt>
                          <dd className="text-xl font-bold text-gray-900">
                            {verification.student_name}
                          </dd>
                        </div>
                      </div>
                    </div>
                  )}

                  {verification.course_title && (
                    <div className="group p-6 bg-gradient-to-br from-gray-50 to-teal-50/30 rounded-2xl border-2 border-gray-200 hover:border-teal-400 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 md:col-span-2">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-teal-500/10 rounded-xl group-hover:bg-teal-500/20 transition-colors">
                          <BookOpen className="w-6 h-6 text-teal-600" />
                        </div>
                        <div className="flex-1">
                          <dt className="text-sm font-bold text-gray-600 mb-2 uppercase tracking-wide">Kurs Adı</dt>
                          <dd className="text-2xl font-bold text-gray-900">
                            {verification.course_title}
                          </dd>
                        </div>
                      </div>
                    </div>
                  )}

                  {verification.issued_at && (
                    <div className="group p-6 bg-gradient-to-br from-gray-50 to-orange-50/30 rounded-2xl border-2 border-gray-200 hover:border-orange-400 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 md:col-span-2">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-orange-500/10 rounded-xl group-hover:bg-orange-500/20 transition-colors">
                          <Calendar className="w-6 h-6 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <dt className="text-sm font-bold text-gray-600 mb-2 uppercase tracking-wide">Veriliş Tarihi</dt>
                          <dd className="text-xl font-bold text-gray-900">
                            {new Date(verification.issued_at).toLocaleDateString("tr-TR", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </dd>
                        </div>
                      </div>
                    </div>
                  )}

                  {verification.is_revoked && verification.revocation_reason && (
                    <div className="p-6 bg-red-50 rounded-2xl border-2 border-red-200 md:col-span-2">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-red-100 rounded-xl">
                          <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <dt className="text-sm font-bold text-red-700 mb-2 uppercase tracking-wide">İptal Nedeni</dt>
                          <dd className="text-base text-red-900">
                            {verification.revocation_reason}
                          </dd>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* BiHocam Branding Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mx-8 mb-8 p-6 bg-gradient-to-r from-teal-50 via-teal-100/50 to-orange-50 rounded-2xl border-l-4 border-teal-500 relative overflow-hidden"
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, teal 1px, transparent 0)`,
                  backgroundSize: '30px 30px'
                }} />
              </div>

              <div className="relative flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-lg">
                    <Shield className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-2 text-lg">Güvenlik Bildirimi</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Bu doğrulama <strong>{verificationTime}</strong> tarihinde gerçekleştirilmiştir. 
                    Sertifika geçerliliği BiHocam güvenli veritabanı üzerinden doğrulanmıştır. 
                    Bu sertifika hakkında sorularınız için lütfen{" "}
                    <Link href="/" className="text-teal-600 hover:text-teal-700 font-semibold underline">
                      BiHocam
                    </Link>{" "}
                    destek ekibi ile iletişime geçin.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* BiHocam Call to Action */}
            <div className="mx-8 mb-8 p-6 bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl text-white text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `radial-gradient(circle at 3px 3px, white 1.5px, transparent 0)`,
                  backgroundSize: '40px 40px'
                }} />
              </div>
              <div className="relative">
                <h4 className="text-2xl font-bold mb-2">Siz de Başarılı Olmak İster misiniz?</h4>
                <p className="text-teal-100 mb-4">BiHocam ile hedeflerinize ulaşın, sertifikanızı kazanın!</p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-teal-600 rounded-xl font-bold hover:bg-teal-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  <Globe className="w-5 h-5" />
                  BiHocam'a Git
                </Link>
              </div>
            </div>
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-8 text-center space-y-3"
          >
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="text-sm font-semibold">
                <span className="text-gray-900">Bi</span>
                <span className="text-teal-600">Hocam</span>
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Bu otomatik bir doğrulama sistemidir. Tüm sertifika bilgileri korunmakta ve şifrelenmektedir.
            </p>
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} BiHocam. Tüm hakları saklıdır.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
