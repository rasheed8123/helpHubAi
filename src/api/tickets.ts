import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export interface Ticket {
  _id: string;
  title: string;
  description: string;
  category: 'IT' | 'HR' | 'Admin';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  createdAt: string;
  requester: {
    name: string;
    email: string;
  };
  assignedTo?: {
    name: string;
    email: string;
  };
  ticketNumber: string;
  mood: 'angry' | 'frustrated' | 'neutral' | 'satisfied' | 'urgent';
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface TicketResponse {
  tickets: Ticket[];
  pagination: PaginationInfo;
}

export const ticketsApi = {
  getTickets: async (params?: { status?: string; page?: number; limit?: number }): Promise<TicketResponse> => {
    const response = await axios.get<TicketResponse>(`${API_URL}/tickets`, { params });
    return response.data;
  },

  // ... rest of the code ...
}; 