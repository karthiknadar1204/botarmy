'use client';

import { useState } from 'react';
import BookmarkButton from '@/_components/BookmarkButton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { YoutubeIcon } from 'lucide-react';

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
  solution_url?: string | null;
};

interface ContestSectionProps {
  platform: string;
  contests: Contest[];
  formatDate: (dateString: string) => string;
  getDurationText: (minutes: number) => string;
  getStatusColor: (status: string) => string;
  bookmarkedContests: Set<string>;
  onBookmarkChange: (contestId: string, isBookmarked: boolean) => void;
  reminderContests?: Set<string>;
}

export default function ContestSection({
  platform,
  contests,
  formatDate,
  getDurationText,
  getStatusColor,
  bookmarkedContests,
  onBookmarkChange,
  reminderContests = new Set()
}: ContestSectionProps) {
  const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
  
  return (
    <section className="mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-3">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground">{platformName} Contests</h2>
        <span className="text-xs sm:text-sm text-muted-foreground">
          {contests.length} {contests.length === 1 ? 'contest' : 'contests'} available
        </span>
      </div>
      <div className="h-px w-full bg-border mb-3 sm:mb-4"></div>
      
      {contests.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {contests.map(contest => (
            <Card key={contest.id} className="relative overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-3 sm:p-5">
                <a 
                  href={contest.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block"
                >
                  <div className="flex justify-between items-start mb-2 sm:mb-3">
                    <h3 className="text-base sm:text-lg font-semibold text-card-foreground line-clamp-2 pr-8">{contest.name}</h3>
                    <Badge 
                      variant={contest.status === 'ongoing' ? 'default' : 
                              contest.status === 'upcoming' ? 'secondary' : 'outline'}
                      className={getStatusColor(contest.status)}
                    >
                      {contest.status}
                    </Badge>
                  </div>
                  
                  <div className="mb-2 sm:mb-3 text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-center mb-1">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span>Starts: {formatDate(contest.start_time)}</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span>Duration: {getDurationText(contest.duration)}</span>
                    </div>
                  </div>
                  
                  {contest.description && (
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-2">
                      {contest.description || "No description available"}
                    </p>
                  )}
                </a>
                
                {/* Solution URL link for past contests */}
                {contest.status === 'past' && contest.solution_url && (
                  <a 
                    href={contest.solution_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs sm:text-sm text-red-600 hover:text-red-700 mb-2"
                  >
                    <YoutubeIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="underline">Watch our solution video</span>
                  </a>
                )}
                
                <BookmarkButton 
                  contestId={contest.id} 
                  isBookmarked={bookmarkedContests.has(contest.id)}
                  onBookmarkChange={(isBookmarked) => onBookmarkChange(contest.id, isBookmarked)}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      ) :
        <p className="text-muted-foreground text-center py-4">No {platformName} contests found with the current filters.</p>
      }
    </section>
  );
} 