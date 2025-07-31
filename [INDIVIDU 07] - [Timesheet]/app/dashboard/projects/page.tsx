'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, FolderOpen, Users, Calendar, Settings, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface Project {
  id: number;
  name: string;
  description?: string;
  teamId: number;
  createdAt: string;
  updatedAt: string;
  memberCount?: number;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userTeam, setUserTeam] = useState<{ role: string; teamId: number } | null>(null);
  const [teamLoading, setTeamLoading] = useState(true);

  // Use user's team ID instead of hardcoded value
  const [currentTeamId, setCurrentTeamId] = useState<number>();

  // Check user team membership and fetch projects
  useEffect(() => {
    const checkUserTeamMembership = async () => {
      try {
        const response = await fetch('/api/user');
        if (response.ok) {
          const userData = await response.json();
          console.log(userData.team?.teamId);
          if (userData.team?.teamId) {
            setUserTeam({ role: userData.team.role, teamId: userData.team.teamId });
            setCurrentTeamId(userData.team.teamId);
          }
        }
      } catch (error) {
        console.error('Error checking team membership:', error);
      } finally {
        setTeamLoading(false);
      }
    };

    checkUserTeamMembership();
  }, []);

  // Fetch projects when currentTeamId changes
  useEffect(() => {
    if (currentTeamId) {
      fetchProjects();
    }
  }, [currentTeamId]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects?teamId=${currentTeamId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      const data = await response.json();
      
      // Fetch member counts for each project
      const projectsWithMemberCounts = await Promise.all(
        data.map(async (project: Project) => {
          try {
            const memberResponse = await fetch(`/api/projects/${project.id}/members`);
            if (memberResponse.ok) {
              const members = await memberResponse.json();
              return { ...project, memberCount: members.length };
            }
          } catch (err) {
            console.error(`Error fetching members for project ${project.id}:`, err);
          }
          return { ...project, memberCount: 0 };
        })
      );
      
      setProjects(projectsWithMemberCounts);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects');
      // Fallback to local storage for development
      const savedProjects = localStorage.getItem('team-projects');
      if (savedProjects) {
        try {
          const parsed = JSON.parse(savedProjects);
          setProjects(parsed);
        } catch (error) {
          console.error('Error parsing saved projects:', error);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Project name is required');
      return;
    }

    try {
      if (editingProject) {
        // Update existing project
        const response = await fetch('/api/projects', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: editingProject.id,
            name: formData.name,
            description: formData.description,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update project');
        }

        const updatedProject = await response.json();
        setProjects(projects.map(project =>
          project.id === editingProject.id ? updatedProject : project
        ));
        setEditingProject(null);
      } else {
        // Create new project
        const response = await fetch('/api/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
            teamId: currentTeamId,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create project');
        }

        const newProject = await response.json();
        setProjects([...projects, newProject]);
      }

      setFormData({ name: '', description: '' });
      setIsCreating(false);
    } catch (err) {
      console.error('Error saving project:', err);
      setError('Failed to save project');
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description || ''
    });
    setIsCreating(true);
  };

  const handleDelete = async (projectId: number) => {
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/projects?id=${projectId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete project');
        }

        setProjects(projects.filter(project => project.id !== projectId));
      } catch (err) {
        console.error('Error deleting project:', err);
        setError('Failed to delete project');
      }
    }
  };

  const cancelForm = () => {
    setIsCreating(false);
    setEditingProject(null);
    setFormData({ name: '', description: '' });
  };

  if (teamLoading) {
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
                <FolderOpen className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle className="text-2xl">Team Projects Only</CardTitle>
              <p className="text-muted-foreground">
                You need to be part of a team to access projects
              </p>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                To create and manage projects, you need to join a team or create your own.
              </p>
              <div className="flex justify-center space-x-4">
                <Button asChild>
                  <Link href="/dashboard/create-team">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Team
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/dashboard/invitations">
                    <Users className="h-4 w-4 mr-2" />
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
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-gray-600 mt-2">Manage your team's projects and track progress</p>
        </div>
        {userTeam.role === 'owner' && (
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/dashboard">
                <Users className="h-4 w-4 mr-2" />
                Team Management
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/activity">
                <TrendingUp className="h-4 w-4 mr-2" />
                Analytics
              </Link>
            </Button>
            <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </div>
        )}
      </div>

      {/* Owner Dashboard Stats */}
      {userTeam.role === 'owner' && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projects.length}</div>
              <p className="text-xs text-muted-foreground">
                Active projects in your team
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {projects.reduce((total, project) => total + (project.memberCount || 0), 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Assigned to projects
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {projects.filter(p => {
                  const updated = new Date(p.updatedAt);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return updated > weekAgo;
                }).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Updated in the last 7 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Project Health</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {projects.filter(p => (p.memberCount || 0) > 0).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Projects with active members
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading projects...</p>
        </div>
      )}

      {/* Create/Edit Project Form */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              {editingProject ? 'Edit Project' : 'Create New Project'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter project name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your project"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editingProject ? 'Update Project' : 'Create Project'}
                </Button>
                <Button type="button" variant="outline" onClick={cancelForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Projects Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-600 mb-4">
                {userTeam.role === 'owner' 
                  ? 'Create your first project to start organizing your work'
                  : 'Projects will appear here once the team owner creates them'
                }
              </p>
              {userTeam.role === 'owner' && (
                <Button onClick={() => setIsCreating(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              )}
            </div>
          ) : (
            projects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Created {new Date(project.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Link href={`/dashboard/projects/${project.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-600 hover:text-green-800"
                        title="Manage Project"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </Link>
                    {userTeam.role === 'owner' && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(project)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit Project"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(project.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete Project"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {project.description && (
                  <p className="text-gray-700 text-sm mb-4">{project.description}</p>
                )}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{project.memberCount || 0} members</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>0 hours</span>
                  </div>
                </div>
                {userTeam.role === 'owner' && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Last updated: {new Date(project.updatedAt).toLocaleDateString()}</span>
                      <span className="text-green-600">Active</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
        </div>
      )}

      {/* Project Statistics - Only show for non-owners or when there are projects */}
      {!loading && projects.length > 0 && userTeam.role !== 'owner' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projects.length}</div>
              <p className="text-xs text-muted-foreground">
                Active projects in your team
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {projects.filter(p => {
                  const updated = new Date(p.updatedAt);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return updated > weekAgo;
                }).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Updated in the last 7 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {projects.reduce((total, project) => total + (project.memberCount || 0), 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Assigned to projects
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 