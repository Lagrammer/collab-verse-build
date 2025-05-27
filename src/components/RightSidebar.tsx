
import React from 'react';
import { Search, Bell } from 'lucide-react';

interface UserMessageProps {
  name: string;
  message: string;
  avatar: string;
  unread?: boolean;
}

const UserMessage: React.FC<UserMessageProps> = ({ name, message, avatar, unread }) => {
  return (
    <div className="flex items-center gap-3 p-2 hover:bg-secondary rounded-lg cursor-pointer">
      <div className="relative">
        <div className="h-8 w-8 rounded-full bg-secondary overflow-hidden">
          <img src={avatar} alt={name} className="h-full w-full object-cover" />
        </div>
        {unread && (
          <div className="absolute -top-1 -right-1 h-3 w-3 bg-brand-yellow rounded-full border-2 border-background"></div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{name}</p>
        <p className="text-muted-foreground text-xs truncate">{message}</p>
      </div>
    </div>
  );
};

interface CommunityRequestProps {
  name: string;
  avatar: string;
  message: string;
}

const CommunityRequest: React.FC<CommunityRequestProps> = ({ name, avatar, message }) => {
  return (
    <div className="p-3 bg-card rounded-lg space-y-3">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-secondary overflow-hidden">
          <img src={avatar} alt={name} className="h-full w-full object-cover" />
        </div>
        <div>
          <p className="font-medium text-sm">{name}</p>
          <p className="text-muted-foreground text-xs">{message}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button className="flex-1 py-1.5 bg-brand-yellow text-black text-sm font-medium rounded-lg hover:bg-brand-yellow/90">
          Accept
        </button>
        <button className="flex-1 py-1.5 bg-secondary text-sm font-medium rounded-lg hover:bg-secondary/90">
          Decline
        </button>
      </div>
    </div>
  );
};

const RightSidebar: React.FC = () => {
  return (
    <div className="w-80 h-screen border-l border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Messages</h2>
          <button className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-secondary">
            <Bell size={18} />
          </button>
        </div>
        <div className="mt-3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            type="text"
            placeholder="Search messages"
            className="w-full py-2 pl-9 pr-3 bg-secondary rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-brand-yellow"
          />
        </div>
      </div>

      <div className="border-b border-border">
        <div className="flex">
          <button className="flex-1 py-3 text-center border-b-2 border-brand-yellow text-brand-yellow font-medium">
            Primary
          </button>
          <button className="flex-1 py-3 text-center border-b-2 border-transparent text-muted-foreground hover:text-foreground">
            General
          </button>
          <button className="flex-1 py-3 text-center border-b-2 border-transparent text-muted-foreground hover:text-foreground">
            Groups
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {/* Messages will be populated from API data */}
        <div className="text-center text-muted-foreground py-8 text-sm">
          No messages
        </div>
      </div>

      <div className="p-4 border-t border-border">
        <h3 className="font-medium mb-3">Community Requests</h3>
        <div className="space-y-3">
          {/* Community requests will be populated from API data */}
          <div className="text-center text-muted-foreground text-sm">
            No requests
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
