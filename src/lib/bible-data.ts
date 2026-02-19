// src/lib/bible-data.ts

export type BibleBook = {
  id: string;
  name: string;
  category: 'OT' | 'NT'; // 舊約或新約
  chapters: number;
};

export const BIBLE_CATEGORIES = {
  OT: [
    { name: "摩西五經", books: ["創世記", "出埃及記", "利未記", "民數記", "申命記"] },
    { name: "歷史書", books: ["約書亞記", "士師記", "路得記", "撒母耳記上", "撒母耳記下", "列王紀上", "列王紀下", "歷代志上", "歷代志下", "以斯拉記", "尼希米記", "以斯帖記"] },
    { name: "詩歌智慧書", books: ["約伯記", "詩篇", "箴言", "傳道書", "雅歌"] },
    { name: "大先知書", books: ["以賽亞書", "耶利米書", "耶利米哀歌", "以西結書", "但以理書"] },
    { name: "小先知書", books: ["何西阿書", "約珥書", "阿摩司書", "俄巴底亞書", "約拿書", "彌迦書", "那鴻書", "哈巴谷書", "西番雅書", "哈該書", "撒迦利亞書", "瑪拉基書"] }
  ],
  NT: [
    { name: "福音書", books: ["馬太福音", "馬可福音", "路加福音", "約翰福音"] },
    { name: "歷史書", books: ["使徒行傳"] },
    { name: "保羅書信", books: ["羅馬書", "哥林多前書", "哥林多後書", "加拉太書", "以弗所書", "腓立比書", "歌羅西書", "帖撒羅尼迦前書", "帖撒羅尼迦後書", "提摩太前書", "提摩太後書", "提多書", "腓利門書"] },
    { name: "通用書信", books: ["希伯來書", "雅各書", "彼得前書", "彼得後書", "約翰一書", "約翰二書", "約翰三書", "猶大書"] },
    { name: "預言書", books: ["啟示錄"] }
  ]
};

