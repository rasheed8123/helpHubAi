import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '@/config';

interface VoiceTicketFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function VoiceTicketForm({ onSuccess, onCancel }: VoiceTicketFormProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        setError(`Error: ${event.error}`);
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        setTranscript(transcript);
      };

      setRecognition(recognition);
    } else {
      setError('Speech recognition is not supported in your browser');
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
    } else {
      setTranscript('');
      recognition.start();
    }
  };

  const handleSubmit = async () => {
    if (!transcript) {
      setError('Please speak your issue first');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // First, get the ticket details from AI
      const response = await fetch(`${API_BASE_URL}/assistant/voice-ticket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('helphub_token')}`
        },
        body: JSON.stringify({ speech: transcript }),
      });

      if (!response.ok) {
        throw new Error('Failed to process voice input');
      }

      const ticketDetails = await response.json();

      // Now create the ticket
      const ticketResponse = await fetch(`${API_BASE_URL}/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('helphub_token')}`
        },
        body: JSON.stringify(ticketDetails),
      });

      if (!ticketResponse.ok) {
        throw new Error('Failed to create ticket');
      }

      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Create Ticket with Voice
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-gray-500 text-center">
            {isListening ? 'Listening... Speak your issue' : 'Click the microphone to start speaking'}
          </p>
          <Button
            onClick={toggleListening}
            disabled={isProcessing}
            className={`w-20 h-20 rounded-full transition-all duration-300 ${
              isListening 
                ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                : 'bg-blue-500 hover:bg-blue-600 hover:scale-105'
            }`}
          >
            {isListening ? (
              <MicOff className="w-10 h-10" />
            ) : (
              <Mic className="w-10 h-10" />
            )}
          </Button>
          {!isListening && (
            <p className="text-xs text-gray-400 text-center">
              Click and hold to speak your issue
            </p>
          )}
        </div>

        {transcript && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-700">{transcript}</p>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!transcript || isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Create Ticket'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 