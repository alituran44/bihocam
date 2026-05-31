"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { messagesApi, Conversation, Message } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";
import Avatar from "@/components/Avatar";
import ConversationDetail from "@/components/messages/ConversationDetail";
import NewConversationModal from "@/components/messages/NewConversationModal";

export default function MessagesPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread" | "archived">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch conversations
  const { data: conversationsData, isLoading } = useQuery({
    queryKey: ["conversations", filter],
    queryFn: () =>
      messagesApi.getConversations({
        include_archived: filter === "archived",
        limit: 100,
        offset: 0,
      }),
    refetchInterval: 30000, // Poll every 30 seconds
  });

  // Fetch unread count
  const { data: unreadCountData } = useQuery({
    queryKey: ["unread-count"],
    queryFn: () => messagesApi.getUnreadCount(),
    refetchInterval: 30000,
  });

  const conversations = conversationsData?.conversations || [];
  const unreadCount = unreadCountData?.unread_count || 0;

  // Automatically open or create conversation when recipient_id is passed in query
  useEffect(() => {
    if (typeof window !== "undefined" && conversations.length > 0) {
      const urlParams = new URLSearchParams(window.location.search);
      const recipientId = urlParams.get("recipient_id");
      if (recipientId) {
        // Clear query param so it doesn't trigger repeatedly
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);

        const existing = conversations.find(
          (c) => c.other_participant_id === recipientId
        );
        if (existing) {
          setSelectedConversationId(existing.id);
          markAsReadMutation.mutate(existing.id);
        } else {
          messagesApi.createConversation({ recipient_id: recipientId })
            .then((newConv) => {
              queryClient.invalidateQueries({ queryKey: ["conversations"] });
              setSelectedConversationId(newConv.id);
            })
            .catch((err) => {
              console.error("Konuşma başlatılamadı:", err);
            });
        }
      }
    }
  }, [conversations, queryClient]);

  // Filter conversations
  const filteredConversations = conversations.filter((conv) => {
    if (filter === "unread" && conv.unread_count === 0) return false;
    if (filter === "archived" && !conv.is_archived) return false;
    if (filter !== "archived" && conv.is_archived) return false;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        conv.other_participant_name.toLowerCase().includes(query) ||
        conv.last_message_preview?.toLowerCase().includes(query) ||
        conv.course_title?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (conversationId: string) => messagesApi.markAsRead(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["unread-count"] });
    },
  });

  // Archive mutation
  const archiveMutation = useMutation({
    mutationFn: (conversationId: string) => messagesApi.archiveConversation(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast.success("Konuşma arşivlendi");
    },
  });

  // Handle conversation select
  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    // Mark as read when viewing
    markAsReadMutation.mutate(conversationId);
  };

  // Handle new conversation created
  const handleNewConversationCreated = (conversation: Conversation) => {
    setSelectedConversationId(conversation.id);
    setShowNewConversation(false);
    queryClient.invalidateQueries({ queryKey: ["conversations"] });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-blue-50/10">
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Conversation List Sidebar */}
        <aside className="w-96 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200/50 bg-gradient-to-r from-teal-50/50 to-blue-50/30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Mesajlar
              </h2>
              <button
                onClick={() => setShowNewConversation(true)}
                className="px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Yeni Konuşma
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Konuşma ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              <svg
                className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filter === "all"
                    ? "bg-teal-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Tümü
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all relative ${
                  filter === "unread"
                    ? "bg-teal-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Okunmamış
                {unreadCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setFilter("archived")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filter === "archived"
                    ? "bg-teal-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Arşiv
              </button>
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <p className="text-sm font-medium">Henüz mesaj yok</p>
                <p className="text-xs text-gray-400 mt-1">Yeni bir konuşma başlatın</p>
              </div>
            ) : (
              <AnimatePresence>
                {filteredConversations.map((conversation) => (
                  <motion.div
                    key={conversation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    onClick={() => handleSelectConversation(conversation.id)}
                    className={`p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-teal-50/50 ${
                      selectedConversationId === conversation.id ? "bg-teal-50 border-l-4 border-l-teal-500" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar
                        src={conversation.other_participant_avatar}
                        name={conversation.other_participant_name}
                        size="md"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {conversation.other_participant_label}
                          </h3>
                          {conversation.last_message_at && (
                            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                              {formatDistanceToNow(new Date(conversation.last_message_at), {
                                addSuffix: true,
                                locale: tr,
                              })}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate mb-1">
                          {conversation.last_message_preview || "Mesaj yok"}
                        </p>
                        <div className="flex items-center gap-2">
                          {conversation.course_title && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                              {conversation.course_title}
                            </span>
                          )}
                          {conversation.unread_count > 0 && (
                            <span className="ml-auto px-2 py-0.5 bg-teal-500 text-white text-xs rounded-full font-semibold">
                              {conversation.unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </aside>

        {/* Conversation Detail */}
        <main className="flex-1 flex flex-col bg-white/50">
          {selectedConversationId ? (
            <ConversationDetail
              conversationId={selectedConversationId}
              onBack={() => setSelectedConversationId(null)}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <svg className="w-24 h-24 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <p className="text-gray-500 font-medium">Bir konuşma seçin</p>
                <p className="text-sm text-gray-400 mt-1">veya yeni bir konuşma başlatın</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* New Conversation Modal */}
      {showNewConversation && (
        <NewConversationModal
          onClose={() => setShowNewConversation(false)}
          onConversationCreated={handleNewConversationCreated}
        />
      )}
    </div>
  );
}
