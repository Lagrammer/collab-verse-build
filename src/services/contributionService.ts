
import apiClient from '@/lib/apiClient';
import { toast } from '@/components/ui/sonner';

export interface User {
  id: number;
  username: string;
  profile_picture: string;
}

export interface ContributionRequest {
  id: number;
  status: 'pending' | 'approved' | 'rejected';
  idea_description: string;
  idea_images: string[];
  requesting_user: User;
  created_at: string;
}

export interface ContributionResponse {
  status: string;
  message?: string;
  contribution_requests?: ContributionRequest[];
}

/**
 * Service for handling contribution-related API calls
 */
export const contributionService = {
  /**
   * Check if the backend API is available
   */
  async checkBackendAvailability(): Promise<boolean> {
    return apiClient.checkBackendAvailability();
  },

  /**
   * Get contribution requests received by the current user
   */
  async getReceivedRequests(): Promise<ContributionRequest[]> {
    if (!(await this.checkBackendAvailability())) {
      toast.error('Backend currently unavailable. Please try again later.');
      throw new Error('Backend currently unavailable. Please try again later.');
    }

    try {
      return await apiClient.get<ContributionRequest[]>('/contribution-requests/received/');
    } catch (error) {
      toast.error('Failed to fetch received requests: ' + (error.message || 'Something went wrong'));
      throw error;
    }
  },
  
  /**
   * Get contribution requests sent by the current user
   */
  async getSentRequests(): Promise<{ status: string; contribution_requests: ContributionRequest[] }> {
    if (!(await this.checkBackendAvailability())) {
      toast.error('Backend currently unavailable. Please try again later.');
      throw new Error('Backend currently unavailable. Please try again later.');
    }

    try {
      return await apiClient.get<{ status: string; contribution_requests: ContributionRequest[] }>('/contribution-requests/sent/');
    } catch (error) {
      toast.error('Failed to fetch sent requests: ' + (error.message || 'Something went wrong'));
      throw error;
    }
  },
  
  /**
   * Approve a contribution request
   */
  async approveRequest(requestId: number): Promise<ContributionResponse> {
    if (!(await this.checkBackendAvailability())) {
      toast.error('Backend currently unavailable. Please try again later.');
      throw new Error('Backend currently unavailable. Please try again later.');
    }

    try {
      const response = await apiClient.post<ContributionResponse>(`/contribution-requests/${requestId}/approve/`);
      toast.success('Contribution request approved successfully');
      return response;
    } catch (error) {
      toast.error('Failed to approve request: ' + (error.message || 'Something went wrong'));
      throw error;
    }
  },
  
  /**
   * Reject a contribution request
   */
  async rejectRequest(requestId: number): Promise<ContributionResponse> {
    if (!(await this.checkBackendAvailability())) {
      toast.error('Backend currently unavailable. Please try again later.');
      throw new Error('Backend currently unavailable. Please try again later.');
    }

    try {
      const response = await apiClient.post<ContributionResponse>(`/contribution-requests/${requestId}/reject/`);
      toast.success('Contribution request rejected successfully');
      return response;
    } catch (error) {
      toast.error('Failed to reject request: ' + (error.message || 'Something went wrong'));
      throw error;
    }
  },
  
  /**
   * Send a contribution request for an idea
   */
  async sendRequest(ideaSlug: string): Promise<ContributionRequest> {
    if (!(await this.checkBackendAvailability())) {
      toast.error('Backend currently unavailable. Please try again later.');
      throw new Error('Backend currently unavailable. Please try again later.');
    }

    try {
      const response = await apiClient.post<ContributionRequest>(`/send-contribution-request/${ideaSlug}/`, {});
      toast.success('Contribution request sent successfully');
      return response;
    } catch (error) {
      toast.error('Failed to send request: ' + (error.message || 'Something went wrong'));
      throw error;
    }
  },
  
  /**
   * Withdraw a contribution request
   */
  async withdrawRequest(requestId: number): Promise<ContributionResponse> {
    if (!(await this.checkBackendAvailability())) {
      toast.error('Backend currently unavailable. Please try again later.');
      throw new Error('Backend currently unavailable. Please try again later.');
    }

    try {
      const response = await apiClient.delete<ContributionResponse>(`/withdraw-contribution-request/${requestId}/`);
      toast.success('Contribution request withdrawn successfully');
      return response;
    } catch (error) {
      toast.error('Failed to withdraw request: ' + (error.message || 'Something went wrong'));
      throw error;
    }
  }
};

export default contributionService;
