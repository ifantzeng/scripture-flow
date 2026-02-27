"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PlanCard from "./PlanCard";

interface Plan {
  id: string;
  title: string;
  created_at: string;
  completed_count: number;
  reading_count: number;
  [key: string]: unknown;
}

interface PlanCarouselProps {
  plans: Plan[];
  onDelete: (id: string, title: string) => void;
  onShare?: (id: string, title: string) => void;
}

export default function PlanCarousel({ plans, onDelete, onShare }: PlanCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => setCurrentIndex((prev) => (prev + 1) % plans.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + plans.length) % plans.length);

  const handleShare = (id: string, title: string) => {
    if (onShare) {
      onShare(id, title);
    } else {
      // Default behavior if no onShare handler is provided
      if (navigator.share) {
        navigator.share({
          title: `我的讀經計畫：${title}`,
          text: `我正在進行「${title}」讀經計畫，邀請你一起加入！`,
          url: window.location.href, // Or generate a specific share link
        }).catch(console.error);
      } else {
        alert("您的瀏覽器不支援原生分享功能，請手動複製網址。");
      }
    }
  };

  return (
    <div className="relative h-125 flex items-center justify-center overflow-hidden">
      <button onClick={prev} className="absolute left-4 z-50 p-3 bg-white/80 backdrop-blur rounded-full shadow-xl">
        <ChevronLeft className="h-6 w-6 text-gray-700" />
      </button>
      <button onClick={next} className="absolute right-4 z-50 p-3 bg-white/80 backdrop-blur rounded-full shadow-xl">
        <ChevronRight className="h-6 w-6 text-gray-700" />
      </button>

      <div className="relative w-full h-full flex items-center justify-center" style={{ perspective: "1000px" }}>
        <AnimatePresence>
          {plans.map((plan, index) => {
            const offset = index - currentIndex;
            const isCenter = offset === 0;
            if (Math.abs(offset) > 2) return null;

            return (
              <motion.div
                key={plan.id}
                animate={{
                  opacity: 1 - Math.abs(offset) * 0.3,
                  scale: isCenter ? 1 : 0.75,
                  x: offset * 280,
                  rotateY: offset * -25,
                  zIndex: 10 - Math.abs(offset),
                }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="absolute w-72 h-105"
                style={{ transformStyle: "preserve-3d" }}
              >
                <PlanCard
                  plan={plan}
                  isCenter={isCenter}
                  onDelete={() => onDelete(plan.id, plan.title)}
                  onShare={handleShare}
                  index={index}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
