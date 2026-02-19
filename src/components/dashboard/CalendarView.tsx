"use client";

import { useState } from "react";
import Link from "next/link";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addDays, differenceInDays } from "date-fns";
import { ChevronLeft, ChevronRight, BookOpen, PlusCircle, X, Calendar as CalendarIcon, ArrowRight, CheckCircle2, CheckCheck, Circle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Reading {
  id: number;
  date: string;
  is_completed: boolean;
  scripture: string;
  theme: string;
}

export default function CalendarView({ readings, onRefresh }: { readings: Reading[], onRefresh: () => void }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const supabase = createClient();

  // --- Modal & Loading State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [catchUpStart, setCatchUpStart] = useState(new Date().toISOString().split('T')[0]);
  const [catchUpEnd, setCatchUpEnd] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const selectedReadings = readings.filter(r => isSameDay(new Date(r.date), selectedDate));
  const uncompletedReadings = selectedReadings.filter(r => !r.is_completed);

  const getDayStatus = (day: Date) => {
    const dayReadings = readings.filter(r => isSameDay(new Date(r.date), day));
    if (dayReadings.length === 0) return 'empty';
    const allCompleted = dayReadings.every(r => r.is_completed);
    return allCompleted ? 'completed' : 'pending';
  };

  // ⭐ 更新版智慧縮寫標題 (與 ReadingListItem 同步)
  const getSmartTitle = (text: string) => {
    if (!text) return "";
    const chapters = text.split(/[,，]/).map(s => s.trim()).filter(Boolean);
    if (chapters.length <= 1) return text;

    let currentBook = "";
    let startChapter = "";
    let lastChapter = "";
    const groups: string[] = [];

    chapters.forEach((chap, index) => {
      const match = chap.match(/^([^\d]+)\s*(\d+.*)$/);
      const book = match ? match[1].trim() : chap;
      const num = match ? match[2].trim() : "";

      if (book !== currentBook) {
        if (currentBook) {
           groups.push(startChapter === lastChapter ? `${currentBook} ${startChapter}` : `${currentBook} ${startChapter}~${lastChapter}`);
        }
        currentBook = book;
        startChapter = num;
        lastChapter = num;
      } else {
        lastChapter = num;
      }

      if (index === chapters.length - 1) {
         groups.push(startChapter === lastChapter ? `${currentBook} ${startChapter}` : `${currentBook} ${startChapter}~${lastChapter}`);
      }
    });

    return groups.join(", ");
  };

  // 處理單項打卡
  const handleToggleSingle = async (id: number, currentStatus: boolean) => {
    try {
        const { error } = await supabase.from('plan_readings').update({ is_completed: !currentStatus }).eq('id', id);
        if (error) throw error;
        onRefresh(); 
    } catch (e: unknown) { alert("更新失敗：" + (e instanceof Error ? e.message : String(e))); }
  };

  // 全部標記已讀 
  const handleMarkAllAsDone = async () => {
    if (uncompletedReadings.length === 0) return;
    if (!confirm(`確定要將 ${format(selectedDate, 'M月d日')} 的所有進度標記為「已完成」嗎？`)) return;

    try {
        const ids = uncompletedReadings.map(r => r.id);
        const { error } = await supabase.from('plan_readings').update({ is_completed: true }).in('id', ids);
        if (error) throw error;
        onRefresh();
    } catch (e: unknown) { alert("更新失敗：" + (e instanceof Error ? e.message : String(e))); }
  };

  const openCatchUpModal = () => {
    if (uncompletedReadings.length === 0) return;
    setIsModalOpen(true);
  };

  const handleConfirmCatchUp = async () => {
    if (!catchUpStart || !catchUpEnd) return;
    if (new Date(catchUpEnd) < new Date(catchUpStart)) { alert("結束日期不能早於開始日期"); return; }
    setLoading(true);
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("未登入");
        const startDateObj = new Date(catchUpStart);
        const endDateObj = new Date(catchUpEnd);
        const durationDays = differenceInDays(endDateObj, startDateObj) + 1;
        
        const { data: plan, error } = await supabase.from('plans').insert({ title: `補進度 (${format(selectedDate, 'MM/dd')})`, user_id: user.id, start_date: catchUpStart }).select().single();
        if (error) throw error;

        const newReadings = uncompletedReadings.map((r, i) => ({
            plan_id: plan.id,
            day: (i % durationDays) + 1,
            date: addDays(startDateObj, i % durationDays).toLocaleDateString('en-CA'),
            scripture: r.scripture,
            theme: `補 ${format(selectedDate, 'MM/dd')}`,
            is_completed: false
        }));

        await supabase.from('plan_readings').insert(newReadings);
        alert(`✅ 補救計畫建立成功！`);
        setIsModalOpen(false);
        onRefresh(); 
    } catch (e: unknown) { alert("建立失敗：" + (e instanceof Error ? e.message : String(e))); } finally { setLoading(false); }
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500 min-h-screen">
        {/* 左側：月曆 (50%) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <CalendarIcon className="h-6 w-6 text-blue-600" />
                {format(currentDate, 'yyyy 年 M 月')}
              </h2>
              <div className="flex gap-2">
                  <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-2 hover:bg-gray-100 rounded-md transition-all"><ChevronLeft className="h-5 w-5"/></button>
                  <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-2 hover:bg-gray-100 rounded-md transition-all"><ChevronRight className="h-5 w-5"/></button>
              </div>
          </div>
          <div className="grid grid-cols-7 text-center mb-4 text-gray-400 font-medium text-sm">
              <div>日</div><div>一</div><div>二</div><div>三</div><div>四</div><div>五</div><div>六</div>
          </div>
          <div className="grid grid-cols-7 gap-3 flex-1 content-start">
              {Array.from({ length: monthStart.getDay() }).map((_, i) => <div key={`empty-${i}`} />)}
              {days.map(day => {
                  const status = getDayStatus(day);
                  let bg = "bg-white text-gray-600 border border-gray-100 hover:border-blue-300";
                  if (status === 'completed') bg = "bg-green-50 text-green-700 border-green-200 hover:bg-green-100";
                  if (status === 'pending') bg = "bg-red-50 text-red-600 border-red-200 hover:bg-red-100";
                  if (isSameDay(day, selectedDate)) bg = "ring-2 ring-blue-600 ring-offset-2 z-10 shadow-md bg-white text-blue-700 border-blue-200";

                  return (
                      <button key={day.toString()} onClick={() => setSelectedDate(day)} className={`h-16 rounded-xl flex flex-col items-center justify-center text-sm transition-all relative ${bg}`}>
                          <span className={`font-bold text-lg ${isToday(day) && !isSameDay(day, selectedDate) ? "text-blue-600 underline" : ""}`}>{format(day, 'd')}</span>
                          {status !== 'empty' && (
                              <div className="mt-1">
                                  {status === 'completed' ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <div className="h-2 w-2 rounded-full bg-red-400 animate-pulse"></div>}
                              </div>
                          )}
                      </button>
                  )
              })}
          </div>
        </div>

        {/* 右側：詳細資料 (50%) */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full">
          <div className="mb-6 pb-6 border-b border-gray-100">
              <h3 className="font-bold text-2xl text-gray-800 flex items-center gap-3">
                  <BookOpen className="h-8 w-8 text-blue-600 p-1.5 bg-blue-50 rounded-lg" />
                  {format(selectedDate, 'M 月 d 日')}
              </h3>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {selectedReadings.length > 0 ? (
                  selectedReadings.map(r => (
                      <div key={r.id} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:shadow-md transition-all">
                          <button onClick={() => handleToggleSingle(r.id, r.is_completed)} className={`shrink-0 transition-colors ${r.is_completed ? 'text-green-600' : 'text-gray-300 hover:text-blue-400'}`}>
                            {r.is_completed ? <CheckCircle2 className="h-8 w-8" /> : <Circle className="h-8 w-8" />}
                          </button>
                          <div className="flex-1 min-w-0">
                             <Link href={`/dashboard/reading/${r.id}`} className="block group">
                                <p className={`font-bold text-xl group-hover:text-blue-600 truncate transition-colors ${r.is_completed ? 'text-gray-400 line-through decoration-gray-300' : 'text-gray-800'}`}>
                                    {getSmartTitle(r.scripture)}
                                </p>
                                <p className="text-xs text-gray-400 truncate mt-0.5">{r.theme || '無主題'}</p>
                             </Link>
                          </div>
                          <Link href={`/dashboard/reading/${r.id}`} className="shrink-0 bg-white border border-gray-200 p-2 rounded-lg text-gray-400 hover:text-blue-600 transition-all"><ArrowRight className="h-5 w-5" /></Link>
                      </div>
                  ))
              ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                      <CalendarIcon className="h-10 w-10 text-gray-200 mb-2" />
                      <p>這一天沒有安排讀經計畫</p>
                  </div>
              )}
          </div>
          {uncompletedReadings.length > 0 && (
              <div className="pt-6 mt-auto border-t border-gray-100 space-y-3">
                <button onClick={handleMarkAllAsDone} className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition-all shadow-md font-bold text-lg"><CheckCheck className="h-5 w-5" /> 全部標記已讀</button>
                <button onClick={openCatchUpModal} className="w-full flex items-center justify-center gap-2 bg-white text-blue-600 border border-blue-200 py-3 rounded-xl hover:bg-blue-50 transition-all font-bold text-lg"><PlusCircle className="h-5 w-5" /> 加入補救計畫</button>
              </div>
          )}
        </div>
      </div>

      {/* --- Catch-up Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6 border-b pb-4"><h3 className="text-xl font-bold text-gray-900 flex items-center gap-2"><CalendarIcon className="h-5 w-5 text-blue-600" /> 設定補救計畫區間</h3><button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="h-6 w-6" /></button></div>
                <div className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">正在補救 <strong>{format(selectedDate, 'M月d日')}</strong> 的 <strong>{uncompletedReadings.length}</strong> 筆進度。</div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">開始日期</label><input type="date" value={catchUpStart} onChange={(e) => setCatchUpStart(e.target.value)} className="w-full p-2 border rounded-md" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">結束日期</label><input type="date" value={catchUpEnd} onChange={(e) => setCatchUpEnd(e.target.value)} className="w-full p-2 border rounded-md" /></div>
                    </div>
                    <button onClick={handleConfirmCatchUp} disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-lg shadow-lg hover:bg-blue-700 disabled:opacity-50">{loading ? "處理中..." : "確認建立補救計畫"}</button>
                </div>
            </div>
        </div>
      )}
    </>
  );
}