"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { messagesApi, Conversation, MessageRecipient } from "@/lib/api";
import { toast } from "sonner";
import Avatar from "@/components/Avatar";

interface NewConversationModalProps {
  onClose: () => void;
  onConversationCreated: (conversation: Conversation) => void;
}

export default function NewConversationModal({
  onClose,
  onConversationCreated,
}: NewConversationModalProps) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecipient, setSelectedRecipient] = useState<MessageRecipient | null>(null);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [subject, setSubject] = useState("");

  // Fetch available recipients (KVKK compliant)
  const { data: recipients, isLoading: recipientsLoading } = useQuery({
    queryKey: ["message-recipients", searchQuery],
    queryFn: () => messagesApi.getAvailableRecipients({ search: searchQuery }),
  });

  // Create conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: (data: { recipient_id: string; course_id?: string; subject?: string }) =>
      messagesApi.createConversation(data),
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      onConversationCreated(conversation);
      toast.success("Konuşma başlatıldı");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Konuşma oluşturulamadı");
    },
  });

  const handleCreate = () => {
    if (!selectedRecipient) {
      toast.error("Lütfen bir alıcı seçin");
      return;
    }

    createConversationMutation.mutate({
      recipient_id: selectedRecipient.id,
      course_id: courseId || undefined,
      subject: subject || undefined,
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl border-2 border-gray-200"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Yeni Konuşma Başlat
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Recipient Search */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Alıcı Seç <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Alıcı ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Recipient List */}
          <div className="mb-4 max-h-64 overflow-y-auto max-h-64 border border-gray-200 rounded-lg p-2">
            {recipientsLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : recipients && recipients.length > 0 ? (
              <div className="space-y-2">
                {recipients.map((recipient) => (
                  <button
                    key={recipient.id}
                    onClick={() => setSelectedRecipient(recipient)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                      selectedRecipient?.id === recipient.id
                        ? "bg-teal-50 border-2 border-teal-500"
                        : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                    }`}
                  >
                    <Avatar src={recipient.avatar} name={recipient.full_name} size="md" />
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-gray-900">{recipient.label}</div>
                      <div className="text-sm text-gray-500">{recipient.role}</div>
                    </div>
                    {selectedRecipient?.id === recipient.id && (
                      <svg className="w-5 h-5 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p className="text-sm">Alıcı bulunamadı</p>
              </div>
            )}
          </div>

          {/* Subject (Optional) */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Konu (Opsiyonel)</label>
            <input
              type="text"
              placeholder="Konu başlığı..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              İptal
            </button>
            <button
              onClick={handleCreate}
              disabled={!selectedRecipient || createConversationMutation.isPending}
              className="px-6 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
            >
              {createConversationMutation.isPending ? "Oluşturuluyor..." : "Konuşma Başlat"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
