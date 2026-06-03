"use client";

import { useQuery } from "@tanstack/react-query";
import { socialApi } from "@/lib/api";
import Link from "next/link";
import { useState } from "react";

export default function SavedReelsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: savedPosts, isLoading } = useQuery({
    queryKey: ["social-saved-posts"],
    queryFn: () => socialApi.getSavedPosts(),
  });

  const filteredPosts = savedPosts?.filter((saved: any) => {
    if (!searchQuery) return true;
    const content = saved.post?.content?.toLowerCase() || "";
    const title = saved.post?.title?.toLowerCase() || "";
    const search = searchQuery.toLowerCase();
    return content.includes(search) || title.includes(search);
  });

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-teal-600 font-bold uppercase tracking-wider text-xs mb-2">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <span>İlham Panosu</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Kaydedilen <span className="text-teal-600">Klipler</span>
          </h1>
          <p className="mt-2 text-sm text-gray-500 max-w-2xl">
            Diğer eğitmenlerden ilham aldığın ve daha sonra izlemek üzere kaydettiğin içerikler.
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-72 mt-2 md:mt-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-2xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm transition-all"
            placeholder="Kliplerde ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white/50 backdrop-blur-sm rounded-[3rem] border-2 border-dashed border-gray-200 p-8 min-h-[500px] flex flex-col items-center justify-center relative">
        
        {isLoading ? (
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">Klipler yükleniyor...</p>
          </div>
        ) : filteredPosts && filteredPosts.length > 0 ? (
          <div className="w-full h-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-start justify-start">
            {/* Grid of saved clips will go here */}
            {filteredPosts.map((saved: any) => (
              <Link href={`/dashboard/social/reels?id=${saved.post?.id}`} key={saved.id} className="group cursor-pointer">
                <div className="relative aspect-[9/16] bg-gray-900 rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl transition-all">
                  <video src={saved.post?.media_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                    <h3 className="text-white font-bold text-sm line-clamp-2">{saved.post?.title || "İsimsiz Klip"}</h3>
                    <p className="text-gray-300 text-xs mt-1 truncate">@{saved.post?.user?.full_name}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center text-center max-w-md">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center shadow-lg shadow-teal-500/40">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 mb-3 tracking-wide">
              Kaydedilen Klip Yok
            </h2>
            
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              Henüz hiçbir klibi kaydetmemişsin. Diğer eğitmenlerin neler yaptığını görmek için keşfete göz at!
            </p>
            
            <Link 
              href="/dashboard/social/reels" 
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl shadow-lg shadow-teal-600/30 transition-all text-sm"
            >
              Keşfete Git 
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
