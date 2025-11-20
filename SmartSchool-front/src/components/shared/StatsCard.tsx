import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  gradient: 'primary' | 'success' | 'warning' | 'accent';
}

const gradientClasses = {
  primary: 'bg-gradient-to-br from-stats-blue to-stats-blue/90',
  success: 'bg-gradient-to-br from-stats-green to-stats-green/90',
  warning: 'bg-gradient-to-br from-stats-orange to-stats-orange/90',
  accent: 'bg-gradient-to-br from-stats-purple to-stats-purple/90',
};

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, gradient }) => {
  return (
    <div className={`${gradientClasses[gradient]} rounded-lg p-6 text-white shadow-md hover:shadow-lg transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <Icon size={48} className="text-white/60" />
      </div>
    </div>
  );
};
