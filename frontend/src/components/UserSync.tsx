'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function UserSync() {
  const { isSignedIn, user } = useUser();

  useEffect(() => {
    const syncUserWithBackend = async () => {
      if (isSignedIn && user) {
        try {
          const userData = {
            clerk_id: user.id,
            email: user.primaryEmailAddress?.emailAddress || '',
            username: user.username,
            first_name: user.firstName,
            last_name: user.lastName,
            image_url: user.imageUrl,
          };

          const response = await fetch(`${API_URL}/users/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
          });

          if (!response.ok) {
            console.error('Failed to sync user data with backend');
          }
        } catch (error) {
          console.error('Error syncing user with backend:', error);
        }
      }
    };

    syncUserWithBackend();
  }, [isSignedIn, user]);


  return null;
} 