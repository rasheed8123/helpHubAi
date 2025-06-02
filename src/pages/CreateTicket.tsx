import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, X, Mic } from 'lucide-react';
import { ticketsApi } from '@/lib/api';
import { API_BASE_URL } from '@/config';
import Navbar from '@/components/Navbar';
import { VoiceTicketForm } from '@/components/tickets/VoiceTicketForm';

const CreateTicket = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [useVoice, setUseVoice] = useState(false);
  const [aiClassification, setAiClassification] = useState<{
    category: string;
    confidence: number;
    reason: string;
  } | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (attachments.length + files.length > 5) {
      toast({
        title: "Too many files",
        description: "You can only upload up to 5 files",
        variant: "destructive"
      });
      return;
    }
    setAttachments(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const ticketData = {
        title: title.trim(),
        description: description.trim(),
        priority: priority
      };

      const response = await fetch(`${API_BASE_URL}/tickets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('helphub_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ticketData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create ticket');
      }

      toast({
        title: "Ticket created",
        description: "Your ticket has been created successfully",
      });

      if (data._id) {
        navigate(`/ticket/${data._id}`);
      } else {
        throw new Error('Invalid ticket ID received from server');
      }
    } catch (error: any) {
      console.error('Create ticket error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create ticket. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 animate-fade-in">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-4 hover:bg-blue-50"
          >
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Ticket</h1>
          <p className="text-gray-600">Submit a new support request and get help from our team</p>
        </div>

        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            onClick={() => setUseVoice(!useVoice)}
            className="flex items-center gap-2"
          >
            <Mic className="w-4 h-4" />
            {useVoice ? 'Switch to Text Input' : 'Use Voice Input'}
          </Button>
        </div>

        {useVoice ? (
          <VoiceTicketForm
            onSuccess={() => {
              toast({
                title: "Ticket created",
                description: "Your ticket has been created successfully",
              });
              navigate('/dashboard');
            }}
            onCancel={() => setUseVoice(false)}
          />
        ) : (
          <Card className="animate-scale-in bg-white/60 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Support Request Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Brief description of your issue"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detailed description of your issue"
                    required
                    rows={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {aiClassification && (
                  <Alert>
                    <AlertDescription>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">AI Classification</p>
                          <p className="text-sm text-muted-foreground">
                            Category: {aiClassification.category}
                            <br />
                            Confidence: {Math.round(aiClassification.confidence * 100)}%
                            <br />
                            Reason: {aiClassification.reason}
                          </p>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label>Attachments (Optional)</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                      accept="image/*,.pdf,.doc,.docx"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">
                        Click to upload or drag and drop
                      </span>
                      <span className="text-xs text-muted-foreground mt-1">
                        Max 5 files, up to 10MB each
                      </span>
                    </label>
                  </div>
                  {attachments.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {attachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-muted rounded"
                        >
                          <span className="text-sm truncate flex-1">
                            {file.name}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Ticket
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg animate-slide-up">
          <h3 className="font-medium text-blue-900 mb-2">💡 Tips for better support:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Be specific about the issue you're experiencing</li>
            <li>• Include error messages if any</li>
            <li>• Mention when the issue started</li>
            <li>• Add steps to reproduce the problem</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateTicket;
