import { pgTable, text, serial, integer, boolean, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull().default("custom"),
  isActive: boolean("is_active").notNull().default(true),
});

export const habitCompletions = pgTable("habit_completions", {
  id: serial("id").primaryKey(),
  habitId: integer("habit_id").notNull(),
  date: date("date").notNull(),
  completed: boolean("completed").notNull().default(false),
});

export const emotionalCheckIns = pgTable("emotional_check_ins", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  mood: text("mood").notNull(), // excellent, good, neutral, stressed, angry
});

export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  content: text("content").notNull(),
});

// Insert schemas
export const insertHabitSchema = createInsertSchema(habits).omit({
  id: true,
  isActive: true,
});

export const insertHabitCompletionSchema = createInsertSchema(habitCompletions).omit({
  id: true,
});

export const insertEmotionalCheckInSchema = createInsertSchema(emotionalCheckIns).omit({
  id: true,
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({
  id: true,
});

// Types
export type Habit = typeof habits.$inferSelect;
export type InsertHabit = z.infer<typeof insertHabitSchema>;
export type HabitCompletion = typeof habitCompletions.$inferSelect;
export type InsertHabitCompletion = z.infer<typeof insertHabitCompletionSchema>;
export type EmotionalCheckIn = typeof emotionalCheckIns.$inferSelect;
export type InsertEmotionalCheckIn = z.infer<typeof insertEmotionalCheckInSchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;

// Extended types for frontend
export type HabitWithStats = Habit & {
  currentStreak: number;
  completionRate: number;
  completedToday: boolean;
  monthlyCompletions: number;
  totalDaysThisMonth: number;
};
