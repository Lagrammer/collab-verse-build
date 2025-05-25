
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, Upload, Trash2, Loader } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface ProfilePictureUploadProps {
  currentPicture?: string;
  onUpdate: (data: { profile_picture: string }) => void;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({ 
  currentPicture, 
  onUpdate 
}) => {
  const [preview, setPreview] = useState<string | null>(currentPicture || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setError(null);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!preview || preview === currentPicture) return;

    setLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual file upload when backend is ready
      // const formData = new FormData();
      // formData.append('profile_picture', file);
      // const response = await apiClient.post('/auth/upload-avatar/', formData);
      
      // Simulate upload for now
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onUpdate({ profile_picture: preview });
      toast.success('Profile picture updated successfully!');
    } catch (error) {
      const errorMessage = error.message || 'Failed to upload profile picture';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual API call when backend is ready
      // await apiClient.delete('/auth/remove-avatar/');
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPreview(null);
      onUpdate({ profile_picture: '' });
      toast.success('Profile picture removed successfully!');
    } catch (error) {
      const errorMessage = error.message || 'Failed to remove profile picture';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = preview !== currentPicture;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Picture</CardTitle>
        <CardDescription>
          Upload a new profile picture or remove the current one.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-32 w-32">
            <AvatarImage src={preview || ''} alt="Profile picture" />
            <AvatarFallback className="text-2xl">
              <Camera size={32} />
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Upload size={16} />
              Choose Photo
            </Button>

            {preview && (
              <>
                {hasChanges && (
                  <Button
                    onClick={handleUpload}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    {loading ? <Loader className="h-4 w-4 animate-spin" /> : <Upload size={16} />}
                    {loading ? "Uploading..." : "Save Changes"}
                  </Button>
                )}

                <Button
                  variant="destructive"
                  onClick={handleRemove}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Remove
                </Button>
              </>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="text-center text-sm text-muted-foreground">
            <p>Recommended: Square image, at least 200x200 pixels</p>
            <p>Maximum file size: 5MB</p>
            <p>Supported formats: JPG, PNG, GIF</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfilePictureUpload;
