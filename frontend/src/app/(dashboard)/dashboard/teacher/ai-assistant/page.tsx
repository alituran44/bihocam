"use client";

import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
}

export default function AITeacherAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "ai",
      text: "Merhaba! Ben sizin AI öğretmen asistanınızım. Ders planlaması, öğrenci değerlendirmesi, öğretim yöntemleri veya eğitim içeriği hakkında sorularınızı sorabilirsiniz. Nasıl yardımcı olabilirim?",
      timestamp: new Date(),
    },
  ]);

  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Quick suggestions handler
  const handleQuickQuestion = (question: string) => {
    if (isLoading) return;
    setInputText(question);
  };

  // Live call to AI APIs
  const callAIAPI = async (userMessage: string): Promise<string> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          history: messages.filter(m => m.id !== '1').map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            content: m.text
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Backend API request failed');
      }

      const data = await response.json();
      return data.reply;
    } catch (err: any) {
      console.error("Backend AI API call failed:", err);
      return (
        `**Bağlantı Hatası.**\n\n` +
        `Yapay zeka asistanına şu an ulaşılamıyor.\n\n` +
        `Lütfen daha sonra tekrar deneyin.`
      );
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userText = inputText;
    setInputText("");
    
    const userMsg: Message = {
      id: Math.random().toString(),
      sender: "user",
      text: userText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const aiReply = await callAIAPI(userText);
      const aiMsg: Message = {
        id: Math.random().toString(),
        sender: "ai",
        text: aiReply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error: any) {
      toast.error(error.message || "Yapay zekadan yanıt alınırken bir hata oluştu.");
      const errorMsg: Message = {
        id: Math.random().toString(),
        sender: "ai",
        text: `⚠️ **Hata:** Yanıt alınamadı. ${error.message || "Lütfen internet bağlantınızı kontrol ediniz."}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span>✨</span> AI Öğretmen Asistanı
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Eğitim ve öğretim konularında sorularınızı sorun, ders planı ve materyal hazırlamada profesyonel öneriler alın.
          </p>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left 3/4 Chat Console */}
        <div className="lg:col-span-3 flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[550px] relative">
          
          {/* Chat Header Status */}
          <div className="bg-slate-50/80 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-emerald-400"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <div>
                <h3 className="font-bold text-sm text-gray-800">Sohbet Ekranı</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                  Sağlayıcı: <span className="text-teal-600 font-extrabold">BİHOCAM AI</span>
                </p>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 max-h-[420px] bg-slate-50/20">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${
                  msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm border ${
                    msg.sender === "user"
                      ? "bg-blue-50 border-blue-100 text-blue-600"
                      : "bg-teal-50 border-teal-100 text-teal-600"
                  }`}
                >
                  {msg.sender === "user" ? "👤" : "✨"}
                </div>
                
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-500/10"
                      : "bg-white text-gray-800 rounded-tl-none border border-gray-100 shadow-sm whitespace-pre-wrap"
                  }`}
                >
                  {msg.text.split("\n").map((line, lIdx) => {
                    let cleanLine = line;
                    let isHeader = false;
                    let isTip = false;
                    
                    if (cleanLine.startsWith("### ")) {
                      cleanLine = cleanLine.replace("### ", "");
                      isHeader = true;
                    }
                    if (cleanLine.startsWith("> [!TIP]") || cleanLine.startsWith("> **Gerçek")) {
                      isTip = true;
                    }

                    if (isHeader) {
                      return <h4 key={lIdx} className="font-extrabold text-base text-teal-600 my-2">{cleanLine}</h4>;
                    }
                    if (isTip) {
                      return (
                        <div key={lIdx} className="bg-amber-50/60 border border-amber-200/60 p-3 rounded-xl text-xs text-amber-800 my-3 leading-relaxed">
                          {cleanLine.replace("> ", "").replace("[!TIP]", "💡 İpucu:")}
                        </div>
                      );
                    }
                    
                    const boldRegex = /\*\*(.*?)\*\*/g;
                    const parts = [];
                    let lastIndex = 0;
                    let match;
                    
                    while ((match = boldRegex.exec(cleanLine)) !== null) {
                      parts.push(cleanLine.substring(lastIndex, match.index));
                      parts.push(<strong key={match.index} className={msg.sender === "user" ? "font-black" : "font-extrabold text-slate-900"}>{match[1]}</strong>);
                      lastIndex = boldRegex.lastIndex;
                    }
                    parts.push(cleanLine.substring(lastIndex));

                    return <p key={lIdx} className={line === "" ? "h-3" : "mb-1"}>{parts.length > 0 ? parts : cleanLine}</p>;
                  })}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 max-w-[80%] mr-auto items-center">
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                  ✨
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-2">
                  <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  <span className="text-xs text-gray-400 font-semibold ml-1">Asistan düşünüyor...</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Chat Input form */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 bg-white flex items-center gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Yapay zeka asistanına sorunuzu yazın..."
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm font-semibold"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="p-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-xl shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9-2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>

        {/* Right 1/4 Quick prompts list */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h3 className="font-bold text-sm text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-1.5">
              <span>💡</span> Hızlı Sorular
            </h3>
            <p className="text-xs text-gray-400 font-semibold leading-relaxed">
              Öğretim sürecini kolaylaştıracak örnek soru taslaklarına tıklayarak hemen sorabilirsiniz:
            </p>
            <div className="space-y-3">
              {[
                "Öğrenci başarı durumunu analiz et.",
                "Etkili bir ders planı nasıl hazırlanır?",
                "Öğrenci motivasyonunu nasıl arttırabilirim?",
                "Farklı öğrenme stillerine nasıl hitap edebilirim?",
              ].map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickQuestion(q)}
                  className="w-full text-left p-3 rounded-xl border border-gray-100 bg-slate-50/50 hover:bg-teal-50 hover:border-teal-300 text-xs font-bold text-gray-700 hover:text-teal-700 transition-all duration-200"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
