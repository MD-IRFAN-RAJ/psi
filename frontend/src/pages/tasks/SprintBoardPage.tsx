import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '@/api/taskService';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { 
  MoreHorizontal, 
  Plus, 
  Filter, 
  Users, 
  AlertCircle,
  MessageSquare,
  Paperclip,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { sprintService } from '@/api/sprintService';

const columnsConfig = [
  { id: 'TODO', name: 'To Do' },
  { id: 'IN_PROGRESS', name: 'In Progress' },
  { id: 'DONE', name: 'Done' },
];

const SprintBoardPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [boardData, setBoardData] = useState<any>({});

  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['tasks', { limit: 100 }],
    queryFn: () => taskService.getTasks({ limit: 100 }),
  });

  const { data: activeSprint } = useQuery({
    queryKey: ['activeSprint'],
    queryFn: sprintService.getActiveSprint,
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => 
      taskService.updateTask(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: 'Could not update task status.',
      });
    }
  });

  // Synchronize internal board state with fetched data
  useEffect(() => {
    if (tasksData?.tasks) {
      const grouped = tasksData.tasks.reduce((acc: any, task: any) => {
        const status = task.status;
        if (!acc[status]) acc[status] = [];
        acc[status].push(task);
        return acc;
      }, {
        TODO: [],
        IN_PROGRESS: [],
        DONE: [],
      });
      setBoardData(grouped);
    }
  }, [tasksData]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // 1. Update UI Optimistically
    const sourceCol = [...boardData[source.droppableId]];
    const destCol = [...boardData[destination.droppableId]];
    const [movedTask] = sourceCol.splice(source.index, 1);
    
    if (source.droppableId === destination.droppableId) {
      sourceCol.splice(destination.index, 0, movedTask);
      setBoardData({ ...boardData, [source.droppableId]: sourceCol });
    } else {
      destCol.splice(destination.index, 0, movedTask);
      setBoardData({
        ...boardData,
        [source.droppableId]: sourceCol,
        [destination.droppableId]: destCol,
      });

      // 2. Persist to Backend
      updateTaskMutation.mutate({ id: draggableId, status: destination.droppableId });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 h-full flex flex-col space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span>Projects</span>
          <span className="text-slate-300">/</span>
          <span>{activeSprint?.project?.name || 'Project'}</span>
          <span className="text-slate-300">/</span>
          <span className="font-bold text-slate-900">Board</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-slate-900">{activeSprint?.name || 'Sprint Board'}</h2>
          <div className="flex -space-x-2 ml-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 w-8 rounded-full border-2 border-white overflow-hidden bg-slate-100 ring-1 ring-slate-100">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`} alt="user" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="bg-white border-slate-200 text-slate-600 font-bold h-9">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm" className="bg-white border-slate-200 text-slate-600 font-bold h-9">
            <Users className="h-4 w-4 mr-2" />
            Grouping
          </Button>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
          {columnsConfig.map((column) => (
            <div key={column.id} className="min-w-[320px] w-[320px] flex flex-col gap-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{column.name}</h3>
                  <span className="text-[11px] font-bold text-slate-300">{(boardData[column.id] || []).length}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={cn(
                      "flex-1 bg-slate-50/50 rounded-xl p-3 space-y-3 transition-colors min-h-[200px]",
                      snapshot.isDraggingOver && "bg-slate-100/80"
                    )}
                  >
                    {(boardData[column.id] || []).map((task: any, index: number) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{ ...provided.draggableProps.style }}
                            className={cn(
                              "bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-4 hover:border-primary transition-shadow cursor-grab active:cursor-grabbing group",
                              snapshot.isDragging && "shadow-xl border-primary ring-2 ring-primary/10 rotate-2"
                            )}
                          >
                            <div className="flex items-start justify-between">
                              <span className="text-[11px] font-bold text-slate-400 tracking-wider">KS-{task.id.split('-')[0].toUpperCase()}</span>
                              <AlertCircle className={cn(
                                "h-4 w-4",
                                task.priority === 'HIGH' ? "text-rose-500" : "text-slate-300"
                              )} />
                            </div>
                            <p className="text-[13px] font-bold text-slate-700 leading-snug group-hover:text-primary transition-colors">
                              {task.title}
                            </p>
                            
                            <div className="flex gap-1.5 flex-wrap">
                              <Badge variant="secondary" className="text-[9px] font-bold bg-blue-50 text-blue-600 px-2 py-0 shadow-none rounded border-none uppercase">Dev</Badge>
                              {task.priority === 'HIGH' && (
                                <Badge variant="secondary" className="text-[9px] font-bold bg-rose-50 text-rose-600 px-2 py-0 shadow-none rounded border-none uppercase">Critical</Badge>
                              )}
                            </div>

                            <div className="flex items-center justify-between pt-2">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                  <MessageSquare className="h-3 w-3" />
                                  2
                                </div>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                  <Paperclip className="h-3 w-3" />
                                  {task.attachments?.length || 0}
                                </div>
                              </div>
                              <div className="h-6 w-6 rounded-full bg-slate-100 border border-slate-200 overflow-hidden ring-2 ring-white">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${task.assignee?.firstName || 'none'}`} alt="avatar" />
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    <Button variant="ghost" className="w-full text-slate-400 text-xs font-bold py-6 hover:bg-white hover:text-slate-600 transition-all border border-dashed border-transparent hover:border-slate-200">
                      <Plus className="h-4 w-4 mr-2" />
                      Add task
                    </Button>
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default SprintBoardPage;
