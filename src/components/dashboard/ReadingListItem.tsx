"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, BookOpen, ExternalLink, Share2, Check } from "lucide-react";
import { parseScriptureGroups, getExternalBibleLink } from "@/lib/bible-lookup";

interface Reading {
  id: number;
  scripture: string;
  completed_chapters: string[];
  is_completed: boolean;
  theme?: string;
}

interface ReadingListItemProps {
  reading: Reading;
  onToggle: (id: number, status: boolean, chapters: string[]) => void;
  onShare: () => void;
  onUpdateChapters: (id: number, chapters: string[]) => void;
}

export default function ReadingListItem({ reading, onToggle, onShare, onUpdateChapters }: ReadingListItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const scriptureText = reading.scripture || "";
  const chapters = scriptureText.split(/[,，]/).map((s: string) => s.trim()).filter((s: string) => s !== "");

  // 取得分組資料與大標題
  const groups = parseScriptureGroups(scriptureText);
  const displayTitle = groups.map(g => g.display).join(', ');

  const readChapters = reading.completed_chapters || [];

  const toggleChapter = (chapter: string) => {
    const newChapters = readChapters.includes(chapter)
        ? readChapters.filter((c: string) => c !== chapter)
        : [...readChapters, chapter];
    
    onUpdateChapters(reading.id, newChapters);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
      <div className="p-4 sm:p-5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 sm:gap-4 cursor-pointer flex-1 min-w-0" onClick={() => setIsOpen(!isOpen)}>
          <div className={`p-2 sm:p-3 rounded-xl shrink-0 ${reading.is_completed ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
            <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className={`text-base sm:text-lg font-bold truncate ${reading.is_completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                {displayTitle}
              </h3>
              {chapters.length > 1 && (
                  isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs sm:text-sm text-gray-500 truncate">{reading.theme || "主要進度"}</p>
                {chapters.length > 1 && (
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                        {readChapters.length}/{chapters.length}
                    </span>
                )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button 
                onClick={(e) => { e.stopPropagation(); onShare(); }}
                className="p-2 text-slate-400 hover:text-blue-600 rounded-full transition-all"
            >
                <Share2 size={18} />
            </button>

            {/* ⭐ 這裡改成直接跳轉到詳細任務頁面 */}
            <Link 
              href={`/dashboard/reading/${reading.id}`}
              className="flex items-center gap-1 bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-colors px-3 py-2 rounded-lg font-bold text-xs"
              onClick={(e) => e.stopPropagation()} 
            >
              <ExternalLink size={14} />
              <span className="hidden sm:inline">任務詳情</span>
            </Link>

            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onToggle(reading.id, reading.is_completed, chapters);
                }}
                className={`px-3 sm:px-4 py-2 rounded-full font-bold text-xs transition-all ${
                    reading.is_completed ? 'bg-green-100 text-green-700' : 'bg-blue-600 text-white'
                }`}
            >
                {reading.is_completed ? '已完成' : '標記完成'}
            </button>
        </div>
      </div>

      {isOpen && chapters.length > 1 && (
        <div className="px-5 pb-5 pt-2 border-t border-gray-50 bg-gray-50/50">
          <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm">
            
            {/* ⭐ 新增：多卷書直接外連捷徑區塊 */}
            <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-gray-100">
                <span className="text-xs font-bold text-slate-400 self-center mr-1">快速閱讀：</span>
                {groups.map((g, idx) => (
                    <a
                        key={idx}
                        href={getExternalBibleLink(g.linkQuery)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-gray-700 transition-colors shadow-sm"
                    >
                        <ExternalLink size={12} />
                        {g.display}
                    </a>
                ))}
            </div>

            <p className="text-xs font-bold text-slate-400 mb-3">詳細章節紀錄：</p>
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                {chapters.map((chapter: string, index: number) => {
                    const isRead = readChapters.includes(chapter);
                    const chapterNum = chapter.trim().split(/\s+/).pop();
                    return (
                        <button 
                            key={index}
                            onClick={() => toggleChapter(chapter)}
                            className={`
                                h-10 rounded-lg text-xs font-bold border transition-all
                                ${isRead 
                                    ? 'bg-green-500 text-white border-green-600 shadow-sm scale-105' 
                                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-blue-300'}
                            `}
                        >
                            {chapterNum}
                            {isRead && <Check size={10} className="ml-1 inline opacity-50" />}
                        </button>
                    );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
