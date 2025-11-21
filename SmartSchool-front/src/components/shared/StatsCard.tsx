import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  gradient: 'primary' | 'success' | 'warning' | 'accent';
  subtitle?: string;
  trend?: string;
  trendDirection?: 'up' | 'down';
  onClick?: () => void;
}

const gradientClasses = {
  primary: 'from-blue-500 to-blue-600',
  success: 'from-green-500 to-green-600',
  warning: 'from-orange-500 to-orange-600',
  accent: 'from-purple-500 to-purple-600',
};

const iconBgClasses = {
  primary: 'bg-blue-400/20',
  success: 'bg-green-400/20',
  warning: 'bg-orange-400/20',
  accent: 'bg-purple-400/20',
};

export const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  gradient,
  subtitle,
  trend,
  trendDirection = 'up',
  onClick
}) => {
  const isClickable = !!onClick;

  return (
    <div 
      className={`
        bg-gradient-to-br ${gradientClasses[gradient]} 
        rounded-xl p-6 text-white shadow-lg 
        hover:shadow-xl transition-all duration-300
        ${isClickable ? 'cursor-pointer hover:scale-105 active:scale-100' : ''}
        relative overflow-hidden group
      `}
      onClick={onClick}
    >
      {/* Effet de brillance au hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative">
        {/* Header avec icône */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-white/80 text-sm font-medium uppercase tracking-wide">
              {title}
            </p>
          </div>
          <div className={`${iconBgClasses[gradient]} rounded-lg p-3 backdrop-blur-sm`}>
            <Icon size={24} className="text-white" />
          </div>
        </div>

        {/* Valeur principale */}
        <div className="mb-3">
          <p className="text-4xl font-bold tracking-tight">
            {value}
          </p>
        </div>

        {/* Footer avec sous-titre et tendance */}
        <div className="flex items-center justify-between">
          {subtitle && (
            <p className="text-white/70 text-sm">
              {subtitle}
            </p>
          )}
          
          {trend && (
            <div className={`
              flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full
              ${trendDirection === 'up' 
                ? 'bg-white/20 text-white' 
                : 'bg-black/20 text-white/90'
              }
            `}>
              {trendDirection === 'up' ? (
                <TrendingUp size={14} />
              ) : (
                <TrendingDown size={14} />
              )}
              <span>{trend}</span>
            </div>
          )}
        </div>

        {/* Indicateur de clic si clickable */}
        {isClickable && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <svg 
              className="w-5 h-5 text-white/60" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 5l7 7-7 7" 
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

// Variante compacte du StatsCard
export const CompactStatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  gradient,
  trend,
  trendDirection = 'up',
}) => {
  return (
    <div className={`
      bg-gradient-to-br ${gradientClasses[gradient]} 
      rounded-lg p-4 text-white shadow-md 
      hover:shadow-lg transition-all duration-200
    `}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`${iconBgClasses[gradient]} rounded-lg p-2`}>
            <Icon size={20} className="text-white" />
          </div>
          <div>
            <p className="text-white/70 text-xs font-medium uppercase">
              {title}
            </p>
            <p className="text-2xl font-bold">
              {value}
            </p>
          </div>
        </div>
        
        {trend && (
          <div className={`
            flex items-center gap-1 text-xs font-medium
            ${trendDirection === 'up' ? 'text-white' : 'text-white/80'}
          `}>
            {trendDirection === 'up' ? (
              <TrendingUp size={12} />
            ) : (
              <TrendingDown size={12} />
            )}
            <span>{trend}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Variante avec bordure (pour thème clair)
export const OutlinedStatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  gradient,
  subtitle,
  trend,
  trendDirection = 'up',
}) => {
  const colorClasses = {
    primary: 'border-blue-200 bg-blue-50/50 text-blue-700',
    success: 'border-green-200 bg-green-50/50 text-green-700',
    warning: 'border-orange-200 bg-orange-50/50 text-orange-700',
    accent: 'border-purple-200 bg-purple-50/50 text-purple-700',
  };

  const iconColorClasses = {
    primary: 'bg-blue-100 text-blue-600',
    success: 'bg-green-100 text-green-600',
    warning: 'bg-orange-100 text-orange-600',
    accent: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className={`
      ${colorClasses[gradient]}
      border-2 rounded-xl p-6 
      shadow-sm hover:shadow-md transition-all duration-200
    `}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium uppercase tracking-wide opacity-70">
            {title}
          </p>
        </div>
        <div className={`${iconColorClasses[gradient]} rounded-lg p-3`}>
          <Icon size={24} />
        </div>
      </div>

      <div className="mb-3">
        <p className="text-4xl font-bold">
          {value}
        </p>
      </div>

      <div className="flex items-center justify-between">
        {subtitle && (
          <p className="text-sm opacity-70">
            {subtitle}
          </p>
        )}
        
        {trend && (
          <div className={`
            flex items-center gap-1 text-sm font-medium
            ${trendDirection === 'up' ? 'text-green-600' : 'text-red-600'}
          `}>
            {trendDirection === 'up' ? (
              <TrendingUp size={14} />
            ) : (
              <TrendingDown size={14} />
            )}
            <span>{trend}</span>
          </div>
        )}
      </div>
    </div>
  );
};