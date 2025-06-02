import { API_BASE_URL } from '../config';

const getAuthHeaders = () => {
  const token = localStorage.getItem('helphub_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }
  return response.json();
};

// Tickets API
export const ticketsApi = {
  getTickets: async (params?: {
    status?: string;
    category?: string;
    priority?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/tickets?${queryParams}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getTicketById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/tickets/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('helphub_token')}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch ticket');
    }
    return response.json();
  },

  async createTicket(data: {
    title: string;
    description: string;
    priority?: string;
    attachments?: File[];
  }) {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    if (data.priority) {
      formData.append('priority', data.priority);
    }
    if (data.attachments) {
      data.attachments.forEach(file => {
        formData.append('attachments', file);
      });
    }

    const response = await fetch(`${API_BASE_URL}/tickets`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('helphub_token')}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create ticket');
    }

    return response.json();
  },

  updateTicket: async (id: string, updateData: {
    status?: string;
    priority?: string;
    assignedTo?: string;
    category?: string;
    statusComment?: string;
    categoryComment?: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/tickets/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData)
    });
    if (!response.ok) {
      throw new Error('Failed to update ticket');
    }
    return response.json();
  },

  addComment: async (ticketId: string, content: string, isInternal: boolean = false) => {
    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('helphub_token')}`
      },
      body: JSON.stringify({ content, isInternal })
    });
    return handleResponse(response);
  },

  getTicketStats: async () => {
    const response = await fetch(`${API_BASE_URL}/tickets/stats`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getDepartmentStats: async (department: string) => {
    const response = await fetch(`${API_BASE_URL}/tickets/department-stats/${department}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('helphub_token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch department stats');
    }

    return response.json();
  }
};

// Users API
export const usersApi = {
  getUsers: async (params?: {
    role?: string;
    department?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/users?${queryParams}`, {
      headers: getAuthHeaders()
    });
    const data = await handleResponse(response);
    return {
      users: data.users || [],
      totalPages: data.totalPages || 1,
      currentPage: data.currentPage || 1,
      total: data.total || 0
    };
  },

  createUser: async (userData: {
    name: string;
    email: string;
    password: string;
    role: string;
    department?: string;
    faceImage?: File;
  }) => {
    const formData = new FormData();
    Object.entries(userData).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value);
      }
    });

    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('helphub_token')}`
      },
      body: formData
    });
    return handleResponse(response);
  },

  updateUser: async (id: string, updateData: any) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData)
    });
    return handleResponse(response);
  },

  deleteUser: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getUserStats: async () => {
    const response = await fetch(`${API_BASE_URL}/users/stats`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await fetch(`${API_BASE_URL}/users/change-password`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword })
    });
    return handleResponse(response);
  }
};

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await handleResponse(response);
    if (data.token) {
      localStorage.setItem('helphub_token', data.token);
    }
    return data;
  },

  register: async (userData: {
    name: string;
    email: string;
    password: string;
    role: string;
    department: string;
    faceImage?: File;
  }) => {
    const formData = new FormData();
    Object.entries(userData).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value);
      }
    });

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    return response.json();
  },

  getMe: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getCurrentUser: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  logout: () => {
    localStorage.removeItem('helphub_token');
    localStorage.removeItem('helphub_user');
  },

  verifyFace: async (email: string, faceImage: File) => {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('faceImage', faceImage);

    const response = await fetch(`${API_BASE_URL}/auth/verify-face`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Face verification failed');
    }

    return response.json();
  },

  verifyFaceAndResetPassword: async (data: {
    email: string;
    newPassword: string;
    faceImage: File;
  }) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const response = await fetch(`${API_BASE_URL}/auth/verify-face-reset`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Password reset failed');
    }

    return response.json();
  }
};

// Admin API
export const adminApi = {
  getDashboardStats: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getUsers: async (params?: {
    role?: string;
    department?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/admin/users?${queryParams}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getTickets: async (params?: {
    status?: string;
    category?: string;
    priority?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/admin/tickets?${queryParams}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};
