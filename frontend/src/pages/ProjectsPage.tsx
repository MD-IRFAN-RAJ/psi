import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { projectService } from '@/api/projectService';
import { 
  Search, 
  Plus, 
  Users, 
  ChevronRight, 
  Loader2,
  FolderOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import CreateProjectModal from '@/components/projects/CreateProjectModal';
import { useAuthStore } from '@/store/useAuthStore';
import { canManageProjects } from '@/lib/rbac';

const ProjectsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: projectService.getProjects,
  });

  const filteredProjects = projects?.filter((p: any) => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.key.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const statusStyles: any = {
    ON_TRACK: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    AT_RISK: 'bg-rose-50 text-rose-700 border-rose-100',
    NEEDS_ATTENTION: 'bg-amber-50 text-amber-700 border-amber-100',
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Projects</h2>
          <p className="text-sm text-slate-500 mt-1">Monitor active initiatives and workspace performance.</p>
        </div>
        {canManageProjects(user?.role) && (
          <Button 
            className="bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold h-10 px-6"
            onClick={() => setCreateModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search projects by name or key..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 bg-slate-50 border-slate-200 text-sm focus:bg-white transition-all" 
            />
          </div>
        </div>
        <div className="flex items-center gap-6 border-l border-slate-100 pl-6">
           <div className="text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Projects</p>
              <p className="text-sm font-bold text-slate-900">{projects?.length || 0}</p>
           </div>
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
           <Loader2 className="h-8 w-8 animate-spin text-primary" />
           <p className="text-sm text-slate-500 font-medium tracking-tight">Initializing projects...</p>
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project: any) => {
            const assignedMembers = project.assignedMembers || [];
            const teamLead = assignedMembers.find((assignment: any) => assignment.role === 'TEAM_LEAD')?.user;
            const teamMemberCount = assignedMembers.filter((assignment: any) => assignment.role === 'TEAM_MEMBER').length;

            return (
            <div key={project.id} className="bg-white border border-slate-200 rounded-xl shadow-sm hover:border-primary hover:shadow-md transition-all cursor-pointer group flex flex-col">
              <div className="p-6 flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="h-10 w-10 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-primary font-bold">
                     {project.key}
                  </div>
                  <Badge className={cn("text-[10px] font-bold px-2 py-0.5 rounded shadow-none border", statusStyles[project.status || 'ON_TRACK'])}>
                     {(project.status || 'ON_TRACK').replace('_', ' ')}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">{project.name}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{project.description || 'No description provided.'}</p>
                </div>

                <div className="space-y-2 pt-2">
                   <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-400 uppercase tracking-widest">Active Tasks</span>
                      <span className="text-slate-900">{project._count?.tasks || 0}</span>
                   </div>
                   <div className="flex items-center justify-between text-[11px] font-bold">
                     <span className="text-slate-400 uppercase tracking-widest">Team Lead</span>
                     <span className="text-slate-900 text-right">
                      {teamLead ? `${teamLead.firstName} ${teamLead.lastName}` : 'Not assigned'}
                     </span>
                   </div>
                   <div className="flex items-center justify-between text-[11px] font-bold">
                     <span className="text-slate-400 uppercase tracking-widest">Team Members</span>
                     <span className="text-slate-900">{teamMemberCount}</span>
                   </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between rounded-b-xl">
                 <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-[11px] font-bold text-slate-500">{teamMemberCount + (teamLead ? 1 : 0)} Assigned</span>
                 </div>
                 <Button variant="ghost" size="sm" className="text-xs font-bold text-primary hover:bg-white px-3">
                    View Details
                    <ChevronRight className="h-3.5 w-3.5 ml-1" />
                 </Button>
              </div>
            </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-2xl py-24 flex flex-col items-center justify-center space-y-4">
           <FolderOpen className="h-12 w-12 text-slate-300" />
           <div className="text-center">
              <p className="text-sm font-bold text-slate-600">No projects found</p>
              <p className="text-xs text-slate-400 mt-1">Try a different search or create a new project to get started.</p>
           </div>
            {canManageProjects(user?.role) && (
             <Button variant="outline" onClick={() => setCreateModalOpen(true)} className="mt-4 border-slate-200">
               Create First Project
             </Button>
            )}
        </div>
      )}

      <CreateProjectModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
    </div>
  );
};

export default ProjectsPage;
