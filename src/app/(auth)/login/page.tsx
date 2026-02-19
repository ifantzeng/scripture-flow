"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleAuth = async (type: 'login' | 'signup') => {
    setLoading(true);
    const { error } = type === 'login' 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (error) {
      alert("操作失敗：" + error.message);
    } else {
      if (type === 'login') {
        router.push("/dashboard");; // 暫時先跳回首頁，之後改 Dashboard
      } else {
        alert("註冊成功！請檢查信箱。");
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8 bg-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm text-center">
        <h2 className="text-2xl font-bold text-gray-900">登入 / 註冊</h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-900">Email</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900">密碼</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600" 
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => handleAuth('login')}
            disabled={loading}
            className="flex-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:bg-gray-400"
          >
            登入
          </button>
          <button
            onClick={() => handleAuth('signup')}
            disabled={loading}
            className="flex-1 rounded-md bg-green-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 disabled:bg-gray-400"
          >
            註冊
          </button>
        </div>
      </div>
    </div>
  );
}