"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import CalendarView from "@/components/dashboard/CalendarView";
import { Loader2 } from "lucide-react";

// ⭐ 定義精確的型別，補齊 CalendarView 正在尋找的所有屬性
export interface Reading {
  id: number;
  date: string;
  is_completed: boolean;
  scripture: string;
  theme: string;
  [key: string]: unknown; // 容許包含來自 Supabase 的其他關聯資料（如 plans）
}

export default function CalendarPage() {
  const [loading, setLoading] = useState(true); 
  const [readings, setReadings] = useState<Reading[]>([]); // ⭐ 換上正確的型別

  const fetchReadings = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
        const { data } = await supabase
          .from('plan_readings')
          .select(`*, plans!inner(user_id)`)
          .eq('plans.user_id', user.id);

        if (data) {
            setReadings(data as Reading[]); // ⭐ 明確告訴 TypeScript 這些資料符合 Reading 型別
        }
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    const initData = async () => {
        await fetchReadings();
    };
    initData();
  }, [fetchReadings]);

  if (loading) return (
    <div className="p-10 flex justify-center h-[60vh] items-center">
      <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">讀經月曆</h1>
      <CalendarView 
        readings={readings} 
        onRefresh={fetchReadings} 
      />
    </div>
  );
}