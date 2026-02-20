"use client";

import { motion } from "framer-motion";
import { BookOpen, Calendar, Trash2, Share2 } from "lucide-react"; // ⭐ 確保引入了 Share2
import Link from "next/link";

interface Plan {
  id: string;
  title: string;
  created_at: string;
  completed_count: number;
  reading_count: number;
}

// ⭐ 確保說明書裡有 onShare
interface PlanCardProps {
  plan: Plan;
  isCenter: boolean;
  onDelete: (id: string, title: string) => void;
  onShare: (id: string, title: string) => void; 
  index: number;
}

// ⭐ 確保接收了 onShare
export default function PlanCard({ plan, isCenter, onDelete, onShare, index }: PlanCardProps) {
  const progress = Math.round((plan.completed_count || 0) / (plan.reading_count || 1) * 100);

  return (
    <div 
      className={
        "w-full h-full rounded-[2.3rem] overflow-hidden flex flex-col " +
        "bg-white/40 backdrop-blur-xl shadow-2xl " +
        "border-t-[3px] border-l-[3px] border-white/90 " +
        "border-b border-r border-white/30"
      }
    >
      {/* 卡片封面背景 */}
      <div className={`h-40 w-full flex items-center justify-center bg-linear-to-br ${index % 2 === 0 ? 'from-blue-500 to-indigo-600' : 'from-emerald-500 to-teal-600'}`}>
        <BookOpen className="h-16 w-16 text-white/30" />
        {isCenter && (
          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-white font-bold border border-white/30">
            進行中
          </div>
        )}
      </div>

      {/* 卡片資訊區 */}
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-xl font-black text-gray-900 line-clamp-2 mb-2">{plan.title}</h3>
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
          <Calendar className="h-3 w-3" />
          {new Date(plan.created_at).toLocaleDateString()}
        </div>

        {/* 進度條 */}
        <div className="mt-auto">
          <div className="flex justify-between text-xs font-bold mb-2">
            <span className="text-gray-500">已閱讀</span>
            <span className="text-blue-600">{progress}%</span>
          </div>
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-blue-600 rounded-full"
            />
          </div>
        </div>

        {/* 操作按鈕 - 只有中心卡片顯示 */}
        {isCenter && (
          <div className="mt-6 flex gap-2">
            <Link href={`/dashboard/calendar?plan=${plan.id}`} className="flex-1 bg-gray-900 text-white text-center py-2.5 rounded-xl text-sm font-bold hover:bg-black transition-colors">
              進入任務
            </Link>
            
            {/* ⭐ 分享按鈕在這裡！ */}
            <button 
              onClick={() => onShare(plan.id, plan.title)}
              className="p-2.5 text-blue-500 hover:bg-blue-50 rounded-xl transition-colors border border-blue-100"
              title="分享為公開範本"
            >
              <Share2 className="h-5 w-5" />
            </button>

            {/* 原本的刪除按鈕 */}
            <button 
              onClick={() => onDelete(plan.id, plan.title)}
              className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-red-100"
              title="刪除計畫"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}