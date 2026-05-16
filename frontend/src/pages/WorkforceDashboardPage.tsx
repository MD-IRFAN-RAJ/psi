import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectService } from '@/api/projectService';
import { userService } from '@/api/userService';
import { useAuthStore } from '@/store/useAuthStore';
import { Users, Shield, Briefcase, UserCog, UserRoundCheck, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

type Assignment = {
  id: string;
  role: 'TEAM_LEAD' | 'TEAM_MEMBER';
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
};

const WorkforceDashboardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuthStore();

  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedLeadId, setSelectedLeadId] = useState<string>('none');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getUsers,
  });

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: projectService.getProjects,
  });

  const selectedProject = useMemo(
    () => projects?.find((project: any) => project.id === selectedProjectId),
    [projects, selectedProjectId]
  );

  const teamLeads = (users || []).filter((member: any) => ['TEAM_LEAD', 'MANAGER'].includes(member.role));
  const teamMembers = (users || []).filter((member: any) => ['TEAM_MEMBER', 'USER'].includes(member.role));

  const roleCount = useMemo(() => {
    const allUsers = users || [];
    return {
      ADMIN: allUsers.filter((u: any) => u.role === 'ADMIN').length,
      CTO: allUsers.filter((u: any) => u.role === 'CTO').length,
      MANAGER: allUsers.filter((u: any) => u.role === 'MANAGER').length,
      TEAM_LEAD: allUsers.filter((u: any) => u.role === 'TEAM_LEAD').length,
      TEAM_MEMBER: allUsers.filter((u: any) => ['TEAM_MEMBER', 'USER'].includes(u.role)).length,
    };
  }, [users]);

  useEffect(() => {
    if (!selectedProjectId && projects?.length) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  useEffect(() => {
    if (!selectedProject) {
      setSelectedLeadId('none');
      setSelectedMemberIds([]);
      return;
    }

    const lead = (selectedProject.assignedMembers || []).find((assignment: Assignment) => assignment.role === 'TEAM_LEAD');
    const members = (selectedProject.assignedMembers || [])
      .filter((assignment: Assignment) => assignment.role === 'TEAM_MEMBER')
      .map((assignment: Assignment) => assignment.user.id);

    setSelectedLeadId(lead?.user.id || 'none');
    setSelectedMemberIds(members);
  }, [selectedProject]);

  const canAssign = ['ADMIN', 'CTO', 'MANAGER'].includes(user?.role || '');

  const assignMutation = useMutation({
    mutationFn: () =>
      projectService.assignMembers(selectedProjectId, {
        teamLeadId: selectedLeadId === 'none' ? null : selectedLeadId,
        teamMemberIds: selectedMemberIds,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({ title: 'Project members updated' });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to update members',
        description: error.response?.data?.error || 'Only managers, CTO, or admin can assign members.',
      });
    },
  });

  const toggleMember = (memberId: string) => {
    setSelectedMemberIds((current) =>
      current.includes(memberId) ? current.filter((id) => id !== memberId) : [...current, memberId]
    );
  };

  if (usersLoading || projectsLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Workforce Dashboard</h2>
          <p className="text-sm text-slate-500 mt-1">View leadership structure and assign team leads and team members to projects.</p>
        </div>
        <Badge variant="outline" className="text-xs font-bold border-slate-200 bg-white">
          {canAssign ? 'Assignment Enabled' : 'Read-only Access'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Admin</p>
          <div className="flex items-center justify-between mt-3">
            <p className="text-2xl font-bold text-slate-900">{roleCount.ADMIN}</p>
            <Shield className="h-5 w-5 text-slate-400" />
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">CTO</p>
          <div className="flex items-center justify-between mt-3">
            <p className="text-2xl font-bold text-slate-900">{roleCount.CTO}</p>
            <UserCog className="h-5 w-5 text-slate-400" />
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Managers</p>
          <div className="flex items-center justify-between mt-3">
            <p className="text-2xl font-bold text-slate-900">{roleCount.MANAGER}</p>
            <Briefcase className="h-5 w-5 text-slate-400" />
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Team Leads</p>
          <div className="flex items-center justify-between mt-3">
            <p className="text-2xl font-bold text-slate-900">{roleCount.TEAM_LEAD}</p>
            <UserRoundCheck className="h-5 w-5 text-slate-400" />
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Team Members</p>
          <div className="flex items-center justify-between mt-3">
            <p className="text-2xl font-bold text-slate-900">{roleCount.TEAM_MEMBER}</p>
            <Users className="h-5 w-5 text-slate-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Projects</h3>
          <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
            {(projects || []).map((project: any) => (
              <button
                key={project.id}
                className={`w-full text-left rounded-lg border px-3 py-2.5 transition-colors ${
                  selectedProjectId === project.id
                    ? 'border-primary bg-primary/5'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
                onClick={() => setSelectedProjectId(project.id)}
              >
                <p className="text-sm font-bold text-slate-900">{project.name}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{project.key}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Project Staffing</h3>
            <p className="text-xs text-slate-500 mt-1">
              {selectedProject ? `${selectedProject.name} (${selectedProject.key})` : 'Select a project'}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Team Lead</label>
            <Select
              value={selectedLeadId}
              onValueChange={setSelectedLeadId}
              disabled={!selectedProjectId || !canAssign}
            >
              <SelectTrigger className="bg-slate-50 border-slate-200">
                <SelectValue placeholder="Select team lead" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No team lead</SelectItem>
                {teamLeads.map((member: any) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.firstName} {member.lastName} ({member.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Team Members</label>
            <div className="border border-slate-200 rounded-lg p-3 max-h-60 overflow-auto bg-slate-50/60 space-y-2">
              {teamMembers.map((member: any) => (
                <label key={member.id} className="flex items-center justify-between gap-3 px-2 py-1.5 rounded hover:bg-white cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{member.firstName} {member.lastName}</p>
                    <p className="text-[11px] text-slate-500">{member.email}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedMemberIds.includes(member.id)}
                    onChange={() => toggleMember(member.id)}
                    disabled={!canAssign}
                    aria-label={`Assign ${member.firstName} ${member.lastName}`}
                    className="h-4 w-4"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-slate-500">
              Only Admin, CTO, and Managers can update project staffing assignments.
            </p>
            <Button
              onClick={() => assignMutation.mutate()}
              disabled={!selectedProjectId || !canAssign || assignMutation.isPending}
              className="bg-[#1D4ED8] hover:bg-[#1E40AF] text-white"
            >
              {assignMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Assignment'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkforceDashboardPage;
