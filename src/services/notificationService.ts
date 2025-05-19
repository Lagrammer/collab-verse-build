
import apiClient from '@/lib/apiClient';
import { toast } from '@/components/ui/sonner';

export interface User {
  id: number;
  username: string;
}

export interface RelatedIdea {
  id: number;
  description: string;
  slug: string;
}

export interface RelatedComment {
  id: number;
  content: string;
}

export interface Notification {
  id: number;
  message: string;
  triggered_by: User;
  related_idea: RelatedIdea | null;
  related_comment: RelatedComment | null;
  related_contribution_request: any | null;
  type: string;
  is_read: boolean;
}

/**
 * Service for handling notification-related API calls
 */
export const notificationService = {
  /**
   * Get all notifications for the current user
   */
  async getAllNotifications(): Promise<Notification[]> {
    try {
      return await apiClient.get<Notification[]>('/notifications/');
    } catch (error) {
      toast.error('Failed to fetch notifications: ' + (error.message || 'Something went wrong'));
      throw error;
    }
  },
  
  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<{ status: string; message: string }> {
    try {
      return await apiClient.post<{ status: string; message: string }>('/notifications/mark-read/');
    } catch (error) {
      toast.error('Failed to mark notifications as read: ' + (error.message || 'Something went wrong'));
      throw error;
    }
  }
};

export default notificationService;
