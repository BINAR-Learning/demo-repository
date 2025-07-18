"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import ProfileForm from "@/components/ProfileForm";
import { useAuth } from "@/hooks/useAuth";
import { TokenExpirationWarning } from "@/components/TokenExpirationWarning";
import { SessionTimer } from "@/components/SessionTimer";
import { User, ProfileData } from "@/lib/types";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<"view" | "edit">("view");
  const { requireAuth } = useAuth();

  useEffect(() => {
    requireAuth("/login");
  }, [requireAuth]);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        toast.error("Failed to load user data");
      }
    } catch (error) {
      console.error("Fetch user data error:", error);
      toast.error("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: ProfileData) => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setMode("view");
        toast.success("Profile updated successfully!");
      } else {
        if (data.errors) {
          // Handle validation errors
          Object.values(data.errors).forEach((error: any) => {
            toast.error(error);
          });
        } else {
          toast.error(data.message || "An error occurred.");
        }
        throw new Error(data.message || "Update failed");
      }
    } catch (error) {
      console.error("Update profile error:", error);
      if (!error.message?.includes("Update failed")) {
        toast.error("Network error occurred.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (mode === "edit") {
      setMode("view");
    } else {
      setMode("edit");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="text-center">
            <p className="text-gray-600">Failed to load user data</p>
            <button
              onClick={fetchUserData}
              className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <TokenExpirationWarning />
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  👤 User Profile
                </h1>
                <p className="mt-2 text-gray-600">
                  Manage your profile information and preferences
                </p>
              </div>
              <SessionTimer />
            </div>
          </div>

          {/* Profile Form */}
          <ProfileForm
            user={user}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={saving}
            mode={mode}
          />

          {/* Profile History Section */}
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📋 Profile Update History
              </h3>
              <p className="text-gray-600">
                Track your profile changes and maintain a complete audit trail
                of all updates.
              </p>
              <div className="mt-4">
                <button
                  onClick={() => window.open("/api/profile/history", "_blank")}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                >
                  View Update History
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                📝 Todos
              </h3>
              <p className="text-gray-600 mb-4">
                Manage your tasks and stay organized
              </p>
              <a
                href="/todos"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors inline-block"
              >
                View Todos
              </a>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                👥 Users
              </h3>
              <p className="text-gray-600 mb-4">
                Browse and manage user accounts
              </p>
              <a
                href="/users"
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors inline-block"
              >
                View Users
              </a>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                🏠 Dashboard
              </h3>
              <p className="text-gray-600 mb-4">Return to the main dashboard</p>
              <a
                href="/"
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors inline-block"
              >
                Go to Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
