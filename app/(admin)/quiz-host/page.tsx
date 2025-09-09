'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Users, Play, Copy, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface QuizCategory {
  id: string;
  name: string;
  description?: string;
}

interface HostSession {
  id: string;
  sessionName: string;
  sessionCode: string;
  maxParticipants: number;
  createdAt: string;
  isActive: boolean;
  participantCount?: number;
}

export default function QuizHostPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<QuizCategory[]>([]);
  const [sessions, setSessions] = useState<HostSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSession, setNewSession] = useState({
    sessionName: '',
    categoryId: '',
    maxParticipants: 50,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch categories
      const categoriesResponse = await fetch('/api/v1/quiz/categories');
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
      }

      // TODO: Fetch existing host sessions
      // For now, we'll show empty state
      setSessions([]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newSession.sessionName) {
      toast.error('Please enter a session name');
      return;
    }

    try {
      const response = await fetch('/api/v1/quiz/host/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSession),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create session');
      }

      const sessionData = await response.json();
      
      // Add to local state
      const newHostSession: HostSession = {
        id: sessionData.id,
        sessionName: sessionData.sessionName,
        sessionCode: sessionData.sessionCode,
        maxParticipants: sessionData.maxParticipants,
        createdAt: sessionData.createdAt,
        isActive: true,
        participantCount: 0,
      };
      
      setSessions(prev => [newHostSession, ...prev]);
      
      // Reset form
      setNewSession({
        sessionName: '',
        categoryId: '',
        maxParticipants: 50,
      });
      setShowCreateForm(false);
      
      toast.success(`Session created! Code: ${sessionData.sessionCode}`);
    } catch (error) {
      console.error('Error creating session:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to create session: ${errorMessage}`);
    }
  };

  const copySessionCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Session code copied to clipboard!');
  };

  const handleStartSession = (sessionId: string) => {
    // Find the session data
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      // Navigate to host control interface with session data
      router.push(`/quiz-host/session?sessionCode=${session.sessionCode}&sessionName=${encodeURIComponent(session.sessionName)}`);
    } else {
      toast.error('Session not found');
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading host dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quiz Host Dashboard</h1>
          <p className="text-gray-600">Create and manage live quiz sessions</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2"
        >
          <Plus size={20} />
          Create Session
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.filter(s => s.isActive).length}</div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions.reduce((sum, session) => sum + (session.participantCount || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all sessions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.length}</div>
            <p className="text-xs text-muted-foreground">
              Created today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Create Session Form */}
      {showCreateForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create New Quiz Session</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateSession} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionName">Session Name</Label>
                  <Input
                    id="sessionName"
                    value={newSession.sessionName}
                    onChange={(e) => setNewSession({...newSession, sessionName: e.target.value})}
                    placeholder="e.g., Friday Night Music Quiz"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category (Optional)</Label>
                  <Select
                    value={newSession.categoryId}
                    onValueChange={(value) => setNewSession({...newSession, categoryId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxParticipants">Max Participants</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  value={newSession.maxParticipants}
                  onChange={(e) => setNewSession({...newSession, maxParticipants: parseInt(e.target.value)})}
                  min="1"
                  max="200"
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit">
                  Create Session
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Sessions List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Quiz Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Play className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">No quiz sessions yet</p>
              <p className="text-sm">Create your first hosted quiz session to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium">{session.sessionName}</h3>
                    <div className="text-sm text-gray-600 space-x-4">
                      <span>Code: <span className="font-mono font-bold">{session.sessionCode}</span></span>
                      <span>Participants: {session.participantCount || 0}/{session.maxParticipants}</span>
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        session.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {session.isActive ? 'Active' : 'Ended'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copySessionCode(session.sessionCode)}
                    >
                      <Copy size={16} />
                    </Button>
                    
                    {session.isActive && (
                      <Button
                        size="sm"
                        onClick={() => handleStartSession(session.id)}
                      >
                        <ExternalLink size={16} />
                        Control
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}