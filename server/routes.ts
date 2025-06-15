import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertHabitSchema,
  insertHabitCompletionSchema,
  insertEmotionalCheckInSchema,
  insertJournalEntrySchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Habits
  app.get("/api/habits", async (req, res) => {
    try {
      const habits = await storage.getHabits();
      res.json(habits);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch habits" });
    }
  });

  app.post("/api/habits", async (req, res) => {
    try {
      const validatedHabit = insertHabitSchema.parse(req.body);
      const habit = await storage.createHabit(validatedHabit);
      res.status(201).json(habit);
    } catch (error) {
      res.status(400).json({ message: "Invalid habit data" });
    }
  });

  app.put("/api/habits/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedHabit = insertHabitSchema.partial().parse(req.body);
      const habit = await storage.updateHabit(id, validatedHabit);
      if (!habit) {
        return res.status(404).json({ message: "Habit not found" });
      }
      res.json(habit);
    } catch (error) {
      res.status(400).json({ message: "Invalid habit data" });
    }
  });

  app.delete("/api/habits/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteHabit(id);
      if (!success) {
        return res.status(404).json({ message: "Habit not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete habit" });
    }
  });

  // Habit Completions
  app.post("/api/habit-completions", async (req, res) => {
    try {
      const validatedCompletion = insertHabitCompletionSchema.parse(req.body);
      const completion = await storage.createOrUpdateHabitCompletion(validatedCompletion);
      res.json(completion);
    } catch (error) {
      res.status(400).json({ message: "Invalid completion data" });
    }
  });

  // Emotional Check-ins
  app.get("/api/emotional-checkin/:date", async (req, res) => {
    try {
      const { date } = req.params;
      const checkIn = await storage.getEmotionalCheckIn(date);
      res.json(checkIn);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch emotional check-in" });
    }
  });

  app.post("/api/emotional-checkin", async (req, res) => {
    try {
      const validatedCheckIn = insertEmotionalCheckInSchema.parse(req.body);
      const checkIn = await storage.createOrUpdateEmotionalCheckIn(validatedCheckIn);
      res.json(checkIn);
    } catch (error) {
      res.status(400).json({ message: "Invalid check-in data" });
    }
  });

  // Journal Entries
  app.get("/api/journal/:date", async (req, res) => {
    try {
      const { date } = req.params;
      const entry = await storage.getJournalEntry(date);
      res.json(entry);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch journal entry" });
    }
  });

  app.post("/api/journal", async (req, res) => {
    try {
      const validatedEntry = insertJournalEntrySchema.parse(req.body);
      const entry = await storage.createOrUpdateJournalEntry(validatedEntry);
      res.json(entry);
    } catch (error) {
      res.status(400).json({ message: "Invalid journal entry data" });
    }
  });

  // Analytics
  app.get("/api/habits-with-stats/:date", async (req, res) => {
    try {
      const { date } = req.params;
      const habitsWithStats = await storage.getHabitsWithStats(date);
      res.json(habitsWithStats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch habits with stats" });
    }
  });

  app.get("/api/weekly-progress", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }
      const progress = await storage.getWeeklyProgress(startDate as string, endDate as string);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch weekly progress" });
    }
  });

  app.get("/api/monthly-stats/:year/:month", async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);
      const stats = await storage.getMonthlyStats(year, month);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch monthly stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
