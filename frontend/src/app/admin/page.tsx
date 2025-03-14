'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { YoutubeIcon, LinkIcon } from 'lucide-react';

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
  solution_url?: string | null;
};

export default function AdminPage() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
  const [solutionUrl, setSolutionUrl] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/contests`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch contests');
      }
      
      const data = await response.json();
      setContests(data);
    } catch (error) {
      console.error('Error fetching contests:', error);
      setError('Failed to load contests. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSolutionSubmit = async () => {
    if (!selectedContest || !solutionUrl) return;
    
    try {
      const response = await fetch(`${API_URL}/contests/${selectedContest.id}/solution`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          solution_url: solutionUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update solution URL');
      }

      // Update local state
      setContests(contests.map(c => 
        c.id === selectedContest.id 
          ? { ...c, solution_url: solutionUrl } 
          : c
      ));
      
      // Close modal and reset form
      setIsModalOpen(false);
      setSelectedContest(null);
      setSolutionUrl('');
      
    } catch (error) {
      console.error('Error updating solution URL:', error);
      alert('Failed to update solution URL. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  const filteredContests = contests
    .filter(contest => {
      if (filterPlatform !== 'all' && contest.platform !== filterPlatform) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      // Sort by status (past contests first) and then by date
      if (a.status !== b.status) {
        return a.status === 'past' ? -1 : 1;
      }
      return new Date(b.start_time).getTime() - new Date(a.start_time).getTime();
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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
        <h1 className="text-3xl font-bold mb-6 text-foreground">Admin Dashboard</h1>
        
        <div className="mb-6">
          <Tabs defaultValue="all" onValueChange={setFilterPlatform}>
            <TabsList>
              <TabsTrigger value="all">All Platforms</TabsTrigger>
              <TabsTrigger value="leetcode">LeetCode</TabsTrigger>
              <TabsTrigger value="codeforces">Codeforces</TabsTrigger>
              <TabsTrigger value="codechef">CodeChef</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContests.map(contest => (
            <Card 
              key={contest.id} 
              className="overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
              onClick={() => {
                setSelectedContest(contest);
                setSolutionUrl(contest.solution_url || '');
                setIsModalOpen(true);
              }}
            >
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-card-foreground line-clamp-2 pr-8">{contest.name}</h3>
                  <Badge 
                    variant={contest.status === 'ongoing' ? 'default' : 
                            contest.status === 'upcoming' ? 'secondary' : 'outline'}
                    className={getStatusColor(contest.status)}
                  >
                    {contest.status}
                  </Badge>
                </div>
                
                <div className="mb-3 text-sm text-muted-foreground">
                  <div className="flex items-center mb-1">
                    <span className="font-medium mr-2">Platform:</span>
                    <span>{contest.platform}</span>
                  </div>
                  <div className="flex items-center mb-1">
                    <span className="font-medium mr-2">Date:</span>
                    <span>{formatDate(contest.start_time)}</span>
                  </div>
                </div>
                
                {contest.solution_url ? (
                  <div className="flex items-center text-sm text-blue-600">
                    <YoutubeIcon className="h-4 w-4 text-red-500 mr-1" />
                    <span>Solution available</span>
                  </div>
                ) : (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <LinkIcon className="h-4 w-4 mr-1" />
                    <span>No solution link</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedContest?.solution_url ? 'Update Solution Link' : 'Add Solution Link'}
              </DialogTitle>
            </DialogHeader>
            {selectedContest && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-foreground">{selectedContest.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedContest.platform} • {formatDate(selectedContest.start_time)}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="solution-url" className="text-sm font-medium">
                    YouTube Solution URL
                  </label>
                  <Input
                    id="solution-url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={solutionUrl}
                    onChange={(e) => setSolutionUrl(e.target.value)}
                  />
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSolutionSubmit} disabled={!solutionUrl}>
                    {selectedContest.solution_url ? 'Update' : 'Add'} Solution
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
} 