import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Zap, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ComingSoonPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const featureName = searchParams.get('feature') || 'This feature';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="mx-auto h-20 w-20 bg-white rounded-2xl shadow-xl flex items-center justify-center">
          <Zap className="h-10 w-10 text-yellow-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">Coming Soon</h1>
          <p className="text-lg font-medium text-slate-600">{featureName}</p>
          <p className="text-slate-500 text-sm">
            We're working hard to bring this feature to you. Stay tuned for updates!
          </p>
        </div>
        <div className="pt-4">
          <Button asChild className="shadow-lg shadow-primary/20">
            <Link to="/dashboard" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ComingSoonPage;
