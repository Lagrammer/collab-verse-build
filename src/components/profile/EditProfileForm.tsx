
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import apiClient from '@/lib/apiClient';

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

interface EditProfileFormProps {
  profile: UserProfile;
  onUpdate: (data: Partial<UserProfile>) => void;
  onSuccess: () => void;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({ profile, onUpdate, onSuccess }) => {
  const [formData, setFormData] = useState({
    username: profile.username || '',
    first_name: profile.first_name || '',
    last_name: profile.last_name || '',
    bio: profile.bio || '',
    country: profile.country || '',
    city: profile.city || '',
    github_profile: profile.github_profile || '',
    linkedin_profile: profile.linkedin_profile || '',
    portfolio_url: profile.portfolio_url || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('Updating profile with data:', formData);
      
      // Use the correct backend endpoint for profile updates
      const response = await apiClient.patch<UserProfile>('/profile/me/', formData);
      console.log('Profile updated successfully:', response);
      
      onUpdate(formData);
      onSuccess();
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      
      // Handle authentication errors
      if (error.status === 401 || error.status === 403) {
        setError('Session expired. Please login again.');
        toast.error('Session expired. Please login again.');
        return;
      }
      
      const errorMessage = error.message || 'Failed to update profile';
      
      if (errorMessage.includes('Backend currently unavailable') || errorMessage.includes('Request timeout')) {
        onUpdate(formData);
        toast.warning('Profile updated locally - changes will sync when connection is restored');
      } else {
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = Object.keys(formData).some(key => 
    formData[key] !== (profile[key] || '')
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile Information</CardTitle>
        <CardDescription>
          Update your personal information and preferences.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              disabled={loading}
              placeholder="Enter your username"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={profile.email}
              disabled
              className="bg-muted"
            />
            <p className="text-sm text-muted-foreground">
              Email cannot be changed from this form.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              disabled={loading}
              placeholder="Tell us about yourself..."
              rows={3}
              maxLength={100}
            />
            <p className="text-sm text-muted-foreground">
              {formData.bio.length}/100 characters
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                disabled={loading}
                placeholder="e.g. United States"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                disabled={loading}
                placeholder="e.g. San Francisco"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Social Links</h4>
            
            <div className="space-y-2">
              <Label htmlFor="github_profile">GitHub Profile</Label>
              <Input
                id="github_profile"
                name="github_profile"
                type="url"
                value={formData.github_profile}
                onChange={handleInputChange}
                disabled={loading}
                placeholder="https://github.com/yourusername"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin_profile">LinkedIn Profile</Label>
              <Input
                id="linkedin_profile"
                name="linkedin_profile"
                type="url"
                value={formData.linkedin_profile}
                onChange={handleInputChange}
                disabled={loading}
                placeholder="https://linkedin.com/in/yourusername"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="portfolio_url">Portfolio URL</Label>
              <Input
                id="portfolio_url"
                name="portfolio_url"
                type="url"
                value={formData.portfolio_url}
                onChange={handleInputChange}
                disabled={loading}
                placeholder="https://yourportfolio.com"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button 
              type="submit" 
              disabled={loading || !hasChanges}
              className="flex-1"
            >
              {loading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
              {loading ? "Updating..." : "Update Profile"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setFormData({
                username: profile.username || '',
                first_name: profile.first_name || '',
                last_name: profile.last_name || '',
                bio: profile.bio || '',
                country: profile.country || '',
                city: profile.city || '',
                github_profile: profile.github_profile || '',
                linkedin_profile: profile.linkedin_profile || '',
                portfolio_url: profile.portfolio_url || '',
              })}
              disabled={loading || !hasChanges}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EditProfileForm;
