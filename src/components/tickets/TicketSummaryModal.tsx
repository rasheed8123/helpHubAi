import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Download, Copy, Check, Globe } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios from 'axios';
import { jsPDF } from 'jspdf';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'https://helpdesk-ai.onrender.com'
});

interface TicketSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: string;
  ticketData: {
    title: string;
    description: string;
    category: string;
    priority: string;
    status: string;
    comments: Array<{
      content: string;
      createdAt: string;
      user: {
        name: string;
      };
    }>;
  };
}

export function TicketSummaryModal({ isOpen, onClose, ticketId, ticketData }: TicketSummaryModalProps) {
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [translatedSummary, setTranslatedSummary] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [languages, setLanguages] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // Fetch supported languages on component mount
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await api.get('/api/translation/languages');
        setLanguages(response.data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch supported languages",
          variant: "destructive"
        });
      }
    };
    fetchLanguages();
  }, []);

  const generateSummary = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://helpdesk-ai.onrender.com/api/assistant/summarize-ticket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('helphub_token')}`
        },
        body: JSON.stringify({
          ticketId,
          ticketData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate summary');
      }

      const data = await response.json();
      setSummary(data.summary);
      setTranslatedSummary(''); // Reset translated summary when new summary is generated
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate summary. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = async (value: string) => {
    setSelectedLanguage(value);
    if (value === 'en') {
      setTranslatedSummary('');
      return;
    }

    setIsTranslating(true);
    try {
      const response = await api.post('/api/translation/translate', {
        text: summary,
        targetLanguage: value
      });
      setTranslatedSummary(response.data.translatedText);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to translate summary",
        variant: "destructive"
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopy = () => {
    const textToCopy = translatedSummary || summary;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    toast({
      title: "Copied",
      description: "Summary copied to clipboard",
    });
  };

  const handleExport = () => {
    const doc = new jsPDF();
    const textToExport = translatedSummary || summary;
    const language = languages[selectedLanguage] || 'English';
    
    // Add title
    doc.setFontSize(16);
    doc.text('Ticket Summary', 20, 20);
    
    // Add language info
    doc.setFontSize(12);
    doc.text(`Language: ${language}`, 20, 30);
    
    // Add summary content
    doc.setFontSize(10);
    const splitText = doc.splitTextToSize(textToExport, 170);
    doc.text(splitText, 20, 40);
    
    // Save the PDF
    doc.save(`ticket-${ticketId}-summary-${selectedLanguage}.pdf`);
    
    toast({
      title: "Exported",
      description: "Summary exported successfully",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl animate-scale-in">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Ticket Summary
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!summary && !isLoading && (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Generate an AI-powered summary of this ticket</p>
              <Button
                onClick={generateSummary}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Generate Summary
              </Button>
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Generating summary...</span>
            </div>
          )}

          {summary && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(languages).map(([code, name]) => (
                      <SelectItem key={code} value={code}>
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          {name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 animate-fade-in">
                <div className="prose max-w-none">
                  {(isTranslating ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      <span className="ml-2 text-gray-600">Translating...</span>
                    </div>
                  ) : (
                    (translatedSummary || summary).split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-4 text-gray-700">
                        {paragraph}
                      </p>
                    ))
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={handleCopy}
                  className="flex items-center gap-2"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleExport}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 