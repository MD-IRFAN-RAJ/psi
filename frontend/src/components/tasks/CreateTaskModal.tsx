import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { taskService } from '@/api/taskService';
import { userService } from '@/api/userService';
import { projectService } from '@/api/projectService';
import { sprintService } from '@/api/sprintService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, X, FileText } from 'lucide-react';

const createTaskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']),
  dueDate: z.string().optional().nullable(),
  assigneeId: z.string().optional().nullable(),
  projectId: z.string().optional().nullable(),
  sprintId: z.string().optional().nullable(),
});

type CreateTaskValues = z.infer<typeof createTaskSchema>;

interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateTaskModal = ({ open, onOpenChange }: CreateTaskModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [files, setFiles] = useState<File[]>([]);

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getUsers,
  });

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: projectService.getProjects,
  });

  const { data: sprints, refetch: refetchSprints } = useQuery({
    queryKey: ['sprints'],
    queryFn: sprintService.getSprints,
    enabled: open,
  });

  useEffect(() => {
    if (open) {
      refetchSprints();
    }
  }, [open, refetchSprints]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateTaskValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      priority: 'MEDIUM',
      status: 'TODO',
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: CreateTaskValues) => {
      // 1. Create Task
      const task = await taskService.createTask(values);

      // 2. Upload attachments if any
      if (files.length > 0) {
        for (const file of files) {
          const formData = new FormData();
          formData.append('file', file);
          await taskService.uploadAttachment(task.id, formData);
        }
      }
      return task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({ title: 'Task created successfully' });
      onOpenChange(false);
      reset();
      setFiles([]);
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to create task',
        description: error.response?.data?.error || 'Something went wrong',
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const pdfOnly = newFiles.filter(f => f.type === 'application/pdf');
      const oversized = pdfOnly.filter(f => f.size > 5 * 1024 * 1024);
      
      if (pdfOnly.length !== newFiles.length) {
        toast({
          variant: 'destructive',
          title: 'Invalid file type',
          description: 'Only PDF files are allowed.',
        });
      }

      if (oversized.length > 0) {
        toast({
          variant: 'destructive',
          title: 'File too large',
          description: 'Each file must be less than 5MB.',
        });
        return;
      }

      if (files.length + pdfOnly.length > 3) {
        toast({
          variant: 'destructive',
          title: 'Limit exceeded',
          description: 'Maximum of 3 files allowed per task.',
        });
        return;
      }

      setFiles([...files, ...pdfOnly]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const selectedProjectId = watch('projectId');
  const projectSprints = sprints?.filter((s: any) => s.projectId === selectedProjectId && s.status === 'ACTIVE') || [];

  const onSubmit = (data: CreateTaskValues) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new task in your workspace.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              placeholder="e.g., API Authentication Refactor"
              {...register('title')}
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Describe the task details..."
              className="min-h-[100px]"
              {...register('description')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Project</label>
              <Select onValueChange={(v) => { setValue('projectId', v); setValue('sprintId', null); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects?.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.key})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sprint</label>
              <Select disabled={!selectedProjectId} onValueChange={(v) => setValue('sprintId', v)}>
                <SelectTrigger>
                  <SelectValue placeholder={selectedProjectId ? "Select sprint (optional)" : "Select project first"} />
                </SelectTrigger>
                <SelectContent>
                  {projectSprints.length === 0 && selectedProjectId ? (
                    <SelectItem value="none" disabled>No active sprints</SelectItem>
                  ) : (
                    projectSprints.map((s: any) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select defaultValue="MEDIUM" onValueChange={(v) => setValue('priority', v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Assignee</label>
              <Select onValueChange={(v) => setValue('assigneeId', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Assign to..." />
                </SelectTrigger>
                <SelectContent>
                  {users?.map((u: any) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.firstName} {u.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Due Date</label>
            <Input type="date" {...register('dueDate')} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Attachments (Max 3 PDF)</label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept=".pdf"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  disabled={files.length >= 3}
                />
                <label
                  htmlFor="file-upload"
                  className={`flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-slate-50 transition-colors ${
                    files.length >= 3 ? 'opacity-50 cursor-not-allowed' : 'border-slate-200'
                  }`}
                >
                  <Upload className="h-5 w-5 text-slate-400" />
                  <span className="text-sm text-slate-500 font-medium">
                    Click to upload PDFs (Max 5MB)
                  </span>
                </label>
              </div>

              {files.length > 0 && (
                <div className="space-y-2">
                  {files.map((file, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-xs font-medium truncate">{file.name}</span>
                        <span className="text-[10px] text-slate-400">({(file.size / 1024).toFixed(0)} KB)</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-slate-400 hover:text-destructive"
                        onClick={() => removeFile(i)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Task'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskModal;
