"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, User, Lock, Save } from "lucide-react";
import { getUser } from "@/lib/auth";
import {
  useV1ProfileUpdatePartialUpdate,
  useV1ChangePasswordCreate,
} from "../../client/gen/sales/v1/v1";
import type { UserProfile } from "../../client/gen/sales/userProfile";

export default function SettingsPage() {
  const [userInfo, setUserInfo] = useState<Partial<UserProfile>>({});
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);

  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { trigger: updateProfile } = useV1ProfileUpdatePartialUpdate();
  const { trigger: changePassword } = useV1ChangePasswordCreate();

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoadingUser(true);
        const user = await getUser();
        setUserData(user);
        setUserInfo({
          first_name: user.first_name || "",
          last_name: user.last_name || "",
        });
        setError(null);
      } catch (err: any) {
        console.error("Failed to load user data:", err);
        setError("Failed to load user data");
      } finally {
        setIsLoadingUser(false);
      }
    };

    loadUserData();
  }, []);

  const refreshUser = async () => {
    try {
      const user = await getUser();
      setUserData(user);
      setUserInfo({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
      });
    } catch (err: any) {
      console.error("Failed to refresh user data:", err);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInfo.first_name?.trim() && !userInfo.last_name?.trim()) {
      toast.error("At least one name field is required");
      return;
    }

    setIsLoadingProfile(true);
    try {
      await updateProfile({
        first_name: userInfo.first_name?.trim() || "",
        last_name: userInfo.last_name?.trim() || "",
      });
      toast.success("Profile updated successfully");
      refreshUser();
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwords.oldPassword) {
      toast.error("Current password is required");
      return;
    }
    if (!passwords.newPassword) {
      toast.error("New password is required");
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwords.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }

    setIsLoadingPassword(true);
    try {
      await changePassword({
        old_password: passwords.oldPassword,
        new_password: passwords.newPassword,
      });
      toast.success("Password changed successfully");
      setPasswords({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error("Failed to change password:", error);
      const errorMessage =
        error?.response?.data?.detail ||
        error?.message ||
        "Failed to change password";
      toast.error(errorMessage);
    } finally {
      setIsLoadingPassword(false);
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">
              {error}. Please try refreshing the page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-secondary-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      {/* User Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userData && !isLoadingUser ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={userData.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Email cannot be changed
                  </p>
                </div>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={userData.username}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Username cannot be changed
                  </p>
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={userData.role}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              <Separator />

              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={userInfo.first_name || ""}
                      onChange={(e) =>
                        setUserInfo({ ...userInfo, first_name: e.target.value })
                      }
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={userInfo.last_name || ""}
                      onChange={(e) =>
                        setUserInfo({ ...userInfo, last_name: e.target.value })
                      }
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>
                <Button type="submit" disabled={isLoadingProfile}>
                  {isLoadingProfile ? (
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Update Profile
                </Button>
              </form>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin h-8 w-8" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Password Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <Label htmlFor="oldPassword">Current Password</Label>
              <Input
                id="oldPassword"
                type="password"
                value={passwords.oldPassword}
                onChange={(e) =>
                  setPasswords({ ...passwords, oldPassword: e.target.value })
                }
                placeholder="Enter your current password"
                required
              />
            </div>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwords.newPassword}
                onChange={(e) =>
                  setPasswords({ ...passwords, newPassword: e.target.value })
                }
                placeholder="Enter your new password"
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                Password must be at least 8 characters long
              </p>
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwords.confirmPassword}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    confirmPassword: e.target.value,
                  })
                }
                placeholder="Confirm your new password"
                required
              />
            </div>
            <Button type="submit" disabled={isLoadingPassword}>
              {isLoadingPassword ? (
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
              ) : (
                <Lock className="mr-2 h-4 w-4" />
              )}
              Change Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
