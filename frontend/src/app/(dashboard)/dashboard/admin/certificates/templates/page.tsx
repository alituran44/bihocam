"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Palette,
  Image as ImageIcon,
  FileText,
  Trash2,
  Edit3,
  Eye,
  Upload,
  Sparkles,
  Wand2,
  Layout,
  Type,
  Droplets,
} from "lucide-react";
import { certificatesApi, CertificateTemplate } from "@/lib/api";

/**
 * AESTHETIC DIRECTION: Design Studio / Creative Workshop
 * 
 * Design Philosophy:
 * - Playful, creative maximalism
 * - Bright, saturated colors (designer's palette)
 * - Rounded corners everywhere
 * - Tool-focused UI (like Figma/Canva)
 * - Floating panels, cards with depth
 * - Colorful gradients and playful shadows
 * - Creative icons and playful micro-interactions
 * - Workshop/atelier vibe with tools and materials
 * - Visual preview as centerpiece
 */

export default function CertificateTemplatesPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<CertificateTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<CertificateTemplate | null>(null);

  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ["certificate-templates"],
    queryFn: () => certificatesApi.getTemplates(),
  });

  const deleteTemplate = useMutation({
    mutationFn: (id: string) => certificatesApi.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificate-templates"] });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-center"
        >
          <Wand2 className="w-20 h-20 text-purple-600 mx-auto" />
          <p className="mt-4 text-lg font-bold text-purple-900">Loading Creative Studio...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100">
      {/* Playful Header - Design Studio Style */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 relative overflow-hidden">
        {/* Floating Shapes Background */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-2xl" />
          <div className="absolute top-20 right-20 w-40 h-40 bg-yellow-300 rounded-3xl rotate-45 blur-2xl" />
          <div className="absolute bottom-10 left-1/3 w-36 h-36 bg-pink-300 rounded-full blur-2xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center space-y-6">
            {/* Icon with Sparkles */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="inline-block relative"
            >
              <div className="p-6 bg-white/20 backdrop-blur-sm rounded-3xl">
                <Palette className="w-16 h-16 text-white" strokeWidth={1.5} />
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute -top-2 -right-2"
              >
                <Sparkles className="w-8 h-8 text-yellow-300" />
              </motion.div>
            </motion.div>

            {/* Title - Playful Typography */}
            <div>
              <h1 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight">
                🎨 Certificate Studio
              </h1>
              <p className="text-xl text-white/90 font-medium">
                Design beautiful certificate templates with creative freedom
              </p>
            </div>

            {/* Create Button - Prominent CTA */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-3 bg-white text-purple-600 px-8 py-4 rounded-full font-bold text-lg shadow-2xl hover:shadow-purple-900/30 transition-all"
            >
              <Plus className="w-6 h-6" />
              Create New Template
            </motion.button>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-auto">
            <path
              fill="rgb(243 232 255)"
              d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
            />
          </svg>
        </div>
      </div>

      {/* Templates Grid - Workshop Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {templates && templates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {templates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 30, rotate: -2 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, rotate: 1 }}
                className="group"
              >
                {/* Template Card - Playful Design */}
                <div className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border-4 border-transparent hover:border-purple-300">
                  {/* Template Preview Area */}
                  <div className="relative h-56 bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 flex items-center justify-center overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle, #000 1px, transparent 1px)`,
                        backgroundSize: '20px 20px'
                      }} />
                    </div>

                    {/* Template Type Badge */}
                    <div className="absolute top-4 right-4">
                      <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg ${
                        template.template_type === 'premium'
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white'
                          : template.template_type === 'modern'
                          ? 'bg-gradient-to-r from-blue-400 to-purple-400 text-white'
                          : template.template_type === 'elegant'
                          ? 'bg-gradient-to-r from-gray-700 to-gray-900 text-white'
                          : 'bg-gradient-to-r from-teal-400 to-green-400 text-white'
                      }`}>
                        {template.template_type}
                      </span>
                    </div>

                    {/* Mock Certificate Icon */}
                    <FileText className="w-24 h-24 text-purple-300" strokeWidth={1} />

                    {/* Floating Tool Icons */}
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute top-16 left-8"
                    >
                      <Palette className="w-8 h-8 text-pink-400 opacity-60" />
                    </motion.div>
                    <motion.div
                      animate={{ y: [0, 10, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                      className="absolute bottom-16 right-8"
                    >
                      <Type className="w-8 h-8 text-orange-400 opacity-60" />
                    </motion.div>
                  </div>

                  {/* Template Info */}
                  <div className="p-6 space-y-4">
                    {/* Name */}
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">
                        {template.name}
                      </h3>
                      {template.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {template.description}
                        </p>
                      )}
                    </div>

                    {/* Meta Tags */}
                    <div className="flex flex-wrap gap-2">
                      {template.config?.primary_color && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-xs font-semibold">
                          <Droplets className="w-3 h-3" />
                          Color Theme
                        </span>
                      )}
                      {template.background_image && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 rounded-full text-xs font-semibold">
                          <ImageIcon className="w-3 h-3" />
                          Custom BG
                        </span>
                      )}
                      {template.is_system_template && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                          <Sparkles className="w-3 h-3" />
                          System
                        </span>
                      )}
                    </div>

                    {/* Action Buttons - Colorful */}
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => setPreviewTemplate(template)}
                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2.5 px-4 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all font-semibold shadow-lg hover:shadow-xl"
                      >
                        <Eye className="w-4 h-4" />
                        Preview
                      </button>
                      <button
                        onClick={() => setSelectedTemplate(template)}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-2.5 px-4 rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all font-semibold shadow-lg hover:shadow-xl"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this template?")) {
                            deleteTemplate.mutate(template.id);
                          }
                        }}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-rose-500 text-white py-2.5 px-4 rounded-xl hover:from-red-600 hover:to-rose-600 transition-all font-semibold shadow-lg hover:shadow-xl"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="max-w-md mx-auto space-y-6">
              <div className="inline-block p-8 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full">
                <Wand2 className="w-20 h-20 text-purple-600" strokeWidth={1.5} />
              </div>
              <h3 className="text-3xl font-black text-gray-900">Start Creating!</h3>
              <p className="text-lg text-gray-600">
                No templates yet. Create your first certificate template and unleash your creativity!
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-2xl hover:shadow-purple-900/30 transition-all"
              >
                <Plus className="w-6 h-6" />
                Create First Template
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Create/Edit Modal Placeholder */}
      <AnimatePresence>
        {(showCreateModal || selectedTemplate) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowCreateModal(false);
              setSelectedTemplate(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-4xl w-full shadow-2xl"
            >
              <h3 className="text-3xl font-black text-gray-900 mb-4">
                {selectedTemplate ? "Edit Template" : "Create New Template"}
              </h3>
              <p className="text-gray-600 mb-6">
                Template creation form would go here with live preview panel, color pickers, font selectors, 
                file uploads, and configuration options.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setSelectedTemplate(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-xl font-bold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg">
                  {selectedTemplate ? "Save Changes" : "Create Template"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal Placeholder */}
      <AnimatePresence>
        {previewTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setPreviewTemplate(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-4xl w-full"
            >
              <h3 className="text-2xl font-black text-gray-900 mb-4">{previewTemplate.name}</h3>
              <p className="text-gray-600">Live preview would render here with actual certificate template.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
