'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import BookmarkButton from '@/_components/BookmarkButton';
import ContestSection from '@/_components/ContestSection';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { BookmarkIcon, FilterIcon, XCircleIcon } from 'lucide-react';

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
  const [reminderContests, setReminderContests] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
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
        const bookmarkedIds = new Set<string>(data.map((contest: Contest) => contest.id));
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

  useEffect(() => {
    const fetchReminders = async () => {
      if (!isSignedIn || !user) return;

      try {
        const response = await fetch(`${API_URL}/reminders`, {
          headers: {
            'user-id': user.id,
          },
        });

        if (!response.ok) {
          console.error('Failed to fetch reminders');
          return;
        }

        const data = await response.json();
        const reminderIds = new Set<string>(data.map((reminder: any) => reminder.contest_id));
        setReminderContests(reminderIds);
      } catch (err) {
        console.error('Error fetching reminders:', err);
      }
    };

    fetchReminders();
  }, [isSignedIn, user]);

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
    <main className="min-h-screen p-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-foreground">Coding Contests</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1"
            >
              <FilterIcon className="h-4 w-4" />
              Filters
              {(filter.platforms.length > 0 || filter.status !== 'all') && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                  {filter.platforms.length + (filter.status !== 'all' ? 1 : 0)}
                </Badge>
              )}
            </Button>
            
            {isSignedIn && (
              <Button 
                variant="default"
                size="sm"
                asChild
                className="flex items-center gap-1"
              >
                <Link href="/bookmarks">
                  <BookmarkIcon className="h-4 w-4 mr-1" />
                  My Bookmarks
                </Link>
              </Button>
            )}
          </div>
        </div>
        
        {/* Filter Section */}
        {showFilters && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Filter Contests</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setFilter({ platforms: [], status: 'all' })}
                  className="flex items-center text-destructive"
                >
                  <XCircleIcon className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Status</h3>
                  <Select 
                    value={filter.status} 
                    onValueChange={(value) => handleFilterChange('status', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                      <SelectItem value="past">Past</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Platforms</h3>
                  <div className="flex flex-wrap gap-2">
                    {getAllPlatforms().map(platform => (
                      <Badge 
                        key={platform}
                        variant={isPlatformSelected(platform) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleFilterChange('platforms', platform)}
                      >
                        {platform}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              {(filter.platforms.length > 0 || filter.status !== 'all') && (
                <div className="mt-4 pt-4 border-t flex items-center">
                  <span className="text-sm text-muted-foreground">Active filters:</span>
                  <div className="flex flex-wrap gap-2 ml-2">
                    {filter.platforms.map(platform => (
                      <Badge 
                        key={platform} 
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {platform}
                        <XCircleIcon 
                          className="h-3 w-3 ml-1 cursor-pointer" 
                          onClick={() => handleFilterChange('platforms', platform)}
                        />
                      </Badge>
                    ))}
                    
                    {filter.status !== 'all' && (
                      <Badge 
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {filter.status.charAt(0).toUpperCase() + filter.status.slice(1)}
                        <XCircleIcon 
                          className="h-3 w-3 ml-1 cursor-pointer" 
                          onClick={() => handleFilterChange('status', 'all')}
                        />
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
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
            reminderContests={reminderContests}
          />
        ))}
      </div>
    </main>
  );
}
