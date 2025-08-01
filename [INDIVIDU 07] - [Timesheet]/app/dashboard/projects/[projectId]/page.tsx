'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  FolderOpen, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  ArrowLeft, 
  Calendar,
  Clock,
  TrendingUp,
  UserPlus,
  Save,
  X
} from 'lucide-react';
import Link from 'next/link';

interface Project {
  id: number;
  name: string;
  description?: string;
  teamId: number;
  createdAt: string;
  updatedAt: string;
}

interface ProjectMember {
  id: number;
  userId: number;
  projectId: number;
  role: string;
  joinedAt: string;
  user: {
    id: number;
    name?: string;
    email: string;
  };
}

interface TeamMember {
  id: number;
  userId: number;
  teamId: number;
  role: string;
  user: {
    id: number;
    name?: string;
    email: string;
  };
}

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [userTeam, setUserTeam] = useState<{ role: string; teamId: number } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [addMemberForm, setAddMemberForm] = useState({ userId: '', role: 'member' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  const fetchProjectData = async () => {
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

      // Fetch project details
      const projectResponse = await fetch(`/api/projects/${projectId}`);
      if (projectResponse.ok) {
        const projectData = await projectResponse.json();
        setProject(projectData);
        setEditForm({ name: projectData.name, description: projectData.description || '' });
      }

      // Fetch project members
      const membersResponse = await fetch(`/api/projects/${projectId}/members`);
      if (membersResponse.ok) {
        const membersData = await membersResponse.json();
        setProjectMembers(membersData);
      }

      // Fetch team members for adding to project
      const teamResponse = await fetch('/api/team');
      if (teamResponse.ok) {
        const teamData = await teamResponse.json();
        setTeamMembers(teamData.teamMembers || []);
      }
    } catch (error) {
      console.error('Error fetching project data:', error);
      setError('Failed to load project data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProject = async () => {
    try {
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/projects', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: projectId,
          name: editForm.name,
          description: editForm.description,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update project');
      }

      const updatedProject = await response.json();
      setProject(updatedProject);
      setIsEditing(false);
      setSuccess('Project updated successfully');
    } catch (error) {
      console.error('Error updating project:', error);
      setError('Failed to update project');
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/projects?id=${projectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      // Redirect to projects list
      window.location.href = '/dashboard/projects';
    } catch (error) {
      console.error('Error deleting project:', error);
      setError('Failed to delete project');
    }
  };

  const handleAddMember = async () => {
    try {
      setError(null);
      setSuccess(null);

      const response = await fetch(`/api/projects/${projectId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: parseInt(addMemberForm.userId),
          role: addMemberForm.role,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add member');
      }

      // Refresh project members
      fetchProjectData();
      setIsAddingMember(false);
      setAddMemberForm({ userId: '', role: 'member' });
      setSuccess('Member added successfully');
    } catch (error) {
      console.error('Error adding member:', error);
      setError('Failed to add member');
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (!confirm('Are you sure you want to remove this member from the project?')) {
      return;
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/members/${memberId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove member');
      }

      // Refresh project members
      fetchProjectData();
      setSuccess('Member removed successfully');
    } catch (error) {
      console.error('Error removing member:', error);
      setError('Failed to remove member');
    }
  };

  const isOwner = userTeam?.role === 'owner';
  const availableTeamMembers = teamMembers.filter(
    member => !projectMembers.some(pm => pm.userId === member.userId)
  );

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <FolderOpen className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-2xl">Project Not Found</CardTitle>
              <p className="text-muted-foreground">
                The project you're looking for doesn't exist or you don't have access to it.
              </p>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild>
                <Link href="/dashboard/projects">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Projects
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/projects">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-gray-600">Project Management</p>
          </div>
        </div>
        {isOwner && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsAddingMember(!isAddingMember)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProject}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Project Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Project Name</Label>
                    <Input
                      id="name"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="Enter project name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      placeholder="Describe your project"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleUpdateProject}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Name</h3>
                    <p className="text-gray-600">{project.name}</p>
                  </div>
                  {project.description && (
                    <div>
                      <h3 className="font-medium">Description</h3>
                      <p className="text-gray-600">{project.description}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Created:</span>
                      <p className="text-gray-600">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Last Updated:</span>
                      <p className="text-gray-600">
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Project Members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Project Members ({projectMembers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isAddingMember && (
                <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                  <h4 className="font-medium mb-3">Add Team Member</h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="member">Select Member</Label>
                      <Select
                        value={addMemberForm.userId}
                        onValueChange={(value) => setAddMemberForm({ ...addMemberForm, userId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a team member" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTeamMembers.map((member) => (
                            <SelectItem key={member.id} value={member.userId.toString()}>
                              {member.user.name || member.user.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Select
                        value={addMemberForm.role}
                        onValueChange={(value) => setAddMemberForm({ ...addMemberForm, role: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="lead">Lead</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleAddMember} disabled={!addMemberForm.userId}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Member
                      </Button>
                      <Button variant="outline" onClick={() => setIsAddingMember(false)}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {projectMembers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No members yet</h3>
                  <p className="text-gray-600 mb-4">
                    Add team members to start collaborating on this project
                  </p>
                  {isOwner && (
                    <Button onClick={() => setIsAddingMember(true)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Member
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {projectMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>
                            {(member.user.name || member.user.email)
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {member.user.name || member.user.email}
                          </p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {member.role} • Joined {new Date(member.joinedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {isOwner && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveMember(member.id)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Project Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Members</span>
                <span className="font-medium">{projectMembers.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Created</span>
                <span className="font-medium">
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Last Updated</span>
                <span className="font-medium">
                  {new Date(project.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard/projects">
                  <FolderOpen className="h-4 w-4 mr-2" />
                  All Projects
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard">
                  <Users className="h-4 w-4 mr-2" />
                  Team Management
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard/activity">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Analytics
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Project Health */}
          <Card>
            <CardHeader>
              <CardTitle>Project Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Member Engagement</span>
                  <span className="text-sm font-medium text-green-600">Good</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Activity Level</span>
                  <span className="text-sm font-medium text-blue-600">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Completion</span>
                  <span className="text-sm font-medium">75%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 