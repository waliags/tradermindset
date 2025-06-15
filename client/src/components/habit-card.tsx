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
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className={`w-8 h-8 rounded-full border-2 ${
              habit.completedToday
                ? "border-success-600 bg-success-50 hover:bg-success-100"
                : "border-slate-300 bg-slate-50 hover:bg-slate-100"
            }`}
            onClick={handleToggle}
            disabled={toggleHabitMutation.isPending}
          >
            <Check 
              className={`w-4 h-4 ${
                habit.completedToday ? "text-success-600" : "text-slate-400 opacity-0"
              }`} 
            />
          </Button>
          
          <div className="flex-1">
            <h4 className="font-semibold text-slate-900">{habit.name}</h4>
            {habit.description && (
              <p className="text-sm text-slate-600 mt-1">{habit.description}</p>
            )}
            <div className="flex items-center mt-2 space-x-4">
              <div className={`flex items-center text-sm ${
                habit.currentStreak > 0 ? "text-success-600" : "text-slate-400"
              }`}>
                <Flame className="mr-1 w-4 h-4" />
                <span>{habit.currentStreak} day streak</span>
              </div>
              <div className="text-sm text-slate-500">
                <span>{habit.monthlyCompletions}/{habit.totalDaysThisMonth} days this month</span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <ProgressCircle 
              value={habit.completionRate} 
              size={48}
              strokeWidth={3}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
