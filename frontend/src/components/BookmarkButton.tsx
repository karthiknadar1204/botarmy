'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

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
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleBookmark();
      }}
      disabled={isLoading}
      className={`absolute top-2 right-2 p-1.5 rounded-full transition-colors ${
        isBookmarked 
          ? 'text-yellow-500 hover:text-yellow-600' 
          : 'text-gray-400 hover:text-gray-600'
      }`}
      aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill={isBookmarked ? "currentColor" : "none"}
        stroke="currentColor"
        className="w-5 h-5"
        strokeWidth={isBookmarked ? "0" : "2"}
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" 
        />
      </svg>
    </button>
  );
} 