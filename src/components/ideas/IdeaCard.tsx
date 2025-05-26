
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CheckCheck, MessageSquare, Clock, User, Eye } from 'lucide-react';
import { Idea } from '@/services/ideaService';
import { contributionService } from '@/services/contributionService';
import { toast } from '@/components/ui/sonner';

interface IdeaCardProps {
  idea: Idea;
  onApprove?: () => void;
  showContributionButton?: boolean;
}

const IdeaCard: React.FC<IdeaCardProps> = ({ 
  idea, 
  onApprove, 
  showContributionButton = false 
}) => {
  const [isRequesting, setIsRequesting] = useState(false);

  const handleApprove = () => {
    if (onApprove) {
      onApprove();
    }
  };

  const handleRequestContribution = async () => {
    setIsRequesting(true);
    try {
      await contributionService.sendContributionRequest(idea.slug);
      toast.success('Contribution request sent successfully!');
    } catch (error) {
      // Error already handled in service
    } finally {
      setIsRequesting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={idea.creator.profile_picture} alt={idea.creator.username} />
              <AvatarFallback>
                {idea.creator.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{idea.creator.username}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock size={12} />
                {formatDate(idea.created_at)}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {idea.is_open_for_contribution && (
              <Badge variant="secondary">Open for Collaboration</Badge>
            )}
            {idea.request_status === 'approved' && (
              <Badge variant="default" className="bg-green-500">
                <CheckCheck size={12} className="mr-1" />
                Approved
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed">{idea.description}</p>
        
        {idea.images && idea.images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {idea.images.slice(0, 3).map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Idea image ${index + 1}`}
                className="w-full h-24 object-cover rounded border"
              />
            ))}
            {idea.images.length > 3 && (
              <div className="w-full h-24 bg-muted rounded border flex items-center justify-center text-sm text-muted-foreground">
                +{idea.images.length - 3} more
              </div>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <CheckCheck size={14} />
              {idea.approve_count} approvals
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare size={14} />
              {idea.comment_count} comments
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!idea.is_approved_by_user && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleApprove}
                className="flex items-center gap-1"
              >
                <CheckCheck size={14} />
                Approve
              </Button>
            )}
            
            {showContributionButton && idea.is_open_for_contribution && (
              <Button
                variant="default"
                size="sm"
                onClick={handleRequestContribution}
                disabled={isRequesting}
                className="flex items-center gap-1"
              >
                <User size={14} />
                {isRequesting ? 'Requesting...' : 'Request to Contribute'}
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1"
            >
              <Eye size={14} />
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IdeaCard;
