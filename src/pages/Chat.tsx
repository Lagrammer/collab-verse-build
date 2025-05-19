
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Loader, Search, MessageCircle } from 'lucide-react';
import chatService, { Chat } from '@/services/chatService';

const ChatPage = () => {
  const navigate = useNavigate();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const chatData = await chatService.getAllChats();
        setChats(chatData);
      } catch (err) {
        setError('Failed to load chats. Please try again later.');
        console.error('Error fetching chats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  const filteredChats = chats.filter(chat => 
    chat.other_user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Layout>
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Messages</h1>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
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
          ) : filteredChats.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-1">No conversations yet</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'No results found' : 'Start a new conversation to chat with others'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => navigate(`/chat/${chat.slug}`)}
                  className="flex items-center p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                >
                  <div className="h-12 w-12 rounded-full bg-secondary overflow-hidden mr-3">
                    {chat.other_user.profile_picture && (
                      <img
                        src={chat.other_user.profile_picture}
                        alt={chat.other_user.username}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-medium truncate">{chat.other_user.username}</h3>
                      {chat.last_message?.sent_at && (
                        <span className="text-xs text-muted-foreground ml-2">
                          {formatTime(chat.last_message.sent_at)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {chat.last_message ? chat.last_message.content : 'No messages yet'}
                    </p>
                  </div>
                  {chat.unread_messages_count > 0 && (
                    <div className="ml-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-xs text-primary-foreground">
                        {chat.unread_messages_count}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ChatPage;
