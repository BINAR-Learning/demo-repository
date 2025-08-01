'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { useActionState } from 'react';
import { TeamDataWithMembers, User } from '@/lib/db/schema';
import { removeTeamMember, inviteTeamMember } from '@/app/login/actions';
import useSWR from 'swr';
import { Suspense } from 'react';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, PlusCircle, Mail, Users, FolderOpen, TrendingUp, Calendar, Settings, Crown } from 'lucide-react';
import Link from 'next/link';

type ActionState = {
  error?: string;
  success?: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function TeamOverviewSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="h-[120px]">
          <CardHeader className="pb-2">
            <div className="animate-pulse space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
              <div className="h-8 w-16 bg-gray-200 rounded"></div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

function TeamOverview() {
  const { data: teamData } = useSWR<TeamDataWithMembers>('/api/team', fetcher);
  const { data: projects } = useSWR<any[]>('/api/projects?teamId=' + (teamData?.id || ''), fetcher);
  const { data: user } = useSWR<User>('/api/user', fetcher);
  
  const isOwner = user?.role === 'owner' || teamData?.teamMembers?.some(m => m.user.id === user?.id && m.role === 'owner');

  if (!teamData) return null;

  const memberCount = teamData.teamMembers?.length || 0;
  const projectCount = projects?.length || 0;
  const ownerCount = teamData.teamMembers?.filter(m => m.role === 'owner').length || 0;
  const memberCountWithoutOwners = memberCount - ownerCount;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Team Members</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{memberCount}</div>
          <p className="text-xs text-muted-foreground">
            {memberCountWithoutOwners} members, {ownerCount} owners
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
          <FolderOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{projectCount}</div>
          <p className="text-xs text-muted-foreground">
            {projectCount > 0 ? 'Active projects' : 'No projects yet'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Team Health</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {projectCount > 0 && memberCount > 1 ? 'Good' : 'Setup'}
          </div>
          <p className="text-xs text-muted-foreground">
            {projectCount > 0 && memberCount > 1 ? 'Team is active' : 'Complete setup'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Your Role</CardTitle>
          <Crown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold capitalize">
            {teamData.teamMembers?.find(m => m.user.id === user?.id)?.role || 'Member'}
          </div>
          <p className="text-xs text-muted-foreground">
            {isOwner ? 'Full access' : 'Limited access'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function TeamMembersSkeleton() {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="animate-pulse">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
              </div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TeamMembers() {
  const { data: teamData } = useSWR<TeamDataWithMembers>('/api/team', fetcher);
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const [state, formAction] = useActionState<ActionState, FormData>(removeTeamMember, {});
  
  const isOwner = user?.role === 'owner' || teamData?.teamMembers?.some(m => m.user.id === user?.id && m.role === 'owner');

  const getUserDisplayName = (user: Pick<User, 'id' | 'name' | 'email'>) => {
    if (user.name) return user.name;
    return user.email.split('@')[0];
  };

  if (!teamData) return null;

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
      </CardHeader>
      <CardContent>
        {state?.error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {state.error}
          </div>
        )}
        {state?.success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
            {state.success}
          </div>
        )}
        <div className="space-y-4">
          {teamData.teamMembers?.map((member) => (
            <div key={member.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage alt={getUserDisplayName(member.user)} />
                  <AvatarFallback>
                    {getUserDisplayName(member.user)
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{getUserDisplayName(member.user)}</p>
                  <p className="text-sm text-muted-foreground">{member.user.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  member.role === 'owner' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {member.role}
                </span>
                {isOwner && member.user.id !== user?.id && (
                  <form action={formAction}>
                    <input type="hidden" name="memberId" value={member.id} />
                    <Button
                      type="submit"
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Remove
                    </Button>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function InviteTeamMemberSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite Team Member</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function InviteTeamMember() {
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const [state, formAction] = useActionState<ActionState, FormData>(inviteTeamMember, {});
  
  const isOwner = user?.role === 'owner';

  if (!isOwner) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite Team Member</CardTitle>
      </CardHeader>
      <CardContent>
        {state?.error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {state.error}
          </div>
        )}
        {state?.success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
            {state.success}
          </div>
        )}
        <form action={formAction} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="colleague@company.com"
              required
            />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <RadioGroup name="role" defaultValue="member" className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="member" id="member" />
                <Label htmlFor="member">Member</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="owner" id="owner" />
                <Label htmlFor="owner">Owner</Label>
              </div>
            </RadioGroup>
          </div>
          <Button type="submit" className="w-full">
            <Mail className="mr-2 h-4 w-4" />
            Send Invitation
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function QuickActions() {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-start">
            <Link href="/dashboard/projects">
              <FolderOpen className="h-6 w-6 mb-2" />
              <span className="font-medium">Manage Projects</span>
              <span className="text-sm text-muted-foreground">Create and organize projects</span>
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-start">
            <Link href="/dashboard/invitations">
              <Mail className="h-6 w-6 mb-2" />
              <span className="font-medium">Manage Invitations</span>
              <span className="text-sm text-muted-foreground">View pending invites</span>
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-start">
            <Link href="/dashboard/activity">
              <TrendingUp className="h-6 w-6 mb-2" />
              <span className="font-medium">Team Analytics</span>
              <span className="text-sm text-muted-foreground">View team activity</span>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: userTeam } = useSWR<{ team: { teamId: number | null; role: string | null } }>('/api/user', fetcher);

  if (!userTeam?.team?.teamId) {
    return (
      <div className="p-6 lg:p-8">
        <h1 className="text-lg lg:text-2xl font-medium mb-6">Welcome to Your Dashboard</h1>
        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You're currently using the app as a standalone user. To access team features and collaborate with others, you can:
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <PlusCircle className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Create Your Own Team</p>
                  <p className="text-sm text-muted-foreground">
                    Start a new team and invite members to collaborate
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Join an Existing Team</p>
                  <p className="text-sm text-muted-foreground">
                    Accept invitations from team owners
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex space-x-2">
              <Button asChild>
                <Link href="/dashboard/create-team">Create Team</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/invitations">Check Invitations</Link>
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-lg lg:text-2xl font-medium">Team Dashboard</h1>
        <p className="text-muted-foreground">Manage your team, projects, and members</p>
      </div>
      
      <Suspense fallback={<TeamOverviewSkeleton />}>
        <TeamOverview />
      </Suspense>
      
      <Suspense fallback={<QuickActions />}>
        <QuickActions />
      </Suspense>
      
      <Suspense fallback={<TeamMembersSkeleton />}>
        <TeamMembers />
      </Suspense>
      
      <Suspense fallback={<InviteTeamMemberSkeleton />}>
        <InviteTeamMember />
      </Suspense>
    </div>
  );
}
