'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import BookmarkButton from '@/components/BookmarkButton';
import ContestSection from '@/components/ContestSection';

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

export default function Home() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [filteredContests, setFilteredContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState({
    platforms: [] as string[],
    status: 'all',
  });
  const [bookmarkedContests, setBookmarkedContests] = useState<Set<string>>(new Set());
  const { isSignedIn, user } = useUser();

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const response = await fetch(`${API_URL}/contests`);
        if (!response.ok) {
          throw new Error('Failed to fetch contests');
        }
        const data = await response.json();
        setContests(data);
        setFilteredContests(data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching contests. Please try again later.');
        setLoading(false);
      }
    };

    fetchContests();
  }, []);

  useEffect(() => {
    const fetchBookmarkedContests = async () => {
      if (!isSignedIn || !user) return;

      try {
        const response = await fetch(`${API_URL}/bookmarks`, {
          headers: {
            'user-id': user.id,
          },
        });

        if (!response.ok) {
          console.error('Failed to fetch bookmarked contests');
          return;
        }

        const data = await response.json();
        const bookmarkedIds = new Set(data.map((contest: Contest) => contest.id));
        setBookmarkedContests(bookmarkedIds);
      } catch (err) {
        console.error('Error fetching bookmarked contests:', err);
      }
    };

    fetchBookmarkedContests();
  }, [isSignedIn, user]);

  useEffect(() => {
    let result = [...contests];
    
    if (filter.platforms.length > 0) {
      result = result.filter(contest => filter.platforms.includes(contest.platform));
    }
    
    if (filter.status !== 'all') {
      result = result.filter(contest => contest.status === filter.status);
    }
    
    setFilteredContests(result);
  }, [filter, contests]);

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

  const getPlatformContests = (platform: string) => {
    if (filter.platforms.length > 0 && !filter.platforms.includes(platform)) {
      return [];
    }
    return filteredContests.filter(contest => contest.platform === platform);
  };

  const isPlatformSelected = (platform: string) => {
    return filter.platforms.includes(platform);
  };

  const getAllPlatforms = () => {
    const platforms = new Set<string>();
    contests.forEach(contest => platforms.add(contest.platform));
    return Array.from(platforms);
  };

  const handleBookmarkChange = (contestId: string, isBookmarked: boolean) => {
    setBookmarkedContests(prev => {
      const newSet = new Set(prev);
      if (isBookmarked) {
        newSet.add(contestId);
      } else {
        newSet.delete(contestId);
      }
      return newSet;
    });
  };

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
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800">Coding Contests</h1>
          {isSignedIn && (
            <Link 
              href="/bookmarks" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 mr-2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" 
                />
              </svg>
              My Bookmarks
            </Link>
          )}
        </div>
        
        {/* Filter Section */}
        <div className="mb-8 p-6 bg-gray-50 rounded-lg shadow-sm">
          <div className="flex flex-wrap gap-6 justify-between items-end">
            <div className="flex flex-wrap gap-4">
              <div>
                <h3 className="block text-sm font-medium text-gray-700 mb-2">Platforms</h3>
                <div className="flex flex-wrap gap-2">
                  {getAllPlatforms().map(platform => (
                    <div key={platform} className="flex items-center">
                      <input
                        id={`platform-${platform}`}
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={isPlatformSelected(platform)}
                        onChange={() => handleFilterChange('platforms', platform)}
                      />
                      <label htmlFor={`platform-${platform}`} className="ml-2 text-sm text-gray-700 capitalize">
                        {platform}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  id="status-filter"
                  className="rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                  value={filter.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="past">Past</option>
                </select>
              </div>
            </div>
            
            {/* Active Filters Display and Clear Button */}
            <div className="flex items-center">
              {(filter.platforms.length > 0 || filter.status !== 'all') && (
                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-600">
                    Active filters:
                    {filter.platforms.length > 0 && (
                      <div className="inline-flex flex-wrap gap-1 ml-2">
                        {filter.platforms.map(platform => (
                          <span 
                            key={platform}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            <span className="capitalize">{platform}</span>
                            <button 
                              onClick={() => handleFilterChange('platforms', platform)}
                              className="ml-1 text-blue-500 hover:text-blue-700"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    {filter.status !== 'all' && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {filter.status.charAt(0).toUpperCase() + filter.status.slice(1)}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setFilter({ platforms: [], status: 'all' })}
                    className="ml-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Contest Sections */}
        {getAllPlatforms().map(platform => (
          <ContestSection
            key={platform}
            platform={platform}
            contests={getPlatformContests(platform)}
            formatDate={formatDate}
            getDurationText={getDurationText}
            getStatusColor={getStatusColor}
            bookmarkedContests={bookmarkedContests}
            onBookmarkChange={handleBookmarkChange}
          />
        ))}
      </div>
    </main>
  );
}
