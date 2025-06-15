import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, BarChart3, Target } from "lucide-react";
import { getWeekDates } from "@/lib/utils";

export default function TradingStatsCard() {
  const currentDate = new Date();
  const { startOfWeek, endOfWeek } = getWeekDates(currentDate);

  const { data: tradingStats, isLoading } = useQuery({
    queryKey: ["/api/trading-stats"],
    queryFn: () =>
      fetch(`/api/trading-stats?startDate=${startOfWeek}&endDate=${endOfWeek}`, {
        credentials: "include",
      }).then(res => res.json())
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="mr-2 w-5 h-5" />
            Weekly Trading Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-slate-500">Loading stats...</div>
        </CardContent>
      </Card>
    );
  }

  if (!tradingStats || tradingStats.totalTrades === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="mr-2 w-5 h-5" />
            Weekly Trading Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-slate-500 py-8">
            <BarChart3 className="mx-auto w-12 h-12 text-slate-300 mb-3" />
            <p>No trades recorded this week</p>
            <p className="text-sm">Add your first trade to see analytics</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { totalTrades, winRate, totalPnL, avgWin, avgLoss, profitFactor, emotionalStates } = tradingStats;
  
  const isProfitable = totalPnL > 0;
  const topEmotion = Object.keys(emotionalStates).length > 0 
    ? Object.entries(emotionalStates).sort(([,a], [,b]) => b - a)[0] 
    : null;

  const getEmotionColor = (emotion: string) => {
    switch (emotion) {
      case "calm": return "bg-green-100 text-green-700 border-green-200";
      case "confident": return "bg-blue-100 text-blue-700 border-blue-200";
      case "excited": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "fearful": return "bg-red-100 text-red-700 border-red-200";
      case "greedy": return "bg-orange-100 text-orange-700 border-orange-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart3 className="mr-2 w-5 h-5" />
          Weekly Trading Stats
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Total Trades */}
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <div className="text-2xl font-bold text-slate-900">{totalTrades}</div>
            <div className="text-sm text-slate-600">Total Trades</div>
          </div>

          {/* Win Rate */}
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <div className={`text-2xl font-bold ${winRate >= 50 ? "text-green-600" : "text-red-600"}`}>
              {winRate}%
            </div>
            <div className="text-sm text-slate-600">Win Rate</div>
          </div>

          {/* P&L */}
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <div className={`text-2xl font-bold flex items-center justify-center ${isProfitable ? "text-green-600" : "text-red-600"}`}>
              {isProfitable ? <TrendingUp className="w-5 h-5 mr-1" /> : <TrendingDown className="w-5 h-5 mr-1" />}
              ${Math.abs(totalPnL).toFixed(2)}
            </div>
            <div className="text-sm text-slate-600">Total P&L</div>
          </div>

          {/* Profit Factor */}
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <div className={`text-2xl font-bold ${profitFactor >= 1 ? "text-green-600" : "text-red-600"}`}>
              {profitFactor.toFixed(2)}
            </div>
            <div className="text-sm text-slate-600">Profit Factor</div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="mt-4 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600">Avg Win:</span>
            <span className="font-semibold text-green-600">${avgWin.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600">Avg Loss:</span>
            <span className="font-semibold text-red-600">${avgLoss.toFixed(2)}</span>
          </div>
          
          {topEmotion && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600">Most Common State:</span>
              <Badge className={getEmotionColor(topEmotion[0])}>
                {topEmotion[0]} ({topEmotion[1]})
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}