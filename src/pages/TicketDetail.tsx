import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth, User } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { ArrowLeft, Clock, User as UserIcon, MessageSquare, CheckCircle2, AlertCircle, History, Lock, Tag, AlertTriangle, UserPlus, Image as ImageIcon, FileText } from 'lucide-react';
import { ticketsApi } from '@/lib/api';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CommentSuggestions } from '@/components/CommentSuggestions';
import { SmartCommentInput } from '@/components/SmartCommentInput';
import { TicketSummaryModal } from '@/components/tickets/TicketSummaryModal';

interface Ticket {
  _id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  requester: {
    _id: string;
    name: string;
    email: string;
    role: string;
    department: string;
  };
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
    role: string;
    department: string;
  };
  comments: Array<{
    _id: string;
    content: string;
    author: {
      _id: string;
      name: string;
      email: string;
      role: string;
      department: string;
    };
    createdAt: string;
    isInternal: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
  statusHistory: Array<{
    status: string;
    changedBy: {
      _id: string;
      name: string;
      email: string;
      role: string;
      department: string;
    };
    changedAt: string;
    comment?: string;
  }>;
  history: Array<{
    type: string;
    oldValue: string;
    newValue: string;
    comment?: string;
    changedBy: {
      _id: string;
      name: string;
      email: string;
      role: string;
      department: string;
    };
    changedAt: string;
  }>;
  attachments?: Array<{
    url: string;
    originalName: string;
  }>;
}

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [ticketStatus, setTicketStatus] = useState('');
  const [categoryComment, setCategoryComment] = useState('');
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [pendingStatus, setPendingStatus] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [timeTravelerStats, setTimeTravelerStats] = useState(null);
  const [showTimeTraveler, setShowTimeTraveler] = useState(false);

  // Helper function to check if user is the ticket requester
  const isTicketRequester = () => {
    return user?.role === 'employee' && ticket?.requester._id === user.id;
  };

  // Helper function to check if user can update status
  const canUpdateStatus = () => {
    if (!user || !ticket) return false;
    
    // Admin, HR, and Super Admin can update status
    if (['admin', 'hr', 'super-admin'].includes(user.role)) return true;
    
    // Employee can close and reopen their own tickets
    if (user.role === 'employee' && ticket.requester._id === user.id) {
      return true;
    }
    
    return false;
  };

  // Helper function to get available status options based on user role
  const getStatusOptions = () => {
    if (!user || !ticket) return [];
    
    if (['admin', 'hr', 'super-admin','it'].includes(user.role)) {
      return [
        { value: 'Open', label: 'Open' },
        { value: 'In Progress', label: 'In Progress' },
        { value: 'Resolved', label: 'Resolved' },
        { value: 'Closed', label: 'Closed' }
      ];
    }
    
    if (user.role === 'employee' && ticket.requester._id === user.id) {
      if (ticket.status === 'Closed') {
        return [
          { value: 'Open', label: 'Reopen Ticket' }
        ];
      } else {
        return [
          { value: 'Closed', label: 'Close Ticket' }
        ];
      }
    }
    
    return [];
  };

  // Helper function to check if ticket is closed
  const isTicketClosed = () => {
    return ticket?.status === 'Closed';
  };

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await ticketsApi.getTicketById(id!);
        setTicket(response.ticket);
        setTicketStatus(response.ticket.status);
      } catch (error) {
        console.error('Failed to fetch ticket:', error);
        toast({
          title: "Error",
          description: "Failed to fetch ticket details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id]);

  useEffect(() => {
    if (
      user?.role === 'employee' &&
      ticket?.requester._id === user.id &&
      (ticket?.status === 'Open' || ticket?.status === 'In Progress')
    ) {
      setShowTimeTraveler(true);
      // Fetch department stats for the ticket's category
      ticketsApi.getDepartmentStats(ticket.category)
        .then(data => {
          if (data && data.topDepts && Array.isArray(data.topDepts)) {
            setTimeTravelerStats(data);
          } else {
            setTimeTravelerStats(null);
          }
        })
        .catch(error => {
          console.error('Error fetching department stats:', error);
          setTimeTravelerStats(null);
        });
    } else {
      setShowTimeTraveler(false);
    }
  }, [user, ticket]);

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast({
        title: "Comment Required",
        description: "Please enter a comment before submitting.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await ticketsApi.addComment(id!, newComment);
      setTicket(prev => {
        if (!prev) return null;
        return {
          ...prev,
          comments: [...prev.comments, response.comment]
        };
      });
      setNewComment('');
      toast({
        title: "Comment Added",
        description: "Your comment has been added to the ticket.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment.",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = (newStatus: string) => {
    setPendingStatus(newStatus);
    setShowStatusConfirm(true);
  };

  const handleStatusConfirm = async () => {
    try {
      const response = await ticketsApi.updateTicket(id!, { status: pendingStatus });
      setTicket(response);
      setTicketStatus(response.status);
      toast({
        title: "Status Updated",
        description: `Ticket status has been updated to ${pendingStatus}.`,
      });
    } catch (error) {
      console.error('Failed to update ticket status:', error);
      toast({
        title: "Error",
        description: "Failed to update ticket status.",
        variant: "destructive",
      });
    } finally {
      setShowStatusConfirm(false);
      setPendingStatus('');
    }
  };

  const handleCloseTicket = async () => {
    try {
      const response = await ticketsApi.updateTicket(id!, { status: 'Closed' });
      setTicket(response);
      setTicketStatus(response.status);
      toast({
        title: "Ticket Closed",
        description: "The ticket has been marked as closed.",
      });
    } catch (error) {
      console.error('Failed to close ticket:', error);
      toast({
        title: "Error",
        description: "Failed to close the ticket.",
        variant: "destructive",
      });
    }
  };

  const handleReopenTicket = async () => {
    try {
      const response = await ticketsApi.updateTicket(id!, { status: 'Open' });
      setTicket(response);
      setTicketStatus(response.status);
      toast({
        title: "Ticket Reopened",
        description: "The ticket has been reopened.",
      });
    } catch (error) {
      console.error('Failed to reopen ticket:', error);
      toast({
        title: "Error",
        description: "Failed to reopen the ticket.",
        variant: "destructive",
      });
    }
  };

  const handleCategoryChange = async (newCategory: string) => {
    try {
      const response = await ticketsApi.updateTicket(ticket!._id, {
        category: newCategory,
        categoryComment
      });
      setTicket(response);
      setCategoryComment('');
      toast({
        title: "Success",
        description: "Ticket category updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update ticket category.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Ticket not found</h1>
            <p className="mt-2 text-gray-600">The ticket you're looking for doesn't exist or you don't have permission to view it.</p>
            <Button onClick={() => navigate('/dashboard')} className="mt-4">
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Time Traveler Preview for Employee */}
        {showTimeTraveler && timeTravelerStats && timeTravelerStats.topDepts && (
          <div className="mb-8 animate-fade-in">
            <div className="relative bg-gradient-to-r from-purple-500/80 to-blue-500/80 rounded-xl shadow-lg p-6 flex items-center gap-6 overflow-hidden">
              <div className="absolute -left-10 -top-10 w-32 h-32 bg-purple-300/30 rounded-full blur-2xl animate-float" />
              <div className="flex-shrink-0">
                <span className="text-5xl animate-spin-slow">⏳</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                  Time Traveler Preview
                  <span className="text-base font-normal text-white/80">(AI Prediction)</span>
                </h2>
                <p className="text-white text-lg font-medium animate-slide-up">
                  This will likely take <span className="font-bold">{timeTravelerStats.avgSteps || 'several'} steps</span>,
                  involve <span className="font-bold">{timeTravelerStats.topDepts.join(' & ')}</span>,
                  and be resolved in <span className="font-bold">~{timeTravelerStats.avgResolutionTime || 'a few'} hours</span>.
                </p>
                <p className="text-white/80 text-sm mt-2 animate-fade-in">
                  Based on historical {ticket.category} tickets.
                </p>
              </div>
            </div>
          </div>
        )}
        <div className="flex justify-between items-center mb-8">
        <Button
          variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="hover:bg-blue-50"
          >
            Back to Dashboard
          </Button>
          <Button
            onClick={() => setShowSummary(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <FileText className="w-4 h-4" />
            View Summary
        </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-lg font-mono">
                        {ticket?.ticketNumber}
                      </Badge>
                    </div>
                    <CardTitle className="text-2xl">{ticket?.title}</CardTitle>
                    <CardDescription className="mt-2">
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="capitalize">
                          {ticket?.category}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`capitalize ${
                            ticket?.priority === 'High'
                              ? 'text-red-600 border-red-600'
                              : ticket?.priority === 'Medium'
                              ? 'text-yellow-600 border-yellow-600'
                              : 'text-green-600 border-green-600'
                          }`}
                        >
                          {ticket?.priority}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`capitalize ${
                            ticket?.status === 'Open'
                              ? 'text-blue-600 border-blue-600'
                              : ticket?.status === 'In Progress'
                              ? 'text-yellow-600 border-yellow-600'
                              : ticket?.status === 'Resolved'
                              ? 'text-green-600 border-green-600'
                              : 'text-gray-600 border-gray-600'
                          }`}
                        >
                          {ticket?.status}
                        </Badge>
                      </div>
                    </CardDescription>
                  </div>
                  {['admin', 'hr', 'super-admin', 'it'].includes(user?.role || '') && (
                    <Select
                      value={ticketStatus}
                      onValueChange={handleStatusChange}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Update Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {getStatusOptions().map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{ticket?.description}</p>
                
                {/* Employee Ticket Actions */}
                {isTicketRequester() && (
                  <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                    <h3 className="text-lg font-semibold mb-4">Ticket Actions</h3>
                    {isTicketClosed() ? (
                      <div className="flex items-center gap-4">
                        <AlertCircle className="w-5 h-5 text-yellow-500" />
                        <p className="text-gray-600">This ticket is currently closed. You can reopen it if you need further assistance.</p>
                        <Button
                          onClick={handleReopenTicket}
                          variant="outline"
                          className="ml-auto"
                        >
                          Reopen Ticket
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <p className="text-gray-600">If your issue has been resolved, you can close this ticket.</p>
                        <Button
                          onClick={handleCloseTicket}
                          variant="outline"
                          className="ml-auto"
                        >
                          Close Ticket
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-6">
                  {ticket.attachments && ticket.attachments.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Attachments</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {ticket.attachments.map((attachment, index) => (
                          <div key={index} className="relative group">
                            <a
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block aspect-square rounded-lg overflow-hidden border hover:border-blue-500 transition-colors"
                            >
                              <img
                                src={attachment.url}
                                alt={attachment.originalName}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                                <ImageIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </a>
                            <p className="mt-1 text-sm text-gray-500 truncate">{attachment.originalName}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Comments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {ticket?.comments?.map((comment) => (
                    <div key={comment._id} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-gray-500" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{comment.author?.name || 'Unknown User'}</span>
                          <Badge variant="secondary" className="text-xs">
                            {comment.author?.role || 'Unknown Role'}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                          {comment.isInternal && (
                            <Badge variant="outline" className="text-xs">
                              Internal Note
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <SmartCommentInput
                    ticketId={id}
                    value={newComment}
                    onChange={setNewComment}
                    onSubmit={handleAddComment}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="animate-slide-up bg-white/80 backdrop-blur-sm border-0" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Status History
                </CardTitle>
                <CardDescription>
                  Track all status changes for this ticket
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ticket?.statusHistory?.map((history, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0">
                        <Badge
                          className={`capitalize ${
                            history.status === 'Open'
                              ? 'bg-blue-100 text-blue-800'
                              : history.status === 'In Progress'
                              ? 'bg-yellow-100 text-yellow-800'
                              : history.status === 'Resolved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {history.status}
                        </Badge>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{history.changedBy?.name || 'Unknown User'}</span>
                          <Badge variant="secondary" className="text-xs">
                            {history.changedBy?.role || 'Unknown Role'}
                          </Badge>
                          {history.changedBy?.department && (
                            <Badge variant="outline" className="text-xs">
                              {history.changedBy.department}
                            </Badge>
                          )}
                          <span className="text-sm text-gray-500">
                            {new Date(history.changedAt).toLocaleString()}
                          </span>
                        </div>
                        {history.comment && (
                          <p className="text-sm text-gray-600 mt-1">{history.comment}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="animate-slide-up bg-white/80 backdrop-blur-sm border-0" style={{ animationDelay: '0.3s' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Manage your account security and password
                </CardDescription>
              </CardHeader>
              {/* ... rest of the existing code ... */}
            </Card>

            {/* Category Section */}
            {!isTicketRequester() && (
            <Card>
              <CardHeader>
                <CardTitle>Category</CardTitle>
                <CardDescription>Change the ticket category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Select
                      value={ticket?.category}
                      onValueChange={handleCategoryChange}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="IT">IT</SelectItem>
                        <SelectItem value="HR">HR</SelectItem>
                          <SelectItem value="Admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Add a comment (optional)"
                      value={categoryComment}
                      onChange={(e) => setCategoryComment(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ticket Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <Badge
                      className={`capitalize ${
                        ticket.status === 'Open'
                          ? 'bg-blue-100 text-blue-800'
                          : ticket.status === 'In Progress'
                          ? 'bg-yellow-100 text-yellow-800'
                          : ticket.status === 'Resolved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {ticket.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {new Date(ticket.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {new Date(ticket.updatedAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Reporter</p>
                    <p className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4" />
                      {ticket.requester?.name || 'Unknown User'}
                    </p>
                  </div>
                  {ticket.assignedTo && (
                    <div>
                      <p className="text-sm text-gray-500">Assigned To</p>
                      <p className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4" />
                        {ticket.assignedTo?.name || 'Unassigned'}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* History Section */}
            <Card>
              <CardHeader>
                <CardTitle>History</CardTitle>
                <CardDescription>Track all changes made to this ticket</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ticket?.history?.map((change, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {change.type === 'status' ? (
                            <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          ) : change.type === 'category' ? (
                            <Tag className="w-4 h-4 text-purple-500 flex-shrink-0" />
                          ) : change.type === 'priority' ? (
                            <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                          ) : (
                            <UserPlus className="w-4 h-4 text-green-500 flex-shrink-0" />
                          )}
                          <span className="font-medium">
                            {change.type === 'status' ? 'Status' : 
                             change.type === 'category' ? 'Category' :
                             change.type === 'priority' ? 'Priority' : 'Assignment'} changed from{' '}
                            <span className="text-gray-500">{change.oldValue}</span> to{' '}
                            <span className="text-gray-900">{change.newValue}</span>
                          </span>
                        </div>
                        {change.comment && (
                          <p className="text-sm text-gray-500 mt-1">{change.comment}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-500">
                          <span className="whitespace-nowrap">By {change.changedBy?.name}</span>
                          <Badge variant="secondary" className="text-xs whitespace-nowrap">
                            {change.changedBy?.role || 'Unknown Role'}
                          </Badge>
                          {change.changedBy?.department && (
                            <Badge variant="outline" className="text-xs whitespace-nowrap">
                              {change.changedBy.department}
                            </Badge>
                          )}
                          <span className="whitespace-nowrap">•</span>
                          <span className="whitespace-nowrap">{new Date(change.changedAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Add the confirmation dialog */}
        <AlertDialog open={showStatusConfirm} onOpenChange={setShowStatusConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to change the ticket status to {pendingStatus}? 
                This ticket will be moved out of your current bucket and you will be redirected to the dashboard.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleStatusConfirm}>
                Confirm Change
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <TicketSummaryModal
          isOpen={showSummary}
          onClose={() => setShowSummary(false)}
          ticketId={id!}
          ticketData={{
            title: ticket?.title || '',
            description: ticket?.description || '',
            category: ticket?.category || '',
            priority: ticket?.priority || '',
            status: ticket?.status || '',
            comments: ticket?.comments.map(comment => ({
              content: comment.content,
              createdAt: comment.createdAt,
              user: {
                name: comment.author.name
              }
            })) || []
          }}
        />
      </div>
    </div>
  );
};

export default TicketDetail;
