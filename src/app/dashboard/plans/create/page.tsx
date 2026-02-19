"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import * as XLSX from "xlsx";
import { BIBLE_BOOKS, BibleBook } from "@/lib/bible-data"; 
import { UploadCloud, FileSpreadsheet, Loader2, ArrowLeft, AlertCircle, Calendar, Layers, Plus, X, BookOpen, Clock, CheckCircle2 } from "lucide-react";

// 定義一個「閱讀軌道」
type ReadingTrack = {
  id: number;
  name: string; 
  books: BibleBook[]; 
  pace: number; 
};

// ⭐ 新增：智慧展開經文格式函式 (放在組件外部，專門處理 1~4 或 1-4 的字串)
const expandScriptureRange = (rawText: string) => {
    if (!rawText) return "";
    
    // 先用逗號切開 (處理混合格式)
    const parts = String(rawText).split(/[,，]/).map(s => s.trim());
    const expandedParts: string[] = [];

    parts.forEach(part => {
        // 尋找是否有 "書卷名 起始數字~結束數字" 或 "書卷名 起始數字-結束數字"
        const rangeMatch = part.match(/^(.+?)\s*(\d+)\s*[~-]\s*(\d+)$/);
        
        if (rangeMatch) {
            const book = rangeMatch[1].trim(); 
            const start = parseInt(rangeMatch[2]); 
            const end = parseInt(rangeMatch[3]);   
            
            // 將 1~4 展開為 1, 2, 3, 4
            if (start <= end && (end - start) < 150) { 
                for (let i = start; i <= end; i++) {
                    expandedParts.push(`${book} ${i}`);
                }
            } else {
                expandedParts.push(part); 
            }
        } else {
            expandedParts.push(part); 
        }
    });

    return expandedParts.join(", "); 
};

