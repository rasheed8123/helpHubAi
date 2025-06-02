import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { API_BASE_URL } from '@/config';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';

interface Suggestion {
  response: string;
  rationale: string;
}

interface SmartCommentInputProps {
  ticketId: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  className?: string;
}

export function SmartCommentInput({
  ticketId,
  value,
  onChange,
  onSubmit,
  placeholder = "Type your comment...",
  className = ""
}: SmartCommentInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Array<{ response: string; rationale: string }>>([]);
  const { user } = useAuth();

  // Immediate API call on mount
  useEffect(() => {
    console.log('Component mounted with ticketId:', ticketId);
    if (user?.role) {
      fetchSuggestions();
    }
  }, [ticketId, user?.role]);

  const fetchSuggestions = async () => {
    if (!user?.role) {
      setError('User role not found');
      return;
    }

    console.log('Starting API call...');
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('helphub_token');
      console.log('Token available:', !!token);
      console.log('Token length:', token?.length);
      console.log('Token first 10 chars:', token?.substring(0, 10) + '...');
      
      if (!token) {
        setError('Please log in to access smart suggestions');
        return;
      }

      const url = `${API_BASE_URL}/tickets/${ticketId}/suggestions?role=${user.role}`;
      console.log('Calling API at:', url);
      console.log('Request headers:', {
        'Authorization': `Bearer ${token.substring(0, 10)}...`,
        'Content-Type': 'application/json'
      });

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('API Response status:', response.status);
      console.log('API Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('API Response data:', data);
      
      if (data.suggestions) {
        setSuggestions(data.suggestions);
        setShowSuggestions(true);
        console.log('Suggestions set:', data.suggestions);
      } else {
        console.log('No suggestions in response');
        setSuggestions([]);
      }
    } catch (error) {
      console.error('API Error:', error);
      setError('Failed to load suggestions. Please try again.');
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle textarea changes
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    if (e.target.value.trim()) {
      setShowSuggestions(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    textareaRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          onFocus={() => !value.trim() && setShowSuggestions(true)}
          placeholder={placeholder}
          className={`min-h-[100px] ${className}`}
        />
        {isLoading && (
          <div className="absolute right-2 top-2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchSuggestions}
              className="ml-2"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <AnimatePresence>
        {showSuggestions && !value.trim() && suggestions.length > 0 && !isLoading && !error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md"
          >
            <div className="max-h-[300px] overflow-y-auto p-1">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion.response)}
                  className={`flex cursor-pointer items-start gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground ${
                    index === selectedIndex ? 'bg-accent text-accent-foreground' : ''
                  }`}
                >
                  <Sparkles className="mt-0.5 h-4 w-4 text-primary" />
                  <div className="flex-1">
                    <div className="font-medium whitespace-pre-line">{suggestion.response}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {suggestion.rationale}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-end mt-2">
        <Button
          onClick={onSubmit}
          disabled={!value.trim()}
        >
          Add Comment
        </Button>
      </div>
    </div>
  );
} 