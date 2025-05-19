
import apiClient from '@/lib/apiClient';
import { toast } from '@/components/ui/sonner';

export interface ChatUser {
  id: number;
  username: string;
  profile_picture: string;
}

export interface Message {
  id: number;
  sender?: ChatUser;
  content: string;
  is_mine: boolean;
  is_read: boolean | null;
  created_at: string;
  sent_at?: string;
}

export interface Chat {
  id: number;
  slug: string;
  other_user: ChatUser;
  unread_messages_count?: number;
  last_message?: Message;
  is_self_text?: boolean;
  created_at?: string;
  messages?: Message[];
}

export interface CreateChatRequest {
  other_user_id: number;
}

export interface SendMessageRequest {
  content: string;
}

/**
 * Service for handling chat-related API calls
 */
export const chatService = {
  /**
   * Check if the backend API is available
   */
  async checkBackendAvailability(): Promise<boolean> {
    return apiClient.checkBackendAvailability();
  },

  /**
   * Get all chats for the current user
   */
  async getAllChats(): Promise<Chat[]> {
    if (!(await this.checkBackendAvailability())) {
      toast.error('Backend currently unavailable. Please try again later.');
      throw new Error('Backend currently unavailable. Please try again later.');
    }

    try {
      return await apiClient.get<Chat[]>('/chats/');
    } catch (error) {
      toast.error('Failed to fetch chats: ' + (error.message || 'Something went wrong'));
      throw error;
    }
  },
  
  /**
   * Create a new chat or get existing chat with another user
   */
  async createChat(data: CreateChatRequest): Promise<{ slug: string }> {
    if (!(await this.checkBackendAvailability())) {
      toast.error('Backend currently unavailable. Please try again later.');
      throw new Error('Backend currently unavailable. Please try again later.');
    }

    try {
      return await apiClient.post<{ slug: string }>('/chats/', data);
    } catch (error) {
      toast.error('Failed to create chat: ' + (error.message || 'Something went wrong'));
      throw error;
    }
  },
  
  /**
   * Get a specific chat by slug
   */
  async getChatBySlug(slug: string): Promise<Chat> {
    if (!(await this.checkBackendAvailability())) {
      toast.error('Backend currently unavailable. Please try again later.');
      throw new Error('Backend currently unavailable. Please try again later.');
    }

    try {
      return await apiClient.get<Chat>(`/chats/${slug}/`);
    } catch (error) {
      toast.error('Failed to fetch chat: ' + (error.message || 'Something went wrong'));
      throw error;
    }
  },
  
  /**
   * Send a message in a specific chat
   */
  async sendMessage(slug: string, data: SendMessageRequest): Promise<Message> {
    if (!(await this.checkBackendAvailability())) {
      toast.error('Backend currently unavailable. Please try again later.');
      throw new Error('Backend currently unavailable. Please try again later.');
    }

    try {
      return await apiClient.post<Message>(`/chats/${slug}/`, data);
    } catch (error) {
      toast.error('Failed to send message: ' + (error.message || 'Something went wrong'));
      throw error;
    }
  },
  
  /**
   * Mark all messages in a chat as read
   */
  async markChatAsRead(slug: string): Promise<any> {
    try {
      return await apiClient.post(`/chats/${slug}/mark-read/`);
    } catch (error) {
      console.error('Failed to mark chat as read:', error);
      throw error;
    }
  },
  
  /**
   * Delete a specific chat
   */
  async deleteChat(slug: string): Promise<void> {
    if (!(await this.checkBackendAvailability())) {
      toast.error('Backend currently unavailable. Please try again later.');
      throw new Error('Backend currently unavailable. Please try again later.');
    }

    try {
      await apiClient.delete(`/chats/${slug}/`);
      toast.success('Chat deleted successfully');
    } catch (error) {
      toast.error('Failed to delete chat: ' + (error.message || 'Something went wrong'));
      throw error;
    }
  },
  
  /**
   * Delete a specific message
   */
  async deleteMessage(messageId: number): Promise<void> {
    if (!(await this.checkBackendAvailability())) {
      toast.error('Backend currently unavailable. Please try again later.');
      throw new Error('Backend currently unavailable. Please try again later.');
    }

    try {
      await apiClient.delete(`/messages/${messageId}/`);
      toast.success('Message deleted successfully');
    } catch (error) {
      toast.error('Failed to delete message: ' + (error.message || 'Something went wrong'));
      throw error;
    }
  }
};

export default chatService;
