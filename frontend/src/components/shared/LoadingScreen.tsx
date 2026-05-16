import { Loader2 } from 'lucide-react';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 space-y-4">
      <div className="relative">
        <div className="h-16 w-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
        </div>
      </div>
      <div className="text-center">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">TaskSuite</h3>
        <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Initializing workspace</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
