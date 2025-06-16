import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartLine, Heart, Plus, Pen, Flame, Check, BarChart3, Target, TrendingUp } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import HabitCard from "@/components/habit-card";
import AddHabitModal from "@/components/add-habit-modal";
import TradeReviewModal from "@/components/trade-review-modal";
import TradingStatsCard from "@/components/trading-stats-card";
import GoalsTracker from "@/components/goals-tracker";
import { formatToday, getWeekDates, getMoodEmoji } from "@/lib/utils";
import type { HabitWithStats, EmotionalCheckIn, JournalEntry } from "@shared/schema";

export default function Dashboard() {
  const [showAddHabitModal, setShowAddHabitModal] = useState(false);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [journalContent, setJournalContent] = useState("");
  
  const today = formatToday();
  const currentDate = new Date();
  const { startOfWeek, endOfWeek } = getWeekDates(currentDate);

  // Fetch habits with stats
  const { data: habits = [], isLoading: habitsLoading } = useQuery<HabitWithStats[]>({
    queryKey: ["/api/habits-with-stats", today],
  });

  // Fetch emotional check-in
  const { data: emotionalCheckIn } = useQuery<EmotionalCheckIn | null>({
    queryKey: ["/api/emotional-checkin", today],
  });

  // Fetch journal entry
  const { data: journalEntry } = useQuery<JournalEntry | null>({
    queryKey: ["/api/journal", today],
  });

  // Fetch weekly progress
  const { data: weeklyProgress = [] } = useQuery<{ date: string; completionRate: number }[]>({
    queryKey: ["/api/weekly-progress"],
    queryFn: () => 
      fetch(`/api/weekly-progress?startDate=${startOfWeek}&endDate=${endOfWeek}`, {
        credentials: "include",
      }).then(res => res.json())
  });

  // Fetch monthly stats
  const { data: monthlyStats } = useQuery({
    queryKey: ["/api/monthly-stats", currentDate.getFullYear(), currentDate.getMonth() + 1],
    queryFn: () =>
      fetch(`/api/monthly-stats/${currentDate.getFullYear()}/${currentDate.getMonth() + 1}`, {
        credentials: "include",
      }).then(res => res.json())
  });

  // Mutations
  const moodMutation = useMutation({
    mutationFn: (mood: string) => 
      apiRequest("POST", "/api/emotional-checkin", { date: today, mood }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/emotional-checkin"] });
    },
  });

  const journalMutation = useMutation({
    mutationFn: (content: string) => 
      apiRequest("POST", "/api/journal", { date: today, content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal"] });
    },
  });

  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
    moodMutation.mutate(mood);
  };

  const handleJournalSave = () => {
    if (journalContent.trim()) {
      journalMutation.mutate(journalContent);
    }
  };

  // Calculate current streak from habits
  const currentStreak = habits.length > 0 ? Math.max(...habits.map(h => h.currentStreak)) : 0;

  // Calculate weekly completion rate
  const weeklyCompletionRate = weeklyProgress.length > 0 
    ? Math.round(weeklyProgress.reduce((sum, day) => sum + day.completionRate, 0) / weeklyProgress.length)
    : 0;

  const currentMood = selectedMood || emotionalCheckIn?.mood;
  const currentJournalContent = journalEntry?.content || "";

  if (habitsLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Mobile Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-lg flex items-center justify-center">
                <ChartLine className="text-primary-foreground w-3 h-3 sm:w-4 sm:h-4" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">TraderHabits</h1>
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <Button onClick={() => setShowTradeModal(true)} size="sm" className="hidden sm:flex">
                <Plus className="mr-1 w-4 h-4" />
                Add Trade
              </Button>
              <Button onClick={() => setShowTradeModal(true)} size="sm" className="sm:hidden p-2">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Welcome Section - Mobile Optimized */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
            <div className="mb-3 sm:mb-0">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                Today, {currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Stay disciplined, trade smart</p>
            </div>
            <div className="flex items-center justify-between sm:block sm:text-right bg-primary-50 dark:bg-primary-900/20 rounded-lg p-3 sm:p-0 sm:bg-transparent">
              <span className="text-sm text-slate-600 dark:text-slate-400 sm:hidden">Current Streak</span>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-primary">{currentStreak}</div>
                <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">day streak</div>
              </div>
            </div>
          </div>
        </div>

        {/* Emotional Check-in - Mobile Optimized */}
        <Card className="mb-6 sm:mb-8">
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3 sm:mb-4 flex items-center">
              <Heart className="text-red-400 mr-2 w-4 h-4 sm:w-5 sm:h-5" />
              Daily Emotional Check-in
            </h3>
            <div className="grid grid-cols-5 gap-2 sm:gap-3">
              {[
                { mood: "excellent", emoji: "😊", label: "Excellent" },
                { mood: "good", emoji: "🙂", label: "Good" },
                { mood: "neutral", emoji: "😐", label: "Neutral" },
                { mood: "stressed", emoji: "😰", label: "Stressed" },
                { mood: "angry", emoji: "😠", label: "Angry" },
              ].map(({ mood, emoji, label }) => (
                <Button
                  key={mood}
                  variant={currentMood === mood ? "default" : "outline"}
                  className="p-2 sm:p-3 h-auto flex-col space-y-1 touch-manipulation active:scale-95 transition-transform"
                  onClick={() => handleMoodSelect(mood)}
                  disabled={moodMutation.isPending}
                >
                  <div className="text-xl sm:text-2xl">{emoji}</div>
                  <div className="text-xs hidden sm:block">{label}</div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="habits" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-12 p-1 sm:grid">
            <TabsTrigger value="habits" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 text-xs sm:text-sm">
              <Check className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Habits</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 text-xs sm:text-sm">
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 text-xs sm:text-sm">
              <Target className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Goals</span>
            </TabsTrigger>
            <TabsTrigger value="journal" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 text-xs sm:text-sm">
              <Pen className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Journal</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="habits">
            <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-4 sm:mt-6">
              {/* Today's Habits - Mobile First */}
              <div className="lg:col-span-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3 sm:mb-0">Today's Habits</h3>
                  <Button 
                    onClick={() => setShowAddHabitModal(true)}
                    className="w-full sm:w-auto touch-manipulation"
                  >
                    <Plus className="mr-2 w-4 h-4" />
                    Add Habit
                  </Button>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {habits.map((habit) => (
                    <HabitCard key={habit.id} habit={habit} date={today} />
                  ))}
                  {habits.length === 0 && (
                    <Card className="border-dashed border-2 border-slate-300 dark:border-slate-600">
                      <CardContent className="p-8 text-center">
                        <div className="text-slate-400 dark:text-slate-500 mb-2">
                          <Check className="w-12 h-12 mx-auto mb-4" />
                        </div>
                        <h4 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                          Start Building Good Habits
                        </h4>
                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                          Add your first habit to begin tracking your daily progress
                        </p>
                        <Button onClick={() => setShowAddHabitModal(true)}>
                          <Plus className="mr-2 w-4 h-4" />
                          Add Your First Habit
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              {/* Sidebar - Mobile Responsive */}
              <div className="lg:col-span-1 space-y-4 sm:space-y-6">
                {/* Weekly Progress */}
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 sm:mb-4">Weekly Progress</h4>
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-600 dark:text-slate-400">Overall Completion</span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">{weeklyCompletionRate}%</span>
                        </div>
                        <Progress value={weeklyCompletionRate} className="w-full h-2" />
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => {
                          const dayProgress = weeklyProgress[index];
                          const isCompleted = dayProgress?.completionRate === 100;
                          const isToday = index === currentDate.getDay() - 1 || 
                            (currentDate.getDay() === 0 && index === 6);
                          
                          return (
                            <div key={`${day}-${index}`} className="text-center">
                              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">{day}</div>
                              <div className={`w-7 h-7 sm:w-6 sm:h-6 rounded flex items-center justify-center border ${
                                isCompleted 
                                  ? "bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700" 
                                  : isToday 
                                    ? "bg-primary-100 dark:bg-primary-900 border-primary-300 dark:border-primary-700"
                                    : "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                              }`}>
                                {isCompleted ? (
                                  <Check className="text-green-600 dark:text-green-400 w-3 h-3" />
                                ) : isToday ? (
                                  <div className="w-2 h-2 bg-primary rounded-full" />
                                ) : null}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Stats Summary */}
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 sm:mb-4">This Month</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Best Streak</span>
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          {monthlyStats?.bestStreak || 0} days
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Total Habits</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{monthlyStats?.totalHabits || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Completion Rate</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{monthlyStats?.completionRate || 0}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Perfect Days</span>
                        <span className="font-semibold text-primary">{monthlyStats?.perfectDays || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid lg:grid-cols-2 gap-6 mt-6">
              <TradingStatsCard />
              <Card>
                <CardContent className="p-6">
                  <h4 className="font-semibold text-slate-900 mb-4 flex items-center">
                    <TrendingUp className="mr-2 w-5 h-5" />
                    Performance Insights
                  </h4>
                  <div className="space-y-4 text-sm text-slate-600">
                    <p>• Track your daily trading performance</p>
                    <p>• Monitor emotional patterns in trades</p>
                    <p>• Analyze win/loss ratios and profit factors</p>
                    <p>• Review trading setups and mistakes</p>
                  </div>
                  <Button 
                    onClick={() => setShowTradeModal(true)} 
                    className="w-full mt-4"
                  >
                    Add Your First Trade
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="goals">
            <div className="mt-6">
              <GoalsTracker />
            </div>
          </TabsContent>

          <TabsContent value="journal">
            <div className="mt-4 sm:mt-6">
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 sm:mb-4 flex items-center">
                    <Pen className="text-slate-400 mr-2 w-4 h-4" />
                    Trading Journal
                  </h4>
                  <Textarea
                    value={journalContent || currentJournalContent}
                    onChange={(e) => setJournalContent(e.target.value)}
                    className="resize-none min-h-[160px] sm:min-h-[200px] text-sm sm:text-base"
                    placeholder="Reflect on your trading day:

• How did you feel before, during, and after trades?
• What patterns did you notice in your decision-making?
• What went well today?
• What could you improve for tomorrow?
• Any lessons learned or insights gained?"
                  />
                  <Button 
                    variant="default" 
                    className="w-full mt-4 touch-manipulation"
                    onClick={handleJournalSave}
                    disabled={journalMutation.isPending}
                  >
                    {journalMutation.isPending ? "Saving..." : "Save Journal Entry"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Mobile spacing for bottom navigation */}
      <div className="h-16 sm:hidden" />

      <AddHabitModal 
        open={showAddHabitModal} 
        onOpenChange={setShowAddHabitModal} 
      />
      
      <TradeReviewModal 
        open={showTradeModal} 
        onOpenChange={setShowTradeModal} 
      />
    </div>
  );
}
