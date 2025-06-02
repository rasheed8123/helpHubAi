import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Copy, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Suggestion {
  response: string;
  rationale: string;
}

interface ResponseSuggestionsProps {
  ticketId: string;
  onSelectSuggestion: (suggestion: string) => void;
  className?: string;
}

export function ResponseSuggestions({ 
  ticketId, 
  onSelectSuggestion,
  className 
}: ResponseSuggestionsProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const { data: suggestions, isLoading, refetch } = useQuery({
    queryKey: ['responseSuggestions', ticketId],
    queryFn: async () => {
      const response = await fetch(`/api/tickets/${ticketId}/suggestions`);
      if (!response.ok) throw new Error('Failed to fetch suggestions');
      const data = await response.json();
      return data.suggestions as Suggestion[];
    }
  });

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      toast.success('Response copied to clipboard');
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      toast.error('Failed to copy response');
    }
  };

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-semibold">Response Suggestions</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Refresh'
          )}
        </Button>
      </div>

      <ScrollArea className="h-[400px] pr-4">
        <AnimatePresence>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : suggestions?.map((suggestion, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="mb-4 last:mb-0"
            >
              <Card className="p-4 bg-muted/50">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-2">
                      {suggestion.rationale}
                    </p>
                    <p className="text-sm whitespace-pre-wrap">
                      {suggestion.response}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(suggestion.response, index)}
                    >
                      {copiedIndex === index ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onSelectSuggestion(suggestion.response)}
                    >
                      Use
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </ScrollArea>
    </Card>
  );
} 