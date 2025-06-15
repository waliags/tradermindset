import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertTradeReviewSchema } from "@shared/schema";
import type { InsertTradeReview } from "@shared/schema";

interface TradeReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TradeReviewModal({ open, onOpenChange }: TradeReviewModalProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedMistakes, setSelectedMistakes] = useState<string[]>([]);
  const [rating, setRating] = useState(0);

  const form = useForm<InsertTradeReview>({
    resolver: zodResolver(insertTradeReviewSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      symbol: "",
      side: "long",
      entryPrice: "",
      exitPrice: "",
      quantity: "",
      pnl: "",
      emotionalState: "calm",
      setup: "",
      lessons: "",
    },
  });

  const addTradeMutation = useMutation({
    mutationFn: (trade: InsertTradeReview) => 
      apiRequest("POST", "/api/trades", trade),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trades"] });
      queryClient.invalidateQueries({ queryKey: ["/api/trading-stats"] });
      onOpenChange(false);
      form.reset();
      setSelectedTags([]);
      setSelectedMistakes([]);
      setRating(0);
    },
  });

  const onSubmit = (data: InsertTradeReview) => {
    const tradeData = {
      ...data,
      tags: selectedTags.length > 0 ? selectedTags : null,
      mistakes: selectedMistakes.length > 0 ? selectedMistakes : null,
      rating: rating > 0 ? rating : null,
    };
    addTradeMutation.mutate(tradeData);
  };

  const commonTags = ["Breakout", "Pullback", "Reversal", "Momentum", "Support/Resistance", "News Event"];
  const commonMistakes = ["FOMO Entry", "Ignored Stop Loss", "Overtrading", "Emotional Decision", "Poor Risk Management", "No Plan"];

  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  const addMistake = (mistake: string) => {
    if (!selectedMistakes.includes(mistake)) {
      setSelectedMistakes([...selectedMistakes, mistake]);
    }
  };

  const removeMistake = (mistake: string) => {
    setSelectedMistakes(selectedMistakes.filter(m => m !== mistake));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Trade Review</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="symbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Symbol</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., AAPL, EURUSD" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="side"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Side</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="long">Long</SelectItem>
                        <SelectItem value="short">Short</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input placeholder="100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="entryPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entry Price</FormLabel>
                    <FormControl>
                      <Input placeholder="150.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="exitPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exit Price</FormLabel>
                    <FormControl>
                      <Input placeholder="155.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pnl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>P&L</FormLabel>
                    <FormControl>
                      <Input placeholder="500.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="emotionalState"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emotional State</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="calm">Calm</SelectItem>
                        <SelectItem value="excited">Excited</SelectItem>
                        <SelectItem value="fearful">Fearful</SelectItem>
                        <SelectItem value="greedy">Greedy</SelectItem>
                        <SelectItem value="confident">Confident</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="setup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Setup</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Bull Flag Breakout" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Tags */}
            <div>
              <FormLabel>Tags</FormLabel>
              <div className="flex flex-wrap gap-2 mt-2 mb-3">
                {selectedTags.map(tag => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                    {tag} ×
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {commonTags.filter(tag => !selectedTags.includes(tag)).map(tag => (
                  <Badge key={tag} variant="outline" className="cursor-pointer" onClick={() => addTag(tag)}>
                    + {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Mistakes */}
            <div>
              <FormLabel>Mistakes</FormLabel>
              <div className="flex flex-wrap gap-2 mt-2 mb-3">
                {selectedMistakes.map(mistake => (
                  <Badge key={mistake} variant="destructive" className="cursor-pointer" onClick={() => removeMistake(mistake)}>
                    {mistake} ×
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {commonMistakes.filter(mistake => !selectedMistakes.includes(mistake)).map(mistake => (
                  <Badge key={mistake} variant="outline" className="cursor-pointer" onClick={() => addMistake(mistake)}>
                    + {mistake}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div>
              <FormLabel>Trade Rating</FormLabel>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star 
                    key={star}
                    className={`w-6 h-6 cursor-pointer ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>
            </div>

            <FormField
              control={form.control}
              name="lessons"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lessons Learned</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="What did you learn from this trade?"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={addTradeMutation.isPending}
              >
                Add Trade
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}