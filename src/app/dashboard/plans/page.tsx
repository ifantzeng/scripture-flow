"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { PlusCircle, Loader2 } from "lucide-react";
import PlanCarousel from "@/components/dashboard/PlanCarousel";

type Plan = {
  id: string;
  title: string;
  created_at: string;
  reading_count: number;
  completed_count: number;
};

export default function PlansPage() {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);
  const supabase = createClient();

  // ⭐ 啟動馬達！確保這段有出現在您的程式碼中
  useEffect(() => {
    // 抓取資料的邏輯
    const fetchPlans = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data: plansData, error } = await supabase
          .from('plans')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // 抓取進度統計
        const plansWithStats = await Promise.all(
          (plansData || []).map(async (plan) => {
            const { count: total } = await supabase
              .from('plan_readings')
              .select('*', { count: 'exact', head: true })
              .eq('plan_id', plan.id);
            const { count: completed } = await supabase
              .from('plan_readings')
              .select('*', { count: 'exact', head: true })
              .eq('plan_id', plan.id)
              .eq('is_completed', true);
            return { ...plan, reading_count: total ?? 0, completed_count: completed ?? 0 };
          })
        );

        setPlans(plansWithStats);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false); // 確保無論成功失敗，最後都會關閉轉圈圈
      }
    };

    fetchPlans();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`確定要刪除計畫「${title}」嗎？此動作無法復原。`)) return;
    const { error } = await supabase.from('plans').delete().eq('id', id);
    if (error) alert("刪除失敗");
    else {
      // 重新抓取資料
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: plansData } = await supabase
          .from('plans')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        const plansWithStats = await Promise.all(
          (plansData || []).map(async (plan) => {
            const { count: total } = await supabase
              .from('plan_readings')
              .select('*', { count: 'exact', head: true })
              .eq('plan_id', plan.id);
            const { count: completed } = await supabase
              .from('plan_readings')
              .select('*', { count: 'exact', head: true })
              .eq('plan_id', plan.id)
              .eq('is_completed', true);
            return { ...plan, reading_count: total ?? 0, completed_count: completed ?? 0 };
          })
        );
        setPlans(plansWithStats);
      }
      setLoading(false);
    }
  };

  // 如果還在載入，顯示轉圈圈
  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 頁面標題區 */}
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">我的讀經計畫</h1>
          <p className="text-gray-500 mt-1">選一張計畫卡片，開始今天的靈修之旅</p>
        </div>
        <Link 
          href="/dashboard/plans/create" 
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-full font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200"
        >
          <PlusCircle className="h-5 w-5" />
          新計畫
        </Link>
      </div>

      {/* 判斷是否有計畫 */}
      {plans.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <p className="text-gray-400 font-medium">目前沒有計畫，點擊右上角新增一個吧！</p>
        </div>
      ) : (
        /* 呼叫轉盤組件 */
        <PlanCarousel plans={plans} onDelete={handleDelete} />
      )}
    </div>
  );
}