"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; // 引入 usePathname
import { createClient } from "@/lib/supabase/client";
import { BookOpen, LogOut, Menu, X, List, Calendar, BarChart3, LayoutDashboard } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname(); // 取得目前網址
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push("/login");
      else setUser(user);
    };
    checkUser();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // 定義導覽連結
  const navItems = [
    { name: '今日進度', href: '/dashboard', icon: LayoutDashboard },
    { name: '月曆', href: '/dashboard/calendar', icon: Calendar },
    { name: '統計', href: '/dashboard/stats', icon: BarChart3 },
    { name: '計畫管理', href: '/dashboard/plans', icon: List },
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            
            {/* 左側 LOGO */}
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-blue-600">
                <BookOpen className="h-6 w-6" />
                <span>Scripture Flow</span>
              </Link>
              
              {/* ⭐ 電腦版選單 (自動變色) */}
              <div className="hidden md:flex ml-10 space-x-2">
                {navItems.map((item) => {
                    // 判斷是否為當前頁面
                    const isActive = pathname === item.href;
                    return (
                        <Link 
                          key={item.href}
                          href={item.href} 
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                              isActive 
                              ? 'bg-blue-50 text-blue-600' 
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          }`}
                        >
                          <item.icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                          {item.name}
                        </Link>
                    )
                })}
              </div>
            </div>

            {/* 右側使用者資訊 */}
            <div className="hidden md:flex items-center gap-4">
              <span className="text-sm text-gray-500">{user.email}</span>
              <button onClick={handleSignOut} className="flex items-center gap-1 rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
                <LogOut className="h-4 w-4" /> 登出
              </button>
            </div>

            {/* 手機版漢堡選單 */}
            <div className="flex items-center md:hidden">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* 手機版下拉選單 */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white">
            <div className="space-y-1 px-4 py-3">
              {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-2 px-3 py-3 text-base font-medium rounded-md ${
                        pathname === item.href 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
              ))}
              <button onClick={handleSignOut} className="w-full text-left mt-2 flex items-center gap-2 px-3 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-md">
                <LogOut className="h-5 w-5" /> 登出
              </button>
            </div>
          </div>
        )}
      </nav>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}