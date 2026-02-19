"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, BookOpen, ExternalLink, Share2, Check } from "lucide-react";

const BOOK_CODES: Record<string, string> = {
  "創世記": "GEN", "出埃及記": "EXO", "利未記": "LEV", "民數記": "NUM", "申命記": "DEU",
  "約書亞記": "JOS", "士師記": "JDG", "路得記": "RUT", "撒母耳記上": "1SA", "撒母耳記下": "2SA",
  "列王紀上": "1KI", "列王紀下": "2KI", "歷代志上": "1CH", "歷代志下": "2CH", "以斯拉記": "EZR",
  "尼希米記": "NEH", "以斯帖記": "EST", "約伯記": "JOB", "詩篇": "PSA", "箴言": "PRO",
  "傳道書": "ECC", "雅歌": "SNG", "以賽亞書": "ISA", "耶利米書": "JER", "耶利米哀歌": "LAM",
  "以西結書": "EZK", "但以理書": "DAN", "何西阿書": "HOS", "約珥書": "JOL", "阿摩司書": "AMO",
  "俄巴底亞書": "OBA", "約拿書": "JON", "彌迦書": "MIC", "那鴻書": "NAM", "哈巴谷書": "HAB",
  "西番雅書": "ZEP", "哈該書": "HAG", "撒迦利亞書": "ZEC", "瑪拉基書": "MAL",
  "馬太福音": "MAT", "馬可福音": "MRK", "路加福音": "LUK", "約翰福音": "JHN", "使徒行傳": "ACT",
  "羅馬書": "ROM", "哥林多前書": "1CO", "哥林多後書": "2CO", "加拉太書": "GAL", "以弗所書": "EPH",
  "腓立比書": "PHP", "歌羅西書": "COL", "帖撒羅尼迦前書": "1TH", "帖撒羅尼迦後書": "2TH",
  "提摩太前書": "1TI", "提摩太後書": "2TI", "提多書": "TIT", "腓利門書": "PHM", "希伯來書": "HEB",
  "雅各書": "JAS", "彼得前書": "1PE", "彼得後書": "2PE", "約翰一書": "1JN", "約翰二書": "2JN",
  "約翰三書": "3JN", "猶大書": "JUD", "啟示錄": "REV"
};

const getExternalBibleLink = (query: string) => {
  const parts = query.trim().split(/\s+/);
  if (parts.length < 2) return `https://www.bible.com/bible/46/GEN.1.CUNP-神`; 
  const bookName = parts[0];
  const startChapter = parseInt(parts[1]) || 1; 
  const bookCode = BOOK_CODES[bookName] || "GEN";
  return `https://www.bible.com/bible/46/${bookCode}.${startChapter}.CUNP-神`;
};

// ⭐ 升級版：不但產生縮寫標題，還能輸出分組資料供按鈕使用
const parseScriptureGroups = (text: string) => {
  if (!text) return [];
  const chapters = text.split(/[,，]/).map(s => s.trim()).filter(Boolean);
  if (chapters.length === 0) return [];

  const groups: { display: string, linkQuery: string }[] = [];
  let currentBook = "";
  let startChapter = "";
  let lastChapter = "";

  chapters.forEach((chap, index) => {
    const match = chap.match(/^([^\d]+)\s*(\d+.*)$/);
    const book = match ? match[1].trim() : chap;
    const num = match ? match[2].trim() : "";

    if (book !== currentBook) {
      if (currentBook) {
         groups.push({
             display: startChapter === lastChapter ? `${currentBook} ${startChapter}` : `${currentBook} ${startChapter}~${lastChapter}`,
             linkQuery: `${currentBook} ${startChapter}`
         });
      }
      currentBook = book;
      startChapter = num;
      lastChapter = num;
    } else {
      lastChapter = num;
    }

    if (index === chapters.length - 1) {
       groups.push({
           display: startChapter === lastChapter ? `${currentBook} ${startChapter}` : `${currentBook} ${startChapter}~${lastChapter}`,
           linkQuery: `${currentBook} ${startChapter}`
       });
    }
  });

  return groups;
};

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