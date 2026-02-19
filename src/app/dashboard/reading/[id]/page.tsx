"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getExternalBibleLink } from "@/lib/bible-lookup";
import { ArrowLeft, CheckCircle2, Loader2, ExternalLink, BookOpen } from "lucide-react";

interface PlanReading {
  id: string;
  scripture: string;
  is_completed: boolean;
  [key: string]: unknown;
}

// ⭐ 智慧解析器：將長字串拆分成不同的書卷群組，並產生對應的連結用字串
const parseScriptureGroups = (text: string) => {
  if (!text) return [];
  const chapters = text.split(/[,，]/).map(s => s.trim()).filter(Boolean);
  if (chapters.length === 0) return [];

  const groups: { display: string, linkQuery: string }[] = [];
  let currentBook = "";
  let startChapter = "";
  let lastChapter = "";

  chapters.forEach((chap, index) => {
    // 自動拆分「中文書卷」與「數字」
    const match = chap.match(/^([^\d]+)\s*(\d+.*)$/);
    const book = match ? match[1].trim() : chap;
    const num = match ? match[2].trim() : "";

    if (book !== currentBook) {
      if (currentBook) {
         groups.push({
             display: startChapter === lastChapter ? `${currentBook} ${startChapter}` : `${currentBook} ${startChapter}~${lastChapter}`,
             linkQuery: `${currentBook} ${startChapter}` // ⭐ 連結永遠指向該群組的第一章
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

export default function ReadingPage() {
  return (
    <Suspense fallback={<div className="p-10 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>}>
      <ReadingContent />
    </Suspense>
  );
}

function ReadingContent() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();
  const [reading, setReading] = useState<PlanReading | null>(null);
  const [loading, setLoading] = useState(true);

  const specificRef = searchParams.get('ref');

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from("plan_readings").select("*").eq("id", id).single();
      if (data) setReading(data);
      setLoading(false);
    };
    fetchData();
  }, [id, supabase]);

  const handleComplete = async () => {
    await supabase.from("plan_readings").update({ is_completed: true }).eq("id", id);
    router.back();
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  const currentRef = specificRef || reading?.scripture || "";
  
  // ⭐ 使用解析器取得分組資料
  const groups = parseScriptureGroups(currentRef);
  const displayTitle = groups.map(g => g.display).join(', '); // 組合出大標題

  return (
    <div className="min-h-screen bg-[#fcfaf7] flex flex-col">
      <nav className="p-4 flex items-center gap-4 bg-white border-b border-orange-100">
        <button onClick={() => router.back()} className="p-2 hover:bg-orange-50 rounded-full transition-colors">
          <ArrowLeft className="h-6 w-6 text-gray-600" />
        </button>
        <h1 className="font-bold text-gray-800">閱讀任務</h1>
      </nav>

      <main className="flex-1 max-w-xl mx-auto px-6 py-12 flex flex-col items-center text-center">
        <div className="bg-blue-50 p-5 rounded-full mb-6">
            <BookOpen className="h-12 w-12 text-blue-600" />
        </div>
        
        {/* ⭐ 這裡的大標題也會變漂亮，不再是落落長的字串 */}
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">{displayTitle}</h2>
        <p className="text-gray-500 mb-8 leading-relaxed text-sm sm:text-base">
            即將前往 <strong>YouVersion (bible.com)</strong> 閱讀經文。<br/>
            若進度包含多卷書，請依序點擊下方按鈕閱讀。
        </p>

        {/* ⭐ 動態產生多個閱讀按鈕 */}
        <div className="w-full space-y-3 mb-8">
            {groups.map((group, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 sm:px-6 sm:py-5 rounded-2xl shadow-sm border border-gray-100 gap-4 hover:border-blue-200 transition-colors">
                    <div className="flex items-center gap-2 font-bold text-xl text-gray-800">
                        📖 {group.display}
                    </div>
                    <a 
                        href={getExternalBibleLink(group.linkQuery)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto bg-black text-white px-6 py-3 rounded-xl font-bold text-base shadow-md hover:bg-gray-800 hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                        <ExternalLink className="h-5 w-5" />
                        前往閱讀
                    </a>
                </div>
            ))}
        </div>

        <div className="w-full flex items-center gap-4 my-6">
            <div className="h-px flex-1 bg-gray-200"></div>
            <span className="text-gray-400 text-sm">今日進度閱讀完畢後</span>
            <div className="h-px flex-1 bg-gray-200"></div>
        </div>

        {/* 在 App 內標記完成 */}
        <button 
            onClick={handleComplete} 
            className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold text-xl shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
        >
            <CheckCircle2 className="h-6 w-6" />
            標記為今日全部完成
        </button>

        <p className="mt-8 text-sm text-gray-400">
            © 靈修進度由 Scripture Flow 持續追蹤
        </p>
      </main>
    </div>
  );
}