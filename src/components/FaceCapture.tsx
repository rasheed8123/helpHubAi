import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FaceCaptureProps {
  onCapture: (image: File) => void;
  onCancel: () => void;
  mode: 'register' | 'verify';
}

export const FaceCapture: React.FC<FaceCaptureProps> = ({ onCapture, onCancel, mode }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const { toast } = useToast();

  // Initialize camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsCameraOn(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Error",
        description: "Failed to access camera. Please ensure you have granted camera permissions.",
        variant: "destructive",
      });
    }
  };

  // Cleanup camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraOn(false);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  // Start camera when component mounts
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) {
      toast({
        title: "Error",
        description: "Failed to capture image. Please try again.",
        variant: "destructive",
      });
      setIsCapturing(false);
      return;
    }

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current video frame on the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'face-image.jpg', { type: 'image/jpeg' });
        onCapture(file);
      } else {
        toast({
          title: "Error",
          description: "Failed to process image. Please try again.",
          variant: "destructive",
        });
      }
      setIsCapturing(false);
    }, 'image/jpeg', 0.95);
  };

  const handleRetry = () => {
    stopCamera();
    startCamera();
  };

  return (
    <div className="space-y-4">
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />
        {!isCameraOn && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <p className="text-white">Camera is off</p>
          </div>
        )}
      </div>
      
      <div className="flex justify-center gap-4">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isCapturing}
        >
          Cancel
        </Button>
        <Button
          onClick={handleRetry}
          variant="outline"
          disabled={isCapturing}
        >
          Retry Camera
        </Button>
        <Button
          onClick={captureImage}
          disabled={!isCameraOn || isCapturing}
        >
          {isCapturing ? 'Capturing...' : 'Capture'}
        </Button>
      </div>
      
      <p className="text-sm text-gray-500 text-center">
        {mode === 'register' 
          ? 'Please position your face in the center of the frame'
          : 'Please verify your face to continue'}
      </p>
    </div>
  );
}; 