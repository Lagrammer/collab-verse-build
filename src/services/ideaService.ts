
import apiClient from '@/lib/apiClient';
import { toast } from '@/components/ui/sonner';

export interface User {
  id: number;
  username: string;
  profile_picture?: string;
}

export interface Idea {
  id: number;
  slug: string;
  description: string;
  images: string[];
  creator: User;
  request_status?: 'pending' | 'approved' | 'rejected';
  latest_approver?: User;
  approve_count: number;
  comment_count: number;
  created_at: string;
  is_approved_by_user?: boolean;
  is_open_for_contribution?: boolean;
}

export interface Comment {
  id: number;
  content: string;
  author: User;
  created_at: string;
  likes_count: number;
  is_liked_by_user: boolean;
  replies_count: number;
}

export interface CreateIdeaRequest {
  description: string;
  images?: File[];
  is_open_for_contribution?: boolean;
}

export interface CreateCommentRequest {
  content: string;
}

/**
 * Service for handling idea-related API calls
 */
export const ideaService = {
  /**
   * Get all ideas
   */
  async getIdeas(): Promise<Idea[]> {
    try {
      const response = await apiClient.get<Idea[]>('/ideas/');
      return response;
    } catch (error) {
      console.error('Failed to fetch ideas:', error);
      toast.error('Failed to load ideas');
      throw error;
    }
  },

  /**
   * Get ideas available for contribution
   */
  async getIdeasForContribution(): Promise<Idea[]> {
    try {
      const response = await apiClient.get<Idea[]>('/ideas/for-contribution/');
      return response;
    } catch (error) {
      console.error('Failed to fetch ideas for contribution:', error);
      toast.error('Failed to load contribution opportunities');
      throw error;
    }
  },

  /**
   * Get a single idea by slug
   */
  async getIdea(slug: string): Promise<Idea> {
    try {
      const response = await apiClient.get<Idea>(`/ideas/${slug}/`);
      return response;
    } catch (error) {
      console.error('Failed to fetch idea:', error);
      toast.error('Failed to load idea');
      throw error;
    }
  },

  /**
   * Create a new idea
   */
  async createIdea(data: CreateIdeaRequest): Promise<Idea> {
    try {
      const formData = new FormData();
      formData.append('description', data.description);
      
      if (data.is_open_for_contribution !== undefined) {
        formData.append('is_open_for_contribution', data.is_open_for_contribution.toString());
      }
      
      if (data.images) {
        data.images.forEach((image, index) => {
          formData.append(`images`, image);
        });
      }

      const response = await apiClient.post<Idea>('/ideas/', formData);
      toast.success('Idea shared successfully!');
      return response;
    } catch (error) {
      console.error('Failed to create idea:', error);
      toast.error('Failed to share idea');
      throw error;
    }
  },

  /**
   * Update an idea
   */
  async updateIdea(slug: string, data: Partial<CreateIdeaRequest>): Promise<Idea> {
    try {
      const formData = new FormData();
      
      if (data.description) {
        formData.append('description', data.description);
      }
      
      if (data.is_open_for_contribution !== undefined) {
        formData.append('is_open_for_contribution', data.is_open_for_contribution.toString());
      }
      
      if (data.images) {
        data.images.forEach((image, index) => {
          formData.append(`images`, image);
        });
      }

      const response = await apiClient.patch<Idea>(`/ideas/${slug}/`, formData);
      toast.success('Idea updated successfully!');
      return response;
    } catch (error) {
      console.error('Failed to update idea:', error);
      toast.error('Failed to update idea');
      throw error;
    }
  },

  /**
   * Delete an idea
   */
  async deleteIdea(slug: string): Promise<void> {
    try {
      await apiClient.delete(`/ideas/${slug}/`);
      toast.success('Idea deleted successfully!');
    } catch (error) {
      console.error('Failed to delete idea:', error);
      toast.error('Failed to delete idea');
      throw error;
    }
  },

  /**
   * Approve an idea
   */
  async approveIdea(slug: string): Promise<void> {
    try {
      await apiClient.post(`/ideas/${slug}/approve/`);
      toast.success('Idea approved!');
    } catch (error) {
      console.error('Failed to approve idea:', error);
      toast.error('Failed to approve idea');
      throw error;
    }
  },

  /**
   * Get comments for an idea
   */
  async getIdeaComments(slug: string): Promise<Comment[]> {
    try {
      const response = await apiClient.get<Comment[]>(`/ideas/${slug}/comments/`);
      return response;
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      toast.error('Failed to load comments');
      throw error;
    }
  },

  /**
   * Add a comment to an idea
   */
  async addComment(slug: string, data: CreateCommentRequest): Promise<Comment> {
    try {
      const response = await apiClient.post<Comment>(`/ideas/${slug}/comments/`, data);
      toast.success('Comment added successfully!');
      return response;
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast.error('Failed to add comment');
      throw error;
    }
  },

  /**
   * Like a comment
   */
  async likeComment(commentId: number): Promise<void> {
    try {
      await apiClient.post(`/ideas/comments/${commentId}/like/`);
    } catch (error) {
      console.error('Failed to like comment:', error);
      toast.error('Failed to like comment');
      throw error;
    }
  },

  /**
   * Delete a comment
   */
  async deleteComment(commentId: number): Promise<void> {
    try {
      await apiClient.delete(`/ideas/comments/${commentId}/delete/`);
      toast.success('Comment deleted successfully!');
    } catch (error) {
      console.error('Failed to delete comment:', error);
      toast.error('Failed to delete comment');
      throw error;
    }
  },

  /**
   * Get replies for a comment
   */
  async getCommentReplies(commentId: number): Promise<Comment[]> {
    try {
      const response = await apiClient.get<Comment[]>(`/ideas/comments/${commentId}/replies/`);
      return response;
    } catch (error) {
      console.error('Failed to fetch replies:', error);
      toast.error('Failed to load replies');
      throw error;
    }
  },

  /**
   * Add a reply to a comment
   */
  async addReply(commentId: number, data: CreateCommentRequest): Promise<Comment> {
    try {
      const response = await apiClient.post<Comment>(`/ideas/comments/${commentId}/replies/`, data);
      toast.success('Reply added successfully!');
      return response;
    } catch (error) {
      console.error('Failed to add reply:', error);
      toast.error('Failed to add reply');
      throw error;
    }
  },
};

export default ideaService;
