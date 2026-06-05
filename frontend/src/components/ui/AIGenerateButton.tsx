"use client";

import React, { useState } from 'react';

interface AIGenerateButtonProps {
  type: 'description' | 'quiz';
  promptData: string;
  onSuccess: (generatedText: string) => void;
  buttonText?: string;
  className?: string;
}

export function AIGenerateButton({ type, promptData, onSuccess, buttonText, className }: AIGenerateButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!promptData.trim()) {
      setError("Lütfen önce bir konu veya başlık girin.");
      setTimeout(() => setError(null), 3000);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/ai/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: promptData,
          type: type
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      onSuccess(data.content);
    } catch (err) {
      console.error('Error generating content:', err);
      setError("İçerik üretilirken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={(e) => { e.preventDefault(); handleGenerate(); }}
        disabled={isLoading}
        className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-lg hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transition-all font-medium disabled:opacity-70 ${className || ''}`}
      >
        <span>✨</span>
        {isLoading ? 'Üretiliyor...' : (buttonText || 'Yapay Zeka ile Üret')}
      </button>
      {error && (
        <div className="absolute top-full left-0 mt-2 w-max max-w-xs bg-red-100 text-red-700 text-xs px-2 py-1 rounded shadow-sm z-10">
          {error}
        </div>
      )}
    </div>
  );
}
