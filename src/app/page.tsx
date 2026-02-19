import Link from "next/link";
import { BookOpen, ArrowRight, CheckCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white flex flex-col">
      {/* 導覽列 */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2 font-bold text-xl text-blue-600">
          <BookOpen className="h-6 w-6" />
          <span>Scripture Flow</span>
        </div>
        <Link href="/login" className="text-gray-600 font-medium hover:text-blue-600 transition">
          登入
        </Link>
      </nav>

      {/* 主要內容區 */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="bg-blue-100 p-4 rounded-full mb-8 animate-in zoom-in duration-700">
          <BookOpen className="h-12 w-12 text-blue-600" />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight mb-6">
          讓讀經成為<br/>
          <span className="text-blue-600">每天的流動</span>
        </h1>
        
        <p className="text-xl text-gray-500 max-w-2xl mb-12 leading-relaxed">
          自定義您的讀經計畫，追蹤靈修進度，養成屬靈好習慣。
          <br className="hidden md:block"/>
          無論是通讀聖經，或是專題研經，我們都能幫助您持之以恆。
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link 
            href="/dashboard" 
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 hover:-translate-y-1"
          >
            開始使用 <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        {/* 特色介紹小區塊 */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-4xl w-full">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center mb-4 text-green-600">
                    <CheckCircle className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg mb-2">靈活計畫</h3>
                <p className="text-gray-500 text-sm">支援多軌道閱讀，可同時進行舊約、新約或詩篇進度。</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4 text-blue-600">
                    <BookOpen className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg mb-2">進度追蹤</h3>
                <p className="text-gray-500 text-sm">視覺化統計圖表與熱力圖，讓您清楚看見累積的恩典。</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center mb-4 text-orange-600">
                    <ArrowRight className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg mb-2">補救機制</h3>
                <p className="text-gray-500 text-sm">落後了嗎？別擔心，一鍵建立補救計畫，輕鬆跟上腳步。</p>
            </div>
        </div>
      </main>
      
      <footer className="py-6 text-center text-gray-400 text-sm border-t border-gray-100 bg-white">
        © 2026 Scripture Flow. Designed for your spiritual growth.
      </footer>
    </div>
  );
}