'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Clock, Calendar, Tag, FileText, Database, FolderOpen, Users, Mail } from 'lucide-react';
import Link from 'next/link';

const categories = [
  'Development',
  'Design',
  'Meeting',
  'Research',
  'Planning',
  'Testing',
  'Documentation',
  'Other'
];

interface Project {
  id: number;
  name: string;
  description: string;
}

interface TimesheetActivity {
  id: number | string; // string for localStorage, number for database
  date: string;
  startTime: string;
  endTime: string;
  category: string;
  projectId?: number;
  description: string;
  userId?: number;
  createdAt?: string;
}

export default function TimesheetPage() {
  const [activities, setActivities] = useState<TimesheetActivity[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [userTeam, setUserTeam] = useState<{ role: string; teamId: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTeamId, setCurrentTeamId] = useState<number>(1);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    category: '',
    projectId: undefined as number | undefined,
    description: ''
  });

  // Check authentication status and load data accordingly
  useEffect(() => {
    checkAuthenticationAndLoadData();
  }, []);

  // Fetch projects when currentTeamId changes (only for authenticated users)
  useEffect(() => {
    if (currentTeamId && isAuthenticated) {
      fetchProjects();
    }
  }, [currentTeamId, isAuthenticated]);

  const checkAuthenticationAndLoadData = async () => {
    try {
      const response = await fetch('/api/user');
      if (response.ok) {
        const userData = await response.json();
        setIsAuthenticated(true);
        
        if (userData.team) {
          setUserTeam({ role: userData.team.role, teamId: userData.team.teamId });
          setCurrentTeamId(userData.team.teamId);
        }
        
        // Load from database for authenticated users
        await fetchActivities();
      } else {
        setIsAuthenticated(false);
        // Load from localStorage for guest users
        loadActivitiesFromLocalStorage();
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      setIsAuthenticated(false);
      // Load from localStorage for guest users
      loadActivitiesFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  const loadActivitiesFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem('timesheetActivities');
      if (stored) {
        const parsed = JSON.parse(stored);
        setActivities(Array.isArray(parsed) ? parsed : []);
      } else {
        setActivities([]);
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      setActivities([]);
    }
  };

  const saveActivitiesToLocalStorage = (activities: TimesheetActivity[]) => {
    try {
      localStorage.setItem('timesheetActivities', JSON.stringify(activities));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/timesheet');
      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      } else {
        console.error('Failed to fetch activities');
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const checkUserTeamMembership = async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await fetch('/api/user');
      if (response.ok) {
        const userData = await response.json();
        if (userData.team) {
          setUserTeam({ role: userData.team.role, teamId: userData.team.teamId });
          setCurrentTeamId(userData.team.teamId);
        }
      }
    } catch (error) {
      console.error('Error checking team membership:', error);
    }
  };

  const fetchProjects = async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await fetch(`/api/projects?teamId=${currentTeamId}`);
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      } else {
        console.error('Failed to fetch projects');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };





  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate time overlap
    const newStartTime = new Date(`2000-01-01T${formData.startTime}`);
    const newEndTime = new Date(`2000-01-01T${formData.endTime}`);
    
    if (newStartTime >= newEndTime) {
      alert('End time must be after start time');
      return;
    }

    // Check for time conflicts
    const hasConflict = activities.some(activity => {
      if (activity.date !== formData.date) return false;
      
      const existingStart = new Date(`2000-01-01T${activity.startTime}`);
      const existingEnd = new Date(`2000-01-01T${activity.endTime}`);
      
      return (
        (newStartTime < existingEnd && newEndTime > existingStart) ||
        (existingStart < newEndTime && existingEnd > newStartTime)
      );
    });

    if (hasConflict) {
      alert('Time conflict detected. Please choose a different time slot.');
      return;
    }

    if (isAuthenticated) {
      // Save to database for authenticated users
      try {
        const response = await fetch('/api/timesheet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        
        if (response.ok) {
          const newActivity = await response.json();
          setActivities(prev => [...prev, newActivity]);
          setFormData({
            date: new Date().toISOString().split('T')[0],
            startTime: '',
            endTime: '',
            category: '',
            projectId: undefined,
            description: ''
          });
        } else {
          const error = await response.json();
          alert(`Failed to create activity: ${error.error}`);
        }
      } catch (error) {
        console.error('Error creating activity:', error);
        alert('Failed to create activity');
      }
    } else {
      // Save to localStorage for guest users
      const newActivity: TimesheetActivity = {
        id: Date.now().toString(), // Use timestamp as ID for localStorage
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        category: formData.category,
        projectId: formData.projectId,
        description: formData.description,
        createdAt: new Date().toISOString()
      };
      
      const updatedActivities = [...activities, newActivity];
      setActivities(updatedActivities);
      saveActivitiesToLocalStorage(updatedActivities);
      
      setFormData({
        date: new Date().toISOString().split('T')[0],
        startTime: '',
        endTime: '',
        category: '',
        projectId: undefined,
        description: ''
      });
    }
  };

  const deleteActivity = async (id: number | string) => {
    if (isAuthenticated) {
      // Delete from database for authenticated users
      try {
        const response = await fetch(`/api/timesheet/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setActivities(prev => prev.filter(activity => activity.id !== id));
        } else {
          const error = await response.json();
          alert(`Failed to delete activity: ${error.error}`);
        }
      } catch (error) {
        console.error('Error deleting activity:', error);
        alert('Failed to delete activity');
      }
    } else {
      // Delete from localStorage for guest users
      const updatedActivities = activities.filter(activity => activity.id !== id);
      setActivities(updatedActivities);
      saveActivitiesToLocalStorage(updatedActivities);
    }
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours.toFixed(2);
  };

  const totalHours = activities.reduce((total, activity) => {
    return total + parseFloat(calculateDuration(activity.startTime, activity.endTime));
  }, 0);

  // Add sample data for testing
  const addSampleData = async () => {
    const today = new Date();
    
    const sampleActivities = [
      {
        date: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 6 days ago
        startTime: '09:00',
        endTime: '12:00',
        category: 'Development',
        projectId: projects.length > 0 ? projects[0].id : undefined,
        description: 'Frontend development - React components'
      },
      {
        date: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        startTime: '13:00',
        endTime: '17:00',
        category: 'Meeting',
        projectId: projects.length > 0 ? projects[0].id : undefined,
        description: 'Team standup and project planning'
      },
      {
        date: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days ago
        startTime: '08:30',
        endTime: '11:30',
        category: 'Design',
        projectId: projects.length > 0 ? projects[0].id : undefined,
        description: 'UI/UX design work'
      },
      {
        date: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        startTime: '14:00',
        endTime: '18:00',
        category: 'Development',
        projectId: projects.length > 1 ? projects[1].id : undefined,
        description: 'Backend API development'
      },
      {
        date: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 4 days ago
        startTime: '09:00',
        endTime: '12:00',
        category: 'Research',
        projectId: projects.length > 0 ? projects[0].id : undefined,
        description: 'Market research and competitor analysis'
      },
      {
        date: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        startTime: '13:00',
        endTime: '16:00',
        category: 'Testing',
        projectId: projects.length > 0 ? projects[0].id : undefined,
        description: 'Unit testing and integration testing'
      },
      {
        date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days ago
        startTime: '08:00',
        endTime: '11:00',
        category: 'Planning',
        projectId: projects.length > 0 ? projects[0].id : undefined,
        description: 'Sprint planning and task breakdown'
      },
      {
        date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        startTime: '14:00',
        endTime: '17:00',
        category: 'Documentation',
        projectId: projects.length > 1 ? projects[1].id : undefined,
        description: 'API documentation and user guides'
      },
      {
        date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days ago
        startTime: '09:00',
        endTime: '12:00',
        category: 'Development',
        projectId: projects.length > 1 ? projects[1].id : undefined,
        description: 'Database optimization and queries'
      },
      {
        date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        startTime: '13:00',
        endTime: '16:00',
        category: 'Meeting',
        projectId: projects.length > 0 ? projects[0].id : undefined,
        description: 'Client presentation and feedback session'
      },
      {
        date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 day ago
        startTime: '08:30',
        endTime: '11:30',
        category: 'Development',
        projectId: projects.length > 0 ? projects[0].id : undefined,
        description: 'Bug fixes and code review'
      },
      {
        date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        startTime: '14:00',
        endTime: '17:00',
        category: 'Design',
        projectId: projects.length > 1 ? projects[1].id : undefined,
        description: 'Mobile app design and prototyping'
      }
    ];

    if (isAuthenticated) {
      // Save sample activities to database for authenticated users
      try {
        for (const activity of sampleActivities) {
          const response = await fetch('/api/timesheet', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(activity),
          });

          if (!response.ok) {
            console.error('Failed to create sample activity');
          }
        }

        // Refresh activities from database
        await fetchActivities();
      } catch (error) {
        console.error('Error creating sample activities:', error);
        alert('Error creating sample activities. Please try again.');
      }
    } else {
      // Save sample activities to localStorage for guest users
      try {
        const newActivities = sampleActivities.map(activity => ({
          ...activity,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9), // Generate unique ID
          createdAt: new Date().toISOString()
        }));
        
        const updatedActivities = [...activities, ...newActivities];
        setActivities(updatedActivities);
        saveActivitiesToLocalStorage(updatedActivities);
      } catch (error) {
        console.error('Error creating sample activities:', error);
        alert('Error creating sample activities. Please try again.');
      }
    }
  };

  const clearAllData = async () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      if (isAuthenticated) {
        try {
          // Delete all activities for the current user
          for (const activity of activities) {
            await fetch(`/api/timesheet/${activity.id}`, {
              method: 'DELETE',
            });
          }
          
          setActivities([]);
        } catch (error) {
          console.error('Error clearing activities:', error);
          alert('Error clearing activities. Please try again.');
        }
      } else {
        try {
          // Delete all activities from localStorage
          localStorage.removeItem('timesheetActivities');
          setActivities([]);
        } catch (error) {
          console.error('Error clearing localStorage:', error);
          alert('Error clearing localStorage. Please try again.');
        }
      }
    }
  };

  if (loading || isAuthenticated === null) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!userTeam) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Personal Timesheet</h1>
            <p className="text-gray-600 mt-1">
              {isAuthenticated ? 'Log your personal work activities' : 'Guest Mode - Data stored locally'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Hours This Week</p>
              <p className="text-2xl font-bold text-blue-600">{totalHours.toFixed(2)}h</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={addSampleData} variant="outline" size="sm">
                <Database className="h-4 w-4 mr-2" />
                Add Sample Data
              </Button>
              <Button onClick={clearAllData} variant="outline" size="sm">
                Clear All
              </Button>
            </div>
          </div>
        </div>

        {/* Authentication Status Notice */}
        {!isAuthenticated && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800">
                    Guest Mode - Local Storage
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Your data is stored locally in your browser. Sign in to sync across devices and access team features.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href="/login/sign-in">
                      <Plus className="h-4 w-4 mr-2" />
                      Sign In
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/login/sign-up">
                      <Mail className="h-4 w-4 mr-2" />
                      Sign Up
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Team Access Notice - Only for authenticated users without team */}
        {isAuthenticated && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-orange-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-orange-800">
                    Personal Mode - Team features not available
                  </p>
                  <p className="text-xs text-orange-700 mt-1">
                    Join a team to access projects and team analytics
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href="/dashboard/create-team">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Team
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/dashboard/invitations">
                      <Mail className="h-4 w-4 mr-2" />
                      Check Invitations
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add Activity Form - Personal Mode */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add Personal Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Date
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category" className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Category
                    </Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Start Time
                    </Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      End Time
                    </Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="What did you work on?"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full">
                  Add Personal Activity
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Activity List */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Personal Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No activities yet. Add your first personal activity!</p>
                    <Button onClick={addSampleData} variant="outline">
                      <Database className="h-4 w-4 mr-2" />
                      Add Sample Data for Testing
                    </Button>
                  </div>
                ) : (
                  activities
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((activity) => (
                      <div key={activity.id} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{activity.date}</span>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {activity.category}
                            </span>
                            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                              Personal
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteActivity(activity.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </Button>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{activity.startTime} - {activity.endTime}</span>
                          <span className="font-medium">
                            {calculateDuration(activity.startTime, activity.endTime)}h
                          </span>
                        </div>
                        {activity.description && (
                          <p className="text-sm text-gray-700">{activity.description}</p>
                        )}
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Timesheet</h1>
          <p className="text-gray-600 mt-1">Log your work activities for team projects</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Hours This Week</p>
            <p className="text-2xl font-bold text-blue-600">{totalHours.toFixed(2)}h</p>
          </div>
          {/* only if user is unauthenticated */}
          {!isAuthenticated && (
          <div className="flex gap-2">
            <Button onClick={addSampleData} variant="outline" size="sm">
              <Database className="h-4 w-4 mr-2" />
              Add Sample Data
            </Button>
            <Button onClick={clearAllData} variant="outline" size="sm">
              Clear All
            </Button>
          </div>
          )}
        </div>
      </div>

      {/* Team Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-800">
                Team Mode - Project features available
              </p>
              <p className="text-xs text-blue-700 mt-1">
                You can log activities for specific projects or personal work
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href="/dashboard/projects">
                  <FolderOpen className="h-4 w-4 mr-2" />
                  View Projects
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href="/dashboard">
                  <Users className="h-4 w-4 mr-2" />
                  Team Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Activity Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category" className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Category
                  </Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="project" className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" />
                    Project
                  </Label>
                  <Select 
                    value={formData.projectId?.toString() || 'none'} 
                    onValueChange={(value) => setFormData({ ...formData, projectId: value === 'none' ? undefined : parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Project (Personal)</SelectItem>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id.toString()}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="startTime" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Start Time
                  </Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="endTime" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    End Time
                  </Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="What did you work on?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full">
                Add Activity
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Activity List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No activities yet. Add your first activity!</p>
                  <Button onClick={addSampleData} variant="outline">
                    <Database className="h-4 w-4 mr-2" />
                    Add Sample Data for Testing
                  </Button>
                </div>
              ) : (
                activities
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((activity) => (
                    <div key={activity.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{activity.date}</span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {activity.category}
                          </span>
                          {activity.projectId ? (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              {projects.find(p => p.id === activity.projectId)?.name || 'Unknown Project'}
                            </span>
                          ) : (
                            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                              Personal
                            </span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteActivity(activity.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </Button>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{activity.startTime} - {activity.endTime}</span>
                        <span className="font-medium">
                          {calculateDuration(activity.startTime, activity.endTime)}h
                        </span>
                      </div>
                      {activity.description && (
                        <p className="text-sm text-gray-700">{activity.description}</p>
                      )}
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 