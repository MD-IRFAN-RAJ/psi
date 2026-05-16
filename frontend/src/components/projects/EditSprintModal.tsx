import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { sprintService } from '@/api/sprintService';
import { projectService } from '@/api/projectService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { Loader2 } from 'lucide-react';

const sprintSchema = z.object({
  name: z.string().min(3, 'Sprint name must be at least 3 characters'),
  goal: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  projectId: z.string().min(1, 'Project is required'),
});

type SprintValues = z.infer<typeof sprintSchema>;

interface EditSprintModalProps {
  sprint: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditSprintModal: React.FC<EditSprintModalProps> = ({ sprint, open, onOpenChange }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: projectService.getProjects,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<SprintValues>({
    resolver: zodResolver(sprintSchema),
    defaultValues: {
      name: sprint?.name || '',
      goal: sprint?.goal || '',
      startDate: sprint?.startDate ? new Date(sprint.startDate).toISOString().split('T')[0] : '',
      endDate: sprint?.endDate ? new Date(sprint.endDate).toISOString().split('T')[0] : '',
      projectId: sprint?.projectId || '',
    }
  });

  useEffect(() => {
    if (sprint) {
      reset({
        name: sprint.name,
        goal: sprint.goal,
        startDate: new Date(sprint.startDate).toISOString().split('T')[0],
        endDate: new Date(sprint.endDate).toISOString().split('T')[0],
        projectId: sprint.projectId,
      });
    } else {
      reset({
        name: '',
        goal: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        projectId: '',
      });
    }
  }, [sprint, reset, open]);

  const mutation = useMutation({
    mutationFn: (data: SprintValues) => 
      sprint?.id 
        ? sprintService.updateSprint(sprint.id, data)
        : sprintService.createSprint(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeSprint'] });
      queryClient.invalidateQueries({ queryKey: ['sprints'] });
      toast({ title: sprint?.id ? 'Sprint updated!' : 'Sprint started!' });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: sprint?.id ? 'Failed to update sprint' : 'Failed to start sprint',
        description: error.response?.data?.error || 'Something went wrong',
      });
    },
  });

  const onSubmit = (data: SprintValues) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{sprint?.id ? 'Edit Sprint Details' : 'Start New Sprint'}</DialogTitle>
          <DialogDescription>{sprint?.id ? 'Update your sprint goals and timeline.' : 'Define your goals for this new work cycle.'}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Project</label>
            <Select onValueChange={(v) => setValue('projectId', v)} defaultValue={sprint?.projectId || ''}>
              <SelectTrigger className="bg-slate-50 border-slate-200">
                <SelectValue placeholder="Select a project for this sprint" />
              </SelectTrigger>
              <SelectContent>
                {projects?.map((p: any) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} ({p.key})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.projectId && <p className="text-[10px] text-rose-500 font-bold">{errors.projectId.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Sprint Name</label>
            <Input 
              placeholder="e.g., Sprint 25: Growth Phase" 
              className="bg-slate-50 border-slate-200" 
              {...register('name')}
            />
            {errors.name && <p className="text-[10px] text-rose-500 font-bold">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Sprint Goal</label>
            <Textarea 
              placeholder="What do we want to achieve?" 
              className="min-h-[80px] bg-slate-50 border-slate-200" 
              {...register('goal')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Start Date</label>
              <Input type="date" className="bg-slate-50 border-slate-200" {...register('startDate')} />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">End Date</label>
              <Input type="date" className="bg-slate-50 border-slate-200" {...register('endDate')} />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending} className="bg-primary text-white">
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : sprint?.id ? 'Save Changes' : 'Start Sprint'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditSprintModal;
