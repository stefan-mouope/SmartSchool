import React from 'react';
import { UserRole, MenuItem } from '@/types';
import { menus, userNames } from '@/constants/menus';
import { Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
interface SidebarProps {
  currentUser: UserRole;
  currentPage: string;
  onPageChange: (page: string) => void;
  isOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentUser, 
  currentPage, 
  onPageChange,
  isOpen 
}) => {
  const userMenu: MenuItem[] = menus[currentUser] || [];
  const userName = userNames[currentUser];
  const [isLoading, setIsLoading] = React.useState(false);
  const { logout } = useAuth();
    const navigate = useNavigate();


  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div 
      className={`${
        isOpen ? 'w-64' : 'w-0'
      } bg-sidebar border-r border-sidebar-border h-screen fixed left-0 top-0 transition-all duration-300 overflow-hidden z-40`}
    >
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-sidebar-foreground">SmartSchool</h1>
        <p className="text-sm text-sidebar-foreground/60 mt-1">{userName}</p>
      </div>

      <nav className="p-4">
        {userMenu.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition-all ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
        <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors mb-2">
          <Settings size={20} />
          <span>Paramètres</span>
        </button>
        <button 
        onClick={handleLogout}
        className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-colors">
          <LogOut size={20} />
          {isLoading ? <span>Déconnexion...</span> : <span>Déconnexion</span>}
        </button>
      </div>
    </div>
  );
};
