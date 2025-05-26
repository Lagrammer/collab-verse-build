
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader, Upload, X } from 'lucide-react';
import { ideaService } from '@/services/ideaService';

interface ShareIdeaModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ShareIdeaModal: React.FC<ShareIdeaModalProps> = ({ open, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    description: '',
    isOpenForContribution: false,
  });
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      isOpenForContribution: checked
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }
    setImages(prev => [...prev, ...files]);
    setError(null);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description.trim()) {
      setError('Please describe your idea');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await ideaService.createIdea({
        description: formData.description,
        images: images.length > 0 ? images : undefined,
        is_open_for_contribution: formData.isOpenForContribution,
      });
      
      // Reset form
      setFormData({
        description: '',
        isOpenForContribution: false,
      });
      setImages([]);
      onSuccess();
    } catch (error) {
      setError(error.message || 'Failed to share idea');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        description: '',
        isOpenForContribution: false,
      });
      setImages([]);
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Share Your Idea</DialogTitle>
          <DialogDescription>
            Share your innovative idea with the community and get feedback from others.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="description">Describe Your Idea *</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Tell us about your innovative idea, what problem it solves, and how it works..."
              value={formData.description}
              onChange={handleInputChange}
              required
              disabled={loading}
              className="min-h-[120px]"
            />
            <p className="text-sm text-muted-foreground">
              Be descriptive and explain the value your idea brings.
            </p>
          </div>

          <div className="space-y-4">
            <Label>Images (Optional)</Label>
            <div className="space-y-3">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                disabled={loading || images.length >= 5}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
              
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-20 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        disabled={loading}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <p className="text-sm text-muted-foreground">
                Upload up to 5 images to help visualize your idea.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="open-for-contribution"
              checked={formData.isOpenForContribution}
              onCheckedChange={handleSwitchChange}
              disabled={loading}
            />
            <Label htmlFor="open-for-contribution" className="text-sm">
              Open for collaboration
            </Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Allow others to request to contribute to your idea.
          </p>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.description.trim()}
              className="flex-1"
            >
              {loading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              {loading ? "Sharing..." : "Share Idea"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ShareIdeaModal;
