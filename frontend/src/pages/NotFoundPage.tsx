import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center space-y-6">
        <div className="mx-auto h-24 w-24 bg-white rounded-2xl shadow-xl flex items-center justify-center text-slate-300">
          <FileQuestion className="h-12 w-12" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-slate-900">404</h1>
          <p className="text-xl font-medium text-slate-600">Page Not Found</p>
          <p className="text-slate-500 max-w-xs mx-auto">
            The page you are looking for doesn't exist or has been moved.
          </p>
        </div>
        <Button asChild className="shadow-lg shadow-primary/20">
          <Link to="/">Go Back Home</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
