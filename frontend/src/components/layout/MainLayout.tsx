import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Layers, 
  Briefcase, 
  ClipboardList, 
  Trello, 
  Settings, 
  HelpCircle, 
  LifeBuoy,
  Search,
  Plus,
  Bell,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/tasks' },
    { name: 'Issues', icon: Layers, path: '/issues' },
    { name: 'Projects', icon: Briefcase, path: '/projects' },
    { name: 'Backlog', icon: ClipboardList, path: '/backlog' },
    { name: 'Sprint Board', icon: Trello, path: '/board' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="h-8 w-8 bg-[#0F172A] rounded flex items-center justify-center">
            <span className="text-white font-bold">W</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#0F172A]">Workspace</h1>
            <p className="text-[10px] text-slate-400 font-medium">Enterprise Suite</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                location.pathname === item.path
                  ? "bg-[#E2E8F0] text-[#0F172A]"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-1">
          <button className="flex items-center gap-3 px-3 py-2 w-full text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors">
            <HelpCircle className="h-4 w-4" />
            Help
          </button>
          <button className="flex items-center gap-3 px-3 py-2 w-full text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors">
            <LifeBuoy className="h-4 w-4" />
            Support
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-200 flex items-center justify-between px-8 bg-white shrink-0">
          <div className="flex items-center gap-8 flex-1">
            <h2 className="text-lg font-bold text-[#0F172A] tracking-tight">TaskSuite</h2>
            <div className="relative w-full max-w-md group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Search tasks, docs..." 
                className="pl-10 h-9 bg-slate-50 border-slate-200 rounded-md text-xs"
              />
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/tasks" className={cn("text-xs font-semibold", location.pathname === '/tasks' ? "text-primary border-b-2 border-primary pb-5 mt-5" : "text-slate-500")}>Home</Link>
              <Link to="/issues" className={cn("text-xs font-semibold", location.pathname === '/issues' ? "text-primary border-b-2 border-primary pb-5 mt-5" : "text-slate-500")}>My Tasks</Link>
              <span className="text-xs font-semibold text-slate-400 cursor-pointer">Feedback</span>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Button size="sm" className="bg-[#1D4ED8] hover:bg-[#1E40AF] text-white px-4 h-9 text-xs font-bold rounded-md">
              Create Issue
            </Button>
            <div className="flex items-center gap-3 border-l border-slate-200 pl-4 ml-2">
              <button className="text-slate-400 hover:text-slate-600">
                <Bell className="h-5 w-5" />
              </button>
              <div 
                className="h-8 w-8 rounded-full bg-slate-200 border border-slate-300 overflow-hidden cursor-pointer"
                onClick={logout}
                title="Logout"
              >
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.firstName}`} alt="avatar" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-[#F8FAFC]">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
