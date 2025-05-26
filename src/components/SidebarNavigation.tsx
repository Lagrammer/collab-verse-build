import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Bell, MessageSquare, Bookmark, BarChart2, Palette, Settings, Users, LogOut, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AppLogo from './AppLogo';
import authService from '@/services/authService';
import apiClient from '@/lib/apiClient';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  notificationCount?: number;
  active?: boolean;
}

interface UserProfile {
  username?: string;
  first_name?: string;
  last_name?: string;
  profile_picture?: string;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, to, notificationCount, active }) => {
  return (
    <Link
      to={to}
      className={`flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-sidebar-accent group transition-colors ${
        active ? 'bg-sidebar-accent' : ''
      }`}
    >
      <div className={`text-sidebar-foreground ${active ? 'text-sidebar-primary' : ''}`}>
        {icon}
      </div>
      <span className={`text-sidebar-foreground ${active ? 'text-sidebar-primary' : ''}`}>{label}</span>
      {notificationCount !== undefined && notificationCount > 0 && (
        <div className="ml-auto flex items-center justify-center h-5 w-5 bg-brand-yellow text-black text-xs font-medium rounded-full">
          {notificationCount}
        </div>
      )}
    </Link>
  );
};

const SidebarNavigation: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        console.log('Fetching user profile for sidebar...');
        const profile = await apiClient.get<UserProfile>('/profile/me/');
        console.log('User profile fetched for sidebar:', profile);
        setUserProfile(profile);
      } catch (error) {
        console.error('Failed to fetch user profile for sidebar:', error);
      }
    };

    fetchUserProfile();
  }, []);
  
  const handleLogout = () => {
    authService.logout();
  };

  const getUserInitials = () => {
    if (userProfile?.first_name && userProfile?.last_name) {
      return `${userProfile.first_name.charAt(0)}${userProfile.last_name.charAt(0)}`;
    }
    if (userProfile?.username) {
      return userProfile.username.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getDisplayName = () => {
    if (userProfile?.first_name && userProfile?.last_name) {
      return `${userProfile.first_name} ${userProfile.last_name}`;
    }
    return userProfile?.username || 'User';
  };
  
  return (
    <div className="bg-sidebar h-screen w-64 flex flex-col border-r border-sidebar-border">
      <div className="p-5">
        <AppLogo />
      </div>
      
      <div className="p-4 space-y-1">
        <Link to="/profile" className="flex items-center gap-2 px-4 py-2 hover:bg-sidebar-accent rounded-lg transition-colors">
          <Avatar className="h-10 w-10">
            <AvatarImage src={userProfile?.profile_picture} alt="Profile" />
            <AvatarFallback className="text-sm font-medium">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sidebar-foreground font-medium text-sm">{getDisplayName()}</p>
            <p className="text-sidebar-foreground/60 text-xs">
              @{userProfile?.username || 'username'}
            </p>
          </div>
        </Link>
      </div>

      <div className="flex-1 flex flex-col px-2 py-4 overflow-y-auto">
        <nav className="space-y-1">
          <NavItem 
            icon={<Home size={20} />} 
            label="Home" 
            to="/" 
            active={currentPath === '/'} 
          />
          <NavItem 
            icon={<Search size={20} />} 
            label="Explore" 
            to="/explore" 
            active={currentPath === '/explore'} 
          />
          <NavItem 
            icon={<Bell size={20} />} 
            label="Notifications" 
            to="/notifications" 
            notificationCount={3} 
            active={currentPath === '/notifications'} 
          />
          <NavItem 
            icon={<MessageSquare size={20} />} 
            label="Messages" 
            to="/chat" 
            notificationCount={2} 
            active={currentPath.startsWith('/chat')} 
          />
          <NavItem 
            icon={<Bookmark size={20} />} 
            label="Saved Ideas" 
            to="/saved" 
            active={currentPath === '/saved'} 
          />
          <NavItem 
            icon={<Users size={20} />} 
            label="Contributions" 
            to="/contributions/received" 
            active={currentPath.startsWith('/contributions')} 
          />
          <NavItem 
            icon={<User size={20} />} 
            label="Profile" 
            to="/profile" 
            active={currentPath === '/profile'} 
          />
          <NavItem 
            icon={<BarChart2 size={20} />} 
            label="Analytics" 
            to="/analytics" 
            active={currentPath === '/analytics'} 
          />
          <NavItem 
            icon={<Palette size={20} />} 
            label="Theme" 
            to="/theme" 
            active={currentPath === '/theme'} 
          />
          <NavItem 
            icon={<Settings size={20} />} 
            label="Settings" 
            to="/settings" 
            active={currentPath === '/settings'} 
          />
        </nav>
      </div>

      <div className="p-4">
        <div className="w-full">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-sidebar-accent transition-colors text-red-400 hover:text-red-500"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
        <button className="w-full py-3 px-4 mt-2 bg-sidebar-primary text-sidebar-primary-foreground rounded-lg font-medium hover:bg-sidebar-primary/90 transition-colors">
          Share Your Idea
        </button>
      </div>
    </div>
  );
};

export default SidebarNavigation;
