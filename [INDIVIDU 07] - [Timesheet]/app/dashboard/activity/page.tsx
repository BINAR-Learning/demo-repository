'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, FolderOpen, TrendingUp, Calendar, Clock, Activity, BarChart3, Target } from 'lucide-react';
import Link from 'next/link';

interface ActivityLog {
  id: number;
  action: string;
  timestamp: string;
  userName?: string;
  ipAddress?: string;
}

interface TeamStats {
  totalMembers: number;
  totalProjects: number;
  activeProjects: number;
  recentActivity: number;
  averageProjectMembers: number;
}

export default function ActivityPage() {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [userTeam, setUserTeam] = useState<{ role: string; teamId: number } | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('week');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch user team info
        const userResponse = await fetch('/api/user');
        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData.team?.teamId) {
            setUserTeam({ role: userData.team.role, teamId: userData.team.teamId });
          }
        }

        // Fetch team data
        const teamResponse = await fetch('/api/team');
        if (teamResponse.ok) {
          const teamData = await teamResponse.json();
          
          // Fetch projects for stats
          const projectsResponse = await fetch(`/api/projects?teamId=${teamData.id}`);
          const projects = projectsResponse.ok ? await projectsResponse.json() : [];
          
          // Calculate stats
          const stats: TeamStats = {
            totalMembers: teamData.teamMembers?.length || 0,
            totalProjects: projects.length,
            activeProjects: projects.filter((p: any) => {
              const updated = new Date(p.updatedAt);
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return updated > weekAgo;
            }).length,
            recentActivity: 0, // Will be calculated from activity logs
            averageProjectMembers: projects.length > 0 ? 
              projects.reduce((total: number, project: any) => total + (project.memberCount || 0), 0) / projects.length : 0
          };
          
          setTeamStats(stats);
        }

        // Fetch activity logs
        const activityResponse = await fetch('/api/team/activity');
        if (activityResponse.ok) {
          const logs = await activityResponse.json();
          setActivityLogs(logs);
          
          // Update recent activity count
          if (teamStats) {
            const recentLogs = logs.filter((log: ActivityLog) => {
              const logDate = new Date(log.timestamp);
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return logDate > weekAgo;
            });
            setTeamStats(prev => prev ? { ...prev, recentActivity: recentLogs.length } : null);
          }
        }
      } catch (error) {
        console.error('Error fetching activity data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE_TEAM':
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'CREATE_PROJECT':
        return <FolderOpen className="h-4 w-4 text-green-500" />;
      case 'INVITE_TEAM_MEMBER':
        return <Users className="h-4 w-4 text-purple-500" />;
      case 'ACCEPT_INVITATION':
        return <Users className="h-4 w-4 text-green-500" />;
      case 'REMOVE_TEAM_MEMBER':
        return <Users className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'CREATE_TEAM':
        return 'Team Created';
      case 'CREATE_PROJECT':
        return 'Project Created';
      case 'INVITE_TEAM_MEMBER':
        return 'Member Invited';
      case 'ACCEPT_INVITATION':
        return 'Invitation Accepted';
      case 'REMOVE_TEAM_MEMBER':
        return 'Member Removed';
      case 'UPDATE_PROJECT':
        return 'Project Updated';
      case 'DELETE_PROJECT':
        return 'Project Deleted';
      default:
        return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case 'week':
        return 'Last 7 days';
      case 'month':
        return 'Last 30 days';
      case 'quarter':
        return 'Last 90 days';
      default:
        return 'Last 7 days';
    }
  };

  if (loading) {
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
      <div className="container mx-auto p-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                <Activity className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle className="text-2xl">Team Analytics Only</CardTitle>
              <p className="text-muted-foreground">
                You need to be part of a team to view analytics
              </p>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Team analytics and activity tracking are available for team members.
              </p>
              <div className="flex justify-center space-x-4">
                <Button asChild>
                  <Link href="/dashboard/create-team">
                    <Users className="h-4 w-4 mr-2" />
                    Create Team
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/dashboard/invitations">
                    <Calendar className="h-4 w-4 mr-2" />
                    Check Invitations
                  </Link>
                </Button>
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
          <h1 className="text-3xl font-bold">Team Analytics</h1>
          <p className="text-gray-600 mt-2">Monitor your team's performance and activity</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={timeRange === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('week')}
          >
            Week
          </Button>
          <Button
            variant={timeRange === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('month')}
          >
            Month
          </Button>
          <Button
            variant={timeRange === 'quarter' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('quarter')}
          >
            Quarter
          </Button>
        </div>
      </div>

      {/* Team Statistics */}
      {teamStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamStats.totalMembers}</div>
              <p className="text-xs text-muted-foreground">
                Active team members
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamStats.totalProjects}</div>
              <p className="text-xs text-muted-foreground">
                {teamStats.activeProjects} active this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamStats.recentActivity}</div>
              <p className="text-xs text-muted-foreground">
                Actions in {getTimeRangeLabel()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Project Members</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {teamStats.averageProjectMembers.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">
                Members per project
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Team Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Project Completion</span>
                <span className="text-sm font-medium">85%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Member Engagement</span>
                <span className="text-sm font-medium">92%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Team Collaboration</span>
                <span className="text-sm font-medium">78%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Growth Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">New Members</span>
                <span className="text-sm font-medium text-green-600">+3 this month</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">New Projects</span>
                <span className="text-sm font-medium text-green-600">+2 this month</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Activity Increase</span>
                <span className="text-sm font-medium text-green-600">+15% vs last month</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Time Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Peak Activity</span>
                <span className="text-sm font-medium">2:00 PM</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Most Active Day</span>
                <span className="text-sm font-medium">Wednesday</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Avg Session</span>
                <span className="text-sm font-medium">45 min</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activityLogs.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No recent activity</h3>
              <p className="text-gray-600">
                Team activity will appear here as members perform actions
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activityLogs.slice(0, 10).map((log) => (
                <div key={log.id} className="flex items-center space-x-4 p-3 rounded-lg border">
                  {getActionIcon(log.action)}
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {getActionLabel(log.action)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {log.userName || 'System'} • {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions for Owners */}
      {userTeam.role === 'owner' && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-start">
                <Link href="/dashboard/projects">
                  <FolderOpen className="h-6 w-6 mb-2" />
                  <span className="font-medium">Manage Projects</span>
                  <span className="text-sm text-muted-foreground">Create and edit projects</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-start">
                <Link href="/dashboard">
                  <Users className="h-6 w-6 mb-2" />
                  <span className="font-medium">Team Management</span>
                  <span className="text-sm text-muted-foreground">Manage team members</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-start">
                <Link href="/dashboard/invitations">
                  <Calendar className="h-6 w-6 mb-2" />
                  <span className="font-medium">Invitations</span>
                  <span className="text-sm text-muted-foreground">Manage team invites</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
