import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { taskService } from '@/api/taskService';
import { useAuthStore } from '@/store/useAuthStore';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  MoreHorizontal,
  TrendingUp,
  Activity
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { format, isBefore, startOfToday } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Fetch all tasks for dashboard calculations
  const { data: allTasksData } = useQuery({
    queryKey: ['tasks', { limit: 1000, includeDone: true }],
    queryFn: () => taskService.getTasks({ limit: 1000, includeDone: true }),
  });

  const tasks = allTasksData?.tasks || [];
  
  // 1. Calculate Sprint Stats
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t: any) => t.status === 'DONE').length;
  const inProgressTasks = tasks.filter((t: any) => t.status === 'IN_PROGRESS').length;
  const todoTasks = tasks.filter((t: any) => t.status === 'TODO').length;
  
  const completionPercentage = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  
  // 2. Identify Overdue Tasks
  const today = startOfToday();
  const overdueTasks = tasks.filter((t: any) => 
    t.dueDate && 
    isBefore(new Date(t.dueDate), today) && 
    t.status !== 'DONE'
  );

  // 3. Workload Data
  const myTasks = tasks.filter((t: any) => t.assigneeId === user?.id);
  const myInProgress = myTasks.filter((t: any) => t.status === 'IN_PROGRESS').length;
  const capacityPercentage = Math.min(Math.round((myInProgress / 5) * 100), 100); // Assuming 5 is max capacity for demo

  // 4. Recent Activity (Latest updated tasks)
  const recentActivity = [...tasks]
    .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);

  const completedTasks = tasks
    .filter((t: any) => t.status === 'DONE')
    .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const reopenMutation = useMutation({
    mutationFn: (taskId: string) => taskService.updateTask(taskId, { status: 'TODO' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({ title: 'Issue reopened' });
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Failed to reopen issue',
      });
    },
  });

  const stats = [
    { label: 'Tasks Done', value: doneTasks, color: 'text-slate-900' },
    { label: 'In Progress', value: inProgressTasks, color: 'text-slate-900' },
    { label: 'To Do', value: todoTasks, color: 'text-slate-900' },
  ];

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back, {user?.firstName}</h2>
          <p className="text-sm text-slate-500 mt-1">Here's a live overview of your team's performance today.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm">
          <CalendarIcon className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-600">{format(new Date(), 'MMM dd, yyyy')}</span>
        </div>
      </div>

      {/* Sprint Progress Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Active Workspace Velocity</h3>
            </div>
            <span className="text-xs font-bold text-primary">{completionPercentage}% Total Progress</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <div className="grid grid-cols-3 gap-12 pt-2">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tasks Table Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Recent Issues</h3>
            <Link to="/tasks">
              <Button variant="ghost" size="sm" className="text-primary text-xs font-bold hover:bg-primary/5">
                View All Issues
              </Button>
            </Link>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Key & Title</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Assignee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.slice(0, 5).map((task: any) => (
                  <tr key={task.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer group">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">
                          TS-{task.id.split('-')[0].toUpperCase()}: {task.title}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Updated {format(new Date(task.updatedAt), 'MMM dd')}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded shadow-none",
                        task.priority === 'HIGH' ? "bg-rose-50 text-rose-600" : 
                        task.priority === 'MEDIUM' ? "bg-amber-50 text-amber-600" : "bg-slate-50 text-slate-600"
                      )}>
                        {task.priority.charAt(0) + task.priority.slice(1).toLowerCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "h-2 w-2 rounded-full",
                          task.status === 'DONE' ? "bg-emerald-500" : 
                          task.status === 'IN_PROGRESS' ? "bg-primary" : "bg-slate-300"
                        )}></div>
                        <span className="text-xs font-medium text-slate-600">
                          {task.status === 'IN_PROGRESS' ? 'In Progress' : 
                           task.status === 'TODO' ? 'To Do' : 'Done'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end">
                          <div className="h-7 w-7 rounded-full bg-slate-100 border border-slate-200 overflow-hidden ring-2 ring-white">
                             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${task.assignee?.firstName || 'none'}`} alt="avatar" />
                          </div>
                       </div>
                    </td>
                  </tr>
                ))}
                {tasks.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm font-medium italic">
                      No issues found in your workspace.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar Widgets Section */}
        <div className="space-y-8">
          {/* Overdue Widget */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertCircle className="h-4 w-4" />
              <h3 className="text-[11px] font-bold uppercase tracking-widest">Overdue Items ({overdueTasks.length})</h3>
            </div>
            <div className="space-y-3">
              {overdueTasks.slice(0, 3).map((item: any) => (
                <div key={item.id} className="flex items-center justify-between group cursor-pointer">
                  <span className="text-xs font-medium text-slate-600 group-hover:text-rose-600 truncate mr-4">{item.title}</span>
                  <span className="text-[10px] font-bold text-rose-500 shrink-0">
                    {format(new Date(item.dueDate), 'MMM dd')}
                  </span>
                </div>
              ))}
              {overdueTasks.length === 0 && (
                <p className="text-xs text-slate-400 italic">No overdue tasks. Good job!</p>
              )}
            </div>
          </div>

          {/* Workload Widget */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Personal Workload</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600">In Progress</span>
                  <span className="text-slate-900">{myInProgress} Tasks</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full">
                  <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${(myInProgress / 5) * 100}%` }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600">Capacity Used</span>
                  <span className="text-slate-900">{capacityPercentage}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      capacityPercentage > 80 ? "bg-rose-500" : "bg-primary"
                    )} 
                    style={{ width: `${capacityPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-4">
             <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-2">Recent Activity</h3>
             <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative">
                <div className="absolute left-8 top-10 bottom-10 w-0.5 bg-slate-100"></div>
                <div className="space-y-8 relative">
                   {recentActivity.map((task: any, idx) => (
                     <div key={task.id} className="flex gap-4">
                        <div className={cn(
                          "h-4 w-4 rounded-full border-4 border-white ring-1 ring-slate-100 z-10 shrink-0 mt-1",
                          task.status === 'DONE' ? "bg-emerald-500" : 
                          task.status === 'IN_PROGRESS' ? "bg-primary" : "bg-slate-300"
                        )}></div>
                        <div className="space-y-1">
                          <p className="text-xs text-slate-600">
                            <span className="font-bold text-slate-900">Task Update:</span> {task.title}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">Updated {format(new Date(task.updatedAt), 'HH:mm')} today</p>
                        </div>
                     </div>
                   ))}
                   {recentActivity.length === 0 && (
                     <p className="text-xs text-slate-400 italic text-center py-4">No recent activity found.</p>
                   )}
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Completed Issues</h3>
          <span className="text-xs font-bold text-slate-500">{completedTasks.length} total</span>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Issue</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completed</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {completedTasks.slice(0, 8).map((task: any) => (
                <tr key={task.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-bold text-slate-900">TS-{task.id.split('-')[0].toUpperCase()}: {task.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Priority: {task.priority}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-600">
                    {format(new Date(task.updatedAt), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-slate-200"
                      disabled={reopenMutation.isPending}
                      onClick={() => reopenMutation.mutate(task.id)}
                    >
                      Reopen
                    </Button>
                  </td>
                </tr>
              ))}
              {completedTasks.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-10 text-center text-slate-400 text-sm font-medium italic">
                    No completed issues yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
