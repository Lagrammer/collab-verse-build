
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Settings, Camera, Shield } from 'lucide-react';
import Layout from '@/components/Layout';
import EditProfileForm from '@/components/profile/EditProfileForm';
import AccountSettings from '@/components/profile/AccountSettings';
import ProfilePictureUpload from '@/components/profile/ProfilePictureUpload';
import apiClient from '@/lib/apiClient';
import { toast } from '@/components/ui/sonner';
import { STORAGE_KEYS } from '@/config/api';

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

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      console.log('Fetching user profile from backend...');
      
      // Check if we have valid tokens first
      const accessToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      
      if (!accessToken || !refreshToken) {
        console.log('No tokens found - redirecting to login');
        navigate('/login');
        return;
      }
      
      const response = await apiClient.get<UserProfile>('/profile/me/');
      console.log('Profile fetched successfully:', response);
      setProfile(response);
    } catch (error) {
      console.error('Failed to fetch profile from backend:', error);
      
      // Check if it's an authentication error
      if (error.status === 401 || error.status === 403) {
        console.log('Authentication error - clearing tokens and redirecting to login');
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        toast.error('Session expired. Please login again.');
        navigate('/login');
        return;
      }
      
      // For other errors, show error message but don't redirect
      console.log('Non-auth error, staying on profile page');
      toast.error('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = (updatedData: Partial<UserProfile>) => {
    if (profile) {
      setProfile({ ...profile, ...updatedData });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-destructive">Failed to load profile</p>
            <Button onClick={fetchProfile} className="mt-4">Retry</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profile Header */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile.profile_picture} alt={`${profile.first_name} ${profile.last_name}`} />
                  <AvatarFallback className="text-lg">
                    {profile.first_name?.charAt(0) || ''}{profile.last_name?.charAt(0) || ''}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-2xl">{profile.first_name} {profile.last_name}</CardTitle>
                  <CardDescription className="text-base">{profile.email}</CardDescription>
                  {profile.username && (
                    <p className="text-sm text-muted-foreground mt-1">@{profile.username}</p>
                  )}
                  {profile.bio && (
                    <p className="text-sm mt-2">{profile.bio}</p>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Profile Management Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User size={16} />
                Profile Info
              </TabsTrigger>
              <TabsTrigger value="picture" className="flex items-center gap-2">
                <Camera size={16} />
                Profile Picture
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Shield size={16} />
                Account Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <EditProfileForm 
                profile={profile} 
                onUpdate={handleProfileUpdate}
                onSuccess={fetchProfile}
              />
            </TabsContent>

            <TabsContent value="picture">
              <ProfilePictureUpload 
                currentPicture={profile.profile_picture}
                onUpdate={handleProfileUpdate}
              />
            </TabsContent>

            <TabsContent value="settings">
              <AccountSettings profile={profile} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
