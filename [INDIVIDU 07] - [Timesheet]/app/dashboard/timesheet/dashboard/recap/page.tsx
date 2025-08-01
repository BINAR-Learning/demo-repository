'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, BarChart3, Clock, TrendingUp, Copy, Download, Calendar, Target, Users, Filter, Database, Plus, Mail, FileText, User, Eye, EyeOff, ChevronDown, ChevronUp, List } from 'lucide-react';
import Link from 'next/link';

interface Project {
  id: number;
  name: string;
  description: string;
}

interface TimesheetActivity {
  id: number | string;
  date: string;
  startTime: string;
  endTime: string;
  category: string;
  projectId?: number;
  description: string;
  userId?: number;
  createdAt?: string;
}

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  totalHours: number;
  activitiesCount?: number;
  daysWorked?: number;
  topCategory?: string;
  topCategoryHours?: number;
  avgHoursPerDay?: number;
  avgHoursPerActivity?: number;
  productivityScore?: number;
  performanceStars?: number;
  categoryBreakdown?: Record<string, number>;
}

interface MemberRecap {
  memberId: number;
  memberName: string;
  memberEmail: string;
  memberRole: string;
  period: string;
  totalHours: number;
  activitiesCount: number;
  daysWorked: number;
  avgHoursPerDay: number;
  topCategory: string;
  topCategoryHours: number;
  categoryBreakdown: Array<{
    category: string;
    hours: number;
    percentage: number;
  }>;
  activities: TimesheetActivity[];
  productivityScore: number;
}

type AnalysisPeriod = 'weekly' | 'monthly' | 'yearly';

