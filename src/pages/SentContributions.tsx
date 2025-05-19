
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader, ArrowLeft, Calendar, Trash2 } from 'lucide-react';
import contributionService, { ContributionRequest } from '@/services/contributionService';

const SentContributions = () => {
  const navigate = useNavigate();
  const [contributions, setContributions] = useState<ContributionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [withdrawingId, setWithdrawingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchContributions = async () => {
      try {
        const response = await contributionService.getSentRequests();
        if (response && response.contribution_requests) {
          setContributions(response.contribution_requests);
        }
      } catch (err) {
        setError('Failed to load contribution requests. Please try again later.');
        console.error('Error fetching contributions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContributions();
  }, []);

  const handleWithdrawRequest = async (requestId: number) => {
    setWithdrawingId(requestId);
    try {
      await contributionService.withdrawRequest(requestId);
      // Remove the contribution from the local state
      setContributions(prevContributions => 
        prevContributions.filter(contribution => contribution.id !== requestId)
      );
    } catch (err) {
      console.error('Error withdrawing request:', err);
    } finally {
      setWithdrawingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Layout>
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate('/contributions/received')} className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Sent Contribution Requests</h1>
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
                <h3 className="text-lg font-medium mb-2">No sent contribution requests</h3>
                <p className="text-muted-foreground">
                  You haven't sent any contribution requests yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {contributions.map((contribution) => (
                <Card key={contribution.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">Request ID: #{contribution.id}</h3>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" /> 
                          {formatDate(contribution.created_at)}
                        </div>
                      </div>
                      <Badge variant={getStatusBadgeVariant(contribution.status)}>
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
                    <CardFooter className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleWithdrawRequest(contribution.id)}
                        disabled={withdrawingId === contribution.id}
                      >
                        {withdrawingId === contribution.id ? (
                          <Loader className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-1" />
                        )}
                        Withdraw Request
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SentContributions;
