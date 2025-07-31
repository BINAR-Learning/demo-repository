'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  XCircle, 
  Users, 
  Mail, 
  Calendar,
  UserPlus,
  Clock
} from 'lucide-react';

interface Invitation {
  id: number;
  teamId: number;
  email: string;
  role: string;
  invitedAt: string;
  status: string;
  team: {
    id: number;
    name: string;
  };
  invitedBy: {
    id: number;
    name: string;
    email: string;
  };
}

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      const response = await fetch('/api/invitations');
      if (response.ok) {
        const data = await response.json();
        setInvitations(data);
      } else {
        setError('Failed to fetch invitations');
      }
    } catch (err) {
      console.error('Error fetching invitations:', err);
      setError('Failed to load invitations');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async (invitationId: number) => {
    try {
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invitationId }),
      });

      if (response.ok) {
        // Refresh invitations list
        fetchInvitations();
        // Show success message
        alert('Invitation accepted successfully! You are now a team member.');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to accept invitation');
      }
    } catch (err) {
      console.error('Error accepting invitation:', err);
      alert('Failed to accept invitation');
    }
  };

  const handleDeclineInvitation = async (invitationId: number) => {
    if (!confirm('Are you sure you want to decline this invitation?')) {
      return;
    }

    try {
      const response = await fetch(`/api/invitations?invitationId=${invitationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh invitations list
        fetchInvitations();
        alert('Invitation declined successfully');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to decline invitation');
      }
    } catch (err) {
      console.error('Error declining invitation:', err);
      alert('Failed to decline invitation');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading invitations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Invitations</h1>
          <p className="text-gray-600 mt-1">Manage your pending team invitations</p>
        </div>
      </div>

      {/* Invitations List */}
      {invitations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pending invitations</h3>
            <p className="text-gray-600">
              You don't have any pending team invitations at the moment.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {invitations.map((invitation) => (
            <Card key={invitation.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Invitation to join {invitation.team.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Mail className="h-4 w-4" />
                      <span className="font-medium">Role:</span>
                    </div>
                    <p className="text-gray-900 capitalize">{invitation.role}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <UserPlus className="h-4 w-4" />
                      <span className="font-medium">Invited by:</span>
                    </div>
                    <p className="text-gray-900">
                      {invitation.invitedBy.name || invitation.invitedBy.email}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">Invited on:</span>
                    </div>
                    <p className="text-gray-900">
                      {new Date(invitation.invitedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">Status:</span>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => handleAcceptInvitation(invitation.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accept Invitation
                  </Button>
                  <Button
                    onClick={() => handleDeclineInvitation(invitation.id)}
                    variant="outline"
                    className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Decline
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 