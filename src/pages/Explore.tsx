
import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { ideaService, Idea } from '@/services/ideaService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ThumbsUpIcon, MessageCircleIcon, CalendarIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const Explore: React.FC = () => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        setLoading(true);
        const fetchedIdeas = await ideaService.getIdeasForContribution();
        setIdeas(fetchedIdeas);
        setError(null);
      } catch (err) {
        setError('Failed to load ideas. Please try again later.');
        console.error('Error fetching ideas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchIdeas();
  }, []);

  const handleApprove = async (slug: string) => {
    try {
      await ideaService.approveIdea(slug);
      // Refresh ideas after approval
      const updatedIdeas = await ideaService.getIdeasForContribution();
      setIdeas(updatedIdeas);
    } catch (error) {
      console.error('Error approving idea:', error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-4 w-full">
          <h1 className="text-2xl font-bold mb-6">Explore Ideas</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="w-full">
                <CardHeader>
                  <Skeleton className="h-5 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-1/3" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-24 w-full mb-4" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-24 mr-2" />
                  <Skeleton className="h-10 w-24" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-full p-6">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 w-full">
        <h1 className="text-2xl font-bold mb-6">Explore Ideas</h1>
        {ideas.length === 0 ? (
          <div className="text-center p-12">
            <h2 className="text-xl font-semibold mb-2">No ideas available right now</h2>
            <p className="text-gray-400 mb-4">Check back later or create your own idea!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ideas.map((idea) => (
              <Card key={idea.id} className="w-full hover:border-primary transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{idea.creator.username}'s Idea</span>
                    <div className="flex items-center text-xs text-gray-400">
                      <CalendarIcon size={14} className="mr-1" />
                      <span>{formatDistanceToNow(new Date(idea.created_at), { addSuffix: true })}</span>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    {/* Truncate the description if it's too long */}
                    {idea.description.length > 150 
                      ? `${idea.description.substring(0, 150)}...` 
                      : idea.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {idea.images && idea.images.length > 0 && (
                    <div className="flex mb-4 overflow-x-auto gap-2">
                      {idea.images.map((image, index) => (
                        <img 
                          key={index} 
                          src={image} 
                          alt={`Idea image ${index + 1}`} 
                          className="h-32 rounded-md object-cover"
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <ThumbsUpIcon size={16} className="mr-1 text-blue-500" />
                      <span>{idea.approve_count}</span>
                    </div>
                    <div className="flex items-center">
                      <MessageCircleIcon size={16} className="mr-1 text-green-500" />
                      <span>{idea.comment_count}</span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleApprove(idea.slug)}
                    variant="default"
                    size="sm"
                  >
                    Approve
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Explore;
