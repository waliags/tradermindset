import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, Plus, TrendingUp, Calendar, DollarSign } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { GoalTracking } from "@shared/schema";

export default function GoalsTracker() {
  const { data: goals = [], isLoading } = useQuery<GoalTracking[]>({
    queryKey: ["/api/goals"],
  });

  const updateGoalMutation = useMutation({
    mutationFn: ({ id, currentValue }: { id: number; currentValue: string }) => 
      apiRequest("PUT", `/api/goals/${id}`, { currentValue }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
    },
  });

  const calculateProgress = (current: string, target: string): number => {
    const currentNum = parseFloat(current) || 0;
    const targetNum = parseFloat(target) || 1;
    return Math.min((currentNum / targetNum) * 100, 100);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "profit": return <DollarSign className="w-4 h-4" />;
      case "risk": return <Target className="w-4 h-4" />;
      case "discipline": return <TrendingUp className="w-4 h-4" />;
      case "learning": return <Calendar className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "profit": return "bg-green-100 text-green-700 border-green-200";
      case "risk": return "bg-red-100 text-red-700 border-red-200";
      case "discipline": return "bg-blue-100 text-blue-700 border-blue-200";
      case "learning": return "bg-purple-100 text-purple-700 border-purple-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const formatDeadline = (deadline: string | null) => {
    if (!deadline) return "No deadline";
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Overdue";
    if (diffDays === 0) return "Due today";
    if (diffDays === 1) return "Due tomorrow";
    return `${diffDays} days left`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="mr-2 w-5 h-5" />
            Trading Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-slate-500">Loading goals...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Target className="mr-2 w-5 h-5" />
            Trading Goals
          </CardTitle>
          <Button size="sm" variant="outline">
            <Plus className="mr-1 w-4 h-4" />
            Add Goal
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {goals.length === 0 ? (
            <div className="text-center text-slate-500 py-8">
              <Target className="mx-auto w-12 h-12 text-slate-300 mb-3" />
              <p>No goals set yet</p>
              <p className="text-sm">Add your first trading goal to track progress</p>
            </div>
          ) : (
            goals.map((goal) => {
              const progress = calculateProgress(goal.currentValue, goal.targetValue);
              const isCompleted = progress >= 100;
              
              return (
                <div key={goal.id} className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-slate-900">{goal.title}</h4>
                        <Badge className={getCategoryColor(goal.category)}>
                          {getCategoryIcon(goal.category)}
                          <span className="ml-1 capitalize">{goal.category}</span>
                        </Badge>
                      </div>
                      {goal.description && (
                        <p className="text-sm text-slate-600 mb-2">{goal.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600">
                        {goal.currentValue} / {goal.targetValue} {goal.unit}
                      </span>
                      <span className={`font-semibold ${isCompleted ? "text-green-600" : "text-slate-900"}`}>
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <Progress 
                      value={progress} 
                      className={`w-full ${isCompleted ? "bg-green-100" : ""}`} 
                    />
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>{formatDeadline(goal.deadline)}</span>
                    {isCompleted && (
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        Completed ✓
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}