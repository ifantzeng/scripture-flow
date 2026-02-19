import { BIBLE_BOOKS } from "./bible-data";
import { subDays, format, isWithinInterval, startOfDay } from "date-fns";

// ... 原有的 parseReadingVolume 保持不變 ...

export function parseReadingVolume(scripture: string): { bookId: string; chapterCount: number }[] {
  const result: { bookId: string; chapterCount: number }[] = [];
  BIBLE_BOOKS.forEach(book => {
    if (scripture.includes(book.name)) {
      const numbersPart = scripture.replace(book.name, "").trim();
      let count = 0;
      if (numbersPart.includes("-")) {
        const [start, end] = numbersPart.split("-").map(n => parseInt(n));
        if (!isNaN(start) && !isNaN(end)) count = end - start + 1;
      } else if (numbersPart.includes(",")) {
         count = numbersPart.split(",").length;
      } else {
        const single = parseInt(numbersPart);
        if (!isNaN(single)) count = 1;
        else if (scripture.trim() === book.name) count = book.chapters; 
      }
      if (count > 0) result.push({ bookId: book.id, chapterCount: count });
    }
  });
  return result;
}

export function calculateBibleStats(readings: any[]) {
  const stats: Record<string, number> = {};
  const dailyChapters: Record<string, number> = {};
  
  // 準備最近 30 天的空資料
  const last30Days = Array.from({ length: 30 }).map((_, i) => {
    return format(subDays(new Date(), i), 'yyyy-MM-dd');
  }).reverse();
  
  last30Days.forEach(date => dailyChapters[date] = 0);
  BIBLE_BOOKS.forEach(b => stats[b.id] = 0);

  let totalOTChaptersRead = 0;
  let totalNTChaptersRead = 0;

  readings.forEach(r => {
    if (!r.is_completed) return;
    const parsed = parseReadingVolume(r.scripture);
    parsed.forEach(p => {
      if (stats[p.bookId] !== undefined) {
        stats[p.bookId] += p.chapterCount;
        
        // 紀錄每日趨勢
        const dateKey = r.date; // 假設資料庫格式是 yyyy-MM-dd
        if (dailyChapters[dateKey] !== undefined) {
          dailyChapters[dateKey] += p.chapterCount;
        }

        const book = BIBLE_BOOKS.find(b => b.id === p.bookId);
        if (book?.category === 'OT') totalOTChaptersRead += p.chapterCount;
        if (book?.category === 'NT') totalNTChaptersRead += p.chapterCount;
      }
    });
  });

  return {
    bookStats: stats,
    otProgress: totalOTChaptersRead / 929,
    ntProgress: totalNTChaptersRead / 260,
    trendData: last30Days.map(date => ({
        date: format(new Date(date), 'MM/dd'),
        chapters: dailyChapters[date]
    }))
  };
}