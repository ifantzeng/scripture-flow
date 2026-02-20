"use client";

import { useMemo, useState, useRef } from "react";
import { BIBLE_BOOKS } from "@/lib/bible-data";
import { calculateBibleStats } from "@/lib/stats-helper";
import { 
  Calendar, TrendingUp, Bookmark, Camera, 
  Loader2, Quote, PenLine, 
  Share2 
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toPng } from 'html-to-image';

const BIBLE_CATEGORIES = {
  OT: [
    { name: "摩西五經", books: ["創世記", "出埃及記", "利未記", "民數記", "申命記"] },
    { name: "歷史書", books: ["約書亞記", "士師記", "路得記", "撒母耳記上", "撒母耳記下", "列王紀上", "列王紀下", "歷代志上", "歷代志下", "以斯拉記", "尼希米記", "以斯帖記"] },
    { name: "詩歌智慧書", books: ["約伯記", "詩篇", "箴言", "傳道書", "雅歌"] },
    { name: "大先知書", books: ["以賽亞書", "耶利米書", "耶利米哀歌", "以西結書", "但以理書"] },
    { name: "小先知書", books: ["何西阿書", "約珥書", "阿摩司書", "俄巴底亞書", "約拿書", "彌迦書", "那鴻書", "哈巴谷書", "西番雅書", "哈該書", "撒迦利亞書", "瑪拉基書"] }
  ],
  NT: [
    { name: "福音書", books: ["馬太福音", "馬可福音", "路加福音", "約翰福音"] },
    { name: "歷史書", books: ["使徒行傳"] },
    { name: "保羅書信", books: ["羅馬書", "哥林多前書", "哥林多後書", "加拉太書", "以弗所書", "腓立比書", "歌羅西書", "帖撒羅尼迦前書", "帖撒羅尼迦後書", "提摩太前書", "提摩太後書", "提多書", "腓利門書"] },
    { name: "通用書信", books: ["希伯來書", "雅各書", "彼得前書", "彼得後書", "約翰一書", "約翰二書", "約翰三書", "猶大書"] },
    { name: "預言書", books: ["啟示錄"] }
  ]
};

interface Reading {
  [key: string]: unknown;
}

interface StatsViewProps {
  readings: Reading[];
  viewMode?: 'SHARE_ONLY' | 'STATS_ONLY';
}

