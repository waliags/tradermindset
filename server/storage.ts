import { 
  type Habit, 
  type InsertHabit,
  type HabitCompletion,
  type InsertHabitCompletion,
  type EmotionalCheckIn,
  type InsertEmotionalCheckIn,
  type JournalEntry,
  type InsertJournalEntry,
  type HabitWithStats
} from "@shared/schema";

export interface IStorage {
  // Habits
  getHabits(): Promise<Habit[]>;
  getHabit(id: number): Promise<Habit | undefined>;
  createHabit(habit: InsertHabit): Promise<Habit>;
  updateHabit(id: number, habit: Partial<InsertHabit>): Promise<Habit | undefined>;
  deleteHabit(id: number): Promise<boolean>;
  
  // Habit Completions
  getHabitCompletions(habitId: number, startDate?: string, endDate?: string): Promise<HabitCompletion[]>;
  getHabitCompletion(habitId: number, date: string): Promise<HabitCompletion | undefined>;
  createOrUpdateHabitCompletion(completion: InsertHabitCompletion): Promise<HabitCompletion>;
  
  // Emotional Check-ins
  getEmotionalCheckIn(date: string): Promise<EmotionalCheckIn | undefined>;
  createOrUpdateEmotionalCheckIn(checkIn: InsertEmotionalCheckIn): Promise<EmotionalCheckIn>;
  
  // Journal Entries
  getJournalEntry(date: string): Promise<JournalEntry | undefined>;
  createOrUpdateJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  
  // Analytics
  getHabitsWithStats(date: string): Promise<HabitWithStats[]>;
  getWeeklyProgress(startDate: string, endDate: string): Promise<{ date: string; completionRate: number }[]>;
  getMonthlyStats(year: number, month: number): Promise<{
    bestStreak: number;
    totalHabits: number;
    completionRate: number;
    perfectDays: number;
  }>;
}

export class MemStorage implements IStorage {
  private habits: Map<number, Habit>;
  private habitCompletions: Map<string, HabitCompletion>;
  private emotionalCheckIns: Map<string, EmotionalCheckIn>;
  private journalEntries: Map<string, JournalEntry>;
  private currentHabitId: number;
  private currentCompletionId: number;
  private currentCheckInId: number;
  private currentJournalId: number;

  constructor() {
    this.habits = new Map();
    this.habitCompletions = new Map();
    this.emotionalCheckIns = new Map();
    this.journalEntries = new Map();
    this.currentHabitId = 1;
    this.currentCompletionId = 1;
    this.currentCheckInId = 1;
    this.currentJournalId = 1;

    // Initialize with default habits
    this.initializeDefaultHabits();
  }

  private initializeDefaultHabits() {
    const defaultHabits: InsertHabit[] = [
      {
        name: "Avoid Overtrading",
        description: "Maximum 3 trades per day, focus on quality over quantity",
        category: "Risk Management"
      },
      {
        name: "Honor Stop Losses",
        description: "Exit positions when stop loss is hit, no exceptions",
        category: "Risk Management"
      },
      {
        name: "Wait for Setup",
        description: "Only trade when all criteria are met, be patient",
        category: "Emotional Control"
      },
      {
        name: "Review Trades Daily",
        description: "Spend 10 minutes analyzing today's trades",
        category: "Analysis & Research"
      }
    ];

    defaultHabits.forEach(habit => this.createHabit(habit));
  }

  // Habits
  async getHabits(): Promise<Habit[]> {
    return Array.from(this.habits.values()).filter(h => h.isActive);
  }

  async getHabit(id: number): Promise<Habit | undefined> {
    return this.habits.get(id);
  }

  async createHabit(insertHabit: InsertHabit): Promise<Habit> {
    const habit: Habit = {
      ...insertHabit,
      id: this.currentHabitId++,
      isActive: true
    };
    this.habits.set(habit.id, habit);
    return habit;
  }

  async updateHabit(id: number, updates: Partial<InsertHabit>): Promise<Habit | undefined> {
    const habit = this.habits.get(id);
    if (!habit) return undefined;
    
    const updatedHabit = { ...habit, ...updates };
    this.habits.set(id, updatedHabit);
    return updatedHabit;
  }

  async deleteHabit(id: number): Promise<boolean> {
    const habit = this.habits.get(id);
    if (!habit) return false;
    
    const updatedHabit = { ...habit, isActive: false };
    this.habits.set(id, updatedHabit);
    return true;
  }

  // Habit Completions
  async getHabitCompletions(habitId: number, startDate?: string, endDate?: string): Promise<HabitCompletion[]> {
    return Array.from(this.habitCompletions.values()).filter(completion => {
      if (completion.habitId !== habitId) return false;
      if (startDate && completion.date < startDate) return false;
      if (endDate && completion.date > endDate) return false;
      return true;
    });
  }

  async getHabitCompletion(habitId: number, date: string): Promise<HabitCompletion | undefined> {
    const key = `${habitId}-${date}`;
    return this.habitCompletions.get(key);
  }

