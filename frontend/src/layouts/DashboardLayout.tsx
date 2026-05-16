import React, { useState } from 'react';
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Layers, 
  Briefcase, 
  ClipboardList, 
  LayoutGrid, 
  Settings, 
  HelpCircle, 
  LifeBuoy,
  Search,
  Bell,
  User as UserIcon,
  Users,
  LogOut,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';
import CreateTaskModal from '@/components/tasks/CreateTaskModal';
import { hasAnyRole } from '@/lib/rbac';

const DashboardLayout: React.FC = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Issues', icon: Layers, path: '/tasks' },
    { name: 'Projects', icon: Briefcase, path: '/projects' },
    ...(hasAnyRole(user?.role, ['ADMIN', 'CTO', 'MANAGER']) ? [{ name: 'Workforce', icon: Users, path: '/workforce' }] : []),
    { name: 'Backlog', icon: ClipboardList, path: '/backlog' },
    { name: 'Sprint Board', icon: LayoutGrid, path: '/board' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/tasks?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="flex h-screen bg-white font-sans antialiased">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 flex flex-col shrink-0 bg-white">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="h-8 w-8 bg-[#0F172A] rounded flex items-center justify-center shadow-lg shadow-slate-200">
            <span className="text-white font-bold text-xs italic">T</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#0F172A] leading-none">TaskSuite</h1>
            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">Enterprise</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-bold transition-all duration-200",
                location.pathname === item.path
                  ? "bg-[#F1F5F9] text-primary"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className={cn("h-4 w-4", location.pathname === item.path ? "text-primary" : "text-slate-400")} />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-1">
          <Link to="/settings" className="flex items-center gap-3 px-3 py-2 w-full text-slate-500 hover:text-slate-900 text-[13px] font-bold transition-colors">
            <HelpCircle className="h-4 w-4" />
            Help Center
          </Link>
          <button onClick={handleComingSoon} className="flex items-center gap-3 px-3 py-2 w-full text-slate-500 hover:text-slate-900 text-[13px] font-bold transition-colors">
            <LifeBuoy className="h-4 w-4" />
            Support
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-200 flex items-center justify-between px-8 bg-white shrink-0 z-30">
          <div className="flex items-center gap-8 flex-1">
            <div className="flex items-center gap-2">
               <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Workspace Online</span>
            </div>
            
            <form onSubmit={handleSearch} className="relative w-full max-w-md group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search everything..." 
                className="pl-10 h-10 bg-slate-50 border-none rounded-lg text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
              />
              {searchQuery && (
                <button 
                  type="button" 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  title="Clear search"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </form>

            <nav className="hidden lg:flex items-center gap-8">
              <Link to="/dashboard" className={cn("text-[11px] font-bold uppercase tracking-widest pb-1 transition-all", location.pathname === '/dashboard' ? "text-primary border-b-2 border-primary" : "text-slate-400 hover:text-slate-600")}>Home</Link>
              <Link to="/tasks" className={cn("text-[11px] font-bold uppercase tracking-widest pb-1 transition-all", location.pathname === '/tasks' ? "text-primary border-b-2 border-primary" : "text-slate-400 hover:text-slate-600")}>My Tasks</Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Button 
              size="sm" 
              className="bg-[#1D4ED8] hover:bg-[#1E40AF] text-white px-6 h-10 text-xs font-bold rounded-lg transition-all shadow-lg shadow-blue-200 active:scale-95"
              onClick={() => setCreateModalOpen(true)}
            >
              Create Issue
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-10 text-xs font-bold border-slate-200"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
            <div className="flex items-center gap-4 border-l border-slate-200 pl-4 ml-2">
              <button className="text-slate-400 hover:text-slate-600 relative p-1" title="Notifications">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-rose-500 rounded-full border-2 border-white"></span>
              </button>
              <Link 
                to="/profile"
                className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 overflow-hidden cursor-pointer hover:border-primary transition-all ring-offset-2 hover:ring-2 hover:ring-primary/20 shadow-sm"
                title="Profile Settings"
              >
                {user?.avatarUrl ? (
                  <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:3010'}${user.avatarUrl}`} alt="avatar" className="h-full w-full object-cover" />
                ) : (
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.firstName}`} alt="avatar" />
                )}
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-[#F8FAFC]">
          <div className="max-w-[1600px] mx-auto min-h-full">
            <Outlet />
          </div>
        </div>
      </main>
      <CreateTaskModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
    </div>
  );
};

  const handleComingSoon = () => {
    navigate('/coming-soon?feature=Support');
  };

export default DashboardLayout;
