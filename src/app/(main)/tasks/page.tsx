'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle } from "lucide-react";
import { PrioritizeTasksDialog } from "./prioritize-tasks-dialog";
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import { Task, User } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function TasksPage() {
  const firestore = useFirestore();

  const tasksQuery = useMemoFirebase(() =>
    firestore ? query(collection(firestore, 'tasks'), orderBy('createdAt', 'desc')) : null
    , [firestore]);

  const usersQuery = useMemoFirebase(() =>
    firestore ? collection(firestore, 'users') : null
    , [firestore]);

  const { data: tasks, loading: tasksLoading } = useCollection<Task>(tasksQuery);
  const { data: users } = useCollection<User>(usersQuery);

  const userMap = useMemo(() => {
    const map = new Map<string, string>();
    users?.forEach(u => map.set(u.id, u.displayName || u.email));
    return map;
  }, [users]);

  const getEmployeeName = (employeeId?: string) => {
    if (!employeeId) return 'Unassigned';
    return userMap.get(employeeId) || 'Unknown';
  };

  const getPriorityVariant = (priority: string): 'outline' | 'secondary' | 'destructive' => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
      default:
        return 'outline';
    }
  };

  const getStatusVariant = (status: string) => {
    return status === 'done' ? 'default' : 'outline';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4">
          <CardTitle>Tasks</CardTitle>
          <div className="flex gap-2">
            {tasks && users && <PrioritizeTasksDialog tasks={tasks} employees={users} />}
            <Link href="/tasks/new">
              <Button size="sm" className="gap-1">
                <PlusCircle className="h-4 w-4" />
                Add Task
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Assigned To</TableHead>
                <TableHead className="hidden md:table-cell">Due Date</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasksLoading && Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-[200px]" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-[100px]" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-[60px]" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-[60px]" /></TableCell>
                </TableRow>
              ))}
              {!tasksLoading && tasks?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No tasks found.
                  </TableCell>
                </TableRow>
              )}
              {!tasksLoading && tasks?.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell className="hidden md:table-cell">{getEmployeeName(task.assigneeId)}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {task.dueDate ? format(task.dueDate, 'MMM d, yyyy') : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPriorityVariant(task.priority)} className="capitalize">{task.priority}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(task.status)} className={`capitalize ${task.status === 'done' ? 'bg-green-600 hover:bg-green-700' : ''}`}>
                      {task.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
