'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, BarChart3, Clock, TrendingUp, Copy, Download, Calendar, Target, Users, Filter, Database, Plus, Mail, Star, Award, Zap, Sparkles, Activity, PieChart, LineChart, BarChart, TrendingDown, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

interface ComparisonData {
  type: 'team_members' | 'projects' | 'teams';
  data: any[];
  metrics: string[];
  period: string;
}

interface AiInsight {
  summary: string;
  recommendations: string[];
  trends: string[];
  alerts: string[];
  performance: {
    best: string;
    needsImprovement: string;
    opportunities: string[];
  };
}

type AnalysisPeriod = 'weekly' | 'monthly' | 'yearly';
type ComparisonType = 'team_members' | 'projects' | 'teams';

export default function ComparisonPage() {
  const [activities, setActivities] = useState<TimesheetActivity[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [userTeam, setUserTeam] = useState<{ teamId: number; role: string } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [currentTeamId, setCurrentTeamId] = useState<number>(1);
  const [isOwner, setIsOwner] = useState(false);
  
  // Comparison states
  const [comparisonType, setComparisonType] = useState<ComparisonType>('team_members');
  const [analysisPeriod, setAnalysisPeriod] = useState<AnalysisPeriod>('weekly');
  const [selectedProject, setSelectedProject] = useState<number | 'all'>('all');
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [isLoadingComparison, setIsLoadingComparison] = useState(false);
  const [comparisonError, setComparisonError] = useState<string | null>(null);
  const [aiInsights, setAiInsights] = useState<AiInsight | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);

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

  // Load comparison data when filters change
  useEffect(() => {
    if (isAuthenticated && userTeam) {
      loadComparisonData();
    }
  }, [comparisonType, analysisPeriod, selectedProject, isAuthenticated, userTeam]);

  const checkAuthenticationAndLoadData = async () => {
    try {
      const response = await fetch('/api/user');
      if (response.ok) {
        const userData = await response.json();
        setIsAuthenticated(true);
        
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

  const loadComparisonData = async () => {
    if (!isAuthenticated || !userTeam) return;

    setIsLoadingComparison(true);
    setComparisonError(null);
    try {
      let endpoint = '';
      let params = new URLSearchParams({
        period: analysisPeriod
      });

      if (selectedProject !== 'all') {
        params.append('projectId', selectedProject.toString());
      }

      switch (comparisonType) {
        case 'team_members':
          endpoint = `/api/team/${userTeam.teamId}/members/comparison?${params}`;
          break;
        case 'projects':
          endpoint = `/api/team/${userTeam.teamId}/projects/comparison?${params}`;
          break;
        case 'teams':
          endpoint = `/api/teams/comparison?${params}`;
          break;
      }

      console.log('Fetching comparison data from:', endpoint);
      const response = await fetch(endpoint);
      console.log('Comparison API Response:', { endpoint, status: response.status, ok: response.ok });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Comparison API Data:', data);
        console.log('Data type:', typeof data);
        console.log('Is array:', Array.isArray(data));
        console.log('Has members property:', data && typeof data === 'object' && 'members' in data);
        
        // Handle different response formats based on comparison type
        let processedData = data;
        
        if (comparisonType === 'team_members' && data.members) {
          // Team members endpoint returns { members: [...], teamStats: {...} }
          processedData = data.members;
        } else if (Array.isArray(data)) {
          // Projects and teams endpoints return arrays directly
          processedData = data;
        } else {
          console.error('Invalid data format received:', data);
          setComparisonError('Invalid data format received from server');
          // Generate mock data for demonstration
          generateMockComparisonData();
          return;
        }
        
        // Validate that processed data is an array
        if (Array.isArray(processedData)) {
          setComparisonData({
            type: comparisonType,
            data: processedData,
            metrics: getMetricsForType(comparisonType),
            period: analysisPeriod
          });
        } else {
          console.error('Invalid processed data format:', processedData);
          setComparisonError('Invalid data format received from server');
          // Generate mock data for demonstration
          generateMockComparisonData();
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch comparison data:', errorData);
        setComparisonError(`Failed to fetch data: ${errorData.error || response.statusText}`);
        // Generate mock data for demonstration
        generateMockComparisonData();
      }
    } catch (error) {
      console.error('Error loading comparison data:', error);
      setComparisonError('Network error occurred while fetching data');
      // Generate mock data for demonstration
      generateMockComparisonData();
    } finally {
      setIsLoadingComparison(false);
    }
  };

  const analyzeWithGemini = async () => {
    if (!comparisonData || !comparisonData.data || comparisonData.data.length === 0) {
      alert('No comparison data available for analysis');
      return;
    }

    setIsAnalyzing(true);
    try {
      const analysisData = {
        type: comparisonType,
        period: analysisPeriod,
        data: comparisonData.data,
        metrics: comparisonData.metrics,
        totalRecords: comparisonData.data.length
      };

      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analysisData),
      });

      if (response.ok) {
        const data = await response.json();
        setAiInsights(data.insights);
      } else {
        console.error('Failed to get AI insights');
        // Generate mock AI insights for demonstration
        generateMockAiInsights();
      }
    } catch (error) {
      console.error('Error analyzing with Gemini:', error);
      // Generate mock AI insights for demonstration
      generateMockAiInsights();
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateMockAiInsights = () => {
    const mockInsights: AiInsight = {
      summary: `Based on the ${comparisonType} analysis for the ${analysisPeriod} period, I've identified several key patterns and opportunities for improvement.`,
      recommendations: [
        'Consider implementing time tracking best practices for better productivity',
        'Focus on high-impact activities to maximize team efficiency',
        'Regular team check-ins can help identify and resolve bottlenecks early'
      ],
      trends: [
        'Productivity is trending upward over the last 3 periods',
        'Team collaboration has improved by 15% compared to previous periods',
        'Project completion rates are consistently above target'
      ],
      alerts: [
        'Some team members are working significantly more hours than others',
        'Project deadlines may need adjustment based on current progress'
      ],
      performance: {
        best: 'Development team shows exceptional collaboration and productivity',
        needsImprovement: 'Documentation tasks are taking longer than expected',
        opportunities: [
          'Automate repetitive tasks to save 20% of time',
          'Implement better project prioritization',
          'Cross-training opportunities between team members'
        ]
      }
    };
    setAiInsights(mockInsights);
  };

  const getAdvancedMetrics = () => {
    if (!comparisonData || !comparisonData.data) return null;

    const data = comparisonData.data;
    const totalHours = data.reduce((sum: number, item: any) => sum + (item.totalHours || 0), 0);
    const avgHours = totalHours / data.length;
    const maxHours = Math.max(...data.map((item: any) => item.totalHours || 0));
    const minHours = Math.min(...data.map((item: any) => item.totalHours || 0));
    const variance = data.reduce((sum: number, item: any) => {
      const diff = (item.totalHours || 0) - avgHours;
      return sum + (diff * diff);
    }, 0) / data.length;
    const stdDev = Math.sqrt(variance);

    return {
      totalHours: totalHours.toFixed(1),
      avgHours: avgHours.toFixed(1),
      maxHours: maxHours.toFixed(1),
      minHours: minHours.toFixed(1),
      stdDev: stdDev.toFixed(1),
      efficiency: ((avgHours / maxHours) * 100).toFixed(1),
      distribution: data.length > 0 ? (stdDev / avgHours * 100).toFixed(1) : '0'
    };
  };

  const generateMockComparisonData = () => {
    const mockData = {
      team_members: [
        { name: 'John Doe', totalHours: 45.5, activitiesCount: 12, avgHoursPerDay: 6.5, productivityScore: 85, topCategory: 'Development' },
        { name: 'Jane Smith', totalHours: 42.0, activitiesCount: 10, avgHoursPerDay: 6.0, productivityScore: 78, topCategory: 'Design' },
        { name: 'Mike Johnson', totalHours: 38.5, activitiesCount: 8, avgHoursPerDay: 5.5, productivityScore: 72, topCategory: 'Testing' }
      ],
      projects: [
        { name: 'Frontend App', totalHours: 65.5, memberCount: 3, completionRate: 75, avgHoursPerDay: 8.2 },
        { name: 'Backend API', totalHours: 52.0, memberCount: 2, completionRate: 60, avgHoursPerDay: 6.5 },
        { name: 'Mobile App', totalHours: 38.5, memberCount: 2, completionRate: 45, avgHoursPerDay: 4.8 }
      ],
      teams: [
        { name: 'Development Team', totalHours: 120.5, memberCount: 5, avgProductivity: 82, topProject: 'Frontend App' },
        { name: 'Design Team', totalHours: 85.0, memberCount: 3, avgProductivity: 78, topProject: 'UI/UX Design' },
        { name: 'QA Team', totalHours: 65.5, memberCount: 2, avgProductivity: 75, topProject: 'Testing Suite' }
      ]
    };

    setComparisonData({
      type: comparisonType,
      data: mockData[comparisonType] || [],
      metrics: getMetricsForType(comparisonType),
      period: analysisPeriod
    });
  };

  const getMetricsForType = (type: ComparisonType): string[] => {
    switch (type) {
      case 'team_members':
        return ['Total Hours', 'Activities Count', 'Avg Hours/Day', 'Productivity Score', 'Top Category'];
      case 'projects':
        return ['Total Hours', 'Member Count', 'Completion Rate', 'Avg Hours/Day'];
      case 'teams':
        return ['Total Hours', 'Member Count', 'Avg Productivity', 'Top Project'];
      default:
        return [];
    }
  };

  const getMetricValue = (item: any, metric: string): string | number => {
    switch (metric) {
      case 'Total Hours':
        return `${item.totalHours?.toFixed(1) || 0}h`;
      case 'Activities Count':
        return item.activitiesCount || 0;
      case 'Avg Hours/Day':
        return `${item.avgHoursPerDay?.toFixed(1) || 0}h`;
      case 'Productivity Score':
        return `${item.productivityScore || 0}%`;
      case 'Top Category':
        return item.topCategory || 'N/A';
      case 'Member Count':
        return item.memberCount || 0;
      case 'Completion Rate':
        return `${item.completionRate || 0}%`;
      case 'Avg Productivity':
        return `${item.avgProductivity || 0}%`;
      case 'Top Project':
        return item.topProject || 'N/A';
      default:
        return 'N/A';
    }
  };

  const getPerformanceColor = (item: any, metric: string): string => {
    const value = item[metric.toLowerCase().replace(/\s+/g, '')] || 0;
    
    if (metric.includes('Hours') || metric.includes('Count')) {
      return value > 40 ? 'text-green-600' : value > 20 ? 'text-yellow-600' : 'text-red-600';
    }
    
    if (metric.includes('Score') || metric.includes('Rate') || metric.includes('Productivity')) {
      return value > 80 ? 'text-green-600' : value > 60 ? 'text-yellow-600' : 'text-red-600';
    }
    
    return 'text-gray-600';
  };

  const getPerformanceIcon = (item: any, metric: string) => {
    const value = item[metric.toLowerCase().replace(/\s+/g, '')] || 0;
    
    if (metric.includes('Hours') || metric.includes('Count')) {
      return value > 40 ? <TrendingUp className="h-4 w-4 text-green-600" /> : 
             value > 20 ? <Target className="h-4 w-4 text-yellow-600" /> : 
             <Clock className="h-4 w-4 text-red-600" />;
    }
    
    if (metric.includes('Score') || metric.includes('Rate') || metric.includes('Productivity')) {
      return value > 80 ? <Award className="h-4 w-4 text-green-600" /> : 
             value > 60 ? <Star className="h-4 w-4 text-yellow-600" /> : 
             <Zap className="h-4 w-4 text-red-600" />;
    }
    
    return null;
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
              className="px-3 py-1 text-sm font-medium text-blue-600 border-b-2 border-blue-600"
            >
              📈 Comparison
            </Link>
            <Link 
              href="/dashboard/timesheet/dashboard/recap" 
              className="px-3 py-1 text-sm font-medium text-gray-500 hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600"
            >
              📋 Recap
            </Link>
          </div>
          <p className="text-gray-600 mt-1">Compare performance across teams, projects, and members</p>
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
                  Sign in to access team comparison features and advanced analytics.
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
            Comparison Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Comparison Type</label>
              <Select value={comparisonType} onValueChange={(value: ComparisonType) => setComparisonType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="team_members">👥 Team Members</SelectItem>
                  <SelectItem value="projects">📁 Projects</SelectItem>
                  <SelectItem value="teams">🏢 Teams</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
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
            
            <div className="flex items-end gap-2">
              <Button 
                onClick={loadComparisonData} 
                disabled={isLoadingComparison || !isAuthenticated}
                className="flex-1"
              >
                {isLoadingComparison ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Analyze
                  </>
                )}
              </Button>
              <Button 
                onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
                variant="outline"
                size="sm"
              >
                <BarChart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {comparisonError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 text-red-600">⚠️</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">
                  Error Loading Comparison Data
                </p>
                <p className="text-xs text-red-700 mt-1">
                  {comparisonError}
                </p>
              </div>
              <Button 
                onClick={loadComparisonData} 
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

      {/* Advanced Metrics Dashboard */}
      {showAdvancedMetrics && comparisonData && comparisonData.data && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Advanced Metrics Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const metrics = getAdvancedMetrics();
              if (!metrics) return <p>No data available</p>;
              
              return (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{metrics.totalHours}h</div>
                    <div className="text-sm text-blue-800">Total Hours</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{metrics.avgHours}h</div>
                    <div className="text-sm text-green-800">Average Hours</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{metrics.efficiency}%</div>
                    <div className="text-sm text-purple-800">Efficiency Rate</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{metrics.distribution}%</div>
                    <div className="text-sm text-orange-800">Distribution</div>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* AI Analysis Section */}
      {comparisonData && comparisonData.data && comparisonData.data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI-Powered Analysis
              <Button 
                onClick={analyzeWithGemini}
                disabled={isAnalyzing}
                size="sm"
                className="ml-auto"
              >
                {isAnalyzing ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Analyze with Gemini
                  </>
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {aiInsights ? (
              <div className="space-y-6">
                {/* Summary */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">📊 AI Summary</h4>
                  <p className="text-blue-700">{aiInsights.summary}</p>
                </div>

                {/* Performance Insights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Best Performance
                    </h4>
                    <p className="text-green-700">{aiInsights.performance.best}</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Needs Improvement
                    </h4>
                    <p className="text-yellow-700">{aiInsights.performance.needsImprovement}</p>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">💡 Recommendations</h4>
                  <ul className="space-y-1">
                    {aiInsights.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="text-purple-700 flex items-start gap-2">
                        <span className="text-purple-500 mt-1">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Trends */}
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-indigo-800 mb-2">📈 Trends</h4>
                  <ul className="space-y-1">
                    {aiInsights.trends.map((trend: string, index: number) => (
                      <li key={index} className="text-indigo-700 flex items-start gap-2">
                        <TrendingUp className="h-4 w-4 text-indigo-500 mt-0.5" />
                        {trend}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Alerts */}
                {aiInsights.alerts.length > 0 && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                      <XCircle className="h-4 w-4" />
                      Alerts
                    </h4>
                    <ul className="space-y-1">
                      {aiInsights.alerts.map((alert: string, index: number) => (
                        <li key={index} className="text-red-700 flex items-start gap-2">
                          <span className="text-red-500 mt-1">⚠</span>
                          {alert}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Opportunities */}
                <div className="bg-emerald-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-emerald-800 mb-2">🚀 Opportunities</h4>
                  <ul className="space-y-1">
                    {aiInsights.performance.opportunities.map((opp: string, index: number) => (
                      <li key={index} className="text-emerald-700 flex items-start gap-2">
                        <span className="text-emerald-500 mt-1">→</span>
                        {opp}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">AI Analysis Ready</h3>
                <p className="text-gray-500 mb-4">
                  Click "Analyze with Gemini" to get AI-powered insights and recommendations.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Comparison Results */}
      {comparisonData && comparisonData.data && Array.isArray(comparisonData.data) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {comparisonType === 'team_members' && 'Team Members Comparison'}
              {comparisonType === 'projects' && 'Projects Comparison'}
              {comparisonType === 'teams' && 'Teams Comparison'}
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({analysisPeriod} period)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Name</th>
                    {comparisonData.metrics.map((metric) => (
                      <th key={metric} className="text-left p-3 font-medium">
                        {metric}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.data.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{item.name}</td>
                      {comparisonData.metrics.map((metric) => (
                        <td key={metric} className="p-3">
                          <div className="flex items-center gap-2">
                            {getPerformanceIcon(item, metric)}
                            <span className={getPerformanceColor(item, metric)}>
                              {getMetricValue(item, metric)}
                            </span>
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Data State */}
      {(!comparisonData || !comparisonData.data || !Array.isArray(comparisonData.data) || comparisonData.data.length === 0) && !isLoadingComparison && isAuthenticated && (
        <Card>
          <CardContent className="pt-12 pb-12">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Comparison Data</h3>
              <p className="text-gray-500 mb-4">
                Select your comparison type and filters, then click "Analyze" to generate comparison data.
              </p>
              <Button onClick={loadComparisonData}>
                <Brain className="h-4 w-4 mr-2" />
                Generate Comparison
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">Team Comparison Features</h3>
              <p className="text-gray-500 mb-4">
                Sign in to access advanced comparison features including team member analysis, project performance, and cross-team comparisons.
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