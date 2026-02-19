"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("密碼長度至少需要 6 個字元");
      return;
    }

    setLoading(true);
    setError("");

    // 更新使用者密碼
    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      alert("密碼更新成功！請使用新密碼重新登入。");
      router.push("/login"); // 導回登入頁面
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex justify-center mb-6">
          <div className="bg-orange-50 p-3 rounded-full">
            <Lock className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">設定新密碼</h2>
        <p className="text-center text-gray-500 mb-8 text-sm">
          請輸入您的新密碼，建議混合使用英文與數字。
        </p>

        <form onSubmit={handleUpdatePassword} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">新密碼</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              placeholder="至少 6 個字元"
              minLength={6}
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition-all flex justify-center items-center disabled:opacity-70 shadow-md"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "確認更新密碼"}
          </button>
        </form>
      </div>
    </div>
  );
}