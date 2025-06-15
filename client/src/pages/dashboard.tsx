import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ChartLine, Heart, Plus, Pen, Flame, Check } from "lucide-react";
import HabitCard from "@/components/habit-card";
import AddHabitModal from "@/components/add-habit-modal";
import { formatToday, getWeekDates, getMoodEmoji } from "@/lib/utils";
import type { HabitWithStats, EmotionalCheckIn, JournalEntry } from "@shared/schema";

export default function Dashboard() {
  const [showAddHabitModal, setShowAddHabitModal] = useState(false);
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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <ChartLine className="text-primary-foreground w-4 h-4" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">TraderHabits</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-primary font-medium">Dashboard</a>
              <a href="#" className="text-slate-600 hover:text-slate-900">Journal</a>
              <a href="#" className="text-slate-600 hover:text-slate-900">Analytics</a>
              <a href="#" className="text-slate-600 hover:text-slate-900">Settings</a>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Today, {currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              </h2>
              <p className="text-slate-600 mt-1">Stay disciplined, trade smart</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{currentStreak}</div>
              <div className="text-sm text-slate-500">day streak</div>
            </div>
          </div>
        </div>

        {/* Emotional Check-in */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Heart className="text-red-400 mr-2 w-5 h-5" />
              Daily Emotional Check-in
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
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
                  className="p-3 h-auto flex-col space-y-1"
                  onClick={() => handleMoodSelect(mood)}
                  disabled={moodMutation.isPending}
                >
                  <div className="text-2xl">{emoji}</div>
                  <div className="text-xs">{label}</div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Today's Habits */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-900">Today's Habits</h3>
              <Button onClick={() => setShowAddHabitModal(true)}>
                <Plus className="mr-2 w-4 h-4" />
                Add Habit
              </Button>
            </div>

            <div className="space-y-4">
              {habits.map((habit) => (
                <HabitCard key={habit.id} habit={habit} date={today} />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Weekly Progress */}
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold text-slate-900 mb-4">Weekly Progress</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600">Overall Completion</span>
                      <span className="font-semibold">{weeklyCompletionRate}%</span>
                    </div>
                    <Progress value={weeklyCompletionRate} className="w-full" />
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => {
                      const dayProgress = weeklyProgress[index];
                      const isCompleted = dayProgress?.completionRate === 100;
                      const isToday = index === currentDate.getDay() - 1 || 
                        (currentDate.getDay() === 0 && index === 6);
                      
                      return (
                        <div key={day} className="text-center">
                          <div className="text-xs text-slate-500 mb-1">{day}</div>
                          <div className={`w-6 h-6 rounded flex items-center justify-center border ${
                            isCompleted 
                              ? "bg-success-100 border-success-300" 
                              : isToday 
                                ? "bg-primary-100 border-primary-300"
                                : "bg-slate-100 border-slate-300"
                          }`}>
                            {isCompleted ? (
                              <Check className="text-success-600 w-3 h-3" />
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

            {/* Quick Journal */}
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold text-slate-900 mb-4 flex items-center">
                  <Pen className="text-slate-400 mr-2 w-4 h-4" />
                  Quick Journal
                </h4>
                <Textarea
                  value={journalContent || currentJournalContent}
                  onChange={(e) => setJournalContent(e.target.value)}
                  className="resize-none"
                  rows={4}
                  placeholder="How did your trading go today? Any emotions or patterns you noticed?"
                />
                <Button 
                  variant="secondary" 
                  className="w-full mt-3"
                  onClick={handleJournalSave}
                  disabled={journalMutation.isPending}
                >
                  Save Entry
                </Button>
              </CardContent>
            </Card>

            {/* Stats Summary */}
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold text-slate-900 mb-4">This Month</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Best Streak</span>
                    <span className="font-semibold text-success-600">
                      {monthlyStats?.bestStreak || 0} days
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Total Habits</span>
                    <span className="font-semibold">{monthlyStats?.totalHabits || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Completion Rate</span>
                    <span className="font-semibold">{monthlyStats?.completionRate || 0}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Perfect Days</span>
                    <span className="font-semibold text-primary">{monthlyStats?.perfectDays || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AddHabitModal 
        open={showAddHabitModal} 
        onOpenChange={setShowAddHabitModal} 
      />
    </div>
  );
}
