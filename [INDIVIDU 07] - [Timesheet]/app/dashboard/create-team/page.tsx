'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createTeam } from '@/app/login/actions';
import { useRouter } from 'next/navigation';
import { Users, Plus } from 'lucide-react';

export default function CreateTeamPage() {
  const [teamName, setTeamName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    console.log('Form data entries:', Array.from(formData.entries()));
    
    try {
      const result = await createTeam({}, formData);
      console.log('Create team result:', result);

    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    } else if ('success' in result && result.success) {
      // Redirect to dashboard after successful team creation
      router.push('/dashboard');
    } else {
      setError('An unexpected error occurred');
      setIsLoading(false);
    }
    } catch (error) {
      console.error('Error creating team:', error);
      setError('Failed to create team. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Create Your Team</CardTitle>
            <p className="text-muted-foreground">
              Start collaborating with your team members
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teamName">Team Name</Label>
                <Input
                  id="teamName"
                  name="name"
                  type="text"
                  placeholder="Enter your team name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !teamName.trim()}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Creating Team...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create Team
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                As a team owner, you'll be able to:
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li>• Create and manage projects</li>
                <li>• Invite team members</li>
                <li>• Manage team settings</li>
                <li>• Access team analytics</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 