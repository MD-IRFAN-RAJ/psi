import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { taskService } from '@/api/taskService';
import { userService } from '@/api/userService';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  LayoutGrid,
  List,
  AlertTriangle,
  ArrowUpCircle,
  Circle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import TaskDetailsModal from '@/components/tasks/TaskDetailsModal';

const TaskListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const querySearch = searchParams.get('search') || '';

  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [search, setSearch] = useState(querySearch);
  const [status, setStatus] = useState<string>('all');
  const [priority, setPriority] = useState<string>('all');
  const [assigneeId, setAssigneeId] = useState<string>('all');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Sync state with URL search param
  useEffect(() => {
    setSearch(querySearch);
  }, [querySearch]);

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', { page, limit, search, status, priority, assigneeId }],
    queryFn: () => taskService.getTasks({
      page,
      limit,
      search,
      status: status === 'all' ? undefined : status,
      priority: priority === 'all' ? undefined : priority,
      assigneeId: assigneeId === 'all' ? undefined : assigneeId,
    }),
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getUsers,
  });

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Filter Bar */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className={cn(
                "flex items-center gap-2 border rounded-md px-3 py-1.5 cursor-pointer transition-all",
                status !== 'all' ? "border-primary bg-primary/5 text-primary" : "border-slate-200 hover:bg-slate-50 text-slate-700"
              )}>
                <Filter className={cn("h-3.5 w-3.5", status !== 'all' ? "text-primary" : "text-slate-400")} />
                <span className="text-xs font-bold">{status === 'all' ? 'Status' : status.replace('_', ' ')}</span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40">
              <DropdownMenuItem onClick={() => setStatus('all')}>All Statuses</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatus('TODO')}>To Do</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatus('IN_PROGRESS')}>In Progress</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className={cn(
                "flex items-center gap-2 border rounded-md px-3 py-1.5 cursor-pointer transition-all",
                priority !== 'all' ? "border-primary bg-primary/5 text-primary" : "border-slate-200 hover:bg-slate-50 text-slate-700"
              )}>
                <AlertTriangle className={cn("h-3.5 w-3.5", priority !== 'all' ? "text-primary" : "text-slate-400")} />
                <span className="text-xs font-bold">{priority === 'all' ? 'Priority' : priority}</span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40">
              <DropdownMenuItem onClick={() => setPriority('all')}>All Priorities</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPriority('LOW')}>Low</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPriority('MEDIUM')}>Medium</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPriority('HIGH')}>High</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className={cn(
                "flex items-center gap-2 border rounded-md px-3 py-1.5 cursor-pointer transition-all",
                assigneeId !== 'all' ? "border-primary bg-primary/5 text-primary" : "border-slate-200 hover:bg-slate-50 text-slate-700"
              )}>
                <Search className={cn("h-3.5 w-3.5", assigneeId !== 'all' ? "text-primary" : "text-slate-400")} />
                <span className="text-xs font-bold">
                  {assigneeId === 'all' ? 'Assignee' : users?.find((u: any) => u.id === assigneeId)?.firstName || 'Assignee'}
                </span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 max-h-64 overflow-y-auto">
              <DropdownMenuItem onClick={() => setAssigneeId('all')}>All Assignees</DropdownMenuItem>
              {users?.map((u: any) => (
                <DropdownMenuItem key={u.id} onClick={() => setAssigneeId(u.id)}>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                       <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.firstName}`} alt="avatar" />
                    </div>
                    {u.firstName} {u.lastName}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex items-center gap-2 border border-slate-200 rounded-md px-3 py-1.5 hover:bg-slate-50 cursor-pointer transition-all">
            <Badge className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-xs font-bold text-slate-700">Label</span>
          </div>
          <Button variant="ghost" size="sm" className="text-xs font-bold text-slate-400 hover:text-slate-600" onClick={() => { setSearch(''); setStatus('all'); setPriority('all'); setAssigneeId('all'); setSearchParams({}); }}>
            Clear all
          </Button>
        </div>

        <div className="flex items-center gap-6">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{data?.meta?.total || 0} Issues</span>
          <div className="flex items-center gap-1 border border-slate-200 rounded-md p-1">
            <Button variant="ghost" size="icon" className="h-7 w-7 bg-slate-100 text-slate-900 shadow-sm"><List className="h-3.5 w-3.5" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-600"><LayoutGrid className="h-3.5 w-3.5" /></Button>
          </div>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden min-w-[1000px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 w-12">
                   <input type="checkbox" className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4" />
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-32">ID</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Title</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assignee</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Labels</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={8} className="px-6 py-4 h-16 bg-slate-50/20"></td>
                  </tr>
                ))
              ) : data?.tasks.map((task: any) => (
                <tr 
                  key={task.id} 
                  className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                  onClick={() => setSelectedTaskId(task.id)}
                >
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4" />
                  </td>
                  <td className="px-6 py-4 text-[11px] font-bold text-slate-500">KNT-{task.id.split('-')[0].toUpperCase()}</td>
                  <td className="px-6 py-4">
                    <span className="text-[13px] font-bold text-[#1D4ED8] hover:underline transition-all">
                      {task.title}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="secondary" className={cn(
                      "text-[10px] font-bold px-3 py-1 rounded-full shadow-none capitalize",
                      task.status === 'DONE' ? "bg-emerald-100 text-emerald-700" : 
                      task.status === 'IN_PROGRESS' ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"
                    )}>
                      {task.status.toLowerCase().replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {task.priority === 'HIGH' ? <ArrowUpCircle className="h-5 w-5 text-rose-500" /> : 
                     task.priority === 'MEDIUM' ? <Circle className="h-5 w-5 text-slate-300" /> : <MoreHorizontal className="h-5 w-5 text-slate-300" />}
                  </td>
                  <td className="px-6 py-4">
                    {task.assignee ? (
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                           <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${task.assignee.firstName}`} alt="avatar" />
                        </div>
                        <span className="text-xs font-medium text-slate-600">{task.assignee.firstName} {task.assignee.lastName}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1.5">
                      <Badge variant="outline" className="text-[10px] font-bold px-2 py-0 border-slate-200 text-slate-500 rounded bg-slate-50">Backend</Badge>
                      <Badge variant="outline" className="text-[10px] font-bold px-2 py-0 border-slate-200 text-slate-500 rounded bg-slate-50">Security</Badge>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-500">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Oct 12, 2023'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer / Pagination */}
          <div className="bg-white border-t border-slate-100 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-500">Rows per page:</span>
              <Select defaultValue="50">
                <SelectTrigger className="h-8 w-16 border-none bg-transparent shadow-none text-xs font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-8">
              <span className="text-xs font-bold text-slate-500">1-5 of {data?.meta?.total || 0}</span>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 disabled:opacity-30" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 disabled:opacity-30" disabled={page >= (data?.meta?.totalPages || 1)} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TaskDetailsModal taskId={selectedTaskId} open={!!selectedTaskId} onOpenChange={(open) => !open && setSelectedTaskId(null)} />
    </div>
  );
};

export default TaskListPage;
