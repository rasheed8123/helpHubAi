import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Suggestion {
  response: string;
  rationale: string;
}

interface CommentSuggestionsProps {
  ticketId: string;
  onSelectSuggestion: (suggestion: string) => void;
  className?: string;
}

export function CommentSuggestions({
  ticketId,
  onSelectSuggestion,
  className
}: CommentSuggestionsProps) {
  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['responseSuggestions', ticketId],
    queryFn: async () => {
      const response = await fetch(`/api/tickets/${ticketId}/suggestions`);
      if (!response.ok) throw new Error('Failed to fetch suggestions');
      const data = await response.json();
      return data.suggestions as Suggestion[];
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-2">
        <Loader2 className="w-4 h-4 animate-spin text-primary" />
      </div>
    );
  }

  if (!suggestions?.length) {
    return null;
  }

  return (
    <div className={cn("space-y-2 p-2 bg-muted/50 rounded-lg", className)}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="w-4 h-4 text-yellow-500" />
        <span>Suggested responses:</span>
      </div>
      <AnimatePresence>
        {suggestions.map((suggestion, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              variant="ghost"
              className="w-full justify-start text-left text-sm h-auto py-2 px-3 hover:bg-muted"
              onClick={() => onSelectSuggestion(suggestion.response)}
            >
              <span className="line-clamp-2">{suggestion.response}</span>
            </Button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
} 