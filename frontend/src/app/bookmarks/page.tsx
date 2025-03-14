'use client';

import { useState, useEffect, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import BookmarkButton from '@/components/BookmarkButton';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type Contest = {
  id: string;
  platform: string;
  name: string;
  url: string;
  start_time: string;
  end_time: string;
  duration: number;
  status: string;
  description: string;
};

export default function BookmarksPage() {
  const [bookmarkedContests, setBookmarkedContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isSignedIn, user } = useUser();

  const [filter, setFilter] = useState({
    platforms: [] as string[],
    status: 'all',
  });

  const filteredBookmarks = useMemo(() => {
    let result = [...bookmarkedContests];
    
    if (filter.platforms.length > 0) {
      result = result.filter(contest => filter.platforms.includes(contest.platform));
    }
    
    if (filter.status !== 'all') {
      result = result.filter(contest => contest.status === filter.status);
    }
    
    return result;
  }, [bookmarkedContests, filter]);

  const handleFilterChange = (type: 'platforms' | 'status', value: any) => {
    if (type === 'platforms') {
      if (Array.isArray(value)) {
        setFilter(prev => ({
          ...prev,
          platforms: value
        }));
      } else {
        setFilter(prev => {
          const platforms = [...prev.platforms];
          const index = platforms.indexOf(value);
          if (index === -1) {
            platforms.push(value);
          } else {
            platforms.splice(index, 1);
          }
          return {
            ...prev,
            platforms
          };
        });
      }
    } else {
      setFilter(prev => ({
        ...prev,
        [type]: value
      }));
    }
  };

  const isPlatformSelected = (platform: string) => {
    return filter.platforms.includes(platform);
  };

  const getAllPlatforms = () => {
    const platforms = new Set<string>();
    bookmarkedContests.forEach(contest => platforms.add(contest.platform));
    return Array.from(platforms);
  };

  useEffect(() => {
    const fetchBookmarkedContests = async () => {
      if (!isSignedIn || !user) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/bookmarks`, {
          headers: {
            'user-id': user.id,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch bookmarked contests');
        }

        const data = await response.json();
        setBookmarkedContests(data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching bookmarked contests. Please try again later.');
        setLoading(false);
      }
    };

    fetchBookmarkedContests();
  }, [isSignedIn, user]);

  const handleBookmarkChange = (contestId: string, isBookmarked: boolean) => {
    if (!isBookmarked) {
      // Remove the contest from the list if unbookmarked
      setBookmarkedContests(prev => prev.filter(contest => contest.id !== contestId));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getDurationText = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'past':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-2xl font-bold mb-4">Sign in to view bookmarks</h2>
          <p className="text-gray-600 mb-6">You need to be signed in to view your bookmarked contests.</p>
          <Link 
            href="/sign-in" 
            className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Bookmarked Contests</h1>
          <Link 
            href="/" 
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Back to All Contests
          </Link>
        </div>

        {bookmarkedContests.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No bookmarked contests</h2>
            <p className="text-gray-500 mb-6">You haven't bookmarked any contests yet.</p>
            <Link 
              href="/" 
              className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Contests
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBookmarks.map(contest => (
              <div key={contest.id} className="relative rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 bg-white border border-gray-200">
                <a 
                  href={contest.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block p-5"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 pr-8">{contest.name}</h3>
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getStatusColor(contest.status)}`}>
                      {contest.status}
                    </span>
                  </div>
                  
                  <div className="mb-3 text-sm text-gray-600">
                    <div className="flex items-center mb-1">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span>Starts: {formatDate(contest.start_time)}</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span>Duration: {getDurationText(contest.duration)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-xs text-gray-500">
                    <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-800 mr-2">
                      {contest.platform}
                    </span>
                  </div>
                </a>
                <BookmarkButton 
                  contestId={contest.id} 
                  isBookmarked={true}
                  onBookmarkChange={(isBookmarked) => handleBookmarkChange(contest.id, isBookmarked)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
} 