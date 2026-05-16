import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { taskService } from '@/api/taskService';
import { 
  Settings2, 
  Zap,
  Edit2,
  CheckCircle2,
  Calendar as CalendarIcon,
  AlertCircle,
  Plus,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import TaskDetailsModal from '@/components/tasks/TaskDetailsModal';
import EditSprintModal from '@/components/projects/EditSprintModal';
import { sprintService } from '@/api/sprintService';
import { projectService } from '@/api/projectService';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/useAuthStore';
import { canManageSprints } from '@/lib/rbac';

const BacklogPage: React.FC = () => {
   const { user } = useAuthStore();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => taskService.getTasks({ limit: 100 }),
  });

  const { data: activeSprint, isLoading: sprintLoading } = useQuery({
    queryKey: ['activeSprint'],
    queryFn: sprintService.getActiveSprint,
  });

   const { data: projects } = useQuery({
      queryKey: ['projects'],
      queryFn: projectService.getProjects,
   });

   const completeSprintMutation = useMutation({
      mutationFn: () => sprintService.updateSprint(activeSprint.id, { status: 'COMPLETED' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeSprint'] });
         queryClient.invalidateQueries({ queryKey: ['sprints'] });
      toast({ title: 'Sprint completed!' });
    },
  });

  const tasks = tasksData?.tasks || [];
   const projectMap = (projects || []).reduce((acc: Record<string, any>, project: any) => {
      acc[project.id] = project;
      return acc;
   }, {});
  
  // Dynamic Sprint Data Calculation
  const todoCount = tasks.filter((t: any) => t.status === 'TODO').length;
  const inProgressCount = tasks.filter((t: any) => t.status === 'IN_PROGRESS').length;
  const doneCount = tasks.filter((t: any) => t.status === 'DONE').length;

  const sprint = activeSprint || {
    id: 'placeholder',
    name: 'No Active Sprint',
    goal: 'Create a sprint to start tracking work.',
    startDate: new Date(),
    endDate: new Date(),
    todo: 0,
    inProgress: 0,
    done: 0,
  };

  // Days left calculation
  const today = new Date();
  const endDate = new Date(sprint.endDate);
  const diffTime = Math.max(0, endDate.getTime() - today.getTime());
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

  if (tasksLoading || sprintLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-slate-500 font-medium tracking-tight">Loading Workspace...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
      {/* Sprint Info Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100">
        <div className="flex-1 p-6 space-y-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
               <Zap className="h-6 w-6" />
            </div>
            <div className="space-y-1">
               <h3 className="text-xl font-bold text-slate-900">{sprint.name}</h3>
               <p className="text-sm text-slate-500">Goal: {sprint.goal}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between border-l border-slate-100 pl-8">
             <div className="flex items-center gap-16">
                <div className="space-y-1">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time Remaining</p>
                   <p className="text-sm font-bold text-slate-900">{daysLeft} Days Left</p>
                   <div className="w-20 h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${completionRate}%` }}></div>
                   </div>
                </div>
                <div className="space-y-1 text-center">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">To Do</p>
                   <p className="text-sm font-bold text-slate-900">{todoCount}</p>
                </div>
                <div className="space-y-1 text-center">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">In Progress</p>
                   <p className="text-sm font-bold text-slate-900">{inProgressCount}</p>
                </div>
                <div className="space-y-1 text-center">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Done</p>
                   <p className="text-sm font-bold text-emerald-600">{doneCount}</p>
                </div>
             </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50/50 flex flex-col justify-center gap-4 w-full md:w-64">
                {activeSprint && canManageSprints(user?.role) ? (
             <>
               <Button 
                  className="w-full bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold h-11"
                  onClick={() => completeSprintMutation.mutate()}
                  disabled={completeSprintMutation.isPending}
               >
                  {completeSprintMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Complete Sprint'}
               </Button>
               <Button 
                  variant="outline" 
                  className="w-full bg-white border-slate-200 text-slate-600 font-bold h-11"
                  onClick={() => setEditModalOpen(true)}
               >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Sprint
               </Button>
             </>
                ) : !activeSprint && canManageSprints(user?.role) ? (
               <Button 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11"
                onClick={() => setEditModalOpen(true)}
             >
                <Plus className="h-4 w-4 mr-2" />
                Start Sprint
             </Button>
                ) : (
                   <div className="text-xs text-slate-500 text-center font-medium">You do not have sprint management permission.</div>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         {/* Backlog List */}
         <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between px-2">
               <div className="flex items-center gap-4">
                  <h3 className="text-xl font-bold text-slate-900">Backlog</h3>
                  <Badge variant="secondary" className="bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded text-[11px]">{tasks.length} Issues</Badge>
               </div>
               <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 border border-slate-200 rounded p-1 bg-white">
                     <Button variant="ghost" size="sm" className="h-7 px-3 text-[11px] font-bold text-slate-600 bg-slate-100 shadow-sm">Group: Epic</Button>
                     <Button variant="ghost" size="sm" className="h-7 px-3 text-[11px] font-bold text-slate-400 hover:text-slate-600">Priority</Button>
                  </div>
                  <Button variant="ghost" size="icon" className="h-9 w-9 border border-slate-200 bg-white">
                     <Settings2 className="h-4 w-4 text-slate-400" />
                  </Button>
               </div>
            </div>

            {/* Tasks List */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
               <div className="divide-y divide-slate-50">
                  {tasks.length > 0 ? (
                     tasks.map((task: any) => (
                        <div 
                          key={task.id} 
                          className="px-6 py-3 flex items-center justify-between hover:bg-slate-50/30 transition-colors cursor-pointer group"
                          onClick={() => setSelectedTaskId(task.id)}
                        >
                           <div className="flex items-center gap-4">
                              <div className={cn(
                                "h-5 w-5 flex items-center justify-center rounded-full border-2",
                                task.status === 'DONE' ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-200"
                              )}>
                                {task.status === 'DONE' && <CheckCircle2 className="h-4 w-4" />}
                              </div>
                              <div className="flex items-center gap-3">
                                 <span className="text-xs font-bold text-slate-900 group-hover:text-primary transition-colors">{task.title}</span>
                                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TS-{task.id.split('-')[0].toUpperCase()}</span>
                                 {task.projectId && projectMap[task.projectId] && (
                                    <Badge variant="outline" className="text-[10px] font-bold text-slate-600 border-slate-200 bg-slate-50 px-1.5 py-0">
                                       {projectMap[task.projectId].key}
                                    </Badge>
                                 )}
                                 {task.dueDate && (
                                   <>
                                     <CalendarIcon className="h-3 w-3 text-slate-300" />
                                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{format(new Date(task.dueDate), 'MMM dd')}</span>
                                   </>
                                 )}
                              </div>
                           </div>
                           <div className="flex items-center gap-4">
                              <div 
                                className="h-7 w-7 rounded-full bg-slate-100 border border-slate-200 overflow-hidden hover:ring-2 hover:ring-primary/20 transition-all"
                                title={task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : 'Unassigned'}
                              >
                                 <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${task.assignee?.firstName || 'none'}`} alt="avatar" />
                              </div>
                              <AlertCircle className={cn("h-4 w-4", task.priority === 'HIGH' ? "text-rose-500" : "text-slate-300")} />
                           </div>
                        </div>
                     ))
                  ) : (
                     <div className="p-6 text-center text-xs text-slate-400 italic">No tasks in the backlog.</div>
                  )}
               </div>
            </div>
         </div>

         {/* Sidebar Stats */}
         <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
               <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Sprint Details</h4>
               
               <div className="space-y-4">
                  <div className="space-y-1">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date Range</p>
                     <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-slate-400" />
                        <span className="text-xs font-bold text-slate-700">
                          {sprint.startDate && format(new Date(sprint.startDate), 'MMM dd')} - {sprint.endDate && format(new Date(sprint.endDate), 'MMM dd')}
                        </span>
                     </div>
                  </div>

                  <div className="space-y-1">
                     <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Workspace Completion</p>
                        <span className="text-xs font-bold text-slate-900">{completionRate}%</span>
                     </div>
                     <div className="h-2 w-full bg-slate-100 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: `${completionRate}%` }}></div>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                     <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100 text-center">
                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Velocity</p>
                        <p className="text-xl font-bold text-indigo-600 mt-1">{totalTasks}</p>
                     </div>
                     <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100 text-center">
                        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Finished</p>
                        <p className="text-xl font-bold text-emerald-600 mt-1">{doneCount}</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Timeline</h4>
                <div className="space-y-6 relative ml-2">
                   <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-100"></div>
                   {[
                      { title: 'Sprint Planning', date: 'Oct 01', done: true },
                      { title: 'Mid-Sprint Review', date: 'Oct 15', done: true },
                      { title: 'Sprint Retrospective', date: 'Oct 31', done: false },
                   ].map((item, i) => (
                      <div key={i} className="flex gap-4 relative">
                         <div className={cn("h-2.5 w-2.5 rounded-full border-2 border-white ring-2 ring-offset-0 z-10 -ml-1.5 mt-1", item.done ? "bg-indigo-600 ring-indigo-600" : "bg-slate-200 ring-slate-200")}></div>
                         <div className="space-y-0.5">
                            <p className="text-xs font-bold text-slate-900">{item.title}</p>
                            <p className="text-[10px] font-medium text-slate-400">{item.done ? 'Completed' : 'Upcoming'} • {item.date}</p>
                         </div>
                      </div>
                   ))}
                </div>
            </div>
         </div>
      </div>
         {canManageSprints(user?.role) && (
            <EditSprintModal sprint={activeSprint || null} open={editModalOpen} onOpenChange={setEditModalOpen} />
         )}
      <TaskDetailsModal taskId={selectedTaskId} open={!!selectedTaskId} onOpenChange={(open) => !open && setSelectedTaskId(null)} />
    </div>
  );
};

export default BacklogPage;
