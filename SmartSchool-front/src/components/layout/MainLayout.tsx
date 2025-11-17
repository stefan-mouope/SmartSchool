import React, { useState } from 'react';
import { UserRole } from '@/types';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface MainLayoutProps {
  currentUser: UserRole;
  currentPage: string;
  onPageChange: (page: string) => void;
  children: React.ReactNode;
}

interface MainLayoutPropsWithUserChange extends MainLayoutProps {
  onUserChange: (user: UserRole) => void;
}

export const MainLayout: React.FC<MainLayoutPropsWithUserChange> = ({ 
  currentUser, 
  currentPage, 
  onPageChange, 
  onUserChange,
  children 
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        currentUser={currentUser}
        currentPage={currentPage}
        onPageChange={onPageChange}
        isOpen={sidebarOpen}
      />
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <Header 
          sidebarOpen={sidebarOpen} 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          currentUser={currentUser}
          onUserChange={onUserChange}
        />
        <main className="pt-16 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
