'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

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
    platform: 'all',
    status: 'all',
  });
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
    // Apply filters
    let result = [...contests];
    
    if (filter.platform !== 'all') {
      result = result.filter(contest => contest.platform === filter.platform);
    }
    
    if (filter.status !== 'all') {
      result = result.filter(contest => contest.status === filter.status);
    }
    
    setFilteredContests(result);
  }, [filter, contests]);

  const handleFilterChange = (type: 'platform' | 'status', value: string) => {
    setFilter(prev => ({
      ...prev,
      [type]: value
    }));
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
    return filteredContests.filter(contest => contest.platform === platform);
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
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Coding Contests</h1>
        
        {/* Filter Section */}
        <div className="mb-8 p-6 bg-gray-50 rounded-lg shadow-sm">
          <div className="flex flex-wrap gap-6 justify-between items-end">
            <div className="flex flex-wrap gap-4">
              <div>
                <label htmlFor="platform-filter" className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
                <select
                  id="platform-filter"
                  className="rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                  value={filter.platform}
                  onChange={(e) => handleFilterChange('platform', e.target.value)}
                >
                  <option value="all">All Platforms</option>
                  <option value="codeforces">Codeforces</option>
                  <option value="leetcode">LeetCode</option>
                  <option value="codechef">CodeChef</option>
                </select>
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
              {(filter.platform !== 'all' || filter.status !== 'all') && (
                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-600">
                    Active filters:
                    {filter.platform !== 'all' && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {filter.platform.charAt(0).toUpperCase() + filter.platform.slice(1)}
                      </span>
                    )}
                    {filter.status !== 'all' && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {filter.status.charAt(0).toUpperCase() + filter.status.slice(1)}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setFilter({ platform: 'all', status: 'all' })}
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
        
        {/* Codeforces Contests */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">Codeforces Contests</h2>
          {getPlatformContests('codeforces').length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getPlatformContests('codeforces').map(contest => (
                <a 
                  key={contest.id} 
                  href={contest.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 bg-white border border-gray-200 hover:bg-gray-50"
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{contest.name}</h3>
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
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No Codeforces contests found with the current filters.</p>
          )}
        </section>
        
        {/* LeetCode Contests */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">LeetCode Contests</h2>
          {getPlatformContests('leetcode').length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getPlatformContests('leetcode').map(contest => (
                <a 
                  key={contest.id} 
                  href={contest.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 bg-white border border-gray-200 hover:bg-gray-50"
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{contest.name}</h3>
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
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No LeetCode contests found with the current filters.</p>
          )}
        </section>
      </div>
    </main>
  );
}