export default function CreatePlanPage() {
  const router = useRouter();
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<'generate' | 'upload'>('generate');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // --- Generator State (多軌道系統) ---
  const [planTitle, setPlanTitle] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [tracks, setTracks] = useState<ReadingTrack[]>([
    { id: 1, name: "主要進度", books: [], pace: 1 }
  ]);

  // --- Upload State ---
  const [file, setFile] = useState<File | null>(null);

  // --- Helper Functions ---

  const addTrack = () => {
    const newId = tracks.length > 0 ? Math.max(...tracks.map(t => t.id)) + 1 : 1;
    setTracks([...tracks, { id: newId, name: `進度軌道 ${newId}`, books: [], pace: 1 }]);
  };

  const removeTrack = (id: number) => {
    if (tracks.length === 1) {
        alert("至少需要保留一個閱讀軌道喔！");
        return;
    }
    setTracks(tracks.filter(t => t.id !== id));
  };

  const updateTrackInfo = (id: number, field: 'name' | 'pace', value: string | number) => {
    setTracks(tracks.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const toggleBookInTrack = (trackId: number, book: BibleBook) => {
    setTracks(tracks.map(track => {
      if (track.id !== trackId) return track;
      const exists = track.books.find(b => b.id === book.id);
      if (exists) {
        return { ...track, books: track.books.filter(b => b.id !== book.id) };
      } else {
        return { ...track, books: [...track.books, book] };
      }
    }));
  };

  const selectCollectionForTrack = (trackId: number, type: 'OT' | 'NT' | 'ALL') => {
    setTracks(tracks.map(track => {
      if (track.id !== trackId) return track;
      if (type === 'ALL') return { ...track, books: [...BIBLE_BOOKS] };
      return { ...track, books: BIBLE_BOOKS.filter(b => b.category === type) };
    }));
  };

  const clearBooksForTrack = (trackId: number) => {
    setTracks(tracks.map(t => t.id === trackId ? { ...t, books: [] } : t));
  };

  // --- Submit Handlers ---

  const handleGenerateSubmit = async () => {
    if (!planTitle) { setMsg("❌ 請輸入計畫名稱"); return; }
    const emptyTrack = tracks.find(t => t.books.length === 0);
    if (emptyTrack) {
        setMsg(`❌ 「${emptyTrack.name}」還沒有選擇任何書卷喔！`);
        return;
    }

    setLoading(true);
    setMsg("⏳ 正在計算多重軌道進度...");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("使用者未登入");

      // 1. 建立計畫
      const { data: planData, error: planError } = await supabase
        .from('plans')
        .insert([{ 
            title: planTitle, 
            user_id: user.id,
            start_date: startDate
        }])
        .select()
        .single();

      if (planError) throw planError;

      // 2. 演算法：多軌並行分配
      const allReadings = [];
      const planStartDate = new Date(startDate);

      for (const track of tracks) {
        let currentDay = 1;
        let currentDate = new Date(planStartDate);
        let chaptersInBuffer = 0;
        let bufferScripture = "";
        
        for (const book of track.books) {
            for (let ch = 1; ch <= book.chapters; ch++) {
                const verseRef = `${book.name} ${ch}`;
                
                if (bufferScripture === "") {
                    bufferScripture = verseRef;
                } else {
                    bufferScripture += `, ${verseRef}`;
                }
                
                chaptersInBuffer++;

                if (chaptersInBuffer >= track.pace) {
                    allReadings.push({
                        plan_id: planData.id,
                        day: currentDay,
                        date: currentDate.toLocaleDateString('en-CA'),
                        scripture: bufferScripture,
                        theme: track.name,
                        is_completed: false
                    });

                    currentDay++;
                    currentDate.setDate(currentDate.getDate() + 1);
                    chaptersInBuffer = 0;
                    bufferScripture = "";
                }
            }
        }
        if (bufferScripture !== "") {
            allReadings.push({
                plan_id: planData.id,
                day: currentDay,
                date: currentDate.toLocaleDateString('en-CA'),
                scripture: bufferScripture,
                theme: track.name,
                is_completed: false
            });
        }
      }

      // 3. 寫入資料庫
      const chunkSize = 100;
      for (let i = 0; i < allReadings.length; i += chunkSize) {
        const chunk = allReadings.slice(i, i + chunkSize);
        const { error } = await supabase.from('plan_readings').insert(chunk);
        if (error) throw error;
      }

      setMsg("✅ 多軌計畫生成成功！正在跳轉...");
      setTimeout(() => router.push("/dashboard"), 1500);

    } catch (error: any) {
      console.error(error);
      setMsg(`❌ 失敗: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planTitle || !file) { setMsg("❌ 請輸入標題並選擇檔案"); return; }
    setLoading(true);
    setMsg("⏳ 正在處理 Excel...");
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("未登入");
        
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData: any[] = XLSX.utils.sheet_to_json(sheet);
        
        const { data: planData, error: planError } = await supabase.from('plans').insert([{ title: planTitle, user_id: user.id }]).select().single();
        if (planError) throw planError;
        
        const readings = jsonData.map((row) => {
            // --- 📅 Excel 日期翻譯機 ---
            let formattedDate = new Date().toISOString().split('T')[0]; 
            if (row.Date) {
                if (typeof row.Date === 'number' || !isNaN(Number(row.Date))) {
                    const excelDays = Number(row.Date);
                    const jsDate = new Date(Math.round((excelDays - 25569) * 86400 * 1000));
                    formattedDate = jsDate.toISOString().split('T')[0];
                } else {
                    try {
                        formattedDate = new Date(row.Date).toISOString().split('T')[0];
                    } catch (e) {
                        console.warn("無法解析日期:", row.Date);
                    }
                }
            }

            // ⭐ 呼叫智慧展開功能，處理經文格式
            const rawScripture = row.Scripture || row.經文;
            const expandedScripture = expandScriptureRange(rawScripture);

            return {
                plan_id: planData.id, 
                day: row.Day || 1, 
                date: formattedDate, 
                scripture: expandedScripture, // ⭐ 將轉換後的結果存入
                is_completed: false
            };
        });

        const { error } = await supabase.from('plan_readings').insert(readings);
        if (error) throw error;
        
        setMsg("✅ 匯入成功！");
        setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err: any) { 
        setMsg(`❌ 失敗: ${err.message}`); 
    } finally { 
        setLoading(false); 
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-100 mt-6 mb-20">
      <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-800 mb-6 flex items-center gap-1">
        <ArrowLeft className="h-4 w-4" /> 返回列表
      </button>

      <h1 className="text-2xl font-bold mb-6">建立新讀經計畫</h1>

      <div className="flex border-b mb-6">
        <button onClick={() => setActiveTab('generate')} className={`flex-1 pb-3 text-center font-medium ${activeTab === 'generate' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
          多軌道產生器 (Advanced)
        </button>
        <button onClick={() => setActiveTab('upload')} className={`flex-1 pb-3 text-center font-medium ${activeTab === 'upload' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
          上傳 Excel
        </button>
      </div>

      {activeTab === 'generate' && (
        <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2 bg-gray-50 p-4 rounded-lg border">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">計畫總標題</label>
                    <input type="text" value={planTitle} onChange={(e) => setPlanTitle(e.target.value)} className="w-full p-2 border rounded-md" placeholder="例如：2026 舊新約並進" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">開始日期</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full p-2 border rounded-md" />
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Layers className="h-5 w-5 text-blue-600" />
                        閱讀軌道設定
                    </h2>
                    <button onClick={addTrack} className="flex items-center gap-1 text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full hover:bg-blue-100 font-medium">
                        <Plus className="h-4 w-4" /> 新增軌道
                    </button>
                </div>

                {tracks.map((track, index) => {
                    const totalChapters = track.books.reduce((acc, b) => acc + b.chapters, 0);
                    const estimatedDays = Math.ceil(totalChapters / track.pace) || 0;

                    return (
                        <div key={track.id} className="border-2 border-gray-100 rounded-xl p-5 relative transition-all hover:border-blue-200 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-2 border-b border-gray-100">
                                <div className="flex items-center gap-2 flex-1">
                                    <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded-full font-mono flex-shrink-0">
                                        Track {index + 1}
                                    </span>
                                    <input 
                                        type="text" 
                                        value={track.name} 
                                        onChange={(e) => updateTrackInfo(track.id, 'name', e.target.value)}
                                        className="font-bold text-gray-700 border-none bg-transparent focus:ring-0 p-0 hover:bg-gray-50 rounded px-1 w-full sm:w-auto"
                                        placeholder="軌道名稱 (如：舊約)"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                     <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1.5 rounded-lg text-yellow-800 text-sm">
                                        <Clock className="h-4 w-4" />
                                        <span>每天讀：</span>
                                        <input 
                                            type="number" min="1" max="50" 
                                            value={track.pace} 
                                            onChange={(e) => updateTrackInfo(track.id, 'pace', parseInt(e.target.value) || 1)}
                                            className="w-12 text-center border rounded p-1 bg-white font-bold"
                                        />
                                        <span>章</span>
                                    </div>
                                    <button onClick={() => removeTrack(track.id)} className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            <p className="text-sm text-gray-500 mb-4 ml-1">
                                共 {totalChapters} 章，預計需要 <span className="font-bold text-blue-600">{estimatedDays}</span> 天完成
                            </p>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 text-sm gap-2">
                                    <div className="flex flex-wrap gap-2">
                                        <span className="text-gray-500 font-medium self-center">快速選取:</span>
                                        <button onClick={() => selectCollectionForTrack(track.id, 'OT')} className="px-3 py-1 bg-white border shadow-sm rounded-md hover:text-blue-600 hover:border-blue-300 transition-colors">舊約</button>
                                        <button onClick={() => selectCollectionForTrack(track.id, 'NT')} className="px-3 py-1 bg-white border shadow-sm rounded-md hover:text-blue-600 hover:border-blue-300 transition-colors">新約</button>
                                        <button onClick={() => selectCollectionForTrack(track.id, 'ALL')} className="px-3 py-1 bg-white border shadow-sm rounded-md hover:text-blue-600 hover:border-blue-300 transition-colors">全部</button>
                                        <button onClick={() => clearBooksForTrack(track.id)} className="px-3 py-1 text-red-500 border border-transparent hover:bg-red-50 rounded-md transition-colors">清空</button>
                                    </div>
                                    <div className="text-gray-400 text-xs">
                                        (依照點擊順序排列)
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                    {BIBLE_BOOKS.map((book) => {
                                        const isSelected = track.books.find(b => b.id === book.id);
                                        return (
                                            <button
                                                key={book.id}
                                                onClick={() => toggleBookInTrack(track.id, book)}
                                                className={`text-sm py-2 px-2 rounded-md border transition-all truncate flex items-center justify-center gap-1 ${
                                                    isSelected 
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-[1.02]' 
                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                                }`}
                                                title={`${book.name} (${book.chapters}章)`}
                                            >
                                                {isSelected && <CheckCircle2 className="h-3 w-3 flex-shrink-0" />}
                                                <span className="truncate">{book.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                                
                                {track.books.length > 0 && (
                                    <div className="mt-4 text-sm text-blue-800 bg-blue-50 p-3 rounded-lg border border-blue-100">
                                        <span className="font-bold block mb-1">已選閱讀順序:</span>
                                        <div className="flex flex-wrap gap-1 text-xs leading-relaxed">
                                            {track.books.map((b, i) => (
                                                <span key={i} className="flex items-center bg-white px-2 py-1 rounded border border-blue-100">
                                                    {i + 1}. {b.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <button
                onClick={handleGenerateSubmit}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:shadow-none"
            >
                {loading ? "計算排程中..." : "建立多軌計畫"}
            </button>
        </div>
      )}

      {activeTab === 'upload' && (
  <form onSubmit={handleUploadSubmit} className="space-y-6 pt-4 bg-gray-50 p-6 rounded-xl border border-gray-100">
      <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">計畫名稱</label>
          <input type="text" value={planTitle} onChange={(e) => setPlanTitle(e.target.value)} className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="例如：教會春季讀經進度" required />
      </div>

      <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-8 text-center relative hover:bg-gray-50 transition-colors">
          <input type="file" accept=".xlsx" onChange={(e) => e.target.files && setFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
          <FileSpreadsheet className="h-12 w-12 text-green-600 mx-auto mb-3" />
          <p className="text-gray-700 font-medium mb-1">{file ? file.name : "點擊或拖曳上傳 Excel 檔案"}</p>
          <p className="text-xs text-gray-400">僅支援 .xlsx 格式</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
          <a 
              href="/templates/scripture_template.xlsx" 
              download="讀經計畫範本.xlsx"
              className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition text-center flex items-center justify-center gap-2 shadow-sm"
          >
              <FileSpreadsheet size={18} className="text-green-600" />
              下載空白範本
          </a>
          
          <button type="submit" disabled={loading} className="flex-[2] bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 shadow-md transition">
              {loading ? "處理中..." : "確認上傳並建立計畫"}
          </button>
      </div>
  </form>
)}

      {msg && (
        <div className={`mt-6 p-4 rounded-lg flex items-center gap-2 ${msg.includes("❌") ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"}`}>
          {msg.includes("❌") && <AlertCircle className="h-5 w-5" />}
          {msg.includes("⏳") && <Loader2 className="h-5 w-5 animate-spin" />}
          {msg}
        </div>
      )}
    </div>
  );
}