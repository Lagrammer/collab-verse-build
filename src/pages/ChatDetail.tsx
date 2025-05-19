
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Loader, ArrowLeft, Send } from 'lucide-react';
import chatService, { Chat, Message } from '@/services/chatService';

const ChatDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [chat, setChat] = useState<Chat | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!slug) return;

    const fetchChat = async () => {
      try {
        const chatData = await chatService.getChatBySlug(slug);
        setChat(chatData);
        
        // Mark messages as read
        if (chatData.messages?.some(msg => !msg.is_read && !msg.is_mine)) {
          await chatService.markChatAsRead(slug);
        }
      } catch (err) {
        setError('Failed to load chat. Please try again later.');
        console.error('Error fetching chat:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChat();
    
    // Poll for new messages every 10 seconds
    const intervalId = setInterval(fetchChat, 10000);
    
    return () => clearInterval(intervalId);
  }, [slug]);

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug || !newMessage.trim() || sending) return;
    
    setSending(true);
    try {
      const sentMessage = await chatService.sendMessage(slug, { content: newMessage });
      
      // Update the chat state with the new message
      setChat(prevChat => {
        if (!prevChat) return null;
        
        return {
          ...prevChat,
          messages: [...(prevChat.messages || []), sentMessage]
        };
      });
      
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Layout>
      <div className="flex flex-col h-full">
        {/* Chat header */}
        <div className="border-b p-3 flex items-center sticky top-0 bg-background z-10">
          <Button variant="ghost" size="icon" onClick={() => navigate('/chat')} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          {loading ? (
            <div className="animate-pulse h-10 w-40 bg-muted rounded"></div>
          ) : chat ? (
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-secondary overflow-hidden">
                {chat.other_user.profile_picture && (
                  <img
                    src={chat.other_user.profile_picture}
                    alt={chat.other_user.username}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <span className="font-medium ml-3">{chat.other_user.username}</span>
            </div>
          ) : null}
        </div>
        
        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-4">
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
          ) : chat?.messages?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No messages yet. Start a conversation!
            </div>
          ) : (
            <div className="space-y-3">
              {chat?.messages?.map((message: Message) => (
                <div
                  key={message.id}
                  className={`flex ${message.is_mine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-2 rounded-lg ${
                      message.is_mine
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    <p>{message.content}</p>
                    <div className={`text-xs mt-1 ${message.is_mine ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {formatTime(message.created_at)}
                      {message.is_mine && (
                        <span className="ml-2">
                          {message.is_read === true ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        {/* Message input */}
        <div className="border-t p-3 sticky bottom-0 bg-background">
          <form onSubmit={handleSendMessage} className="flex items-center">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 mr-2"
              disabled={loading || !chat}
            />
            <Button type="submit" size="icon" disabled={loading || sending || !newMessage.trim() || !chat}>
              {sending ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ChatDetail;
