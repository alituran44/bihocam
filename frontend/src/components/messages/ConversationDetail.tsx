"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { messagesApi, Conversation, Message } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";
import Avatar from "@/components/Avatar";

interface ConversationDetailProps {
  conversationId: string;
  onBack?: () => void;
}

export default function ConversationDetail({ conversationId, onBack }: ConversationDetailProps) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messageContent, setMessageContent] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);

  // Fetch conversation
  const { data: conversation, isLoading: conversationLoading } = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => messagesApi.getConversation(conversationId),
  });

  // Fetch messages (infinite scroll)
  const {
    data: messagesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["conversation-messages", conversationId],
    queryFn: ({ pageParam = 0 }) =>
      messagesApi.getMessages(conversationId, {
        limit: 50,
        offset: pageParam,
      }),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.messages.length < 50) return undefined;
      return allPages.length * 50;
    },
    initialPageParam: 0,
  });

  // Backend returns messages in DESC order (newest first), but we need ASC for chat display (oldest first)
  const messages = messagesData?.pages.flatMap((page) => page.messages).reverse() || [];

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (data: { content: string; attachment?: File }) =>
      messagesApi.sendMessage(conversationId, data),
    onSuccess: () => {
      setMessageContent("");
      setAttachment(null);
      queryClient.invalidateQueries({ queryKey: ["conversation-messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["unread-count"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Mesaj gönderilemedi");
    },
  });

  // Mark as read when viewing
  useEffect(() => {
    if (conversation) {
      messagesApi.markAsRead(conversationId).catch(() => {
        // Silent fail
      });
    }
  }, [conversationId, conversation]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Polling for new messages
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["conversation-messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversation", conversationId] });
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [conversationId, queryClient]);

  const handleSend = () => {
    if (!messageContent.trim() && !attachment) return;

    sendMessageMutation.mutate({
      content: messageContent,
      attachment: attachment || undefined,
    });
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB for images, 10MB for documents)
      const maxSize = file.type.startsWith("image/") ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error(`Dosya boyutu çok büyük (max: ${file.type.startsWith("image/") ? "5MB" : "10MB"})`);
        return;
      }
      setAttachment(file);
    }
  };

  if (conversationLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Conversation bulunamadı</p>
      </div>
    );
  }

  const isMyMessage = (message: Message) => message.sender_id === user?.id;

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200/50 bg-gradient-to-r from-teal-50/50 to-blue-50/30">
        {onBack && (
          <button
            onClick={onBack}
            className="mb-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <div className="flex items-center gap-3">
          <Avatar
            src={conversation.other_participant_avatar}
            name={conversation.other_participant_name}
            size="md"
          />
          <div>
            <h3 className="font-semibold text-gray-900">{conversation.other_participant_label}</h3>
            <p className="text-sm text-gray-500">{conversation.other_participant_role}</p>
          </div>
        </div>
        {conversation.course_title && (
          <div className="mt-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
              {conversation.course_title}
            </span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50/50 to-white">
        {hasNextPage && (
          <div className="text-center">
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="px-4 py-2 text-sm text-teal-600 hover:text-teal-700 disabled:opacity-50"
            >
              {isFetchingNextPage ? "Yükleniyor..." : "Daha fazla mesaj yükle"}
            </button>
          </div>
        )}

        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${isMyMessage(message) ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                  isMyMessage(message)
                    ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white"
                    : "bg-white border border-gray-200 text-gray-900"
                }`}
              >
                {!isMyMessage(message) && (
                  <div className="text-xs font-semibold mb-1">{message.sender_name}</div>
                )}
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                {message.attachment_url && (
                  <div className="mt-2">
                    <a
                      href={message.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs underline"
                    >
                      📎 {message.attachment_filename}
                    </a>
                  </div>
                )}
                <div className="flex items-center justify-end gap-2 mt-1">
                  <span className="text-xs opacity-70">
                    {formatDistanceToNow(new Date(message.created_at), {
                      addSuffix: true,
                      locale: tr,
                    })}
                  </span>
                  {isMyMessage(message) && (
                    <svg
                      className={`w-4 h-4 ${message.is_read ? "text-blue-300" : "text-gray-300"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200/50 bg-white">
        {attachment && (
          <div className="mb-2 flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-700">📎 {attachment.name}</span>
            <button
              onClick={() => setAttachment(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <label className="cursor-pointer p-2 text-gray-600 hover:text-teal-600 transition-colors">
            <input
              type="file"
              onChange={handleAttachmentChange}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar"
            />
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </label>
          <textarea
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Mesaj yazın..."
            rows={1}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
          />
          <button
            onClick={handleSend}
            disabled={(!messageContent.trim() && !attachment) || sendMessageMutation.isPending}
            className="px-6 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
          >
            {sendMessageMutation.isPending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Gönder"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
