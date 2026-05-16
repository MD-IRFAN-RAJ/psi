import React from 'react';
import { 
  User, 
  Bell, 
  Lock, 
  Palette, 
  CreditCard,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

const SettingsPage: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleComingSoon = (featureName: string) => {
    navigate(`/coming-soon?feature=${encodeURIComponent(featureName)}`);
  };

  const sections = [
    { title: 'Account', icon: User, items: ['Profile Information', 'Personal Email', 'Language & Region'] },
    { title: 'Security', icon: Lock, items: ['Change Password', 'Two-Factor Authentication', 'Login Sessions'] },
    { title: 'Notifications', icon: Bell, items: ['Email Notifications', 'Push Notifications', 'Activity Feed'] },
    { title: 'Billing', icon: CreditCard, items: ['Plan Details', 'Payment Methods', 'Invoice History'] },
    { title: 'Appearance', icon: Palette, items: ['Theme Settings', 'Accessibility', 'Typography'] },
  ];

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 max-w-[1000px] mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
        <p className="text-sm text-slate-500 mt-1">Manage your account preferences and workspace configuration.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Summary */}
        <div className="md:col-span-1 space-y-6">
           <div className="bg-white border border-slate-200 rounded-xl p-6 text-center space-y-4 shadow-sm">
              <div className="h-24 w-24 rounded-full bg-slate-100 border-4 border-white shadow-md mx-auto overflow-hidden">
                 <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.firstName}`} alt="avatar" />
              </div>
              <div className="space-y-1">
                 <h3 className="font-bold text-lg text-slate-900">{user?.firstName} {user?.lastName}</h3>
                 <p className="text-xs text-slate-500">{user?.email}</p>
                 <div className="pt-2">
                    <Badge className="bg-indigo-50 text-indigo-600 border-none font-bold text-[10px] uppercase px-3 py-1 rounded-full shadow-none">{user?.role}</Badge>
                 </div>
              </div>
              <Button variant="outline" className="w-full h-10 font-bold text-slate-600 border-slate-200" onClick={handleLogout}>
                 <LogOut className="h-4 w-4 mr-2" />
                 Sign Out
              </Button>
           </div>
        </div>

        {/* Settings Sections */}
        <div className="md:col-span-2 space-y-4">
           {sections.map((section) => (
              <div key={section.title} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                 <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30 flex items-center gap-3">
                    <section.icon className="h-4 w-4 text-slate-400" />
                    <h4 className="text-sm font-bold text-slate-700">{section.title}</h4>
                 </div>
                 <div className="divide-y divide-slate-50">
                    {section.items.map((item) => (
                       <button key={item} className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left group" onClick={() => handleComingSoon(item)}>
                          <span className="text-sm font-medium text-slate-600 group-hover:text-primary transition-colors">{item}</span>
                          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
                       </button>
                    ))}
                 </div>
              </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
