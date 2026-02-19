"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { PlusCircle, Trash2, Calendar, FileText, Loader2, List } from "lucide-react";

type Plan = {
  id: string;
  title: string;
  created_at: string;
  reading_count?: number;
  completed_count?: number;
};

export default function PlansPage() {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);
  const supabase = createClient();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. 抓取這個人的所有計畫 (最新的在上面)
      const { data: plansData, error } = await supabase
        .from('plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // 2. 計算每個計畫的進度
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

          return { ...plan, reading_count: total || 0, completed_count: completed || 0 };
        })
      );

      setPlans(plansWithStats);
    } catch (error) {
      console.error("讀取失敗:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (planId: string, planTitle: string) => {
    const confirmMsg = prompt(`⚠️ 危險動作！\n\n您確定要刪除「${planTitle}」嗎？\n這將會刪除該計畫下的所有進度紀錄。\n\n請輸入 "DELETE" (大寫) 確認刪除：`);
    
    if (confirmMsg !== "DELETE") {
        if (confirmMsg !== null) alert("刪除已取消");
        return;
    }

    try {
      setLoading(true);
      // 1. 先刪除該計畫的所有閱讀進度 (因為有 Foreign Key 綁定，要先刪小孩再刪父母)
      await supabase.from('plan_readings').delete().eq('plan_id', planId);
      
      // 2. 再刪除計畫本身
      const { error } = await supabase.from('plans').delete().eq('id', planId);
      
      if (error) throw error;

      // 更新畫面
      setPlans(prev => prev.filter(p => p.id !== planId));
      alert("✅ 刪除成功！");
    } catch (error: any) {
      alert(`刪除失敗: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 標題區 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <List className="h-6 w-6 text-blue-600"/> 
                計畫管理
            </h1>
            <p className="text-gray-500 text-sm mt-1">在這裡管理您的所有讀經計畫</p>
        </div>
        <Link
          href="/dashboard/plans/create"
          className="flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
        >
          <PlusCircle className="h-4 w-4" />
          建立新計畫
        </Link>
      </div>

      {/* 列表區 */}
      {plans.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-10 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900">目前沒有任何計畫</h3>
            <p className="text-gray-500 mb-6">建立您的第一個讀經計畫，開始屬靈之旅。</p>
            <Link href="/dashboard/plans/create" className="text-blue-600 hover:underline">
                立即建立 &rarr;
            </Link>
        </div>
      ) : (
        <div className="grid gap-4">
            {plans.map((plan) => (
                <div key={plan.id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-shadow">
                    {/* 左側資訊 */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-gray-900">{plan.title}</h3>
                            {/* 標記最新的計畫 */}
                            {plans[0].id === plan.id && (
                                <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">使用中</span>
                            )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(plan.created_at).toLocaleDateString()}
                            </span>
                            <span>
                                進度: {plan.completed_count} / {plan.reading_count} 章
                            </span>
                        </div>
                    </div>

                    {/* 右側按鈕 */}
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => handleDelete(plan.id, plan.title)}
                            className="flex items-center gap-1 text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-md text-sm transition-colors border border-transparent hover:border-red-200"
                        >
                            <Trash2 className="h-4 w-4" />
                            刪除
                        </button>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
}