"use client";

import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
}

interface AISettings {
  provider: "gemini" | "chatgpt" | "claude";
  geminiKey: string;
  openaiKey: string;
  claudeKey: string;
  systemPrompt: string;
  temperature: number;
}

const DEFAULT_SYSTEM_PROMPT = 
  "Sen BiHocam platformunda görev yapan son derece bilgili, profesyonel ve destekleyici bir Yapay Zeka Öğretmen Asistanısın. " +
  "Eğitmenlere ders planı hazırlama, müfredat oluşturma, öğrenci başarı analizi, motivasyon taktikleri ve interaktif ders etkinlikleri " +
  "konularında rehberlik ediyorsun. Sorulara pedagojik esaslara uygun, yapıcı ve ilham verici yanıtlar ver.";

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
  const [showSettings, setShowSettings] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [activeGuideTab, setActiveGuideTab] = useState<"gemini" | "openai" | "claude">("gemini");
  
  // Stored AI settings
  const [settings, setSettings] = useState<AISettings>({
    provider: "gemini",
    geminiKey: "",
    openaiKey: "",
    claudeKey: "",
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    temperature: 0.7,
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load settings from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("bihocam_ai_settings");
      if (stored) {
        try {
          setSettings(JSON.parse(stored));
        } catch (e) {
          console.error("Settings load error:", e);
        }
      }
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = (newSettings: AISettings) => {
    setSettings(newSettings);
    localStorage.setItem("bihocam_ai_settings", JSON.stringify(newSettings));
    toast.success("Ayarlar başarıyla kaydedildi.");
  };

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
    const { provider, geminiKey, openaiKey, claudeKey, systemPrompt, temperature } = settings;

    // 1. GEMINI
    if (provider === "gemini" && geminiKey.trim()) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: `Sistem Rolü: ${systemPrompt}\n\nKullanıcı Sorusuna Pedagojik Yanıt Ver:\n${userMessage}`,
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: temperature,
              },
            }),
          }
        );
        const data = await response.json();
        if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
          return data.candidates[0].content.parts[0].text;
        }
        throw new Error(data.error?.message || "Gemini'den boş yanıt döndü.");
      } catch (err: any) {
        console.error("Gemini API call failed:", err);
        throw new Error(`Gemini API Hatası: ${err.message || "Bilinmeyen hata"}`);
      }
    }

    // 2. OPENAI (ChatGPT)
    if (provider === "chatgpt" && openaiKey.trim()) {
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userMessage },
            ],
            temperature: temperature,
          }),
        });
        const data = await response.json();
        if (data.choices?.[0]?.message?.content) {
          return data.choices[0].message.content;
        }
        throw new Error(data.error?.message || "OpenAI'den boş yanıt döndü.");
      } catch (err: any) {
        console.error("OpenAI API call failed:", err);
        throw new Error(`OpenAI API Hatası: ${err.message || "Bilinmeyen hata"}`);
      }
    }

    // 3. CLAUDE
    if (provider === "claude" && claudeKey.trim()) {
      try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": claudeKey,
            "anthropic-version": "2023-06-01",
            "dangerously-allow-browser": "true",
          },
          body: JSON.stringify({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1024,
            system: systemPrompt,
            messages: [{ role: "user", content: userMessage }],
            temperature: temperature,
          }),
        });
        const data = await response.json();
        if (data.content?.[0]?.text) {
          return data.content[0].text;
        }
        throw new Error(data.error?.message || "Claude'dan boş yanıt döndü.");
      } catch (err: any) {
        console.error("Claude API call failed:", err);
        throw new Error(`Claude API Hatası: ${err.message || "Bilinmeyen hata"}`);
      }
    }

    // 4. FALLBACK MOCK (If no API Key is added)
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const queryLower = userMessage.toLowerCase();
    if (queryLower.includes("analiz") || queryLower.includes("başarı")) {
      return (
        "### Öğrenci Başarı Durumu Analizi Raporu\n\n" +
        "Kurslarınızdaki öğrencilerin gelişim süreçlerini analiz ettiğimde şu temel başlıklar öne çıkmaktadır:\n\n" +
        "1. **Kavrama Düzeyi (%78):** Öğrenciler video derslerinizi ortalama %85 oranında tamamlamışlardır. Limit ve türev testlerindeki başarı oranı yüksektir.\n" +
        "2. **Zorlanılan Alanlar:** İntegral konusundaki çoktan seçmeli sorularda hata oranı %42'ye ulaşmaktadır. Bu bölüme ek bir soru çözüm dersi tanımlamanızı öneririm.\n" +
        "3. **Öneriler:** Haftalık interaktif deneme sınavları ekleyerek öğrencilerin pratik yapmasını sağlayabilirsiniz. Dilerseniz hemen bir integral çalışma föyü hazırlayabilirim!"
      );
    }
    
    if (queryLower.includes("ders planı") || queryLower.includes("hazırlanır")) {
      return (
        "### 5 Adımda Etkili Ders Planı Şablonu\n\n" +
        "Canlı dersleriniz veya video içerikleriniz için şu pedagojik akışı takip edebilirsiniz:\n\n" +
        "1. **Giriş & Köprü Kuralı (5 Dk):** Derse güncel bir problemle başlayın. Bir önceki konudaki can alıcı bir soruya atıfta bulunun.\n" +
        "2. **Kavramsal Aktarım (15 Dk):** Konunun teorik altyapısını görsel veya akıllı tahta yardımıyla sadeleştirerek anlatın.\n" +
        "3. **Uygulama & Birlikte Çözüm (15 Dk):** Önce basit bir örnek çözün, ardından zorluk seviyesini artırın.\n" +
        "4. **Etkin Katılım & Quiz (10 Dk):** Öğrencilere anlık bir test yönlendirin veya canlı sohbette şıkları işaretlemelerini isteyin.\n" +
        "5. **Özet & Ödevlendirme (5 Dk):** Konuyu 2 cümleyle özetleyin ve haftalık kütüphane dokümanını incelemelerini önerin."
      );
    }

    if (queryLower.includes("motivasyon") || queryLower.includes("arttırabilirim")) {
      return (
        "### Öğrenci Motivasyonunu Artırma Stratejileri\n\n" +
        "Online eğitimde öğrencilerin ilgisini canlı tutmak için kullanabileceğiniz 4 premium teknik:\n\n" +
        "1. **Mikro-Ödüllendirme:** Ödev teslimatlarını zamanında yapan ilk 3 öğrenciye bir sonraki canlı derste söz hakkı verin veya dijital rozet tanımlayın.\n" +
        "2. **Kişiselleştirilmiş Geribildirim:** Ödev veya test notlandırmalarında öğrencilere sadece puan vermeyin. Hatalarını açıklayan 2 cümlelik yapıcı yorumlar yazın (sonner bildirimleriyle anında görürler!).\n" +
        "3. **Akran Etkileşimi:** Canlı derslerde mini grup çalışmaları düzenleyerek öğrencilerin birbirleriyle fikir alışverişi yapmasına fırsat tanıyın.\n" +
        "4. **Gerçek Hayat Örnekleri:** Formülleri soyut bırakmayın. Örneğin; 'Bu integral denklemi oyun programlamada karakterlerin zıplama ivmesini hesaplamak için kullanılır' şeklinde bağlamlar kurun."
      );
    }

    return (
      `**Sistem Deneme Modunda Çalışıyor.**\n\n` +
      `Sorduğunuz soru: "${userMessage}"\n\n` +
      `Eğitim asistanınız olarak bu konudaki önerilerim şunlardır:\n\n` +
      `* **Planlama Yapın:** Konuyu küçük öğrenme hedeflerine bölün.\n` +
      `* **Ölçme ve Değerlendirme:** Öğrencilere çoktan seçmeli interaktif quizler tanımlayarak anlık geri bildirim sağlayın.\n` +
      `* **Kütüphanenizi Aktif Tutun:** Öğrencilerinizin indirebileceği PDF kaynakları ve izleyebileceği YouTube linklerini kütüphanenize yükleyin.\n\n` +
      `> [!TIP]\n` +
      `> **Gerçek Yapay Zeka Yanıtları Almak İster misiniz?**\n` +
      `> Sağ üstteki **"API Anahtarı Ayarları"** butonuna tıklayarak kendi Gemini, ChatGPT veya Claude API anahtarınızı ekleyin. Böylece tamamen size özel canlı yapay zeka modelini kullanabilirsiniz.`
    );
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
        text: `⚠️ **Hata:** Yanıt alınamadı. ${error.message || "Lütfen API anahtarınızı ve internet bağlantınızı kontrol ediniz."}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const activeKeyExists = () => {
    if (settings.provider === "gemini") return !!settings.geminiKey.trim();
    if (settings.provider === "chatgpt") return !!settings.openaiKey.trim();
    if (settings.provider === "claude") return !!settings.claudeKey.trim();
    return false;
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
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowGuide(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-bold text-xs transition-all"
          >
            📖 Kurulum Kılavuzu
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-bold text-xs shadow-md shadow-teal-500/10 hover:shadow-lg transition-all"
          >
            ⚙️ API Anahtarı Ayarları
          </button>
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
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${activeKeyExists() ? "bg-emerald-400" : "bg-amber-400"}`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${activeKeyExists() ? "bg-emerald-500" : "bg-amber-500"}`}></span>
              </span>
              <div>
                <h3 className="font-bold text-sm text-gray-800">Sohbet Ekranı</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                  Sağlayıcı: <span className="text-teal-600 font-extrabold">{settings.provider.toUpperCase()}</span>
                  {!activeKeyExists() && " (DENEME MODU)"}
                </p>
              </div>
            </div>
            {!activeKeyExists() && (
              <span className="px-2.5 py-1 bg-amber-50 border border-amber-100 rounded-md text-[10px] font-bold text-amber-700">
                ⚠️ API Anahtarı Eksik
              </span>
            )}
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

      {/* API Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-2xl max-w-lg w-full overflow-hidden animate-slideUp">
            <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-6 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">API Anahtarı & Model Ayarları</h3>
                <p className="text-teal-100 text-xs mt-1">Kendi AI modelinizi bağlayarak canlı veriyle çalışın.</p>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all"
              >
                ✕
              </button>
            </div>
            
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                saveSettings({
                  provider: formData.get("provider") as any,
                  geminiKey: formData.get("geminiKey") as string,
                  openaiKey: formData.get("openaiKey") as string,
                  claudeKey: formData.get("claudeKey") as string,
                  systemPrompt: formData.get("systemPrompt") as string,
                  temperature: parseFloat(formData.get("temperature") as string) || 0.7,
                });
                setShowSettings(false);
              }}
              className="p-6 space-y-5 max-h-[500px] overflow-y-auto"
            >
              {/* Provider Selection */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-600 uppercase tracking-wide">Yapay Zeka Servis Sağlayıcı</label>
                <select
                  name="provider"
                  defaultValue={settings.provider}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 font-semibold text-sm focus:outline-none focus:border-teal-500"
                >
                  <option value="gemini">Google Gemini Pro (Önerilen - Ücretsiz Seçenekli)</option>
                  <option value="chatgpt">OpenAI ChatGPT (GPT-4o Mini)</option>
                  <option value="claude">Anthropic Claude (Sonnet 3.5)</option>
                </select>
              </div>

              {/* Gemini Key */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-600 uppercase tracking-wide flex items-center justify-between">
                  <span>Google Gemini API Key</span>
                  <span className="text-[10px] text-teal-600 lowercase font-bold">Ücretsiz alınabilir</span>
                </label>
                <input
                  type="password"
                  name="geminiKey"
                  defaultValue={settings.geminiKey}
                  placeholder="AIzaSy..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* OpenAI Key */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-600 uppercase tracking-wide">OpenAI (ChatGPT) API Key</label>
                <input
                  type="password"
                  name="openaiKey"
                  defaultValue={settings.openaiKey}
                  placeholder="sk-proj-..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Claude Key */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-600 uppercase tracking-wide">Anthropic Claude API Key</label>
                <input
                  type="password"
                  name="claudeKey"
                  defaultValue={settings.claudeKey}
                  placeholder="sk-ant-..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* System Prompt */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-600 uppercase tracking-wide">Sistem Talimatı (Prompt)</label>
                <textarea
                  name="systemPrompt"
                  defaultValue={settings.systemPrompt}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-teal-500 resize-none font-semibold text-gray-700"
                />
              </div>

              {/* Temperature */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-600 uppercase tracking-wide flex justify-between">
                  <span>Yaratıcılık Derecesi (Temperature)</span>
                </label>
                <input
                  type="range"
                  name="temperature"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  defaultValue={settings.temperature}
                  className="w-full accent-teal-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase">
                  <span>Daha Net/Kesin</span>
                  <span>Daha Yaratıcı</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs transition-all"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-bold text-xs shadow-md shadow-teal-500/10 hover:shadow-lg transition-all"
                >
                  Değişiklikleri Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Setup Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-2xl max-w-2xl w-full overflow-hidden animate-slideUp">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">📖 Yapay Zeka API Anahtarı Alma Kılavuzu</h3>
                <p className="text-blue-100 text-xs mt-1">Hızlıca ve kolayca kendinize özel API anahtarınızı edinin.</p>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Tab Navigation inside Guide */}
              <div className="flex border-b border-gray-200">
                {[
                  { key: "gemini", label: "Google Gemini (Ücretsiz)" },
                  { key: "openai", label: "OpenAI ChatGPT" },
                  { key: "claude", label: "Anthropic Claude" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveGuideTab(tab.key as any)}
                    className={`pb-3 px-4 font-bold text-xs relative transition-colors ${
                      activeGuideTab === tab.key ? "text-blue-600 font-extrabold" : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {tab.label}
                    {activeGuideTab === tab.key && (
                      <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-600 rounded-full"></span>
                    )}
                  </button>
                ))}
              </div>

              {/* Guide Contents */}
              <div className="space-y-4 max-h-[300px] overflow-y-auto text-xs leading-relaxed text-gray-700 font-medium">
                {activeGuideTab === "gemini" && (
                  <div className="space-y-4">
                    <p className="font-bold text-slate-800 text-sm">Google Gemini API Anahtarı Nasıl Alınır? (Dakikalar İçinde - Ücretsiz)</p>
                    <ol className="list-decimal list-inside space-y-2.5">
                      <li>
                        Tarayıcınızdan <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline">Google AI Studio</a> platformuna gidin.
                      </li>
                      <li>Google (Gmail) hesabınızla giriş yapın.</li>
                      <li>Sol üst menüdeki mavi renkli <strong>"Get API Key" (API Anahtarı Al)</strong> butonuna tıklayın.</li>
                      <li>Açılan pencerede <strong>"Create API Key"</strong> butonuna tıklayarak yeni bir anahtar oluşturun.</li>
                      <li>Oluşturulan anahtarı kopyalayın ve asistan ayarlarındaki <strong>Gemini API Key</strong> kutusuna yapıştırıp kaydedin!</li>
                    </ol>
                    <div className="p-3.5 bg-green-50 border border-green-200 rounded-xl text-green-800 font-semibold flex gap-2">
                      <span>💡</span>
                      <span>Gemini API anahtarı dakikada 15 isteğe kadar tamamen ÜCRETSİZDİR ve öğretmenler için en pratik seçenektir!</span>
                    </div>
                  </div>
                )}

                {activeGuideTab === "openai" && (
                  <div className="space-y-4">
                    <p className="font-bold text-slate-800 text-sm">OpenAI ChatGPT API Anahtarı Nasıl Alınır?</p>
                    <ol className="list-decimal list-inside space-y-2.5">
                      <li>
                        <a href="https://platform.openai.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline">OpenAI Developer Platform</a> web sitesine gidin.
                      </li>
                      <li>Hesabınıza giriş yapın veya yeni bir hesap oluşturun.</li>
                      <li>Sol menüde bulunan <strong>"API Keys"</strong> seçeneğine tıklayın.</li>
                      <li><strong>"Create new secret key" (Yeni gizli anahtar oluştur)</strong> butonuna tıklayın ve bir isim vererek oluşturun.</li>
                      <li>Oluşturulan <code>sk-proj-...</code> kodunu hemen kopyalayın (tek bir kez gösterilir) ve asistan ayarlarındaki OpenAI API Key alanına yapıştırın.</li>
                    </ol>
                    <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 font-semibold flex gap-2">
                      <span>⚠️</span>
                      <span>OpenAI API anahtarı kullanabilmek için OpenAI hesabınızda en az 5$ yüklü bakiye (credit) bulunması gerekmektedir.</span>
                    </div>
                  </div>
                )}

                {activeGuideTab === "claude" && (
                  <div className="space-y-4">
                    <p className="font-bold text-slate-800 text-sm">Anthropic Claude API Anahtarı Nasıl Alınır?</p>
                    <ol className="list-decimal list-inside space-y-2.5">
                      <li>
                        <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline">Anthropic Console</a> sayfasına gidin.
                      </li>
                      <li>Kaydolun veya mevcut hesabınızla giriş yapın.</li>
                      <li>Üst menüdeki <strong>"API Keys"</strong> sekmesine geçin.</li>
                      <li><strong>"Create Key"</strong> butonuna tıklayın ve bir isim vererek oluşturun.</li>
                      <li>Kodunuzu kopyalayın ve asistan ayarlarındaki Claude API Key alanına kaydedin.</li>
                    </ol>
                  </div>
                )}
              </div>

              {/* Guide Footer */}
              <div className="flex items-center justify-end pt-4 border-t border-gray-100">
                <button
                  onClick={() => setShowGuide(false)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition-all"
                >
                  Anladım, Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
