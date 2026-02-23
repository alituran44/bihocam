"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Share2, ExternalLink, QrCode, CheckCircle2 } from "lucide-react";
import { Certificate } from "@/lib/api";
import { useState } from "react";

/**
 * AESTHETIC DIRECTION: Museum Gallery / Fine Art Exhibition
 * 
 * Design Philosophy:
 * - Ultra-refined minimalism with generous whitespace
 * - Monochromatic palette (blacks, grays, whites) with single accent color
 * - Large-scale typography (Playfair Display for headlines)
 * - Certificate displayed as precious artwork
 * - Subtle, sophisticated animations
 * - Gallery-style presentation with focused lighting effect
 * - Clean lines, perfect alignment, breathing room
 */

interface CertificateDetailModalProps {
  certificate: Certificate;
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
  onShare: () => void;
}

export default function CertificateDetailModal({
  certificate,
  isOpen,
  onClose,
  onDownload,
  onShare,
}: CertificateDetailModalProps) {
  const [showQR, setShowQR] = useState(false);

  const verificationUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/verify-certificate/${certificate.id}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - Gallery Darkroom */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 cursor-pointer"
          />

          {/* Modal Container - Center Stage */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-5xl pointer-events-auto"
            >
              {/* Close Button - Minimalist */}
              <button
                onClick={onClose}
                className="absolute -top-12 right-0 text-white/80 hover:text-white transition-colors p-2"
              >
                <X className="w-8 h-8" strokeWidth={1} />
              </button>

              {/* Main Content - Gallery Frame */}
              <div className="bg-white rounded-none shadow-2xl overflow-hidden">
                <div className="grid md:grid-cols-[1.5fr,1fr]">
                  {/* Left: Certificate Display - The Artwork */}
                  <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-8 md:p-12 flex items-center justify-center min-h-[500px]">
                    {/* Spotlight Effect */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.8),transparent_70%)] pointer-events-none" />
                    
                    {/* Certificate Preview Frame */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="relative w-full max-w-md"
                    >
                      {/* Decorative Frame Border */}
                      <div className="absolute -inset-4 border border-gray-300 rounded-sm" />
                      <div className="absolute -inset-2 border-2 border-gray-400 rounded-sm" />
                      
                      {/* Certificate Mock */}
                      <div className="relative bg-white shadow-2xl p-8 rounded-sm">
                        {/* Certificate Header */}
                        <div className="text-center space-y-4 mb-6">
                          <div className="inline-block p-3 bg-emerald-50 rounded-full">
                            <CheckCircle2 className="w-8 h-8 text-emerald-600" strokeWidth={1.5} />
                          </div>
                          <h3 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">
                            SERTİFİKA
                          </h3>
                          <div className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-gray-400 to-transparent" />
                        </div>

                        {/* Certificate Body */}
                        <div className="space-y-4 text-center">
                          <p className="text-sm text-gray-600 tracking-wide uppercase">Bu belge</p>
                          <p className="text-2xl font-serif font-bold text-gray-900 border-b-2 border-gray-300 pb-2">
                            {certificate.student_name}
                          </p>
                          <p className="text-sm text-gray-600 tracking-wide uppercase">
                            adlı kişinin aşağıdaki kursu başarıyla tamamladığını belirtir
                          </p>
                          <p className="text-lg font-semibold text-gray-800 leading-tight">
                            {certificate.course_title}
                          </p>
                          
                          {/* Certificate Number */}
                          <div className="pt-4">
                            <p className="text-xs text-gray-500 font-mono tracking-wider">
                              {certificate.certificate_number}
                            </p>
                          </div>
                        </div>

                        {/* Bottom Seal */}
                        <div className="mt-8 pt-4 border-t border-gray-200 flex justify-between items-center">
                          <div className="text-xs text-gray-500">
                            {new Date(certificate.issued_at).toLocaleDateString("tr-TR")}
                          </div>
                          <div className="text-xs text-gray-500">
                            {certificate.completion_percentage}%
                          </div>
                        </div>
                      </div>

                      {/* Shadow underneath */}
                      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-4/5 h-4 bg-black/10 blur-xl rounded-full" />
                    </motion.div>
                  </div>

                  {/* Right: Details & Actions - Gallery Info Panel */}
                  <div className="bg-white p-8 md:p-10 flex flex-col">
                    {/* Title - Playfair Display for luxury */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="space-y-6 flex-1"
                    >
                      <div>
                        <h2 className="text-4xl font-serif font-bold text-gray-900 leading-tight mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                          Başarı Sertifikası
                        </h2>
                        <p className="text-sm text-gray-500 tracking-widest uppercase">Sertifika Detayları</p>
                      </div>

                      {/* Metadata - Museum Label Style */}
                      <div className="space-y-4 border-l-2 border-gray-200 pl-4">
                        <div>
                          <dt className="text-xs text-gray-500 uppercase tracking-wider mb-1">Alıcı</dt>
                          <dd className="text-base font-semibold text-gray-900">{certificate.student_name}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-gray-500 uppercase tracking-wider mb-1">Kurs</dt>
                          <dd className="text-base font-semibold text-gray-900">{certificate.course_title}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-gray-500 uppercase tracking-wider mb-1">Eğitmen</dt>
                          <dd className="text-base font-semibold text-gray-900">{certificate.teacher_name}</dd>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <dt className="text-xs text-gray-500 uppercase tracking-wider mb-1">Tamamlanma</dt>
                            <dd className="text-base font-semibold text-gray-900">{certificate.completion_percentage}%</dd>
                          </div>
                          <div>
                            <dt className="text-xs text-gray-500 uppercase tracking-wider mb-1">Dersler</dt>
                            <dd className="text-base font-semibold text-gray-900">
                              {certificate.completed_lessons}/{certificate.total_lessons}
                            </dd>
                          </div>
                        </div>
                        <div>
                          <dt className="text-xs text-gray-500 uppercase tracking-wider mb-1">Veriliş Tarihi</dt>
                          <dd className="text-base font-semibold text-gray-900">
                            {new Date(certificate.issued_at).toLocaleDateString("tr-TR", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-gray-500 uppercase tracking-wider mb-1">Sertifika No</dt>
                          <dd className="text-sm font-mono text-gray-700">{certificate.certificate_number}</dd>
                        </div>
                      </div>

                      {/* QR Code Toggle */}
                      <button
                        onClick={() => setShowQR(!showQR)}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        <QrCode className="w-4 h-4" />
                        {showQR ? "Gizle" : "Göster"} Doğrulama QR
                      </button>

                      {showQR && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border border-gray-200 p-4 rounded-sm"
                        >
                          <div className="bg-white p-4 border border-gray-300 inline-block">
                            <div className="w-32 h-32 bg-gray-100 flex items-center justify-center">
                              <QrCode className="w-16 h-16 text-gray-400" />
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">Doğrulamak için tara</p>
                        </motion.div>
                      )}
                    </motion.div>

                    {/* Actions - Refined Buttons */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="space-y-3 pt-6 border-t border-gray-200"
                    >
                      <button
                        onClick={onDownload}
                        className="w-full flex items-center justify-center gap-3 bg-gray-900 text-white py-4 px-6 hover:bg-gray-800 transition-colors group"
                      >
                        <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" strokeWidth={1.5} />
                        <span className="font-medium tracking-wide uppercase text-sm">Sertifikayı İndir</span>
                      </button>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={onShare}
                          className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-3 px-4 hover:border-gray-900 hover:text-gray-900 transition-colors"
                        >
                          <Share2 className="w-4 h-4" strokeWidth={1.5} />
                          <span className="font-medium text-sm">Paylaş</span>
                        </button>
                        <a
                          href={verificationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-3 px-4 hover:border-gray-900 hover:text-gray-900 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
                          <span className="font-medium text-sm">Doğrula</span>
                        </a>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
