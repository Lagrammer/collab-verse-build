
import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, User, Clock, MessageSquare, CheckCheck, Eye } from 'lucide-react';
import ShareIdeaModal from '@/components/ideas/ShareIdeaModal';
import IdeaCard from '@/components/ideas/IdeaCard';
import { ideaService, Idea } from '@/services/ideaService';
import { toast } from '@/components/ui/sonner';
import { STORAGE_KEYS } from '@/config/api';

const Index = () => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch all ideas
  const { data: allIdeas = [], isLoading: isLoadingAll, error: errorAll } = useQuery({
    queryKey: ['ideas'],
    queryFn: async () => {
      try {
        return await ideaService.getIdeas();
      } catch (error) {
        if (error.status === 401 || error.status === 403) {
          console.log('Authentication error in ideas fetch - redirecting to login');
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER_DATA);
          navigate('/login');
          throw error;
        }
        throw error;
      }
    },
  });

  // Fetch ideas for contribution
  const { data: contributionIdeas = [], isLoading: isLoadingContribution, error: errorContribution } = useQuery({
    queryKey: ['ideas-for-contribution'],
    queryFn: async () => {
      try {
        return await ideaService.getIdeasForContribution();
      } catch (error) {
        if (error.status === 401 || error.status === 403) {
          console.log('Authentication error in contribution ideas fetch - redirecting to login');
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER_DATA);
          navigate('/login');
          throw error;
        }
        throw error;
      }
    },
  });

  const handleIdeaCreated = () => {
    console.log('Idea created - refreshing queries');
    queryClient.invalidateQueries({ queryKey: ['ideas'] });
    queryClient.invalidateQueries({ queryKey: ['ideas-for-contribution'] });
    setShowShareModal(false);
  };

  const handleApproveIdea = async (slug: string) => {
    try {
      await ideaService.approveIdea(slug);
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
      queryClient.invalidateQueries({ queryKey: ['ideas-for-contribution'] });
    } catch (error) {
      // Error already handled in service
    }
  };

  if (errorAll || errorContribution) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-destructive">Failed to load ideas</p>
            <Button 
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['ideas'] });
                queryClient.invalidateQueries({ queryKey: ['ideas-for-contribution'] });
              }} 
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 overflow-auto">
        <div className="p-6 max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Community Ideas</h1>
              <p className="text-muted-foreground">
                Discover and share innovative ideas with the community
              </p>
            </div>
            <Button onClick={() => setShowShareModal(true)} className="flex items-center gap-2">
              <Plus size={16} />
              Share Your Idea
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Eye size={16} />
                All Ideas ({allIdeas.length})
              </TabsTrigger>
              <TabsTrigger value="contribution" className="flex items-center gap-2">
                <User size={16} />
                Open for Contribution ({contributionIdeas.length})
              </TabsTrigger>
            </TabsList>

            {/* All Ideas Tab */}
            <TabsContent value="all">
              {isLoadingAll ? (
                <div className="grid gap-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded-full"></div>
                          <div className="space-y-2">
                            <div className="w-24 h-4 bg-muted rounded"></div>
                            <div className="w-16 h-3 bg-muted rounded"></div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="w-full h-4 bg-muted rounded"></div>
                          <div className="w-3/4 h-4 bg-muted rounded"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : allIdeas.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <div className="space-y-4">
                      <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                        <Plus size={24} className="text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">No ideas yet</h3>
                        <p className="text-muted-foreground">
                          Be the first to share an innovative idea with the community!
                        </p>
                      </div>
                      <Button onClick={() => setShowShareModal(true)}>
                        Share Your First Idea
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {allIdeas.map((idea) => (
                    <IdeaCard 
                      key={idea.id} 
                      idea={idea} 
                      onApprove={() => handleApproveIdea(idea.slug)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Contribution Ideas Tab */}
            <TabsContent value="contribution">
              {isLoadingContribution ? (
                <div className="grid gap-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded-full"></div>
                          <div className="space-y-2">
                            <div className="w-24 h-4 bg-muted rounded"></div>
                            <div className="w-16 h-3 bg-muted rounded"></div>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              ) : contributionIdeas.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <div className="space-y-4">
                      <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                        <User size={24} className="text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">No contribution opportunities</h3>
                        <p className="text-muted-foreground">
                          No ideas are currently open for collaboration.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {contributionIdeas.map((idea) => (
                    <IdeaCard 
                      key={idea.id} 
                      idea={idea} 
                      onApprove={() => handleApproveIdea(idea.slug)}
                      showContributionButton
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Share Idea Modal */}
          <ShareIdeaModal 
            open={showShareModal}
            onClose={() => setShowShareModal(false)}
            onSuccess={handleIdeaCreated}
          />
        </div>
      </div>
    </Layout>
  );
};

export default Index;