  async createOrUpdateHabitCompletion(completion: InsertHabitCompletion): Promise<HabitCompletion> {
    const key = `${completion.habitId}-${completion.date}`;
    const existing = this.habitCompletions.get(key);
    
    if (existing) {
      const updated = { ...existing, completed: completion.completed };
      this.habitCompletions.set(key, updated);
      return updated;
    } else {
      const newCompletion: HabitCompletion = {
        ...completion,
        id: this.currentCompletionId++
      };
      this.habitCompletions.set(key, newCompletion);
      return newCompletion;
    }
  }

  // Emotional Check-ins
  async getEmotionalCheckIn(date: string): Promise<EmotionalCheckIn | undefined> {
    return this.emotionalCheckIns.get(date);
  }

  async createOrUpdateEmotionalCheckIn(checkIn: InsertEmotionalCheckIn): Promise<EmotionalCheckIn> {
    const existing = this.emotionalCheckIns.get(checkIn.date);
    
    if (existing) {
      const updated = { ...existing, mood: checkIn.mood };
      this.emotionalCheckIns.set(checkIn.date, updated);
      return updated;
    } else {
      const newCheckIn: EmotionalCheckIn = {
        ...checkIn,
        id: this.currentCheckInId++
      };
      this.emotionalCheckIns.set(checkIn.date, newCheckIn);
      return newCheckIn;
    }
  }

  // Journal Entries
  async getJournalEntry(date: string): Promise<JournalEntry | undefined> {
    return this.journalEntries.get(date);
  }

  async createOrUpdateJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry> {
    const existing = this.journalEntries.get(entry.date);
    
    if (existing) {
      const updated = { ...existing, content: entry.content };
      this.journalEntries.set(entry.date, updated);
      return updated;
    } else {
      const newEntry: JournalEntry = {
        ...entry,
        id: this.currentJournalId++
      };
      this.journalEntries.set(entry.date, newEntry);
      return newEntry;
    }
  }

  // Analytics
  async getHabitsWithStats(date: string): Promise<HabitWithStats[]> {
    const habits = await this.getHabits();
    const today = new Date(date);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    return Promise.all(habits.map(async (habit) => {
      const completions = await this.getHabitCompletions(habit.id);
      const monthlyCompletions = completions.filter(c => 
        c.date >= startOfMonth.toISOString().split('T')[0] && 
        c.date <= endOfMonth.toISOString().split('T')[0] &&
        c.completed
      );
      
      const completedToday = completions.some(c => c.date === date && c.completed);
      
      // Calculate streak
      let currentStreak = 0;
      const sortedCompletions = completions.sort((a, b) => b.date.localeCompare(a.date));
      const checkDate = new Date(date);
      
      for (let i = 0; i < 365; i++) {
        const dateStr = checkDate.toISOString().split('T')[0];
        const completion = sortedCompletions.find(c => c.date === dateStr);
        
        if (completion && completion.completed) {
          currentStreak++;
        } else {
          break;
        }
        
        checkDate.setDate(checkDate.getDate() - 1);
      }
      
      const totalDaysThisMonth = endOfMonth.getDate();
      const completionRate = totalDaysThisMonth > 0 ? (monthlyCompletions.length / totalDaysThisMonth) * 100 : 0;
      
      return {
        ...habit,
        currentStreak,
        completionRate: Math.round(completionRate),
        completedToday,
        monthlyCompletions: monthlyCompletions.length,
        totalDaysThisMonth
      };
    }));
  }

  async getWeeklyProgress(startDate: string, endDate: string): Promise<{ date: string; completionRate: number }[]> {
    const habits = await this.getHabits();
    const result: { date: string; completionRate: number }[] = [];
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      let totalHabits = habits.length;
      let completedHabits = 0;
      
      for (const habit of habits) {
        const completion = await this.getHabitCompletion(habit.id, dateStr);
        if (completion && completion.completed) {
          completedHabits++;
        }
      }
      
      const completionRate = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;
      result.push({ date: dateStr, completionRate: Math.round(completionRate) });
    }
    
    return result;
  }

  async getMonthlyStats(year: number, month: number): Promise<{
    bestStreak: number;
    totalHabits: number;
    completionRate: number;
    perfectDays: number;
  }> {
    const habits = await this.getHabits();
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);
    
    let bestStreak = 0;
    let totalCompletions = 0;
    let totalPossible = 0;
    let perfectDays = 0;
    
    // Calculate per day
    for (let d = new Date(startOfMonth); d <= endOfMonth; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      let dayCompletions = 0;
      
      for (const habit of habits) {
        const completion = await this.getHabitCompletion(habit.id, dateStr);
        if (completion && completion.completed) {
          dayCompletions++;
          totalCompletions++;
        }
        totalPossible++;
      }
      
      if (dayCompletions === habits.length && habits.length > 0) {
        perfectDays++;
      }
    }
    
    // Calculate best streak (simplified)
    const weeklyProgress = await this.getWeeklyProgress(
      startOfMonth.toISOString().split('T')[0],
      endOfMonth.toISOString().split('T')[0]
    );
    
    let currentStreak = 0;
    for (const day of weeklyProgress) {
      if (day.completionRate === 100) {
        currentStreak++;
        bestStreak = Math.max(bestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }
    
    const completionRate = totalPossible > 0 ? (totalCompletions / totalPossible) * 100 : 0;
    
    return {
      bestStreak,
      totalHabits: habits.length,
      completionRate: Math.round(completionRate),
      perfectDays
    };
  }
}

export const storage = new MemStorage();
