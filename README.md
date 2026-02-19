📖 Scripture Flow | 靈修進度追蹤平台
Scripture Flow 是一款專為基督徒設計的靈修進度管理工具。透過強大的 Excel 匯入功能與智慧化的經文解析系統，協助使用者輕鬆管理長期的讀經計畫，並與 YouVersion 數位聖經無縫接軌。

✨ 核心功能
🛠️ 讀經計畫管理
Excel 一鍵匯入：支援複雜的讀經進度表匯入，自動修正 Excel 日期序列號（如 46023）並轉換為標準格式。

智慧經文解析：自動歸納同書卷章節（例如將「利未記 1, 利未記 2」精簡為「利未記 1~2」）。

多書卷支援：當日進度若跨越多卷書，系統會自動生成多個獨立的閱讀按鈕。

📅 互動式儀表板
今日進度：直觀的打卡介面，支援細分到「章」等級的進度追蹤。

月曆視圖：全方位掌握靈修歷史，並具備**「補救計畫」**功能，協助追趕落後的進度。

🔐 安全與帳戶
全方位 RLS 防護：資料庫啟用 Row Level Security，確保使用者資料完全隔離。

完善的認證流程：整合 Email 登入、註冊，以及完整的**「忘記密碼 / 重設密碼」**工作流。

行動優先設計：採用響應式介面，無論在電腦、iPad 或手機上都有極佳體驗。

🚀 技術棧
前端框架: Next.js (App Router)

語言: TypeScript

樣式: Tailwind CSS

資料庫 & 認證: Supabase (PostgreSQL, Auth, RLS)

圖示: Lucide React

日期處理: date-fns

部署: Vercel

🛠️ 開發環境設定
1. 複製專案
Bash
git clone https://github.com/ifantzeng/scripture-flow.git
cd scripture-flow
2. 安裝依賴
Bash
npm install
3. 環境變數設定
請在根目錄建立 .env.local 檔案，並填入您的 Supabase 金鑰：

程式碼片段
NEXT_PUBLIC_SUPABASE_URL=您的_SUPABASE_網址
NEXT_PUBLIC_SUPABASE_ANON_KEY=您的_SUPABASE_匿名金鑰
4. 啟動開發伺服器
Bash
npm run dev
瀏覽器打開 http://localhost:3000 即可開始開發。

📂 專案結構精華
src/app/(auth)：處理登入、註冊、忘記密碼等流程。

src/app/dashboard/reading/[id]：智慧化的詳細閱讀任務頁面。

src/components/dashboard：包含 CalendarView 與 ReadingListItem 等核心互動元件。

src/lib：封裝了 Supabase 客戶端與智慧經文解析邏輯 (bible-lookup)。

🛡️ 安全性紀錄
本專案已通過 Supabase Linter 安全稽核：

[x] RLS Enabled: 所有 public 資料表均已啟用資料列安全性。

[x] Auth Hardening: 實作了 Email 確認與密碼重設安全導向。

[x] Validation: 前端實作密碼強度基本檢查。

👤 貢獻者
ifantzeng(Lead Developer)

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
