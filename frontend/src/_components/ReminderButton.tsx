'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import ReminderModal from './ReminderModal';
import { Button } from '@/components/ui/button';
import { BellIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ReminderButtonProps {
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
  hasReminder?: boolean;
}

export default function ReminderButton({ 
  contestId, 
  contestName, 
  startTime,
  contest,
  hasReminder = false 
}: ReminderButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReminderSet, setIsReminderSet] = useState(hasReminder);
  const { isSignedIn } = useUser();

  const openModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleReminderSet = (isSet: boolean) => {
    setIsReminderSet(isSet);
    closeModal();
  };

  if (!isSignedIn) {
    return null;
  }

  return (
    <>
      <Button
        onClick={openModal}
        variant="ghost"
        size="icon"
        className={cn(
          "absolute top-2 right-10 p-1.5 rounded-full",
          isReminderSet ? "text-purple-500 hover:text-purple-600" : "text-gray-400 hover:text-gray-600"
        )}
        aria-label={isReminderSet ? 'Edit reminder' : 'Set reminder'}
      >
        <BellIcon 
          className="w-5 h-5" 
          fill={isReminderSet ? "currentColor" : "none"} 
          strokeWidth={isReminderSet ? 1 : 2}
        />
      </Button>

      {isModalOpen && (
        <ReminderModal 
          contestId={contestId}
          contestName={contestName}
          startTime={startTime}
          contest={contest}
          onClose={closeModal}
          onReminderSet={handleReminderSet}
          isReminderSet={isReminderSet}
        />
      )}
    </>
  );
} 