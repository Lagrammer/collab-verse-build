
import apiClient from '@/lib/apiClient';
import { toast } from '@/components/ui/sonner';

export interface ContributionRequest {
  id: number;
  status: 'pending' | 'approved' | 'rejected';
  idea_description: string;
  idea_images: string[];
  requesting_user: {
    id: number;
    username: string;
    profile_picture?: string;
  };
  created_at: string;
}

/**
 * Service for handling contribution request API calls
 */
export const contributionService = {
  /**
   * Send a contribution request for an idea
   */
  async sendContributionRequest(ideaSlug: string): Promise<ContributionRequest> {
    try {
      const response = await apiClient.post<ContributionRequest>(`/send-contribution-request/${ideaSlug}/`, {});
      toast.success('Contribution request sent successfully!');
      return response;
    } catch (error) {
      console.error('Failed to send contribution request:', error);
      toast.error('Failed to send contribution request');
      throw error;
    }
  },

  /**
   * Get received contribution requests
   */
  async getReceivedRequests(): Promise<ContributionRequest[]> {
    try {
      const response = await apiClient.get<ContributionRequest[]>('/contribution-requests/received/');
      return response;
    } catch (error) {
      console.error('Failed to fetch received requests:', error);
      toast.error('Failed to load received requests');
      throw error;
    }
  },

  /**
   * Get sent contribution requests
   */
  async getSentRequests(): Promise<{ contribution_requests: ContributionRequest[] }> {
    try {
      const response = await apiClient.get<{ contribution_requests: ContributionRequest[] }>('/contribution-requests/sent/');
      return response;
    } catch (error) {
      console.error('Failed to fetch sent requests:', error);
      toast.error('Failed to load sent requests');
      throw error;
    }
  },

  /**
   * Approve a contribution request
   */
  async approveRequest(requestId: number): Promise<void> {
    try {
      await apiClient.post(`/contribution-requests/${requestId}/approve/`);
      toast.success('Contribution request approved!');
    } catch (error) {
      console.error('Failed to approve request:', error);
      toast.error('Failed to approve request');
      throw error;
    }
  },

  /**
   * Reject a contribution request
   */
  async rejectRequest(requestId: number): Promise<void> {
    try {
      await apiClient.post(`/contribution-requests/${requestId}/reject/`);
      toast.success('Contribution request rejected');
    } catch (error) {
      console.error('Failed to reject request:', error);
      toast.error('Failed to reject request');
      throw error;
    }
  },

  /**
   * Withdraw a contribution request
   */
  async withdrawRequest(requestId: number): Promise<void> {
    try {
      await apiClient.delete(`/withdraw-contribution-request/${requestId}/`);
      toast.success('Contribution request withdrawn');
    } catch (error) {
      console.error('Failed to withdraw request:', error);
      toast.error('Failed to withdraw request');
      throw error;
    }
  },
};

export default contributionService;
