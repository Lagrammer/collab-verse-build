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

interface UserProfile {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  profile_picture?: string;
  date_joined: string;
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
      
      // Try to fetch from backend first
      const response = await apiClient.get<UserProfile>('/auth/profile/');
      console.log('Profile fetched successfully:', response);
      setProfile(response);
    } catch (error) {
      console.error('Failed to fetch profile from backend:', error);
      
      // Fallback to mock data if backend is unavailable
      console.log('Using mock profile data as fallback');
      const mockProfile: UserProfile = {
        id: 1,
        email: 'user@example.com',
        firstname: 'John',
        lastname: 'Doe',
        profile_picture: 'https://i.pravatar.cc/100?img=33',
        date_joined: '2024-01-15T10:30:00Z'
      };
      setProfile(mockProfile);
      toast.error('Using offline mode - changes will not be saved');
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
                  <AvatarImage src={profile.profile_picture} alt={`${profile.firstname} ${profile.lastname}`} />
                  <AvatarFallback className="text-lg">
                    {profile.firstname.charAt(0)}{profile.lastname.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-2xl">{profile.firstname} {profile.lastname}</CardTitle>
                  <CardDescription className="text-base">{profile.email}</CardDescription>
                  <p className="text-sm text-muted-foreground mt-1">
                    Member since {new Date(profile.date_joined).toLocaleDateString()}
                  </p>
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
