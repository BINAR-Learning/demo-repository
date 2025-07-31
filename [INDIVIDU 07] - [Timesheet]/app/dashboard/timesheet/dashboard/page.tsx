'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, BarChart3, Clock, TrendingUp, Copy, Download, Calendar, Target, Users, Filter, Database, Plus, Mail } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';

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

interface CategoryStats {
  category: string;
  hours: number;
  percentage: number;
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

type AnalysisPeriod = 'weekly' | 'monthly' | 'yearly';
type AnalysisScope = 'personal' | 'team' | 'project' | 'comprehensive';
type ComparisonMode = 'none' | 'team_members' | 'projects' | 'time_periods';

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

export default function TimesheetDashboard() {
  const [activities, setActivities] = useState<TimesheetActivity[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [totalHours, setTotalHours] = useState(0);
  const [aiInsights, setAiInsights] = useState<AiInsight | null>(null);
  const [analysisSource, setAnalysisSource] = useState<'gemini' | 'local'>('local');
  const [analysisModel, setAnalysisModel] = useState<string>('manual-logic');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisPeriod, setAnalysisPeriod] = useState<AnalysisPeriod>('weekly');
  const [selectedProject, setSelectedProject] = useState<number | 'all'>('all');
  
  // Enhanced filter states
  const [analysisScope, setAnalysisScope] = useState<AnalysisScope>('personal');
  const [selectedTeamMember, setSelectedTeamMember] = useState<number | 'all'>('all');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [userTeam, setUserTeam] = useState<{ teamId: number; role: string } | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [currentTeamId, setCurrentTeamId] = useState<number>(1);
  const [teamComparisonData, setTeamComparisonData] = useState<any>(null);
  const [isLoadingTeamComparison, setIsLoadingTeamComparison] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  // New comparison states
  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>('none');
  const [comparisonData, setComparisonData] = useState<any[]>([]);
  const [selectedComparisonItems, setSelectedComparisonItems] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [showProjectComparison, setShowProjectComparison] = useState(false);
  const [showTeamComparison, setShowTeamComparison] = useState(false);

  // Check authentication status and load data accordingly
  useEffect(() => {
    checkAuthenticationAndLoadData();
  }, []);

  // Fetch projects when currentTeamId changes (only for authenticated users)
  useEffect(() => {
    if (currentTeamId && isAuthenticated) {
      fetchProjects();
      fetchActivities();
    }
  }, [currentTeamId, isAuthenticated]);

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
        calculateStats(activitiesData);
      } else {
        setActivities([]);
        calculateStats([]);
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      setActivities([]);
      calculateStats([]);
    }
  };

  const fetchActivities = async () => {
    console.log('fetchActivities', isAuthenticated);
    if (!isAuthenticated) {
      loadActivitiesFromLocalStorage();
      return;
    }

    try {
      const response = await fetch('/api/timesheet');
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setActivities(data);
        calculateStats(data);
      } else {
        console.error('Failed to fetch activities');
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  // Update stats when filters change
  useEffect(() => {
    const { totalHours: filteredTotal, categoryStats: filteredStats } = calculateFilteredStats();
    setTotalHours(filteredTotal);
    setCategoryStats(filteredStats);
  }, [analysisPeriod, selectedProject, activities]);

  // Fetch team comparison data when filters change
  useEffect(() => {
    if (userTeam && showTeamComparison) {
      fetchTeamComparisonData();
    }
  }, [analysisPeriod, selectedProject, userTeam, showTeamComparison]);

  const fetchUserTeamInfo = async () => {
    if (!isAuthenticated) return;
    
    try {
      const userResponse = await fetch('/api/user');
      if (userResponse.ok) {
        const userData = await userResponse.json();
        if (userData.team?.teamId) {
          const teamInfo = { teamId: userData.team.teamId, role: userData.team.role };
          setUserTeam(teamInfo);
          setCurrentTeamId(userData.team.teamId);
          setIsOwner(userData.team.role === 'owner');
          
          // Fetch team members if user is part of a team
          await fetchTeamMembers(userData.team.teamId);
        }
      }
    } catch (error) {
      console.error('Error fetching user team info:', error);
    }
  };

  const fetchTeamMembers = async (teamId: number) => {
    try {
      const response = await fetch(`/api/team/${teamId}/members`);
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data.members);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const fetchProjects = async () => {
    if (!isAuthenticated) return;
    
    try {
      // Use user's team ID if available, otherwise fallback to default
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

  const fetchTeamComparisonData = async () => {
    if (!userTeam) return;
    
    setIsLoadingTeamComparison(true);
    try {
      const params = new URLSearchParams({
        period: analysisPeriod,
        projectId: selectedProject === 'all' ? 'all' : selectedProject.toString()
      });
      
      const response = await fetch(`/api/team/${userTeam.teamId}/members/comparison?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTeamComparisonData(data);
        setTeamMembers(data.members || []);
      } else {
        console.error('Failed to fetch team comparison data');
      }
    } catch (error) {
      console.error('Error fetching team comparison data:', error);
    } finally {
      setIsLoadingTeamComparison(false);
    }
  };

  const calculateStats = (activitiesData: TimesheetActivity[]) => {
    const total = activitiesData.reduce((sum, activity) => {
      return sum + calculateDuration(activity.startTime, activity.endTime);
    }, 0);

    setTotalHours(total);

    // Calculate category distribution
    const categoryMap = new Map<string, number>();
    activitiesData.forEach(activity => {
      const duration = calculateDuration(activity.startTime, activity.endTime);
      categoryMap.set(activity.category, (categoryMap.get(activity.category) || 0) + duration);
    });

    const stats: CategoryStats[] = Array.from(categoryMap.entries()).map(([category, hours]) => ({
      category,
      hours,
      percentage: (hours / total) * 100
    }));

    setCategoryStats(stats.sort((a, b) => b.hours - a.hours));
  };

  // New function to calculate stats based on current filters
  const calculateFilteredStats = () => {
    const filteredActivities = getActivitiesByPeriod(analysisPeriod);
    const total = filteredActivities.reduce((sum, activity) => {
      return sum + calculateDuration(activity.startTime, activity.endTime);
    }, 0);

    // Calculate category distribution for filtered data
    const categoryMap = new Map<string, number>();
    filteredActivities.forEach(activity => {
      const duration = calculateDuration(activity.startTime, activity.endTime);
      categoryMap.set(activity.category, (categoryMap.get(activity.category) || 0) + duration);
    });

    const stats: CategoryStats[] = Array.from(categoryMap.entries()).map(([category, hours]) => ({
      category,
      hours,
      percentage: total > 0 ? (hours / total) * 100 : 0
    }));

    return {
      totalHours: total,
      categoryStats: stats.sort((a, b) => b.hours - a.hours)
    };
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const diffMs = end.getTime() - start.getTime();
    return diffMs / (1000 * 60 * 60);
  };

  const getActivitiesByPeriod = (period: AnalysisPeriod) => {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'weekly':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'monthly':
        startDate = new Date(now.setDate(now.getDate() - 30));
        break;
      case 'yearly':
        startDate = new Date(now.setDate(now.getDate() - 365));
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 7));
    }

    return activities.filter(activity => {
      const activityDate = new Date(activity.date);
      const dateFilter = activityDate >= startDate && activityDate <= new Date();
      
      // Filter by project if selected
      const projectFilter = selectedProject === 'all' || activity.projectId === selectedProject;
      
      return dateFilter && projectFilter;
    });
  };

  const analyzeWithAI = async () => {
    setIsAnalyzing(true);
    
    try {
      const periodActivities = getActivitiesByPeriod(analysisPeriod);

      if (periodActivities.length === 0) {
        setAiInsights({
          summary: `No activities found for this ${analysisPeriod} period. Please add some activities first.`,
          recommendations: ['Add some activities to get started with analysis'],
          trends: [],
          alerts: [],
          performance: {
            best: 'No data available',
            needsImprovement: 'Add activities to begin tracking',
            opportunities: ['Start logging your work activities']
          }
        });
        return;
      }

      // Get user team information
      let currentUserTeam = userTeam;
      let currentTeamMembers = teamMembers;
      let projectBreakdown = null;
      
      if (!currentUserTeam) {
        try {
          const userResponse = await fetch('/api/user');
          if (userResponse.ok) {
            const userData = await userResponse.json();
            if (userData.team?.teamId) {
              currentUserTeam = { teamId: userData.team.teamId, role: userData.team.role };
              
              // Get team members data for team analysis
              const teamResponse = await fetch(`/api/team/${userData.team.teamId}/members`);
              if (teamResponse.ok) {
                const teamData = await teamResponse.json();
                currentTeamMembers = teamData.members.map((member: any) => ({
                  id: member.id,
                  name: member.name || member.email,
                  email: member.email,
                  role: member.role,
                  totalHours: member.totalHours || 0
                }));
              }
              
              // Get project breakdown for project analysis
              const projectsResponse = await fetch(`/api/team/${userData.team.teamId}/projects/breakdown`);
              if (projectsResponse.ok) {
                projectBreakdown = await projectsResponse.json();
              }
            }
          }
        } catch (error) {
          console.log('Team data not available, proceeding with personal analysis');
        }
      } else if (currentUserTeam && !currentTeamMembers) {
        // Fetch team members if not already loaded
        await fetchTeamMembers(currentUserTeam.teamId);
        currentTeamMembers = teamMembers;
        
        // Get project breakdown for project analysis
        const projectsResponse = await fetch(`/api/team/${currentUserTeam.teamId}/projects/breakdown`);
        if (projectsResponse.ok) {
          projectBreakdown = await projectsResponse.json();
        }
      }

      // Determine analysis type based on scope selection
      let analysisType: 'personal' | 'team' | 'project' | 'comprehensive' = analysisScope;
      
      // Override if scope is not available
      if (analysisScope === 'team' && !currentUserTeam) {
        analysisType = 'personal';
      } else if (analysisScope === 'project' && !currentUserTeam) {
        analysisType = 'personal';
      } else if (analysisScope === 'comprehensive' && (!currentUserTeam || !currentTeamMembers || !projectBreakdown)) {
        if (currentUserTeam && currentTeamMembers) {
          analysisType = 'team';
        } else if (currentUserTeam && projectBreakdown) {
          analysisType = 'project';
        } else {
          analysisType = 'personal';
        }
      }

      // Prepare data for AI analysis
      const analysisData = {
        period: analysisPeriod,
        project: selectedProject === 'all' ? undefined : projects.find(p => p.id === selectedProject)?.name,
        teamId: currentUserTeam?.teamId,
        totalHours: periodActivities.reduce((sum, activity) => 
          sum + calculateDuration(activity.startTime, activity.endTime), 0
        ),
        activities: periodActivities.map(activity => ({
          date: activity.date,
          category: activity.category,
          project: activity.projectId ? projects.find(p => p.id === activity.projectId)?.name || 'Unknown Project' : 'No Project',
          projectId: activity.projectId,
          duration: calculateDuration(activity.startTime, activity.endTime),
          description: activity.description,
          userId: 1 // Will be replaced with actual user ID when database integration is complete
        })),
        categoryBreakdown: categoryStats,
        periodDays: analysisPeriod === 'weekly' ? 7 : analysisPeriod === 'monthly' ? 30 : 365,
        teamMembers: currentTeamMembers,
        projectBreakdown,
        analysisType,
        comparisonMode,
        selectedComparisonItems
      };

      // Call AI API
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
        setAnalysisSource(data.source || 'local');
        setAnalysisModel(data.model || 'manual-logic');
      } else {
        // Fallback analysis
        const avgHoursPerDay = analysisData.totalHours / analysisData.periodDays;
        const topCategory = analysisData.categoryBreakdown[0];
        
        setAiInsights(generateFallbackInsights(analysisData, avgHoursPerDay, topCategory));
        setAnalysisSource('local');
        setAnalysisModel('manual-logic');
      }
    } catch (error) {
      setAiInsights({
        summary: 'Unable to analyze data at the moment. Please try again later.',
        recommendations: ['Check your internet connection', 'Verify your data is properly formatted'],
        trends: [],
        alerts: ['Analysis failed - using fallback data'],
        performance: {
          best: 'Analysis unavailable',
          needsImprovement: 'Please try again later',
          opportunities: ['Retry the analysis when the issue is resolved']
        }
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // New function to handle comparison analysis
  const handleComparisonAnalysis = async () => {
    if (selectedComparisonItems.length < 2) {
      alert('Please select at least 2 items to compare');
      return;
    }

    setIsAnalyzing(true);
    try {
      // This would be enhanced to fetch comparison data
      // For now, we'll use the existing analysis with comparison context
      await analyzeWithAI();
      setShowComparison(true);
    } catch (error) {
      console.error('Error in comparison analysis:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // New function to prepare comparison data
  const prepareComparisonData = () => {
    if (!userTeam) return [];

    const comparisonOptions = [];
    
    if (comparisonMode === 'team_members' && teamMembers.length > 0) {
      comparisonOptions.push(...teamMembers.map(member => ({
        id: `member_${member.id}`,
        name: member.name,
        type: 'team_member',
        data: member
      })));
    } else if (comparisonMode === 'projects' && projects.length > 0) {
      comparisonOptions.push(...projects.map(project => ({
        id: `project_${project.id}`,
        name: project.name,
        type: 'project',
        data: project
      })));
    } else if (comparisonMode === 'time_periods') {
      comparisonOptions.push(
        { id: 'current_week', name: 'Current Week', type: 'time_period', data: { period: 'weekly' } },
        { id: 'current_month', name: 'Current Month', type: 'time_period', data: { period: 'monthly' } },
        { id: 'last_month', name: 'Last Month', type: 'time_period', data: { period: 'monthly', offset: -1 } }
      );
    }

    return comparisonOptions;
  };

  const generateFallbackInsights = (data: any, avgHoursPerDay: number, topCategory: any): AiInsight => {
    const periodLabel = analysisPeriod === 'weekly' ? 'Minggu' : analysisPeriod === 'monthly' ? 'Bulan' : 'Tahun';
    const scopeLabel = analysisScope === 'personal' ? 'Personal' : 
                      analysisScope === 'team' ? 'Tim' : 
                      analysisScope === 'project' ? 'Project' : 'Komprehensif';
    
    const summary = `${scopeLabel} timesheet analysis for the ${periodLabel} period shows ${data.totalHours.toFixed(2)} total hours worked, averaging ${avgHoursPerDay.toFixed(2)} hours per day. Top category is ${topCategory?.category || 'Unknown'} with ${topCategory?.hours?.toFixed(2) || 0} hours.`;
    
    const recommendations = [];
    if (avgHoursPerDay > 8) {
      recommendations.push('Schedule breaks and leisure time to prevent burnout');
    }
    if (topCategory && topCategory.percentage > 50) {
      recommendations.push('Consider allocating time to other categories for skill development');
    }
    recommendations.push('Track your energy levels throughout the day');
    recommendations.push('Set realistic daily goals based on your patterns');
    
    const trends = [
      `Average ${avgHoursPerDay.toFixed(1)} hours per day`,
      `Work distributed across ${data.categoryBreakdown?.length || 0} categories`,
      `Completed ${data.activities.length} activities during this period`
    ];
    
    const alerts = [];
    if (avgHoursPerDay > 9) {
      alerts.push(`High workload detected (${avgHoursPerDay.toFixed(1)}h/day) - consider reducing daily work hours`);
    }
    if (topCategory && topCategory.percentage > 60) {
      alerts.push(`High focus on ${topCategory.category} (${topCategory.percentage.toFixed(1)}%) - consider diversifying work activities`);
    }
    
    const dailyPatterns = data.activities.reduce((acc: any, activity: any) => {
      const day = new Date(activity.date).toLocaleDateString('en-US', { weekday: 'long' });
      acc[day] = (acc[day] || 0) + activity.duration;
      return acc;
    }, {});
    
    const mostProductiveDay = Object.entries(dailyPatterns)
      .sort(([,a]: any, [,b]: any) => b - a)[0];
    
    const best = mostProductiveDay 
      ? `Most productive day: ${mostProductiveDay[0]} with ${(mostProductiveDay[1] as number).toFixed(1)} hours`
      : `Strong performance in ${topCategory?.category || 'primary work'} category`;
    
    const needsImprovement = avgHoursPerDay > 8 
      ? 'Focus on work-life balance and reducing daily work hours'
      : 'Maintain current productivity levels while optimizing time allocation';
    
    const opportunities = [
      'Implement time blocking techniques to improve focus',
      'Review and optimize category organization',
      'Set specific productivity goals for the next period'
    ];
    
    return {
      summary,
      recommendations,
      trends,
      alerts,
      performance: {
        best,
        needsImprovement,
        opportunities
      }
    };
  };

  const copyToClipboard = async () => {
    try {
      if (!aiInsights) return;
      
      const insightsText = `
${aiInsights.summary}

RECOMMENDATIONS:
${aiInsights.recommendations.map(rec => `• ${rec}`).join('\n')}

TRENDS:
${aiInsights.trends.map(trend => `• ${trend}`).join('\n')}

${aiInsights.alerts.length > 0 ? `ALERTS:\n${aiInsights.alerts.map(alert => `• ${alert}`).join('\n')}\n` : ''}
PERFORMANCE:
Best: ${aiInsights.performance.best}
Needs Improvement: ${aiInsights.performance.needsImprovement}

OPPORTUNITIES:
${aiInsights.performance.opportunities.map(opp => `• ${opp}`).join('\n')}
      `.trim();
      
      await navigator.clipboard.writeText(insightsText);
      alert('Insights copied to clipboard!');
    } catch (error) {
      alert('Failed to copy to clipboard');
    }
  };

  const exportData = () => {
    const periodActivities = getActivitiesByPeriod(analysisPeriod);
    const csvContent = [
      ['Date', 'Category', 'Start Time', 'End Time', 'Duration (h)', 'Description'],
      ...periodActivities.map(activity => [
        activity.date,
        activity.category,
        activity.startTime,
        activity.endTime,
        calculateDuration(activity.startTime, activity.endTime).toFixed(2),
        activity.description
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timesheet-${analysisPeriod}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getPeriodStats = () => {
    const periodActivities = getActivitiesByPeriod(analysisPeriod);
    const totalPeriodHours = periodActivities.reduce((sum, activity) => {
      return sum + calculateDuration(activity.startTime, activity.endTime);
    }, 0);

    const periodDays = analysisPeriod === 'weekly' ? 7 : analysisPeriod === 'monthly' ? 30 : 365;
    const avgHoursPerDay = totalPeriodHours / periodDays;

    return {
      totalHours: totalPeriodHours,
      activitiesCount: periodActivities.length,
      avgHoursPerDay
    };
  };

  const periodStats = getPeriodStats();

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Timesheet Dashboard</h1>
          <div className="flex gap-4 mt-2">
            <Link 
              href="/dashboard/timesheet/dashboard" 
              className="px-3 py-1 text-sm font-medium text-blue-600 border-b-2 border-blue-600"
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
              className="px-3 py-1 text-sm font-medium text-gray-500 hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600"
            >
              📋 Recap
            </Link>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={analysisPeriod} onValueChange={(value: AnalysisPeriod) => setAnalysisPeriod(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Pilih Periode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">📅 7 Hari Terakhir</SelectItem>
              <SelectItem value="monthly">📅 30 Hari Terakhir</SelectItem>
              <SelectItem value="yearly">📅 1 Tahun Terakhir</SelectItem>
            </SelectContent>
          </Select>
          <Select 
            value={selectedProject.toString()} 
            onValueChange={(value) => setSelectedProject(value === 'all' ? 'all' : parseInt(value))}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Pilih Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">📁 Semua Project</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id.toString()}>
                  📁 {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={exportData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/timesheet/dashboard/comparison">
              <BarChart3 className="h-4 w-4 mr-2" />
              Comparison
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

      {/* Filter Summary */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-sm">
            <Filter className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-800">Filter Aktif:</span>
            <span className="text-blue-700">
              {analysisPeriod === 'weekly' ? '📅 7 Hari Terakhir' : 
               analysisPeriod === 'monthly' ? '📅 30 Hari Terakhir' : '📅 1 Tahun Terakhir'}
            </span>
            {selectedProject !== 'all' && (
              <>
                <span className="text-blue-600">•</span>
                <span className="text-blue-700">
                  📁 {projects.find(p => p.id === selectedProject)?.name || 'Project'}
                </span>
              </>
            )}
            {userTeam && analysisScope !== 'personal' && (
              <>
                <span className="text-blue-600">•</span>
                <span className="text-blue-700">
                  {analysisScope === 'team' ? '👥 Tim' : 
                   analysisScope === 'project' ? '📊 Project' : '🔍 Lengkap'}
                </span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Analysis Filters */}
      {userTeam && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Analysis Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Basic Analysis Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Analysis Scope</label>
                  <Select value={analysisScope} onValueChange={(value: AnalysisScope) => setAnalysisScope(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Analisis" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">👤 Analisis Personal</SelectItem>
                      <SelectItem value="team">👥 Analisis Tim</SelectItem>
                      <SelectItem value="project">📊 Analisis Project</SelectItem>
                      <SelectItem value="comprehensive">🔍 Analisis Lengkap</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {analysisScope === 'team' && teamMembers.length > 0 && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Team Member</label>
                    <Select 
                      value={selectedTeamMember.toString()} 
                      onValueChange={(value) => setSelectedTeamMember(value === 'all' ? 'all' : parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Anggota Tim" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">👥 Semua Anggota Tim</SelectItem>
                        {teamMembers.map((member) => (
                          <SelectItem key={member.id} value={member.id.toString()}>
                            👤 {member.name} ({member.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="flex items-end">
                  <Button 
                    onClick={analyzeWithAI} 
                    disabled={isAnalyzing || activities.length === 0}
                    className="w-full"
                  >
                    {isAnalyzing ? 'Menganalisa...' : `Analyze ${analysisScope}`}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jam</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{periodStats.totalHours.toFixed(2)}h</div>
            <p className="text-xs text-muted-foreground">
              {analysisPeriod === 'weekly' ? 'Minggu ini' : analysisPeriod === 'monthly' ? 'Bulan ini' : 'Tahun ini'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktivitas</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{periodStats.activitiesCount}</div>
            <p className="text-xs text-muted-foreground">
              Total entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata/Hari</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{periodStats.avgHoursPerDay.toFixed(2)}h</div>
            <p className="text-xs text-muted-foreground">
              Jam per hari
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kategori</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categoryStats.length}</div>
            <p className="text-xs text-muted-foreground">
              Berbeda jenis
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📊 Distribusi Kategori
              <span className="text-xs text-gray-500 font-normal">
                ({analysisPeriod === 'weekly' ? '7 hari' : analysisPeriod === 'monthly' ? '30 hari' : '1 tahun'})
                {selectedProject !== 'all' && ` • ${projects.find(p => p.id === selectedProject)?.name}`}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryStats.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-2">Tidak ada data untuk periode ini</p>
                  <p className="text-xs text-gray-400">
                    Coba ubah filter periode atau project untuk melihat data
                  </p>
                </div>
              ) : (
                categoryStats.map((stat) => (
                  <div key={stat.category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm font-medium">{stat.category}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${stat.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">
                        {stat.hours.toFixed(1)}h
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Analisa AI
              {analysisSource === 'gemini' && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  Gemini AI ({analysisModel})
                </span>
              )}
              {analysisSource === 'local' && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Manual Logic
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!userTeam && (
                <Button 
                  onClick={analyzeWithAI} 
                  disabled={isAnalyzing || activities.length === 0}
                  className="w-full"
                >
                  {isAnalyzing ? 'Menganalisa...' : `Analisa ${analysisPeriod === 'weekly' ? 'Mingguan' : analysisPeriod === 'monthly' ? 'Bulanan' : 'Tahunan'}`}
                </Button>
              )}
              
              {aiInsights && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">Insight & Rekomendasi</h4>
                      <span className="text-xs text-gray-500">
                        {analysisSource === 'gemini' ? `Powered by ${analysisModel}` : 'Manual Analysis'}
                      </span>
                    </div>
                    <Button onClick={copyToClipboard} variant="ghost" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-4">
                    {/* Summary */}
                    <div>
                      <h5 className="font-medium text-blue-700 mb-2">Summary</h5>
                      <p className="text-gray-700">{aiInsights.summary}</p>
                    </div>

                    {/* Performance */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-green-700 mb-2">Best Performance</h5>
                        <p className="text-gray-700">{aiInsights.performance.best}</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-yellow-700 mb-2">Needs Improvement</h5>
                        <p className="text-gray-700">{aiInsights.performance.needsImprovement}</p>
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <h5 className="font-medium text-purple-700 mb-2">Recommendations</h5>
                      <ul className="list-disc list-inside space-y-1">
                        {aiInsights.recommendations.map((rec, index) => (
                          <li key={index} className="text-gray-700">{rec}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Trends */}
                    <div>
                      <h5 className="font-medium text-indigo-700 mb-2">Trends</h5>
                      <ul className="list-disc list-inside space-y-1">
                        {aiInsights.trends.map((trend, index) => (
                          <li key={index} className="text-gray-700">{trend}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Alerts */}
                    {aiInsights.alerts.length > 0 && (
                      <div>
                        <h5 className="font-medium text-red-700 mb-2">Alerts</h5>
                        <ul className="list-disc list-inside space-y-1">
                          {aiInsights.alerts.map((alert, index) => (
                            <li key={index} className="text-red-600">{alert}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Opportunities */}
                    <div>
                      <h5 className="font-medium text-emerald-700 mb-2">Opportunities</h5>
                      <ul className="list-disc list-inside space-y-1">
                        {aiInsights.performance.opportunities.map((opp, index) => (
                          <li key={index} className="text-gray-700">{opp}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
             </div>

       {/* Comparison Dashboard Toggles */}
       {userTeam && (projects.length > 1 || teamMembers.length > 1) && (
         <Card className="border-green-200 bg-green-50">
           <CardContent className="pt-4">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <span className="text-green-600">📊</span>
                 <span className="font-medium text-green-800">Dashboard Perbandingan Tersedia</span>
               </div>
               <div className="flex gap-2">
                 {projects.length > 1 && (
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={() => setShowProjectComparison(!showProjectComparison)}
                     className="flex items-center gap-2"
                   >
                     📊 {showProjectComparison ? 'Sembunyikan' : 'Tampilkan'} Project
                   </Button>
                 )}
                 {teamMembers.length > 1 && (
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={() => setShowTeamComparison(!showTeamComparison)}
                     className="flex items-center gap-2"
                   >
                     👥 {showTeamComparison ? 'Sembunyikan' : 'Tampilkan'} Tim
                   </Button>
                 )}
               </div>
             </div>
             <p className="text-sm text-green-700 mt-2">
               Analisis mendalam untuk membandingkan performa project dan anggota tim
             </p>
           </CardContent>
         </Card>
       )}
     </div>
   );
 } 