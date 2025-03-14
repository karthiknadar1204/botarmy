'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ReminderModalProps {
  contestId: string;
  contestName: string;
  startTime: string;
  contest: {
    id: string;
    name: string;
    url: string;
    platform: string;
    start_time: string;
    // other contest properties
  };
  onClose: () => void;
  onReminderSet: (isSet: boolean) => void;
  isReminderSet: boolean;
}

export default function ReminderModal({
  contestId,
  contestName,
  startTime,
  contest,
  onClose,
  onReminderSet,
  isReminderSet: initialIsReminderSet,
}: ReminderModalProps) {
  const [reminderTime, setReminderTime] = useState('30');
  const [useCustomEmail, setUseCustomEmail] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(true);
  const { isSignedIn, user } = useUser();

  const contestStartTime = new Date(startTime);
  const now = new Date();
  const maxReminderMinutes = Math.floor((contestStartTime.getTime() - now.getTime()) / (60 * 1000));

  // Fetch existing reminder settings if reminder is already set
  useEffect(() => {
    if (initialIsReminderSet && isSignedIn && user) {
      const fetchReminderSettings = async () => {
        try {
          const response = await fetch(`${API_URL}/reminders/${contestId}`, {
            headers: {
              'user-id': user.id,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setReminderTime(data.reminder_minutes.toString());
            if (data.custom_email) {
              setUseCustomEmail(true);
              setCustomEmail(data.custom_email);
            }
          }
        } catch (error) {
          console.error('Error fetching reminder settings:', error);
        }
      };

      fetchReminderSettings();
    }
  }, [initialIsReminderSet, contestId, isSignedIn, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSignedIn || !user) {
      setError('You must be signed in to set reminders');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const reminderData = {
        contest_id: contestId,
        reminder_minutes: parseInt(reminderTime),
        custom_email: useCustomEmail ? customEmail : null,
        contest_url: contest?.url,
        first_name: user.firstName || user.username || user.emailAddresses[0]?.emailAddress?.split('@')[0]
      };

      const response = await fetch(`${API_URL}/reminders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': user.id,
        },
        body: JSON.stringify(reminderData),
      });

      if (response.ok) {
        onReminderSet(true);
        handleClose();
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to set reminder');
      }
    } catch (error) {
      setError('An error occurred while setting the reminder');
      console.error('Error setting reminder:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isSignedIn || !user) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/reminders/${contestId}`, {
        method: 'DELETE',
        headers: {
          'user-id': user.id,
        },
      });

      if (response.ok) {
        onReminderSet(false);
        handleClose();
      } else {
        setError('Failed to delete reminder');
      }
    } catch (error) {
      setError('An error occurred while deleting the reminder');
      console.error('Error deleting reminder:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const isFormValid = () => {
    if (useCustomEmail && !validateEmail(customEmail)) {
      return false;
    }
    return true;
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialIsReminderSet ? 'Edit Reminder' : 'Set Reminder'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="mb-4">
          <p className="text-gray-700 font-medium">{contestName}</p>
          <p className="text-sm text-gray-500">
            Starts: {new Date(startTime).toLocaleString()}
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reminderTime">Remind me before the contest</Label>
              <Select 
                value={reminderTime} 
                onValueChange={setReminderTime}
              >
                <SelectTrigger id="reminderTime">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                  <SelectItem value="360">6 hours</SelectItem>
                  <SelectItem value="720">12 hours</SelectItem>
                  <SelectItem value="1440">24 hours</SelectItem>
                </SelectContent>
              </Select>
              {parseInt(reminderTime) > maxReminderMinutes && (
                <p className="text-sm text-destructive">
                  This reminder time is after the contest starts. Please select a shorter time.
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="useCustomEmail" 
                checked={useCustomEmail}
                onCheckedChange={(checked) => setUseCustomEmail(checked === true)}
              />
              <Label htmlFor="useCustomEmail" className="text-sm">
                Send reminder to a different email
              </Label>
            </div>
            
            {useCustomEmail && (
              <div className="space-y-2">
                <Input
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="Enter email address"
                  required={useCustomEmail}
                />
                {useCustomEmail && customEmail && !validateEmail(customEmail) && (
                  <p className="text-sm text-destructive">
                    Please enter a valid email address
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="mt-6">
            {initialIsReminderSet ? (
              <>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isLoading}
                >
                  Delete Reminder
                </Button>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || !isFormValid() || parseInt(reminderTime) > maxReminderMinutes}
                  >
                    Update
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !isFormValid() || parseInt(reminderTime) > maxReminderMinutes}
                >
                  Set Reminder
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 