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

export const tradeReviews = pgTable("trade_reviews", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  symbol: text("symbol").notNull(),
  side: text("side").notNull(), // "long" or "short"
  entryPrice: text("entry_price").notNull(),
  exitPrice: text("exit_price"),
  quantity: text("quantity").notNull(),
  pnl: text("pnl"),
  tags: text("tags").array(),
  emotionalState: text("emotional_state"), // "calm", "excited", "fearful", "greedy", "confident"
  setup: text("setup"), // "breakout", "pullback", "reversal", etc.
  mistakes: text("mistakes").array(),
  lessons: text("lessons"),
  rating: integer("rating"), // 1-5 stars
});

export const goalTracking = pgTable("goal_tracking", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  targetValue: text("target_value").notNull(),
  currentValue: text("current_value").notNull().default("0"),
  unit: text("unit").notNull(), // "USD", "percent", "trades", etc.
  deadline: date("deadline"),
  category: text("category").notNull(), // "profit", "risk", "discipline", "learning"
  isActive: boolean("is_active").notNull().default(true),
});

export const riskMetrics = pgTable("risk_metrics", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  accountBalance: text("account_balance"),
  maxDrawdown: text("max_drawdown"),
  dailyRisk: text("daily_risk"),
  positionSize: text("position_size"),
  riskRewardRatio: text("risk_reward_ratio"),
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

export const insertTradeReviewSchema = createInsertSchema(tradeReviews).omit({
  id: true,
});

export const insertGoalTrackingSchema = createInsertSchema(goalTracking).omit({
  id: true,
  isActive: true,
});

export const insertRiskMetricsSchema = createInsertSchema(riskMetrics).omit({
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
export type TradeReview = typeof tradeReviews.$inferSelect;
export type InsertTradeReview = z.infer<typeof insertTradeReviewSchema>;
export type GoalTracking = typeof goalTracking.$inferSelect;
export type InsertGoalTracking = z.infer<typeof insertGoalTrackingSchema>;
export type RiskMetrics = typeof riskMetrics.$inferSelect;
export type InsertRiskMetrics = z.infer<typeof insertRiskMetricsSchema>;

// Extended types for frontend
export type HabitWithStats = Habit & {
  currentStreak: number;
  completionRate: number;
  completedToday: boolean;
  monthlyCompletions: number;
  totalDaysThisMonth: number;
};
