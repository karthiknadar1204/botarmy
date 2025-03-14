'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { BookmarkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface BookmarkButtonProps {
  contestId: string;
  isBookmarked: boolean;
  onBookmarkChange?: (isBookmarked: boolean) => void;
}

export default function BookmarkButton({ contestId, isBookmarked: initialBookmarked, onBookmarkChange }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [isLoading, setIsLoading] = useState(false);
  const { isSignedIn, user } = useUser();
  
  useEffect(() => {
    setIsBookmarked(initialBookmarked);
  }, [initialBookmarked]);

  const toggleBookmark = async () => {
    if (!isSignedIn || !user) {
      alert('Please sign in to bookmark contests');
      return;
    }

    setIsLoading(true);
    try {
      const method = isBookmarked ? 'DELETE' : 'POST';
      const response = await fetch(`${API_URL}/bookmarks/${contestId}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'user-id': user.id,
        },
      });

      if (response.ok) {
        const newBookmarkState = !isBookmarked;
        setIsBookmarked(newBookmarkState);
        if (onBookmarkChange) {
          onBookmarkChange(newBookmarkState);
        }
      } else {
        console.error('Failed to update bookmark');
      }
    } catch (error) {
      console.error('Error updating bookmark:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSignedIn) {
    return null;
  }

  return (
    <Button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleBookmark();
      }}
      disabled={isLoading}
      variant="ghost"
      size="icon"
      className={cn(
        "absolute top-2 right-2 p-1.5 rounded-full",
        isBookmarked ? "text-yellow-500 hover:text-yellow-600" : "text-gray-400 hover:text-gray-600"
      )}
      aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
    >
      <BookmarkIcon 
        className="w-5 h-5" 
        fill={isBookmarked ? "currentColor" : "none"} 
        strokeWidth={isBookmarked ? 1 : 2}
      />
    </Button>
  );
} 