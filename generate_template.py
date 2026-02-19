import pandas as pd
import os

def create_excel_template():
    # 1. 準備範例資料，確保欄位名稱與 page.tsx 解析邏輯完全一致
    data = {
        "Day": [1, 2, 3, 4],
        "Date": ["2026-02-19", "2026-02-20", "2026-02-21", "2026-02-22"],
        "經文": [
            "創世記 1, 創世記 2", 
            "創世記 3, 馬太福音 1", 
            "詩篇 1", 
            "箴言 1, 箴言 2"
        ]
    }

    # 2. 轉換成 pandas DataFrame
    df = pd.DataFrame(data)

    # 3. 設定輸出路徑 (指向 Next.js 的 public/templates 資料夾)
    # 如果您是在 scripture-flow 資料夾內執行，這樣寫剛好對應
    output_dir = os.path.join("public", "templates")
    
    # 如果資料夾不存在，自動建立
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        print(f"📂 已建立資料夾：{output_dir}")

    output_path = os.path.join(output_dir, "scripture_template.xlsx")

    # 4. 輸出為 Excel 檔案 (不包含 index)
    try:
        # 需確保已安裝 openpyxl 套件
        df.to_excel(output_path, index=False)
        print(f"✅ 成功產出範本檔案：{output_path}")
        print("💡 提示：使用者現在可以透過網頁下載這個標準格式的 Excel 檔了！")
    except Exception as e:
        print(f"❌ 產出失敗，錯誤訊息：{e}")

if __name__ == "__main__":
    create_excel_template()