export const BIBLE_BOOKS: BibleBook[] = [
  // --- 舊約 Old Testament (39卷) ---
  { id: 'Gen', name: '創世記', category: 'OT', chapters: 50 },
  { id: 'Exo', name: '出埃及記', category: 'OT', chapters: 40 },
  { id: 'Lev', name: '利未記', category: 'OT', chapters: 27 },
  { id: 'Num', name: '民數記', category: 'OT', chapters: 36 },
  { id: 'Deu', name: '申命記', category: 'OT', chapters: 34 },
  { id: 'Jos', name: '約書亞記', category: 'OT', chapters: 24 },
  { id: 'Jdg', name: '士師記', category: 'OT', chapters: 21 },
  { id: 'Rut', name: '路得記', category: 'OT', chapters: 4 },
  { id: '1Sa', name: '撒母耳記上', category: 'OT', chapters: 31 },
  { id: '2Sa', name: '撒母耳記下', category: 'OT', chapters: 24 },
  { id: '1Ki', name: '列王紀上', category: 'OT', chapters: 22 },
  { id: '2Ki', name: '列王紀下', category: 'OT', chapters: 25 },
  { id: '1Ch', name: '歷代志上', category: 'OT', chapters: 29 },
  { id: '2Ch', name: '歷代志下', category: 'OT', chapters: 36 },
  { id: 'Ezr', name: '以斯拉記', category: 'OT', chapters: 10 },
  { id: 'Neh', name: '尼希米記', category: 'OT', chapters: 13 },
  { id: 'Est', name: '以斯帖記', category: 'OT', chapters: 10 },
  { id: 'Job', name: '約伯記', category: 'OT', chapters: 42 },
  { id: 'Psa', name: '詩篇', category: 'OT', chapters: 150 },
  { id: 'Pro', name: '箴言', category: 'OT', chapters: 31 },
  { id: 'Ecc', name: '傳道書', category: 'OT', chapters: 12 },
  { id: 'Son', name: '雅歌', category: 'OT', chapters: 8 },
  { id: 'Isa', name: '以賽亞書', category: 'OT', chapters: 66 },
  { id: 'Jer', name: '耶利米書', category: 'OT', chapters: 52 },
  { id: 'Lam', name: '耶利米哀歌', category: 'OT', chapters: 5 },
  { id: 'Eze', name: '以西結書', category: 'OT', chapters: 48 },
  { id: 'Dan', name: '但以理書', category: 'OT', chapters: 12 },
  { id: 'Hos', name: '何西阿書', category: 'OT', chapters: 14 },
  { id: 'Joe', name: '約珥書', category: 'OT', chapters: 3 },
  { id: 'Amo', name: '阿摩司書', category: 'OT', chapters: 9 },
  { id: 'Oba', name: '俄巴底亞書', category: 'OT', chapters: 1 },
  { id: 'Jon', name: '約拿書', category: 'OT', chapters: 4 },
  { id: 'Mic', name: '彌迦書', category: 'OT', chapters: 7 },
  { id: 'Nah', name: '那鴻書', category: 'OT', chapters: 3 },
  { id: 'Hab', name: '哈巴谷書', category: 'OT', chapters: 3 },
  { id: 'Zep', name: '西番雅書', category: 'OT', chapters: 3 },
  { id: 'Hag', name: '哈该書', category: 'OT', chapters: 2 },
  { id: 'Zec', name: '撒迦利亞書', category: 'OT', chapters: 14 },
  { id: 'Mal', name: '瑪拉基書', category: 'OT', chapters: 4 },

  // --- 新約 New Testament (27卷) ---
  { id: 'Mat', name: '馬太福音', category: 'NT', chapters: 28 },
  { id: 'Mar', name: '馬可福音', category: 'NT', chapters: 16 },
  { id: 'Luk', name: '路加福音', category: 'NT', chapters: 24 },
  { id: 'Joh', name: '約翰福音', category: 'NT', chapters: 21 },
  { id: 'Act', name: '使徒行傳', category: 'NT', chapters: 28 },
  { id: 'Rom', name: '羅馬書', category: 'NT', chapters: 16 },
  { id: '1Co', name: '哥林多前書', category: 'NT', chapters: 16 },
  { id: '2Co', name: '哥林多後書', category: 'NT', chapters: 13 },
  { id: 'Gal', name: '加拉太書', category: 'NT', chapters: 6 },
  { id: 'Eph', name: '以弗所書', category: 'NT', chapters: 6 },
  { id: 'Phi', name: '腓立比書', category: 'NT', chapters: 4 },
  { id: 'Col', name: '歌羅西書', category: 'NT', chapters: 4 },
  { id: '1Th', name: '帖撒羅尼迦前書', category: 'NT', chapters: 5 },
  { id: '2Th', name: '帖撒羅尼迦後書', category: 'NT', chapters: 3 },
  { id: '1Ti', name: '提摩太前書', category: 'NT', chapters: 6 },
  { id: '2Ti', name: '提摩太後書', category: 'NT', chapters: 4 },
  { id: 'Tit', name: '提多書', category: 'NT', chapters: 3 },
  { id: 'Phm', name: '腓利門書', category: 'NT', chapters: 1 },
  { id: 'Heb', name: '希伯來書', category: 'NT', chapters: 13 },
  { id: 'Jam', name: '雅各書', category: 'NT', chapters: 5 },
  { id: '1Pe', name: '彼得前書', category: 'NT', chapters: 5 },
  { id: '2Pe', name: '彼得後書', category: 'NT', chapters: 3 },
  { id: '1Jo', name: '約翰一書', category: 'NT', chapters: 5 },
  { id: '2Jo', name: '約翰二書', category: 'NT', chapters: 1 },
  { id: '3Jo', name: '約翰三書', category: 'NT', chapters: 1 },
  { id: 'Jud', name: '猶大書', category: 'NT', chapters: 1 },
  { id: 'Rev', name: '啟示錄', category: 'NT', chapters: 22 },


];