export default function StatsView({ readings, viewMode = 'STATS_ONLY' }: StatsViewProps) {
  const [isExporting, setIsExporting] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  const [showGoldenVerse, setShowGoldenVerse] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [goldenVerse, setGoldenVerse] = useState("");
  const [insights, setInsights] = useState("");

  const stats = useMemo(() => calculateBibleStats(readings), [readings]);

  const handleExportImage = async () => {
    if (statsRef.current === null) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(statsRef.current, { 
        cacheBust: true,
        backgroundColor: '#f8fafc',
        style: { padding: '24px' }
      });
      const link = document.createElement('a');
      link.download = `聖經閱讀見證-${new Date().toLocaleDateString()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('截圖失敗', err);
    } finally {
      setIsExporting(false);
    }
  };

  const getHeatmapColor = (timesRead: number) => {
    if (timesRead === 0) return "bg-slate-100 text-slate-400 border-slate-200"; 
    if (timesRead > 0 && timesRead < 1) return "bg-cyan-100 text-cyan-700 border-cyan-200"; 
    if (timesRead >= 1 && timesRead < 2) return "bg-emerald-500 text-white border-emerald-600 shadow-sm"; 
    if (timesRead >= 2 && timesRead < 3) return "bg-violet-600 text-white border-violet-700 shadow-md"; 
    return "bg-amber-400 text-amber-900 border-amber-500 ring-2 ring-amber-100"; 
  };

  const renderCategorySection = (title: string, categoryBooks: string[], themeColor: string, accentColor: string) => {
    let totalChapters = 0;
    let completedChapters = 0;
    categoryBooks.forEach(bookName => {
      const book = BIBLE_BOOKS.find(b => b.name === bookName);
      if (book) {
        totalChapters += book.chapters;
        completedChapters += Math.min(stats.bookStats[book.id] || 0, book.chapters);
      }
    });
    const percentage = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;
    return (
      <div key={title} className="space-y-4">
        <div className="flex justify-between items-center">
          <h5 className="text-sm font-bold text-slate-600 flex items-center gap-2">
            <Bookmark className={`h-4 w-4 ${accentColor}`} />
            {title}
          </h5>
          <span className="text-xs font-black text-slate-400">{percentage}%</span>
        </div>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {categoryBooks.map(bookName => {
                const book = BIBLE_BOOKS.find(b => b.name === bookName);
                if (!book) return null;
                const timesRead = (stats.bookStats[book.id] || 0) / book.chapters;
                return (
                    <div 
                      key={book.id} 
                      className={`h-12 rounded-lg flex items-center justify-center text-xs font-black border transition-all ${getHeatmapColor(timesRead)}`}
                    >
                        {book.name.substring(0, 2)}
                    </div>
                );
            })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      {viewMode === 'SHARE_ONLY' && (
        <div className="bg-white p-6 rounded-3xl border-2 border-blue-50 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
              <Share2 className="h-5 w-5 text-blue-600" />
              <h3 className="font-bold text-gray-800">截圖分享設定</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-2xl border transition-all ${showGoldenVerse ? 'border-amber-200 bg-amber-50/30' : 'border-gray-100'}`}>
                  <label className="flex items-center gap-2 cursor-pointer mb-2">
                      <input type="checkbox" checked={showGoldenVerse} onChange={e => setShowGoldenVerse(e.target.checked)} className="rounded text-amber-500" />
                      <span className="text-sm font-bold text-gray-700">附上今日金句</span>
                  </label>
                  {showGoldenVerse && (
                      <input 
                          type="text" 
                          placeholder="例如：詩篇 23:1 耶和華是我的牧者..." 
                          value={goldenVerse} 
                          onChange={e => setGoldenVerse(e.target.value)}
                          className="w-full p-2 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                      />
                  )}
              </div>
              <div className={`p-4 rounded-2xl border transition-all ${showInsights ? 'border-blue-200 bg-blue-50/30' : 'border-gray-100'}`}>
                  <label className="flex items-center gap-2 cursor-pointer mb-2">
                      <input type="checkbox" checked={showInsights} onChange={e => setShowInsights(e.target.checked)} className="rounded text-blue-600" />
                      <span className="text-sm font-bold text-gray-700">附上讀經心得</span>
                  </label>
                  {showInsights && (
                      <textarea 
                          placeholder="寫下您今天的領受..." 
                          value={insights} 
                          onChange={e => setInsights(e.target.value)}
                          className="w-full p-2 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-blue-400 bg-white h-20 resize-none"
                      />
                  )}
              </div>
          </div>
          <button 
            onClick={handleExportImage}
            disabled={isExporting}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-xl disabled:bg-slate-300"
          >
            {isExporting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
            產生見證圖片並下載
          </button>
        </div>
      )}

      <div ref={statsRef} className="space-y-10 bg-white p-8 rounded-[40px] border border-slate-100 shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-end border-b border-slate-100 pb-6">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-lg">S</div>
                        Scripture Flow
                    </h2>
                    <p className="text-slate-400 text-xs font-bold mt-1 tracking-widest uppercase">Bible Reading Progress Report</p>
                </div>
                <div className="text-right">
                    <p className="text-slate-300 text-[10px] font-black">{new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100/50">
                    <p className="text-emerald-600/50 text-[10px] font-black uppercase tracking-tighter mb-1">Old Testament</p>
                    <div className="text-4xl font-black text-emerald-600">{stats.otProgress.toFixed(2)} <span className="text-sm font-medium opacity-50">遍</span></div>
                </div>
                <div className="bg-violet-50/50 p-6 rounded-3xl border border-violet-100/50">
                    <p className="text-violet-600/50 text-[10px] font-black uppercase tracking-tighter mb-1">New Testament</p>
                    <div className="text-4xl font-black text-violet-600">{stats.ntProgress.toFixed(2)} <span className="text-sm font-medium opacity-50">遍</span></div>
                </div>
            </div>

            <div className="space-y-10">
                <h3 className="font-bold text-slate-800 flex items-center gap-2"><Calendar className="h-4 w-4 text-blue-500" /> 聖經書卷閱讀熱力圖</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                        <div className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full w-fit">舊約聖經</div>
                        {BIBLE_CATEGORIES.OT.map(cat => renderCategorySection(cat.name, cat.books, "bg-emerald-500", "text-emerald-400"))}
                    </div>
                    <div className="space-y-8">
                        <div className="text-[10px] font-black text-violet-700 bg-violet-100 px-3 py-1 rounded-full w-fit">新約聖經</div>
                        {BIBLE_CATEGORIES.NT.map(cat => renderCategorySection(cat.name, cat.books, "bg-violet-600", "text-violet-400"))}
                    </div>
                </div>
            </div>

             {(showGoldenVerse || showInsights) && (
                <div className="pt-8 border-t border-slate-100 space-y-6">
                    {showGoldenVerse && goldenVerse && (
                        <div className="relative p-8 bg-amber-50/30 rounded-4xl border border-amber-100/50">
                            <Quote className="absolute top-4 left-4 h-8 w-8 text-amber-200" />
                            <p className="text-xl font-serif text-slate-800 leading-relaxed text-center px-4 italic">「{goldenVerse}」</p>
                        </div>
                    )}
                    {showInsights && insights && (
                        <div className="p-8 bg-slate-50/50 rounded-4xl border border-slate-100/50">
                            <div className="flex items-center gap-2 mb-3 text-slate-400">
                                <PenLine size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">靈修領受</span>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">{insights}</p>
                        </div>
                    )}
                </div>
            )}
            
            <div className="text-center pt-4">
                <p className="text-[9px] text-slate-300 font-bold tracking-widest uppercase">Generated by Scripture Flow</p>
            </div>
      </div>

      {viewMode === 'STATS_ONLY' && (
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-xl text-gray-800 mb-8 flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-blue-600" /> 近 30 天閱讀動力趨勢
            </h3>
            <div className="h-70 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.trendData}>
                        <defs>
                            <linearGradient id="colorChapters" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} minTickGap={30} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }} />
                        <Area type="monotone" dataKey="chapters" name="閱讀章數" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorChapters)" animationDuration={1500} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
      )}
    </div>
  );
}