"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const supabase = createClient();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    // 設定重設完密碼後要導回哪個頁面 (會自動抓取目前的網域)
    const redirectUrl = `${window.location.origin}/update-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("重設密碼的連結已發送至您的信箱，請前往收信！");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-50 p-3 rounded-full">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">忘記密碼？</h2>
        <p className="text-center text-gray-500 mb-8 text-sm">
          請輸入您註冊時使用的電子郵件，我們將發送重設密碼的連結給您。
        </p>

        {message ? (
          <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3 mb-6">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-medium">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">電子郵件</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                placeholder="you@example.com"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex justify-center items-center disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "發送重設連結"}
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <Link href="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 font-medium transition-colors">
            <ArrowLeft className="h-4 w-4" /> 返回登入
          </Link>
        </div>
      </div>
    </div>
  );
}