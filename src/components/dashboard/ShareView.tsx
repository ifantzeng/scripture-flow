"use client";

import { useState, useRef, useEffect } from "react";
import { toPng } from 'html-to-image';
import { 
  Camera, Loader2, Quote, PenLine, BookOpen, Share2 
} from "lucide-react";

const BIBLE_BOOKS = [
  "創世記", "出埃及記", "利未記", "民數記", "申命記", 
  "約書亞記", "士師記", "路得記", "撒母耳記上", "撒母耳記下",
  "列王紀上", "列王紀下", "歷代志上", "歷代志下", "以斯拉記",
  "尼希米記", "以斯帖記", "約伯記", "詩篇", "箴言", "傳道書", "雅歌",
  "以賽亞書", "耶利米書", "耶利米哀歌", "以西結書", "但以理書",
  "何西阿書", "約珥書", "阿摩司書", "俄巴底亞書", "約拿書", "彌迦書",
  "那鴻書", "哈巴谷書", "西番雅書", "哈該書", "撒迦利亞書", "瑪拉基書",
  "馬太福音", "馬可福音", "路加福音", "約翰福音", "使徒行傳",
  "羅馬書", "哥林多前書", "哥林多後書", "加拉太書", "以弗所書",
  "腓立比書", "歌羅西書", "帖撒羅尼迦前書", "帖撒羅尼迦後書",
  "提摩太前書", "提摩太後書", "提多書", "腓利門書", "希伯來書",
  "雅各書", "彼得前書", "彼得後書", "約翰一書", "約翰二書", "約翰三書",
  "猶大書", "啟示錄"
];

// ⭐ 定義 Props
interface ShareViewProps {
  initialBook?: string;
  initialChapter?: string;
}

export default function ShareView({ initialBook = "創世記", initialChapter = "" }: ShareViewProps) {
  const [isExporting, setIsExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // 狀態管理
  const [selectedBook, setSelectedBook] = useState(initialBook);
  const [chapterVerse, setChapterVerse] = useState(initialChapter);
  const [scriptureText, setScriptureText] = useState(""); 
  const [note, setNote] = useState(""); 

  // ⭐ 自動更新欄位
  useEffect(() => {
    if (initialBook) setSelectedBook(initialBook);
    if (initialChapter) setChapterVerse(initialChapter);
  }, [initialBook, initialChapter]);

  const handleExportImage = async () => {
    if (cardRef.current === null) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, { 
        cacheBust: true,
        backgroundColor: '#f8fafc',
        style: { padding: '20px' } 
      });
      const link = document.createElement('a');
      link.download = `靈修分享-${new Date().toLocaleDateString()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('截圖失敗', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95">
      <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-start gap-4">
        <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
            <Share2 size={24} />
        </div>
        <div>
            <h2 className="text-lg font-bold text-blue-900">製作讀經分享卡</h2>
            <p className="text-blue-700/70 text-sm">輸入您的領受，系統將自動生成一張精美的圖片供您分享。</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                    <BookOpen size={18} className="text-orange-500" /> 選擇經文
                </h3>
                <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                        <label className="text-xs font-bold text-slate-400 mb-1 block">書卷</label>
                        <select 
                            value={selectedBook}
                            onChange={(e) => setSelectedBook(e.target.value)}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {BIBLE_BOOKS.map(book => (
                                <option key={book} value={book}>{book}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-400 mb-1 block">章節</label>
                        <input 
                            type="text" 
                            placeholder="如 1:1"
                            value={chapterVerse}
                            onChange={(e) => setChapterVerse(e.target.value)}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-400 mb-1 block">經文內容 (選填)</label>
                    <textarea 
                        placeholder="輸入經文內容..."
                        value={scriptureText}
                        onChange={(e) => setScriptureText(e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                    />
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                    <PenLine size={18} className="text-blue-500" /> 讀經心得
                </h3>
                <textarea 
                    placeholder="寫下您今天的領受與禱告..." 
                    value={note} 
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 h-40 resize-none leading-relaxed"
                />
            </div>

            <button 
                onClick={handleExportImage}
                disabled={isExporting}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-xl disabled:bg-slate-300 active:scale-95"
            >
                {isExporting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
                下載分享圖片
            </button>
        </div>

        <div className="flex items-start justify-center bg-slate-100/50 p-4 rounded-3xl border border-slate-200/50">
            <div ref={cardRef} className="w-full bg-white p-8 rounded-[32px] shadow-2xl border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-bl-[100px] opacity-50 -mr-10 -mt-10"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-100 rounded-tr-[80px] opacity-50 -ml-10 -mb-10"></div>

                <div className="flex justify-between items-center mb-8 relative z-10">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-lg font-bold">S</div>
                        <span className="font-black text-slate-800 tracking-tight">Scripture Flow</span>
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{new Date().toLocaleDateString()}</span>
                </div>

                <div className="relative z-10 mb-8">
                    <div className="flex items-center gap-2 mb-3">
                        <Quote size={20} className="text-orange-400 fill-orange-400" />
                        <span className="text-xs font-black text-orange-500 uppercase tracking-widest">今日亮光</span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-2">
                        {selectedBook} <span className="text-orange-500">{chapterVerse}</span>
                    </h2>
                    {scriptureText && (
                         <p className="text-lg font-serif italic text-slate-600 leading-relaxed border-l-4 border-orange-200 pl-4 py-1">
                            {scriptureText}
                        </p>
                    )}
                </div>

                {note ? (
                    <div className="relative z-10 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                         <div className="flex items-center gap-2 mb-3">
                            <PenLine size={16} className="text-blue-500" />
                            <span className="text-xs font-black text-blue-500 uppercase tracking-widest">靈修筆記</span>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                            {note}
                        </p>
                    </div>
                ) : (
                    <div className="relative z-10 bg-slate-50 p-10 rounded-3xl border border-dashed border-slate-200 text-center text-slate-400 text-sm">
                        在此處預覽您的靈修心得...
                    </div>
                )}

                <div className="mt-8 text-center relative z-10">
                     <p className="text-[10px] text-slate-300 font-bold tracking-[0.3em] uppercase">My Spiritual Journey</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}