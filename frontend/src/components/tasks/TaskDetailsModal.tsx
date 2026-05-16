import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '@/api/taskService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  User, 
  FileText, 
  Download, 
  Trash2, 
  Loader2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';
import { hasAnyRole } from '@/lib/rbac';

const statusColors: any = {
  TODO: 'bg-slate-100 text-slate-700 border-slate-200',
  IN_PROGRESS: 'bg-blue-100 text-blue-700 border-blue-200',
  DONE: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const priorityColors: any = {
  LOW: 'bg-slate-100 text-slate-600',
  MEDIUM: 'bg-amber-100 text-amber-700',
  HIGH: 'bg-rose-100 text-rose-700',
};

interface TaskDetailsModalProps {
  taskId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TaskDetailsModal = ({ taskId, open, onOpenChange }: TaskDetailsModalProps) => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const canManageTaskMeta = hasAnyRole(user?.role, ['ADMIN', 'CTO', 'MANAGER', 'TEAM_LEAD']);

  const { data: task, isLoading } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => taskService.getTaskById(taskId!),
    enabled: !!taskId && open,
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => taskService.updateTask(taskId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      toast({ title: 'Task updated' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => taskService.deleteTask(taskId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({ title: 'Task deleted' });
      onOpenChange(false);
    },
  });

  const handleDownload = async (attachmentId: string, fileName: string) => {
    try {
      const blob = await taskService.downloadAttachment(attachmentId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Download failed',
        description: 'You might not have permission to download this file.',
      });
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-slate-500">Loading details...</p>
          </div>
        ) : task ? (
          <>
            <DialogHeader className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={cn("px-2.5 py-0.5 rounded-full border shadow-none", statusColors[task.status])}>
                  {task.status.replace('_', ' ')}
                </Badge>
                <div className="flex items-center gap-2">
                  {canManageTaskMeta && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-slate-400 hover:text-destructive"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this task?')) {
                          deleteMutation.mutate();
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <DialogTitle className="text-2xl font-bold text-slate-900">{task.title}</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-6">
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-2">Description</h4>
                  <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                    {task.description || 'No description provided.'}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">Attachments</h4>
                  {task.attachments?.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2">
                      {task.attachments.map((file: any) => (
                        <div key={file.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 group">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="h-8 w-8 bg-white rounded border border-slate-200 flex items-center justify-center text-primary">
                              <FileText className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col overflow-hidden">
                              <span className="text-xs font-semibold text-slate-700 truncate">{file.fileName}</span>
                              <span className="text-[10px] text-slate-400 uppercase">{file.fileType.split('/')[1]} • {(file.fileSize / 1024).toFixed(0)} KB</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-primary"
                            onClick={() => handleDownload(file.id, file.fileName)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No attachments for this task.</p>
                  )}
                </div>
              </div>

              <div className="space-y-6 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</label>
                    <Select 
                      value={task.status} 
                      onValueChange={(v) => updateMutation.mutate({ status: v })}
                    >
                      <SelectTrigger className="h-9 bg-white border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TODO">To Do</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="DONE">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {canManageTaskMeta && (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Priority</label>
                      <Select 
                        value={task.priority} 
                        onValueChange={(v) => updateMutation.mutate({ priority: v })}
                      >
                        <SelectTrigger className="h-9 bg-white border-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-3 pt-2">
                    <div className="flex items-center text-sm">
                      <User className="h-4 w-4 mr-3 text-slate-400" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Assignee</p>
                        <p className="text-slate-700 font-medium">{task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : 'Unassigned'}</p>
                      </div>
                    </div>

                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-3 text-slate-400" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Due Date</p>
                        <p className="text-slate-700 font-medium">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No deadline'}</p>
                      </div>
                    </div>

                    <div className="flex items-center text-sm">
                      <AlertCircle className="h-4 w-4 mr-3 text-slate-400" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Created By</p>
                        <p className="text-slate-700 font-medium">{task.author.firstName} {task.author.lastName}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="p-8 text-center text-slate-500">Failed to load task details.</div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailsModal;
