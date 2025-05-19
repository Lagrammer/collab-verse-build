
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader, Check, X, Calendar } from 'lucide-react';
import contributionService, { ContributionRequest } from '@/services/contributionService';

const ReceivedContributions = () => {
  const navigate = useNavigate();
  const [contributions, setContributions] = useState<ContributionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchContributions = async () => {
      try {
        const data = await contributionService.getReceivedRequests();
        setContributions(data);
      } catch (err) {
        setError('Failed to load contribution requests. Please try again later.');
        console.error('Error fetching contributions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContributions();
  }, []);

  const handleApproveRequest = async (requestId: number) => {
    setProcessingId(requestId);
    try {
      await contributionService.approveRequest(requestId);
      // Update the status in the local state
      setContributions(prevContributions => 
        prevContributions.map(contribution => 
          contribution.id === requestId 
            ? { ...contribution, status: 'approved' } 
            : contribution
        )
      );
    } catch (err) {
      console.error('Error approving request:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    setProcessingId(requestId);
    try {
      await contributionService.rejectRequest(requestId);
      // Update the status in the local state
      setContributions(prevContributions => 
        prevContributions.map(contribution => 
          contribution.id === requestId 
            ? { ...contribution, status: 'rejected' } 
            : contribution
        )
      );
    } catch (err) {
      console.error('Error rejecting request:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const pendingContributions = contributions.filter(c => c.status === 'pending');
  const approvedContributions = contributions.filter(c => c.status === 'approved');
  const rejectedContributions = contributions.filter(c => c.status === 'rejected');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const renderContributionCard = (contribution: ContributionRequest) => (
    <Card key={contribution.id} className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-secondary overflow-hidden">
              {contribution.requesting_user.profile_picture && (
                <img
                  src={contribution.requesting_user.profile_picture}
                  alt={contribution.requesting_user.username}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div>
              <h3 className="font-medium">{contribution.requesting_user.username}</h3>
              <div className="flex items-center text-xs text-muted-foreground">
                <Calendar className="h-3 w-3 mr-1" /> 
                {formatDate(contribution.created_at)}
              </div>
            </div>
          </div>
          <Badge
            variant={
              contribution.status === 'approved' 
                ? 'default' 
                : contribution.status === 'rejected' 
                  ? 'destructive' 
                  : 'outline'
            }
          >
            {contribution.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{contribution.idea_description}</p>
        
        {contribution.idea_images.length > 0 && (
          <div className="mt-3 flex space-x-2 overflow-x-auto pb-2">
            {contribution.idea_images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Idea image ${index + 1}`}
                className="h-24 w-auto rounded object-cover"
              />
            ))}
          </div>
        )}
      </CardContent>
      {contribution.status === 'pending' && (
        <CardFooter className="flex justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRejectRequest(contribution.id)}
            disabled={processingId === contribution.id}
          >
            {processingId === contribution.id ? <Loader className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 mr-1" />}
            Reject
          </Button>
          <Button
            size="sm"
            onClick={() => handleApproveRequest(contribution.id)}
            disabled={processingId === contribution.id}
          >
            {processingId === contribution.id ? <Loader className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
            Approve
          </Button>
        </CardFooter>
      )}
    </Card>
  );

  return (
    <Layout>
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Contribution Requests</h1>
            <Button onClick={() => navigate('/contributions/sent')}>
              View Sent Requests
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <Card className="mb-4 bg-red-500/10 border-red-500/20">
              <CardContent className="p-4 text-center">
                <p className="text-red-500">{error}</p>
                <Button onClick={() => window.location.reload()} className="mt-2">
                  Retry
                </Button>
              </CardContent>
            </Card>
          ) : contributions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <h3 className="text-lg font-medium mb-2">No contribution requests yet</h3>
                <p className="text-muted-foreground">
                  When someone requests to contribute to one of your ideas, you'll see it here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="pending">
              <TabsList className="mb-4">
                <TabsTrigger value="pending">
                  Pending ({pendingContributions.length})
                </TabsTrigger>
                <TabsTrigger value="approved">
                  Approved ({approvedContributions.length})
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  Rejected ({rejectedContributions.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="pending">
                {pendingContributions.length === 0 ? (
                  <p className="text-center py-6 text-muted-foreground">No pending requests</p>
                ) : (
                  pendingContributions.map(renderContributionCard)
                )}
              </TabsContent>
              
              <TabsContent value="approved">
                {approvedContributions.length === 0 ? (
                  <p className="text-center py-6 text-muted-foreground">No approved requests</p>
                ) : (
                  approvedContributions.map(renderContributionCard)
                )}
              </TabsContent>
              
              <TabsContent value="rejected">
                {rejectedContributions.length === 0 ? (
                  <p className="text-center py-6 text-muted-foreground">No rejected requests</p>
                ) : (
                  rejectedContributions.map(renderContributionCard)
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ReceivedContributions;
