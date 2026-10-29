import React, { useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

export const OfflineState = ({ onRetry, title = "You are offline", description = "Please turn on your internet connection to use Campus to Corporate Club." }) => {
  useEffect(() => {
    const handleOnline = () => {
      if (onRetry) {
        onRetry();
      }
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [onRetry]);

  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-amber-500/10 via-zinc-950/80 to-zinc-950 border border-amber-500/25 text-amber-200 space-y-4 shadow-2xl max-w-2xl mx-auto text-center my-8">
      <div className="w-12 h-12 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
        <WifiOff className="w-6 h-6 animate-pulse" />
      </div>
      <div>
        <h3 className="font-bold text-white text-lg sm:text-xl font-heading">{title}</h3>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-md mx-auto leading-relaxed">
          {description}
        </p>
      </div>
      <div className="pt-2 flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (onRetry) onRetry();
          }}
          className="text-xs font-semibold text-white border-amber-500/40 hover:bg-amber-500/20 px-5 min-h-[40px] flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </Button>
      </div>
    </div>
  );
};

export default OfflineState;