export default function RecapPage() {
  const [activities, setActivities] = useState<TimesheetActivity[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [userTeam, setUserTeam] = useState<{ teamId: number; role: string } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [currentTeamId, setCurrentTeamId] = useState<number>(1);
  const [isOwner, setIsOwner] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  
  // Recap states
  const [analysisPeriod, setAnalysisPeriod] = useState<AnalysisPeriod>('weekly');
  const [selectedProject, setSelectedProject] = useState<number | 'all'>('all');
  const [memberRecaps, setMemberRecaps] = useState<MemberRecap[]>([]);
  const [isLoadingRecaps, setIsLoadingRecaps] = useState(false);
  const [recapError, setRecapError] = useState<string | null>(null);
  const [showAllMembers, setShowAllMembers] = useState(false);
  const [expandedActivities, setExpandedActivities] = useState<Set<number>>(new Set());

  // Check authentication status and load data accordingly
  useEffect(() => {
    checkAuthenticationAndLoadData();
  }, []);

  // Fetch projects when currentTeamId changes (only for authenticated users)
  useEffect(() => {
    if (currentTeamId && isAuthenticated) {
      fetchProjects();
      fetchTeamMembers();
    }
  }, [currentTeamId, isAuthenticated]);

  // Load recap data when filters change
  useEffect(() => {
    if (isAuthenticated && userTeam) {
      loadRecapData();
    }
  }, [analysisPeriod, selectedProject, isAuthenticated, userTeam]);

  const checkAuthenticationAndLoadData = async () => {
    try {
      const response = await fetch('/api/user');
      if (response.ok) {
        const userData = await response.json();
        setIsAuthenticated(true);
        setCurrentUserId(userData.id);
        
        if (userData.team) {
          setUserTeam({ teamId: userData.team.teamId, role: userData.team.role });
          setCurrentTeamId(userData.team.teamId);
          setIsOwner(userData.team.role === 'owner');
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
    }
  };

  const loadActivitiesFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem('timesheetActivities');
      if (stored) {
        const parsed = JSON.parse(stored);
        const activitiesData = Array.isArray(parsed) ? parsed : [];
        setActivities(activitiesData);
      } else {
        setActivities([]);
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      setActivities([]);
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

  const fetchTeamMembers = async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await fetch(`/api/team/${currentTeamId}/members`);
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data.members || []);
      } else {
        console.error('Failed to fetch team members');
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const loadRecapData = async () => {
    if (!isAuthenticated || !userTeam) return;

    setIsLoadingRecaps(true);
    setRecapError(null);
    try {
      let endpoint = '';
      let params = new URLSearchParams({
        period: analysisPeriod
      });

      if (selectedProject !== 'all') {
        params.append('projectId', selectedProject.toString());
      }

      // If user is not owner, only show their own data
      if (!isOwner && currentUserId) {
        params.append('userId', currentUserId.toString());
      }

      endpoint = `/api/team/${userTeam.teamId}/members/recap?${params}`;

      console.log('Fetching recap data from:', endpoint);
      const response = await fetch(endpoint);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Recap API Data:', data);
        
        if (Array.isArray(data)) {
          setMemberRecaps(data);
        } else if (data.recaps && Array.isArray(data.recaps)) {
          setMemberRecaps(data.recaps);
        } else {
          console.error('Invalid recap data format:', data);
          setRecapError('Invalid data format received from server');
          generateMockRecapData();
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch recap data:', errorData);
        setRecapError(`Failed to fetch data: ${errorData.error || response.statusText}`);
        generateMockRecapData();
      }
    } catch (error) {
      console.error('Error loading recap data:', error);
      setRecapError('Network error occurred while fetching data');
      generateMockRecapData();
    } finally {
      setIsLoadingRecaps(false);
    }
  };

  const generateMockRecapData = () => {
    const mockRecaps: MemberRecap[] = [
      {
        memberId: 1,
        memberName: 'John Doe',
        memberEmail: 'john@example.com',
        memberRole: 'Developer',
        period: analysisPeriod,
        totalHours: 45.5,
        activitiesCount: 12,
        daysWorked: 7,
        avgHoursPerDay: 6.5,
        topCategory: 'Development',
        topCategoryHours: 25.5,
        categoryBreakdown: [
          { category: 'Development', hours: 25.5, percentage: 56.0 },
          { category: 'Meetings', hours: 8.0, percentage: 17.6 },
          { category: 'Planning', hours: 6.0, percentage: 13.2 },
          { category: 'Testing', hours: 4.0, percentage: 8.8 },
          { category: 'Documentation', hours: 2.0, percentage: 4.4 }
        ],
        activities: [],
        productivityScore: 85
      },
      {
        memberId: 2,
        memberName: 'Jane Smith',
        memberEmail: 'jane@example.com',
        memberRole: 'Designer',
        period: analysisPeriod,
        totalHours: 42.0,
        activitiesCount: 10,
        daysWorked: 7,
        avgHoursPerDay: 6.0,
        topCategory: 'Design',
        topCategoryHours: 28.0,
        categoryBreakdown: [
          { category: 'Design', hours: 28.0, percentage: 66.7 },
          { category: 'Meetings', hours: 6.0, percentage: 14.3 },
          { category: 'Research', hours: 4.0, percentage: 9.5 },
          { category: 'Prototyping', hours: 3.0, percentage: 7.1 },
          { category: 'Documentation', hours: 1.0, percentage: 2.4 }
        ],
        activities: [],
        productivityScore: 78
      }
    ];

    // If user is not owner, only show their own data
    if (!isOwner && currentUserId) {
      const userRecap = mockRecaps.find(recap => recap.memberId === currentUserId);
      setMemberRecaps(userRecap ? [userRecap] : []);
    } else {
      setMemberRecaps(mockRecaps);
    }
  };

  const downloadMemberRecap = async (memberRecap: MemberRecap) => {
    try {
      const recapData = {
        memberName: memberRecap.memberName,
        memberEmail: memberRecap.memberEmail,
        memberRole: memberRecap.memberRole,
        period: memberRecap.period,
        totalHours: memberRecap.totalHours,
        activitiesCount: memberRecap.activitiesCount,
        daysWorked: memberRecap.daysWorked,
        avgHoursPerDay: memberRecap.avgHoursPerDay,
        topCategory: memberRecap.topCategory,
        topCategoryHours: memberRecap.topCategoryHours,
        productivityScore: memberRecap.productivityScore,
        categoryBreakdown: memberRecap.categoryBreakdown,
        activities: memberRecap.activities
      };

      const csvContent = [
        ['Member Timesheet Recap'],
        [''],
        ['Member Information'],
        ['Name', memberRecap.memberName],
        ['Email', memberRecap.memberEmail],
        ['Role', memberRecap.memberRole],
        ['Period', memberRecap.period],
        [''],
        ['Summary'],
        ['Total Hours', memberRecap.totalHours.toFixed(2)],
        ['Activities Count', memberRecap.activitiesCount],
        ['Days Worked', memberRecap.daysWorked],
        ['Average Hours/Day', memberRecap.avgHoursPerDay.toFixed(2)],
        ['Productivity Score', `${memberRecap.productivityScore}%`],
        [''],
        ['Category Breakdown'],
        ['Category', 'Hours', 'Percentage'],
        ...memberRecap.categoryBreakdown.map(cat => [
          cat.category,
          cat.hours.toFixed(2),
          `${cat.percentage.toFixed(1)}%`
        ]),
        [''],
        ['Activities'],
        ['Date', 'Start Time', 'End Time', 'Category', 'Project', 'Description', 'Duration (h)'],
        ...memberRecap.activities.map(activity => [
          activity.date,
          activity.startTime,
          activity.endTime,
          activity.category,
          activity.projectId ? projects.find(p => p.id === activity.projectId)?.name || 'Unknown' : 'No Project',
          activity.description,
          calculateDuration(activity.startTime, activity.endTime).toFixed(2)
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `timesheet-recap-${memberRecap.memberName.replace(/\s+/g, '-')}-${analysisPeriod}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading recap:', error);
      alert('Failed to download recap');
    }
  };

  const downloadAllRecaps = async () => {
    try {
      const allRecapsData = memberRecaps.map(recap => ({
        memberName: recap.memberName,
        memberEmail: recap.memberEmail,
        memberRole: recap.memberRole,
        period: recap.period,
        totalHours: recap.totalHours,
        activitiesCount: recap.activitiesCount,
        daysWorked: recap.daysWorked,
        avgHoursPerDay: recap.avgHoursPerDay,
        topCategory: recap.topCategory,
        topCategoryHours: recap.topCategoryHours,
        productivityScore: recap.productivityScore
      }));

      const csvContent = [
        ['Team Timesheet Recaps Summary'],
        [''],
        ['Period', analysisPeriod],
        ['Generated', new Date().toLocaleDateString()],
        [''],
        ['Member', 'Email', 'Role', 'Total Hours', 'Activities', 'Days Worked', 'Avg Hours/Day', 'Top Category', 'Top Category Hours', 'Productivity Score'],
        ...allRecapsData.map(recap => [
          recap.memberName,
          recap.memberEmail,
          recap.memberRole,
          recap.totalHours.toFixed(2),
          recap.activitiesCount,
          recap.daysWorked,
          recap.avgHoursPerDay.toFixed(2),
          recap.topCategory,
          recap.topCategoryHours.toFixed(2),
          `${recap.productivityScore}%`
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `team-timesheet-recap-${analysisPeriod}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading all recaps:', error);
      alert('Failed to download all recaps');
    }
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const diffMs = end.getTime() - start.getTime();
    return diffMs / (1000 * 60 * 60);
  };

  const getProductivityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProductivityIcon = (score: number) => {
    if (score >= 80) return '🏆';
    if (score >= 60) return '⭐';
    return '📊';
  };

  const toggleActivities = (memberId: number) => {
    const newExpanded = new Set(expandedActivities);
    if (newExpanded.has(memberId)) {
      newExpanded.delete(memberId);
    } else {
      newExpanded.add(memberId);
    }
    setExpandedActivities(newExpanded);
  };

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Timesheet Dashboard</h1>
          <div className="flex gap-4 mt-2">
            <Link 
              href="/dashboard/timesheet/dashboard" 
              className="px-3 py-1 text-sm font-medium text-gray-500 hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600"
            >
              📊 Analytics
            </Link>
            <Link 
              href="/dashboard/timesheet/dashboard/comparison" 
              className="px-3 py-1 text-sm font-medium text-gray-500 hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600"
            >
              📈 Comparison
            </Link>
            <Link 
              href="/dashboard/timesheet/dashboard/recap" 
              className="px-3 py-1 text-sm font-medium text-blue-600 border-b-2 border-blue-600"
            >
              📋 Recap
            </Link>
          </div>
          <p className="text-gray-600 mt-1">Member timesheet summaries and detailed recaps</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/timesheet">
              <BarChart3 className="h-4 w-4 mr-2" />
              Back to Timesheet
            </Link>
          </Button>
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
                  Guest Mode - Limited Features
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Sign in to access timesheet recap features and download functionality.
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

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Recap Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Time Period</label>
              <Select value={analysisPeriod} onValueChange={(value: AnalysisPeriod) => setAnalysisPeriod(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">📅 Last 7 Days</SelectItem>
                  <SelectItem value="monthly">📅 Last 30 Days</SelectItem>
                  <SelectItem value="yearly">📅 Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Project Filter</label>
              <Select 
                value={selectedProject.toString()} 
                onValueChange={(value) => setSelectedProject(value === 'all' ? 'all' : parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">📁 All Projects</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      📁 {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isOwner && (
              <div>
                <label className="text-sm font-medium mb-2 block">View Mode</label>
                <div className="flex items-center gap-2">
                  <Button
                    variant={showAllMembers ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowAllMembers(true)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    All Members
                  </Button>
                  <Button
                    variant={!showAllMembers ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowAllMembers(false)}
                    className="flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    My Data
                  </Button>
                </div>
              </div>
            )}
            
            <div className="flex items-end gap-2">
              <Button 
                onClick={loadRecapData} 
                disabled={isLoadingRecaps || !isAuthenticated}
                className="flex-1"
              >
                {isLoadingRecaps ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Recap
                  </>
                )}
              </Button>
              {isOwner && memberRecaps.length > 1 && (
                <Button 
                  onClick={downloadAllRecaps}
                  variant="outline"
                  size="sm"
                >
                  <Download className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {recapError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 text-red-600">⚠️</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">
                  Error Loading Recap Data
                </p>
                <p className="text-xs text-red-700 mt-1">
                  {recapError}
                </p>
              </div>
              <Button 
                onClick={loadRecapData} 
                size="sm" 
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-100"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Member Recaps */}
      {memberRecaps.length > 0 && (
        <div className="space-y-6">
          {memberRecaps.map((recap) => (
            <Card key={recap.memberId}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5" />
                    <div>
                      <h3 className="text-lg font-semibold">{recap.memberName}</h3>
                      <p className="text-sm text-gray-500">{recap.memberEmail} • {recap.memberRole}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${getProductivityColor(recap.productivityScore)}`}>
                      {getProductivityIcon(recap.productivityScore)} {recap.productivityScore}%
                    </span>
                    <Button 
                      onClick={() => downloadMemberRecap(recap)}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Summary Stats */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Summary</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Hours:</span>
                        <span className="text-sm font-medium">{recap.totalHours.toFixed(1)}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Activities:</span>
                        <span className="text-sm font-medium">{recap.activitiesCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Days Worked:</span>
                        <span className="text-sm font-medium">{recap.daysWorked}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Avg Hours/Day:</span>
                        <span className="text-sm font-medium">{recap.avgHoursPerDay.toFixed(1)}h</span>
                      </div>
                    </div>
                  </div>

                  {/* Top Category */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Top Category</h4>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-lg font-semibold text-blue-800">{recap.topCategory}</div>
                      <div className="text-sm text-blue-600">{recap.topCategoryHours.toFixed(1)} hours</div>
                      <div className="text-xs text-blue-500">
                        {((recap.topCategoryHours / recap.totalHours) * 100).toFixed(1)}% of total time
                      </div>
                    </div>
                  </div>

                  {/* Category Breakdown */}
                  <div className="space-y-4 md:col-span-2">
                    <h4 className="font-medium text-gray-900">Category Breakdown</h4>
                    <div className="space-y-2">
                      {recap.categoryBreakdown.map((category, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span className="text-sm font-medium">{category.category}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${category.percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600 w-16 text-right">
                              {category.hours.toFixed(1)}h
                            </span>
                            <span className="text-sm text-gray-500 w-12 text-right">
                              {category.percentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Activities Section */}
                <div className="mt-6 border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                      <List className="h-4 w-4" />
                      Timesheet Activities ({recap.activities.length})
                    </h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActivities(recap.memberId)}
                      className="flex items-center gap-2"
                    >
                      {expandedActivities.has(recap.memberId) ? (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          Hide Activities
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          Show Activities
                        </>
                      )}
                    </Button>
                  </div>

                  {expandedActivities.has(recap.memberId) && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      {recap.activities.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-gray-200">
                                <th className="text-left py-2 px-2 font-medium text-gray-700">Date</th>
                                <th className="text-left py-2 px-2 font-medium text-gray-700">Start</th>
                                <th className="text-left py-2 px-2 font-medium text-gray-700">End</th>
                                <th className="text-left py-2 px-2 font-medium text-gray-700">Duration</th>
                                <th className="text-left py-2 px-2 font-medium text-gray-700">Category</th>
                                <th className="text-left py-2 px-2 font-medium text-gray-700">Project</th>
                                <th className="text-left py-2 px-2 font-medium text-gray-700">Description</th>
                              </tr>
                            </thead>
                            <tbody>
                              {recap.activities.map((activity, index) => (
                                <tr key={index} className="border-b border-gray-100 hover:bg-gray-100">
                                  <td className="py-2 px-2 text-gray-900">
                                    {new Date(activity.date).toLocaleDateString()}
                                  </td>
                                  <td className="py-2 px-2 text-gray-700">{activity.startTime}</td>
                                  <td className="py-2 px-2 text-gray-700">{activity.endTime}</td>
                                  <td className="py-2 px-2 text-gray-700 font-medium">
                                    {calculateDuration(activity.startTime, activity.endTime).toFixed(2)}h
                                  </td>
                                  <td className="py-2 px-2">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      {activity.category}
                                    </span>
                                  </td>
                                  <td className="py-2 px-2 text-gray-700">
                                    {activity.projectId 
                                      ? projects.find(p => p.id === activity.projectId)?.name || 'Unknown'
                                      : 'No Project'
                                    }
                                  </td>
                                  <td className="py-2 px-2 text-gray-700 max-w-xs truncate" title={activity.description}>
                                    {activity.description}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500 text-sm">No activities found for this period</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No Data State */}
      {memberRecaps.length === 0 && !isLoadingRecaps && isAuthenticated && (
        <Card>
          <CardContent className="pt-12 pb-12">
            <div className="text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Recap Data</h3>
              <p className="text-gray-500 mb-4">
                Select your filters and click "Generate Recap" to create timesheet summaries.
              </p>
              <Button onClick={loadRecapData}>
                <FileText className="h-4 w-4 mr-2" />
                Generate Recap
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Guest Mode Message */}
      {!isAuthenticated && (
        <Card>
          <CardContent className="pt-12 pb-12">
            <div className="text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Timesheet Recap Features</h3>
              <p className="text-gray-500 mb-4">
                Sign in to access timesheet recap features including detailed member summaries and download functionality.
              </p>
              <div className="flex gap-2 justify-center">
                <Button asChild>
                  <Link href="/login/sign-in">
                    <Plus className="h-4 w-4 mr-2" />
                    Sign In
                  </Link>
                </Button>
                <Button asChild variant="outline">
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
    </div>
  );
} 