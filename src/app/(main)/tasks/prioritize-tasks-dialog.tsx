'use client';

import { useState } from 'react';
import { Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { runFlow } from '@genkit-ai/next/run-flow';
import { prioritizeTasksFlow } from '@/ai/flows/prioritizeTasks';
import type { Task, Employee } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

type PrioritizedTask = Task & {
  justification: string;
  newPriority: 'Low' | 'Medium' | 'High' | 'Critical';
};

export function PrioritizeTasksDialog({ tasks, employees }: { tasks: Task[], employees: Employee[] }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PrioritizedTask[] | null>(null);

  const handlePrioritize = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const { prioritizedTasks } = await runFlow(prioritizeTasksFlow, { tasks, employees });
      setResult(prioritizedTasks as PrioritizedTask[]);
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const getPriorityVariant = (priority: 'Low' | 'Medium' | 'High' | 'Critical'): 'outline' | 'secondary' | 'destructive' | 'default' => {
    switch (priority) {
      case 'Critical':
        return 'destructive';
      case 'High':
        return 'destructive';
      case 'Medium':
        return 'secondary';
      case 'Low':
      default:
        return 'outline';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1 border-accent text-accent hover:bg-accent hover:text-accent-foreground">
          <Wand2 className="h-4 w-4" />
          AI Prioritize
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>AI-Driven Task Prioritization</DialogTitle>
          <DialogDescription>
            Let AI analyze your team's tasks to suggest an optimal order of execution based on deadlines, roles, and priority.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {!result && !isLoading && !error && (
             <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
                <Wand2 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">Ready to optimize?</h3>
                <p className="text-sm text-muted-foreground mb-4">Click the button below to start the AI analysis.</p>
                <Button onClick={handlePrioritize}>Generate Priorities</Button>
             </div>
          )}

          {isLoading && (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {result && (
            <ScrollArea className="h-[50vh] pr-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>New Priority</TableHead>
                    <TableHead>Justification</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.title}</TableCell>
                      <TableCell>
                        <Badge variant={getPriorityVariant(task.newPriority)}>{task.newPriority}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{task.justification}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
