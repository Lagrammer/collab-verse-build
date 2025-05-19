
import apiClient from '@/lib/apiClient';
import { toast } from '@/components/ui/sonner';

export interface Idea {
  id: number;
  creator: {
    id: number;
    username: string;
  };
  description: string;
  slug: string;
  images: string[];
  request_status?: string;
  latest_approver?: {
    id: number;
    username: string;
  };
  approve_count: number;
  comment_count: number;
  created_at: string;
}

export interface CreateIdeaRequest {
  description: string;
  images?: File[];
}

/**
 * Service for handling idea-related API calls
 */
export const ideaService = {
  /**
   * Get all ideas
   */
  async getAllIdeas(): Promise<Idea[]> {
    try {
      return await apiClient.get<Idea[]>('/ideas/');
    } catch (error) {
      toast.error('Failed to fetch ideas: ' + (error.message || 'Something went wrong'));
      throw error;
    }
  },
  
  /**
   * Get ideas available for contribution
   */
  async getIdeasForContribution(): Promise<Idea[]> {
    try {
      return await apiClient.get<Idea[]>('/ideas/for-contribution/');
    } catch (error) {
      toast.error('Failed to fetch ideas for contribution: ' + (error.message || 'Something went wrong'));
      throw error;
    }
  },
  
  /**
   * Get a single idea by slug
   */
  async getIdeaBySlug(slug: string): Promise<Idea> {
    try {
      return await apiClient.get<Idea>(`/ideas/${slug}/`);
    } catch (error) {
      toast.error('Failed to fetch idea: ' + (error.message || 'Something went wrong'));
      throw error;
    }
  },
  
  /**
   * Create a new idea
   */
  async createIdea(idea: CreateIdeaRequest): Promise<Idea> {
    try {
      // Handle file uploads with FormData
      const formData = new FormData();
      formData.append('description', idea.description);
      
      if (idea.images && idea.images.length) {
        idea.images.forEach((image, index) => {
          formData.append(`images[${index}]`, image);
        });
      }
      
      return await apiClient.post<Idea>('/ideas/', formData, {
        headers: {
          // Remove Content-Type to let the browser set it with the correct boundary
          'Content-Type': undefined,
        },
      });
    } catch (error) {
      toast.error('Failed to create idea: ' + (error.message || 'Something went wrong'));
      throw error;
    }
  },
  
  /**
   * Approve an idea
   */
  async approveIdea(slug: string): Promise<any> {
    try {
      return await apiClient.post(`/ideas/${slug}/approve/`);
    } catch (error) {
      toast.error('Failed to approve idea: ' + (error.message || 'Something went wrong'));
      throw error;
    }
  },
  
  /**
   * Delete an idea
   */
  async deleteIdea(slug: string): Promise<void> {
    try {
      await apiClient.delete(`/ideas/${slug}/`);
      toast.success('Idea deleted successfully');
    } catch (error) {
      toast.error('Failed to delete idea: ' + (error.message || 'Something went wrong'));
      throw error;
    }
  },
};

export default ideaService;
