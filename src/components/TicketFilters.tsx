import React from 'react';
import { Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';

interface TicketFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  selectedMood: string;
  setSelectedMood: (mood: string) => void;
}

export function TicketFilters({
  searchQuery,
  setSearchQuery,
  selectedStatus,
  setSelectedStatus,
  selectedMood,
  setSelectedMood
}: TicketFiltersProps) {
  const { user } = useAuth();
  const isStaff = ['admin', 'super-admin', 'hr', 'it'].includes(user?.role || '');

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'angry':
        return '😠';
      case 'frustrated':
        return '😤';
      case 'urgent':
        return '⚡';
      case 'satisfied':
        return '😊';
      default:
        return '😐';
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6 bg-white/60 backdrop-blur-sm p-4 rounded-lg shadow-sm">
      {/* Search Input */}
      <div className="flex-1">
        <Input
          type="text"
          placeholder="Search tickets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Status Filter */}
      <div className="w-full sm:w-48">
        <Select
          value={selectedStatus}
          onValueChange={setSelectedStatus}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Open">Open</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Resolved">Resolved</SelectItem>
            <SelectItem value="Closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Mood Filter - Only visible to staff */}
      {isStaff && (
        <div className="w-full sm:w-48">
          <Select
            value={selectedMood}
            onValueChange={setSelectedMood}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Mood" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Moods</SelectItem>
              <SelectItem value="angry">{getMoodIcon('angry')} Angry</SelectItem>
              <SelectItem value="frustrated">{getMoodIcon('frustrated')} Frustrated</SelectItem>
              <SelectItem value="neutral">{getMoodIcon('neutral')} Neutral</SelectItem>
              <SelectItem value="satisfied">{getMoodIcon('satisfied')} Satisfied</SelectItem>
              <SelectItem value="urgent">{getMoodIcon('urgent')} Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
} 