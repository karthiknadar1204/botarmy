'use client';

import { useState } from 'react';
import BookmarkButton from '@/components/BookmarkButton';

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

interface ContestSectionProps {
  platform: string;
  contests: Contest[];
  formatDate: (dateString: string) => string;
  getDurationText: (minutes: number) => string;
  getStatusColor: (status: string) => string;
  bookmarkedContests: Set<string>;
  onBookmarkChange: (contestId: string, isBookmarked: boolean) => void;
}

export default function ContestSection({
  platform,
  contests,
  formatDate,
  getDurationText,
  getStatusColor,
  bookmarkedContests,
  onBookmarkChange
}: ContestSectionProps) {
  const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
  
  return (
    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">{platformName} Contests</h2>
      {contests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contests.map(contest => (
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
                
                {contest.description && (
                  <p className="text-sm text-gray-500 line-clamp-2">{contest.description || "No description available"}</p>
                )}
              </a>
              <BookmarkButton 
                contestId={contest.id} 
                isBookmarked={bookmarkedContests.has(contest.id)}
                onBookmarkChange={(isBookmarked) => onBookmarkChange(contest.id, isBookmarked)}
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">No {platformName} contests found with the current filters.</p>
      )}
    </section>
  );
} 