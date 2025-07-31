'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Settings, Shield, Bell, Globe, Save, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface TeamSettings {
  name: string;
  description?: string;
  visibility: 'public' | 'private';
  allowMemberInvites: boolean;
  requireApproval: boolean;
  maxMembers: number;
}

export default function GeneralSettingsPage() {
  const [settings, setSettings] = useState<TeamSettings>({
    name: '',
    description: '',
    visibility: 'private',
    allowMemberInvites: false,
    requireApproval: true,
    maxMembers: 10
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userTeam, setUserTeam] = useState<{ role: string; teamId: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeamData = async () => {
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
          setSettings({
            name: teamData.name || '',
            description: teamData.description || '',
            visibility: teamData.visibility || 'private',
            allowMemberInvites: teamData.allowMemberInvites || false,
            requireApproval: teamData.requireApproval !== false,
            maxMembers: teamData.maxMembers || 10
          });
        }
      } catch (error) {
        console.error('Error fetching team data:', error);
        setError('Failed to load team settings');
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/team/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      setSuccess('Team settings updated successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save team settings');
    } finally {
      setSaving(false);
    }
  };

  const isOwner = userTeam?.role === 'owner';

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
                <Settings className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle className="text-2xl">Team Settings Only</CardTitle>
              <p className="text-muted-foreground">
                You need to be part of a team to access settings
              </p>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Team settings are available for team members.
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
                    <Bell className="h-4 w-4 mr-2" />
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
          <h1 className="text-3xl font-bold">Team Settings</h1>
          <p className="text-gray-600 mt-2">Configure your team preferences and permissions</p>
        </div>
        {!isOwner && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertTriangle className="h-4 w-4" />
            Only team owners can modify settings
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
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Team Name</Label>
                <Input
                  id="name"
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  placeholder="Enter team name"
                  disabled={!isOwner}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={settings.description}
                  onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                  placeholder="Describe your team"
                  rows={3}
                  disabled={!isOwner}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Visibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="visibility">Team Visibility</Label>
                <Select
                  value={settings.visibility}
                  onValueChange={(value: 'public' | 'private') => 
                    setSettings({ ...settings, visibility: value })
                  }
                  disabled={!isOwner}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  {settings.visibility === 'private' 
                    ? 'Only invited members can see and join your team'
                    : 'Anyone can see your team and request to join'
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Member Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Member Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allowInvites">Allow Member Invites</Label>
                  <p className="text-sm text-muted-foreground">
                    Let team members invite new people
                  </p>
                </div>
                <Button
                  variant={settings.allowMemberInvites ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSettings({ 
                    ...settings, 
                    allowMemberInvites: !settings.allowMemberInvites 
                  })}
                  disabled={!isOwner}
                >
                  {settings.allowMemberInvites ? 'Enabled' : 'Disabled'}
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="requireApproval">Require Approval</Label>
                  <p className="text-sm text-muted-foreground">
                    Require owner approval for new members
                  </p>
                </div>
                <Button
                  variant={settings.requireApproval ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSettings({ 
                    ...settings, 
                    requireApproval: !settings.requireApproval 
                  })}
                  disabled={!isOwner}
                >
                  {settings.requireApproval ? 'Enabled' : 'Disabled'}
                </Button>
              </div>

              <div>
                <Label htmlFor="maxMembers">Maximum Members</Label>
                <Select
                  value={settings.maxMembers.toString()}
                  onValueChange={(value) => 
                    setSettings({ ...settings, maxMembers: parseInt(value) })
                  }
                  disabled={!isOwner}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 members</SelectItem>
                    <SelectItem value="10">10 members</SelectItem>
                    <SelectItem value="25">25 members</SelectItem>
                    <SelectItem value="50">50 members</SelectItem>
                    <SelectItem value="100">100 members</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Save Button */}
          {isOwner && (
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Saving...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Save Changes
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard">
                  <Users className="h-4 w-4 mr-2" />
                  Team Members
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard/projects">
                  <Globe className="h-4 w-4 mr-2" />
                  Projects
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard/invitations">
                  <Bell className="h-4 w-4 mr-2" />
                  Invitations
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/dashboard/activity">
                  <Settings className="h-4 w-4 mr-2" />
                  Analytics
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Current Settings Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Current Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Visibility:</span>
                <span className="font-medium capitalize">{settings.visibility}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Member Invites:</span>
                <span className="font-medium">
                  {settings.allowMemberInvites ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Approval Required:</span>
                <span className="font-medium">
                  {settings.requireApproval ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Max Members:</span>
                <span className="font-medium">{settings.maxMembers}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
