import React from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, Info, X } from 'lucide-react';

interface AlertBannerProps {
  message: string | null;
  type: 'critical' | 'warning' | 'info' | 'success' | null;
  onDismiss: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  message,
  type,
  onDismiss
}) => {
  if (!message) return null;

  const getStyle = () => {
    switch (type) {
      case 'critical':
        return {
          bg: 'bg-red-600',
          border: 'border-red-700',
          text: 'text-white',
          icon: <ShieldAlert className="text-white animate-bounce flex-shrink-0" size={18} />
        };
      case 'warning':
        return {
          bg: 'bg-[#F27D26]',
          border: 'border-[#F27D26]/80',
          text: 'text-black font-bold',
          icon: <AlertTriangle className="text-black animate-pulse flex-shrink-0" size={18} />
        };
      case 'success':
        return {
          bg: 'bg-[#111111] border border-[#00FF00]/40',
          border: 'border-[#00FF00]/40',
          text: 'text-[#00FF00]',
          icon: <CheckCircle2 className="text-[#00FF00] flex-shrink-0" size={18} />
        };
      case 'info':
      default:
        return {
          bg: 'bg-[#1A1A1A]',
          border: 'border-[#2A2A2A]',
          text: 'text-[#00FFFF]',
          icon: <Info className="text-[#00FFFF] flex-shrink-0" size={18} />
        };
    }
  };

  const style = getStyle();

  return (
    <div 
      id="critical-alert-banner"
      className={`w-full ${style.bg} ${style.border} border-b px-4 py-2.5 flex items-center justify-between shadow-2xl transition-all duration-300 z-40`}
    >
      <div className="flex items-center gap-2.5">
        {style.icon}
        <span className={`font-mono text-xs sm:text-sm font-bold tracking-wide ${style.text}`}>
          {message}
        </span>
      </div>

      <button
        onClick={onDismiss}
        className="text-current opacity-80 hover:opacity-100 p-1 rounded transition-opacity"
        title="Dismiss Alert"
      >
        <X size={16} />
      </button>
    </div>
  );
};
