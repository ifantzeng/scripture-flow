"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Flame, Loader2, LayoutGrid, Share2, Target } from "lucide-react"; 
import ReadingListItem from "@/components/dashboard/ReadingListItem"; 
import ShareView from "@/components/dashboard/ShareView";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'TODAY' | 'SHARE'>('TODAY');
  const [shareData, setShareData] = useState({ book: "創世記", chapter: "" });
  const [loading, setLoading] = useState(true);
  const [todayReadings, setTodayReadings] = useState<any[]>([]);
  const [progress, setProgress] = useState({ completed: 0, total: 0, percentage: 0 });
  const supabase = createClient();

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: readings } = await supabase
        .from('plan_readings')
        .select(`*, plans!inner(title, user_id)`)
        .eq('plans.user_id', user.id);

      if (readings) {
        const total = readings.length;
        const completed = readings.filter((r: any) => r.is_completed).length;
        setProgress({
            completed,
            total,
            percentage: total > 0 ? Math.round((completed / total) * 100) : 0
        });

        const todayStr = new Date().toLocaleDateString('en-CA');
        const todayItems = readings.filter((r: any) => r.date === todayStr);
        setTodayReadings(todayItems);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  // ⭐ 補回 handleShare：處理分享頁面預填
  const handleShare = (reading: any) => {
    const scripture = reading.scripture || ""; 
    const parts = scripture.trim().split(/\s+/); 
    const book = parts[0] || "創世記";
    const chapter = parts.slice(1).join(' ') || ""; 
    setShareData({ book, chapter });
    setActiveTab('SHARE');
  };

  // ⭐ 修正 toggleComplete：接收 allChapters 並同步資料庫
  const toggleComplete = async (readingId: number, currentStatus: boolean, allChapters: string[]) => {
    const newStatus = !currentStatus;
    const newChapters = newStatus ? allChapters : [];

    // 樂觀更新
    setTodayReadings(prev => prev.map(r => 
      r.id === readingId ? { ...r, is_completed: newStatus, completed_chapters: newChapters } : r
    ));

    await supabase.from('plan_readings').update({ 
      is_completed: newStatus,
      completed_chapters: newChapters 
    }).eq('id', readingId);
    
    fetchDashboardData(); 
  };

  // ⭐ 永久存檔邏輯：更新細部進度
  const updateChapterProgress = async (readingId: number, chapters: string[]) => {
    setTodayReadings(prev => prev.map(r => 
      r.id === readingId ? { ...r, completed_chapters: chapters } : r
    ));

    await supabase.from('plan_readings')
      .update({ completed_chapters: chapters })
      .eq('id', readingId);
      
    fetchDashboardData();
  };

  const todayTotal = todayReadings.length;
  const todayCompleted = todayReadings.filter(r => r.is_completed).length;
  const todayPercentage = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Scripture Flow</h1>
            <p className="text-gray-500 text-sm mt-1">{new Date().toLocaleDateString()} 靈修儀表板</p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-xl">
            <button onClick={() => setActiveTab('TODAY')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'TODAY' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>
                <LayoutGrid size={16} /> 今日進度
            </button>
            <button onClick={() => setActiveTab('SHARE')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'SHARE' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>
                <Share2 size={16} /> 讀經分享
            </button>
        </div>
      </div>

      <div className="transition-all duration-300">
        {activeTab === 'TODAY' && (
             <div className="grid gap-8 md:grid-cols-3">
                <div className="md:col-span-2 space-y-4">
                    {todayReadings.length > 0 ? (
                        todayReadings.map((reading) => (
                            <ReadingListItem 
                                key={reading.id} 
                                reading={reading} 
                                onToggle={toggleComplete} 
                                onShare={() => handleShare(reading)}
                                onUpdateChapters={updateChapterProgress}
                            />
                        ))
                    ) : (
                        <div className="p-12 text-center text-gray-400 border border-dashed border-gray-200 rounded-2xl">
                            今天沒有任務
                        </div>
                    )}
                </div>

                <div className="space-y-6 sticky top-6 self-start">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-4"><Target className="text-blue-600" /> <h3 className="font-bold">今日達標率</h3></div>
                        <div className="text-4xl font-bold mb-2">{todayPercentage}%</div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden"><div style={{ width: `${todayPercentage}%` }} className="h-full bg-blue-500 transition-all duration-700"></div></div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-4"><Flame className="text-orange-600" /> <h3 className="font-bold">總體完成率</h3></div>
                        <div className="text-4xl font-bold mb-2">{progress.percentage}%</div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden"><div style={{ width: `${progress.percentage}%` }} className="h-full bg-orange-500 transition-all duration-700"></div></div>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'SHARE' && (
            <ShareView initialBook={shareData.book} initialChapter={shareData.chapter} />
        )}
      </div>
    </div>
  );
}