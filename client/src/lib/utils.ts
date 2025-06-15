import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatToday(): string {
  return new Date().toISOString().split('T')[0];
}

export function getWeekDates(date: Date): { startOfWeek: string; endOfWeek: string } {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  
  const startOfWeek = new Date(d.setDate(diff));
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  
  return {
    startOfWeek: startOfWeek.toISOString().split('T')[0],
    endOfWeek: endOfWeek.toISOString().split('T')[0]
  };
}

export function getMoodEmoji(mood: string): string {
  const moodMap: Record<string, string> = {
    excellent: "😊",
    good: "🙂",
    neutral: "😐",
    stressed: "😰",
    angry: "😠"
  };
  return moodMap[mood] || "😐";
}
