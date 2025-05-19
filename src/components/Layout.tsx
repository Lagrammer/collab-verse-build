
import React from 'react';
import SidebarNavigation from './SidebarNavigation';
import RightSidebar from './RightSidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <SidebarNavigation />
      {children}
      <RightSidebar />
    </div>
  );
};

export default Layout;
