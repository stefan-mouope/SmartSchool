import React from 'react';
import { Menu, X } from 'lucide-react';
import { UserRole } from '@/types';
import { userNames } from '@/constants/menus';

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  currentUser: UserRole;
  onUserChange: (user: UserRole) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  sidebarOpen, 
  onToggleSidebar,
  currentUser,
  onUserChange 
}) => {
  return (
    <header className="bg-card border-b border-border h-16 flex items-center justify-between px-6 fixed top-0 right-0 left-0 z-30">
      <div className="flex items-center">
        <button
          onClick={onToggleSidebar}
          className="text-foreground hover:text-primary transition-colors p-2 hover:bg-muted rounded-lg"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className="ml-4">
          <h2 className="text-lg font-semibold text-foreground">École Primaire La Sagesse</h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground mr-2">{userNames[currentUser]}</span>
        <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
          <button
            onClick={() => onUserChange('super')}
            className={`px-3 py-1.5 text-sm rounded transition-colors ${
              currentUser === 'super'
                ? 'bg-primary text-primary-foreground font-medium'
                : 'text-foreground hover:bg-background'
            }`}
          >
            Super
          </button>
          <button
            onClick={() => onUserChange('directeur')}
            className={`px-3 py-1.5 text-sm rounded transition-colors ${
              currentUser === 'directeur'
                ? 'bg-primary text-primary-foreground font-medium'
                : 'text-foreground hover:bg-background'
            }`}
          >
            Directeur
          </button>
          <button
            onClick={() => onUserChange('enseignant')}
            className={`px-3 py-1.5 text-sm rounded transition-colors ${
              currentUser === 'enseignant'
                ? 'bg-primary text-primary-foreground font-medium'
                : 'text-foreground hover:bg-background'
            }`}
          >
            Enseignant
          </button>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
          {currentUser === 'super' ? 'S' : currentUser === 'directeur' ? 'D' : 'E'}
        </div>
      </div>
    </header>
  );
};
