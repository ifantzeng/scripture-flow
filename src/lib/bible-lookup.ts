/**
 * 聖經中英文卷名對照表 (對應 YouVersion 標準縮寫)
 */
export const BIBLE_ID_MAP: Record<string, string> = {
  "創世記": "GEN", "出埃及記": "EXO", "利未記": "LEV", "民數記": "NUM", "申命記": "DEU",
  "約書亞記": "JOS", "士師記": "JDG", "路得記": "RUT", "撒母耳記上": "1SA", "撒母耳記下": "2SA",
  "列王紀上": "1KI", "列王紀下": "2KI", "歷代志上": "1CH", "歷代志下": "2CH", "以斯拉記": "EZR",
  "尼希米記": "NEH", "以斯帖記": "EST", "約伯記": "JOB", "詩篇": "PSA", "箴言": "PRO",
  "傳道書": "ECC", "雅歌": "SNG", "以賽亞書": "ISA", "耶利米書": "JER", "耶利米哀歌": "LAM",
  "以西結書": "EZK", "但以理書": "DAN", "何西阿書": "HOS", "約珥書": "JOL", "阿摩司書": "AMO",
  "俄巴底亞書": "OBA", "約拿書": "JON", "彌迦書": "MIC", "那鴻書": "NAM", "哈巴谷書": "HAB",
  "西番雅書": "ZEP", "哈該書": "HAG", "撒迦利亞書": "ZEC", "瑪拉基書": "MAL",
  "馬太福音": "MAT", "馬可福音": "MRK", "路加福音": "LUK", "約翰福音": "JHN", "使徒行傳": "ACT",
  "羅馬書": "ROM", "哥林多前書": "1CO", "哥林多後書": "2CO", "加拉太書": "GAL", "以弗所書": "EPH",
  "腓立比書": "PHP", "哥羅西書": "COL", "帖撒羅尼迦前書": "1TH", "帖撒羅尼迦後書": "2TH",
  "提摩太前書": "1TI", "提摩太後書": "2TI", "提多書": "TIT", "腓利門書": "PHM", "希伯來書": "HEB",
  "雅各書": "JAS", "彼得前書": "1PE", "彼得後書": "2PE", "約翰一書": "1JN", "約翰二書": "2JN",
  "約翰三書": "3JN", "猶大書": "JUD", "啟示錄": "REV"
};

/**
 * 產生指向 YouVersion (bible.com) 的精確章節連結
 * 格式範例：https://www.bible.com/zh-TW/bible/46/GEN.1.CUNP
 */
export function getExternalBibleLink(scripture: string) {
  if (!scripture) return "https://www.bible.com/zh-TW";
  
  // 1. 處理複數經文，只取第一項 (如 "創世記 1, 創世記 2" -> "創世記 1")
  const firstRef = scripture.split(/[,，]/)[0].trim();
  
  // 2. 解析書名與章節數字 (如 "創世記 1" -> ["創世記", "1"])
  const match = firstRef.match(/^(\D+)\s*(\d+)/);
  if (!match) return `https://www.bible.com/zh-TW/search/bible?q=${encodeURIComponent(firstRef)}`;

  const chineseName = match[1].trim();
  const chapter = match[2].trim();
  const englishId = BIBLE_ID_MAP[chineseName];

  if (!englishId) return `https://www.bible.com/zh-TW/search/bible?q=${encodeURIComponent(firstRef)}`;

  // 3. 回傳 YouVersion 標準路徑 (使用譯本 ID: 46 代表和合本 CUNP)
  return `https://www.bible.com/zh-TW/bible/46/${englishId}.${chapter}.CUNP`;
}

/**
 * 備用：產生 Bible-API 的連結
 */
export function getBibleApiUrl(scripture: string) {
  if (!scripture) return null;
  const firstRef = scripture.split(/[,，]/)[0].trim();
  const match = firstRef.match(/^(\D+)\s*(\d+.*)/);
  if (!match) return null;
  const chineseName = match[1].trim();
  const chapterRange = match[2].trim(); 
  const englishId = BIBLE_ID_MAP[chineseName];
  if (!englishId) return null;
  return `https://bible-api.com/${englishId}+${chapterRange}?translation=cuv`;
}