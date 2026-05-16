import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const projectSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters'),
  key: z.string().min(2, 'Project key must be at least 2 characters').max(5, 'Key too long').toUpperCase(),
  description: z.string().optional(),
});

type ProjectValues = z.infer<typeof projectSchema>;

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ open, onOpenChange }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      key: '',
      description: '',
    }
  });

  const mutation = useMutation({
    mutationFn: projectService.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({ title: 'Project created successfully' });
      onOpenChange(false);
      reset();
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to create project',
        description: error.response?.data?.error || 'Something went wrong',
      });
    },
  });

  const onSubmit = (data: ProjectValues) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900">Create New Project</DialogTitle>
          <DialogDescription className="text-slate-500 mt-2">
            Establish a new workspace for your team initiatives.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Project Name</label>
              <Input 
                placeholder="e.g., Marketing Campaign 2024" 
                className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all text-sm font-medium" 
                {...register('name')}
              />
              {errors.name && <p className="text-[10px] text-rose-500 font-bold">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Project Key</label>
              <Input 
                placeholder="e.g., MKT" 
                className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all text-sm font-bold" 
                {...register('key')}
              />
              <p className="text-[10px] text-slate-400">Short identifier for tasks (e.g., MKT-101)</p>
              {errors.key && <p className="text-[10px] text-rose-500 font-bold">{errors.key.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Description</label>
              <Textarea 
                placeholder="Briefly describe the project goals..." 
                className="min-h-[100px] bg-slate-50 border-slate-200 focus:bg-white transition-all text-sm font-medium" 
                {...register('description')}
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              className="font-bold text-slate-500"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold px-8 h-11"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectModal;
