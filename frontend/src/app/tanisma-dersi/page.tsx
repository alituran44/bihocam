"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Header from "@/components/Header";

// Types
type Message = {
  id: string;
  sender: "ai" | "user";
  text: string;
  options?: string[];
  isResult?: boolean;
};

// Mock Teachers
const MOCK_TEACHERS = [
  { id: 1, name: "Ahmet Y.", brans: "Matematik", puan: 4.9, bio: "15 yıllık deneyimli, olimpiyat tecrübesi", img: "https://i.pravatar.cc/150?u=a042581f4e29026024d" },
  { id: 2, name: "Zeynep S.", brans: "Fizik & Matematik", puan: 4.8, bio: "Öğrenci merkezli, yeni nesil soru uzmanı", img: "https://i.pravatar.cc/150?u=a042581f4e29026704d" },
  { id: 3, name: "Burak E.", brans: "Matematik", puan: 5.0, bio: "Boğaziçi Üniversitesi mezunu, hızlı tempoya uygun", img: "https://i.pravatar.cc/150?u=a048581f4e29026701d" },
];

export default function AITanismaDersiPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      sender: "ai",
      text: "Merhaba! Ben Bihocam Yapay Zeka Eğitim Danışmanınız. 🤖\n\nSizin için en doğru öğretmeni bulmamı ister misiniz? İlk olarak, hangi eğitim kategorisiyle ilgilendiğinizi seçebilir misiniz?",
      options: ["İlkokul", "Ortaokul", "Lise", "Yabancı Dil", "Koçluk", "Beceri"]
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleOptionSelect = (option: string, messageId: string) => {
    // Remove options from the previous AI message so they can't click again
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, options: undefined } : m));
    
    // Add user message
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: "user", text: option }]);
    
    // Trigger AI thinking
    setIsTyping(true);

    // AI Response Logic based on length (mocking a dynamic conversation)
    setTimeout(() => {
      setIsTyping(false);
      const step = messages.length; // Approximate step tracking
      
      let nextMessage: Message;
      
      if (step < 3) {
        // Step 2
        let dynamicOptions = ["Matematik ve Fen", "Sözel Dersler", "Yabancı Dil Pratiği", "Sınav Hazırlığı", "Sadece Koçluk"]; // Default fallback
        
        if (option === "İlkokul") dynamicOptions = ["Okuma Yazma", "Temel Matematik", "İngilizceye Giriş", "Bursluluk Sınavı", "Ödevlere Yardım"];
        else if (option === "Ortaokul") dynamicOptions = ["LGS Matematik", "Fen Bilimleri", "LGS Türkçe", "Sosyal Bilgiler", "Yabancı Dil"];
        else if (option === "Lise") dynamicOptions = ["YKS Matematik (TYT/AYT)", "Fizik, Kimya, Biyoloji", "Türkçe ve Edebiyat", "Tarih, Coğrafya", "Yabancı Dil"];
        else if (option === "Yabancı Dil") dynamicOptions = ["İngilizce Konuşma Pratiği", "YDS / TOEFL / IELTS", "Almanca", "Fransızca", "İspanyolca"];
        else if (option === "Koçluk") dynamicOptions = ["Öğrenci Koçluğu (Motivasyon)", "Sınav Koçluğu (LGS/YKS)", "Kariyer Danışmanlığı", "Zaman Yönetimi", "Tercih Danışmanlığı"];
        else if (option === "Beceri") dynamicOptions = ["Hızlı Okuma", "Robotik Kodlama", "Müzik / Enstrüman", "Satranç", "Diksiyon ve Hitabet"];

        nextMessage = {
          id: Date.now().toString(),
          sender: "ai",
          text: `Harika, ${option} kategorisini not aldım. Peki en çok hangi konularda veya derslerde desteğe ihtiyacınız var? (Birden fazla yazabilirsiniz)`,
          options: dynamicOptions
        };
      } else if (step < 5) {
        // Step 3
        nextMessage = {
          id: Date.now().toString(),
          sender: "ai",
          text: `Anladım. Özel derslerde öğrencinin çalışma disiplinini nasıl tanımlarsınız? Bu, ona en uygun mizaçtaki öğretmeni seçmem için önemli.`,
          options: ["Çok disiplinli, kendi çalışır", "Biraz yönlendirme gerekiyor", "Odaklanma sorunu yaşıyor", "Sınav stresi yüksek"]
        };
      } else if (step < 7) {
        // Step 4
        nextMessage = {
          id: Date.now().toString(),
          sender: "ai",
          text: `Teşekkürler, bu bilgi eşleştirme için çok değerli! Son olarak dersleri hangi zaman diliminde almak istersiniz?`,
          options: ["Hafta İçi Akşam", "Hafta Sonu Gündüz", "Hafta Sonu Akşam", "Farketmez, öğretmene uyarım"]
        };
      } else {
        // Final Step
        nextMessage = {
          id: Date.now().toString(),
          sender: "ai",
          text: `Harika! Verdiğiniz tüm bilgileri analiz ettim... Sizin öğrenme tarzınıza, hedeflerinize ve takviminize en uygun öğretmenleri listeledim. 👇\n\nİnceleyip istediğiniz eğitmenden anında 'Tanışma Dersi' talep edebilirsiniz!`,
          isResult: true
        };
      }
      
      setMessages(prev => [...prev, nextMessage]);
    }, 1500);
  };

  const handleCustomInput = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const text = formData.get("userInput") as string;
    if (!text.trim()) return;
    
    e.currentTarget.reset();
    
    // Remove options from last message if any
    setMessages(prev => {
      const newMsgs = [...prev];
      const lastAiMsg = newMsgs.filter(m => m.sender === "ai").pop();
      if (lastAiMsg) lastAiMsg.options = undefined;
      return newMsgs;
    });

    setMessages(prev => [...prev, { id: Date.now().toString(), sender: "user", text }]);
    
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      
      // Generic fallback response if they type custom
      if (messages.length < 5) {
         setMessages(prev => [...prev, {
            id: Date.now().toString(),
            sender: "ai",
            text: "Not aldım. Eğitimin verimli olması adına, öğrencinin çalışma tarzından veya hedeflerinden kısaca bahseder misiniz?",
            options: ["Desteğe ihtiyacı var", "Çok hırslı", "Dikkat dağınıklığı var"]
         }]);
      } else {
         setMessages(prev => [...prev, {
            id: Date.now().toString(),
            sender: "ai",
            text: "Tüm notlarınızı aldım. Sistemimizdeki yüzlerce uzman arasından size en uygun profilleri çıkardım! 👇",
            isResult: true
         }]);
      }
    }, 1500);
  };

  return (
    <div className="h-screen bg-[#F8FAFC] flex flex-col font-sans overflow-hidden">
      <Header />
      
      <main className="flex-1 flex flex-col pt-24 pb-6 overflow-hidden">
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 h-full flex flex-col shadow-xl rounded-b-3xl">
          
          {/* Header Area */}
          <div className="bg-white rounded-t-3xl p-6 border-b border-gray-100 flex items-center justify-between shadow-sm z-10 shrink-0">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 shadow-lg">
                   <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
                      <img src="/calm_student.png" alt="AI Danışman" className="w-10 h-10 object-contain translate-y-1" onError={(e) => e.currentTarget.style.display='none'} />
                   </div>
                </div>
                <div>
                   <h2 className="font-black text-lg text-slate-900">Bihocam Yapay Zeka</h2>
                   <div className="flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                     <span className="text-xs font-bold text-slate-500">Şu an çevrimiçi, size yardımcı olmaya hazır</span>
                   </div>
                </div>
             </div>
             <Link href="/" className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
               ✕
             </Link>
          </div>

          {/* Chat Messages Area */}
          <div className="flex-1 bg-slate-50/50 overflow-y-auto p-4 sm:p-6 space-y-6 relative border-x border-slate-200">
             <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[75%]">
                       {msg.sender === "ai" && (
                         <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 shrink-0 flex items-center justify-center shadow-md mb-1">
                           <span className="text-white text-xs">🤖</span>
                         </div>
                       )}
                       
                       <div className={`p-4 rounded-2xl whitespace-pre-wrap font-medium text-[15px] leading-relaxed shadow-sm ${
                         msg.sender === "user" 
                           ? "bg-blue-600 text-white rounded-br-none" 
                           : "bg-white text-slate-700 border border-slate-100 rounded-bl-none"
                       }`}>
                         {msg.text}
                       </div>
                    </div>

                    {/* AI Options Buttons */}
                    {msg.options && msg.options.length > 0 && (
                      <div className="ml-10 mt-3 flex flex-wrap gap-2">
                        {msg.options.map((opt, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleOptionSelect(opt, msg.id)}
                            className="px-4 py-2 bg-white border border-blue-200 text-blue-600 font-bold text-sm rounded-full hover:bg-blue-50 hover:border-blue-300 transition-colors shadow-sm"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Final Result Render */}
                    {msg.isResult && (
                      <div className="ml-10 mt-4 w-full max-w-2xl space-y-4">
                         {MOCK_TEACHERS.map(t => (
                            <div key={t.id} className="bg-white border border-slate-200 hover:border-emerald-400 rounded-2xl p-4 flex flex-col sm:flex-row items-center sm:items-start gap-4 transition-all shadow-sm group">
                              <img src={t.img} alt={t.name} className="w-16 h-16 rounded-full object-cover shadow-sm ring-4 ring-slate-50" />
                              <div className="flex-1 text-center sm:text-left space-y-1">
                                 <h4 className="text-lg font-black text-slate-900">{t.name}</h4>
                                 <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                                   <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">{t.brans}</span>
                                   <span className="text-orange-500 flex items-center gap-1 text-xs font-bold">
                                     ⭐ {t.puan}
                                   </span>
                                 </div>
                                 <p className="text-slate-500 text-xs mt-1 font-medium">{t.bio}</p>
                              </div>
                              <div className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center sm:justify-end sm:h-16">
                                 <Link href={`/instructors/${t.id}`} className="w-full sm:w-auto text-center px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-md transition-colors text-sm">
                                   Hemen Başla
                                 </Link>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </motion.div>
                ))}
             </AnimatePresence>

             {/* Typing Indicator */}
             {isTyping && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex items-end gap-2"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 shrink-0 flex items-center justify-center shadow-md mb-1">
                     <span className="text-white text-xs">🤖</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-slate-100 shadow-sm flex items-center gap-1.5 h-12">
                     <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></span>
                     <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                     <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
                  </div>
                </motion.div>
             )}
             
             <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="bg-white rounded-b-3xl p-4 border-t border-gray-100 shrink-0">
             <form onSubmit={handleCustomInput} className="relative flex items-center">
               <input
                 type="text"
                 name="userInput"
                 placeholder="Cevabınızı buraya yazabilirsiniz..."
                 disabled={isTyping}
                 className="w-full pl-6 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-full text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all disabled:opacity-50"
                 autoComplete="off"
               />
               <button 
                 type="submit" 
                 disabled={isTyping}
                 className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50"
               >
                 <svg className="w-5 h-5 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                   <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                 </svg>
               </button>
             </form>
             <p className="text-center text-[10px] font-semibold text-slate-400 mt-3">
               Yapay zeka asistanımız size en uygun öğretmeni bulmak için cevaplarınızı analiz eder.
             </p>
          </div>
          
        </div>
      </main>
    </div>
  );
}
