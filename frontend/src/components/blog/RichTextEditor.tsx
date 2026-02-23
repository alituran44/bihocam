"use client";

/**
 * EPIC-BLOG: Rich Text Editor Component (EP13-FE-03)
 * 
 * Simple and reliable contentEditable-based editor
 * WordPress-style WYSIWYG experience
 */

import { useState, useEffect, useRef } from "react";
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Type,
} from "lucide-react";
import { toast } from "sonner";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  readOnly?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "İçeriğinizi buraya yazın...",
  minHeight = "500px",
  readOnly = false,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Update word and character count
  useEffect(() => {
    if (editorRef.current) {
      const text = editorRef.current.innerText || "";
      setCharCount(text.length);
      setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
    }
  }, [value]);

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && !isInitialized) {
      if (value) {
        editorRef.current.innerHTML = value;
      } else {
        editorRef.current.innerHTML = "";
      }
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Update content when value changes externally
  useEffect(() => {
    if (editorRef.current && isInitialized) {
      const currentHtml = editorRef.current.innerHTML;
      if (value !== currentHtml && value !== undefined) {
        editorRef.current.innerHTML = value || "";
      }
    }
  }, [value, isInitialized]);

  // Handle content changes
  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);
    }
  };

  // Format commands
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  // Insert heading
  const insertHeading = (level: 1 | 2 | 3) => {
    execCommand("formatBlock", `h${level}`);
  };

  // Insert link
  const insertLink = () => {
    const url = prompt("Link URL'sini girin:");
    if (url) {
      execCommand("createLink", url);
    }
  };

  // Insert image
  const insertImage = () => {
    const url = prompt("Görsel URL'sini girin:");
    if (url) {
      execCommand("insertImage", url);
    }
  };

  return (
    <div className="border-2 border-gray-300 rounded-xl overflow-hidden bg-white shadow-sm">
      {!readOnly && (
        <div className="border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 via-white to-gray-50 p-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Text Formatting */}
            <div className="flex items-center gap-1 bg-white rounded border border-gray-200 p-1">
              <button
                type="button"
                onClick={() => execCommand("bold")}
                className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-700"
                title="Kalın"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => execCommand("italic")}
                className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-700"
                title="İtalik"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => execCommand("underline")}
                className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-700"
                title="Altı Çizili"
              >
                <Underline className="w-4 h-4" />
              </button>
            </div>

            <div className="w-px h-6 bg-gray-300"></div>

            {/* Headings */}
            <div className="flex items-center gap-1 bg-white rounded border border-gray-200 p-1">
              <button
                type="button"
                onClick={() => insertHeading(1)}
                className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-700"
                title="Başlık 1"
              >
                <Heading1 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertHeading(2)}
                className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-700"
                title="Başlık 2"
              >
                <Heading2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertHeading(3)}
                className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-700"
                title="Başlık 3"
              >
                <Heading3 className="w-4 h-4" />
              </button>
            </div>

            <div className="w-px h-6 bg-gray-300"></div>

            {/* Lists */}
            <div className="flex items-center gap-1 bg-white rounded border border-gray-200 p-1">
              <button
                type="button"
                onClick={() => execCommand("insertUnorderedList")}
                className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-700"
                title="Madde İşareti"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => execCommand("insertOrderedList")}
                className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-700"
                title="Numaralı Liste"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => execCommand("formatBlock", "blockquote")}
                className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-700"
                title="Alıntı"
              >
                <Quote className="w-4 h-4" />
              </button>
            </div>

            <div className="w-px h-6 bg-gray-300"></div>

            {/* Media */}
            <div className="flex items-center gap-1 bg-white rounded border border-gray-200 p-1">
              <button
                type="button"
                onClick={insertLink}
                className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-700"
                title="Link Ekle"
              >
                <LinkIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={insertImage}
                className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-700"
                title="Görsel Ekle"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!readOnly}
        onInput={handleInput}
        className="prose prose-lg max-w-none focus:outline-none p-6 min-h-[400px]"
        style={{ minHeight }}
        suppressContentEditableWarning
        data-placeholder={placeholder}
      />

      {/* Footer with Stats */}
      {!readOnly && (
        <div className="border-t-2 border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4 text-gray-600">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4" />
                <span className="font-medium">{wordCount.toLocaleString()}</span>
                <span>kelime</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{charCount.toLocaleString()}</span>
                <span>karakter</span>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {charCount > 0 && (
                <span>
                  Yaklaşık {Math.ceil(wordCount / 200)} dakika okuma süresi
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx global>{`
        [contenteditable="true"] {
          outline: none;
        }
        [contenteditable="true"]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
        }
        [contenteditable="true"] h1 {
          font-size: 2.25rem;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
          line-height: 1.2;
        }
        [contenteditable="true"] h2 {
          font-size: 1.875rem;
          font-weight: 700;
          margin-top: 1.25rem;
          margin-bottom: 0.75rem;
          line-height: 1.3;
        }
        [contenteditable="true"] h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          line-height: 1.4;
        }
        [contenteditable="true"] p {
          margin-bottom: 1rem;
          line-height: 1.75;
        }
        [contenteditable="true"] img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1rem 0;
        }
        [contenteditable="true"] a {
          color: #14b8a6;
          text-decoration: underline;
        }
        [contenteditable="true"] a:hover {
          color: #0d9488;
        }
        [contenteditable="true"] blockquote {
          border-left: 4px solid #14b8a6;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #6b7280;
        }
        [contenteditable="true"] ul,
        [contenteditable="true"] ol {
          margin: 1rem 0;
          padding-left: 2rem;
        }
        [contenteditable="true"] li {
          margin: 0.5rem 0;
        }
      `}</style>
    </div>
  );
}
