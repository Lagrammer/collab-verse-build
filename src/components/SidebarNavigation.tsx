
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, Bell, MessageSquare, Bookmark, BarChart2, Palette, Settings } from 'lucide-react';
import AppLogo from './AppLogo';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  notificationCount?: number;
  active?: boolean;
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
  return (
    <div className="bg-sidebar h-screen w-64 flex flex-col border-r border-sidebar-border">
      <div className="p-5">
        <AppLogo />
      </div>
      
      <div className="p-4 space-y-1">
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="h-10 w-10 rounded-full bg-secondary overflow-hidden">
            <img 
              src="https://i.pravatar.cc/100?img=33" 
              alt="Profile" 
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="text-sidebar-foreground font-medium text-sm">User Name</p>
            <p className="text-sidebar-foreground/60 text-xs">@username</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-2 py-4 overflow-y-auto">
        <nav className="space-y-1">
          <NavItem icon={<Home size={20} />} label="Home" to="/" active={true} />
          <NavItem icon={<Search size={20} />} label="Explore" to="/explore" />
          <NavItem icon={<Bell size={20} />} label="Notifications" to="/notifications" notificationCount={3} />
          <NavItem icon={<MessageSquare size={20} />} label="Inbox" to="/inbox" notificationCount={2} />
          <NavItem icon={<Bookmark size={20} />} label="Saved Ideas" to="/saved" />
          <NavItem icon={<BarChart2 size={20} />} label="Analytics" to="/analytics" />
          <NavItem icon={<Palette size={20} />} label="Theme" to="/theme" />
          <NavItem icon={<Settings size={20} />} label="Settings" to="/settings" />
        </nav>
      </div>

      <div className="p-4">
        <button className="w-full py-3 px-4 bg-sidebar-primary text-sidebar-primary-foreground rounded-lg font-medium hover:bg-sidebar-primary/90 transition-colors">
          Share Your Idea
        </button>
      </div>
    </div>
  );
};

export default SidebarNavigation;
