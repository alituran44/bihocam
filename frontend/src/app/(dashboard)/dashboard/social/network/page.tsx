"use client";

import { useQuery } from "@tanstack/react-query";
import { socialApi } from "@/lib/api";
import { useState } from "react";
import Avatar from "@/components/Avatar";

export default function NetworkPage() {
  const [activeTab, setActiveTab] = useState<"followers" | "following">("followers");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: followers = [], isLoading: isLoadingFollowers } = useQuery({
    queryKey: ["social-followers"],
    queryFn: () => socialApi.getFollowers(),
  });

  const { data: following = [], isLoading: isLoadingFollowing } = useQuery({
    queryKey: ["social-following"],
    queryFn: () => socialApi.getFollowing(),
  });

  const displayList = activeTab === "followers" ? followers : following;
  
  const filteredList = displayList.filter((item: any) => {
    if (!searchQuery) return true;
    const user = activeTab === "followers" ? item.follower : item.followed;
    const search = searchQuery.toLowerCase();
    return (
      (user?.full_name?.toLowerCase() || "").includes(search) ||
      (user?.email?.toLowerCase() || "").includes(search)
    );
  });

  const isLoading = activeTab === "followers" ? isLoadingFollowers : isLoadingFollowing;

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-100 text-teal-600 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Sosyal Ağ & Etkileşim
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Takipçi Ve <span className="text-teal-600">Takip</span>
        </h1>
        <p className="mt-2 text-sm text-gray-500 font-medium max-w-2xl">
          Profilinizi takip eden kitleyi tanıyın, diğer eğitmenler ile bağlantıda kalın ve sosyal etkileşimlerinizi yönetin.
        </p>
      </div>

      {/* Controls: Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        
        <div className="inline-flex bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100">
          <button
            onClick={() => setActiveTab("followers")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === "followers"
                ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Takipçilerim ({followers.length})
          </button>
          <button
            onClick={() => setActiveTab("following")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === "following"
                ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Takip Ettiklerim ({following.length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            className="w-full bg-white border border-gray-200 rounded-full pl-5 pr-4 py-3 text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-sm transition-all"
            placeholder="Takipçi ismi veya email ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* List Area */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredList.map((item: any) => {
              const user = activeTab === "followers" ? item.follower : item.followed;
              if (!user) return null;

              return (
                <div key={item.id} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name} className="w-14 h-14 rounded-2xl object-cover" />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center border border-teal-100">
                      <span className="text-xl font-bold text-teal-600">
                        {(user.full_name || "U").charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate mb-1">
                      {user.full_name || "İsimsiz Kullanıcı"}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 truncate">
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="truncate">{user.email}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Sonuç Bulunamadı
            </h3>
            <p className="text-sm text-gray-500">
              Arama kriterlerinize veya seçili sekmeye uygun kullanıcı yok.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
