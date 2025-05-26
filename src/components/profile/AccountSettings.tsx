
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Loader, Shield, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import apiClient from '@/lib/apiClient';
import authService from '@/services/authService';

interface UserProfile {
  slug?: string;
  username?: string;
  first_name: string;
  last_name: string;
  email: string;
  country?: string;
  city?: string;
  bio?: string;
  profile_picture?: string;
  github_profile?: string;
  linkedin_profile?: string;
  portfolio_url?: string;
  skills?: Array<{ id: number; name: string }>;
}

interface AccountSettingsProps {
  profile: UserProfile;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ profile }) => {
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError(null);

    // Validation
    if (passwordData.new_password !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      setPasswordLoading(false);
      return;
    }

    if (passwordData.new_password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      setPasswordLoading(false);
      return;
    }

    try {
      console.log('Changing password...');
      
      // Use the correct backend endpoint for password change
      await apiClient.patch('/profile/change-password/', {
        old_password: passwordData.old_password,
        new_password: passwordData.new_password
      });
      
      console.log('Password changed successfully');
      setPasswordData({
        old_password: '',
        new_password: '',
        confirmPassword: '',
      });
      toast.success('Password changed successfully!');
    } catch (error) {
      console.error('Failed to change password:', error);
      
      // Handle authentication errors
      if (error.status === 401 || error.status === 403) {
        setPasswordError('Session expired. Please login again.');
        toast.error('Session expired. Please login again.');
        return;
      }
      
      const errorMessage = error.message || 'Failed to change password';
      
      if (errorMessage.includes('Backend currently unavailable') || errorMessage.includes('Request timeout')) {
        toast.warning('Password change failed - backend unavailable. Please try again later.');
      } else {
        setPasswordError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    setDeleteLoading(true);

    try {
      console.log('Deleting account...');
      
      // Note: Backend doesn't seem to have delete account endpoint
      // This would need to be implemented on the backend
      toast.error('Account deletion is not available at this time. Please contact support.');
    } catch (error) {
      console.error('Failed to delete account:', error);
      toast.error('Failed to delete account');
    } finally {
      setDeleteLoading(false);
    }
  };

  const canChangePassword = 
    passwordData.old_password && 
    passwordData.new_password && 
    passwordData.confirmPassword;

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield size={20} />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your password to keep your account secure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {passwordError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{passwordError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="old_password">Current Password</Label>
              <Input
                id="old_password"
                name="old_password"
                type="password"
                value={passwordData.old_password}
                onChange={handlePasswordChange}
                required
                disabled={passwordLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new_password">New Password</Label>
              <Input
                id="new_password"
                name="new_password"
                type="password"
                value={passwordData.new_password}
                onChange={handlePasswordChange}
                required
                disabled={passwordLoading}
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
                disabled={passwordLoading}
                minLength={8}
              />
            </div>

            <Button 
              type="submit" 
              disabled={passwordLoading || !canChangePassword}
              className="w-full"
            >
              {passwordLoading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
              {passwordLoading ? "Changing Password..." : "Change Password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Your account details and membership information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Username</Label>
              <p className="text-sm text-muted-foreground">
                {profile.username || 'Not set'}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Email</Label>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
            </div>
          </div>
          
          {profile.slug && (
            <div>
              <Label className="text-sm font-medium">Profile Slug</Label>
              <p className="text-sm text-muted-foreground">{profile.slug}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle size={20} />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions that will permanently affect your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Account deletion is currently not available. Please contact support if you need to delete your account.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountSettings;
