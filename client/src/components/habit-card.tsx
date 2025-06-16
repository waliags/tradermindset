import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, Check } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import ProgressCircle from "./progress-circle";
import type { HabitWithStats } from "@shared/schema";

interface HabitCardProps {
  habit: HabitWithStats;
  date: string;
}

export default function HabitCard({ habit, date }: HabitCardProps) {
  const toggleHabitMutation = useMutation({
    mutationFn: (completed: boolean) => 
      apiRequest("POST", "/api/habit-completions", {
        habitId: habit.id,
        date,
        completed
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits-with-stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/monthly-stats"] });
    },
  });

  const handleToggle = () => {
    toggleHabitMutation.mutate(!habit.completedToday);
  };

  return (
    <Card className="hover:shadow-md transition-all duration-200 active:scale-[0.98] touch-manipulation">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start sm:items-center space-x-3 sm:space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className={`w-10 h-10 sm:w-8 sm:h-8 rounded-full border-2 flex-shrink-0 touch-manipulation active:scale-95 ${
              habit.completedToday
                ? "border-green-600 bg-green-50 hover:bg-green-100 dark:border-green-500 dark:bg-green-900/20"
                : "border-slate-300 bg-slate-50 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800"
            }`}
            onClick={handleToggle}
            disabled={toggleHabitMutation.isPending}
          >
            <Check 
              className={`w-4 h-4 sm:w-4 sm:h-4 transition-opacity ${
                habit.completedToday ? "text-green-600 dark:text-green-400" : "text-slate-400 opacity-0"
              }`} 
            />
          </Button>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm sm:text-base truncate">{habit.name}</h4>
            {habit.description && (
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{habit.description}</p>
            )}
            <div className="flex flex-col sm:flex-row sm:items-center mt-2 space-y-1 sm:space-y-0 sm:space-x-4">
              <div className={`flex items-center text-xs sm:text-sm ${
                habit.currentStreak > 0 ? "text-green-600 dark:text-green-400" : "text-slate-400"
              }`}>
                <Flame className="mr-1 w-3 h-3 sm:w-4 sm:h-4" />
                <span>{habit.currentStreak} day streak</span>
              </div>
              <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                <span>{habit.monthlyCompletions}/{habit.totalDaysThisMonth} days this month</span>
              </div>
            </div>
          </div>
          
          <div className="flex-shrink-0">
            <ProgressCircle 
              value={habit.completionRate} 
              size={40}
              strokeWidth={3}
              className="sm:w-12 sm:h-12"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
