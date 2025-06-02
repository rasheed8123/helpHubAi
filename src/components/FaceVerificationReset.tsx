import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { authApi } from '@/lib/api';
import { FaceCapture } from './FaceCapture';
import { Loader2 } from 'lucide-react';

export const FaceVerificationReset: React.FC = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [faceImage, setFaceImage] = useState<File | null>(null);
  const [step, setStep] = useState<'email' | 'face' | 'password'>('email');
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }
    setStep('face');
  };

  const handleFaceCapture = async (image: File) => {
    setIsVerifying(true);
    try {
      // First verify the face
      const data = await authApi.verifyFace(email, image);
      
      if (data.verified) {
        setFaceImage(image);
        setStep('password');
        toast({
          title: "Success",
          description: "Face verified successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Face verification failed. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Face verification failed",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!faceImage) {
      toast({
        title: "Error",
        description: "Please capture your face image",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    try {
      await authApi.verifyFaceAndResetPassword({
        email,
        newPassword,
        faceImage
      });

      toast({
        title: "Success",
        description: "Password has been reset successfully",
      });

      // Reset form
      setEmail('');
      setNewPassword('');
      setConfirmPassword('');
      setFaceImage(null);
      setStep('email');
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reset password",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {step === 'email' && (
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>
          <Button type="submit" className="w-full">
            Continue
          </Button>
        </form>
      )}

      {step === 'face' && (
        <div className="space-y-4">
          {isVerifying && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="ml-2">Verifying face...</span>
            </div>
          )}
          <FaceCapture
            onCapture={handleFaceCapture}
            onCancel={() => setStep('email')}
            mode="verify"
          />
        </div>
      )}

      {step === 'password' && (
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep('face')}
              className="w-full"
            >
              Back
            </Button>
            <Button type="submit" className="w-full">
              Reset Password
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}; 