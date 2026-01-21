'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle } from "lucide-react";
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import { Project, Task, User } from '@/types';
import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProjectsPage() {
  const firestore = useFirestore();

  const projectsQuery = useMemoFirebase(() =>
    firestore ? query(collection(firestore, 'projects'), orderBy('createdAt', 'desc')) : null
    , [firestore]);

  const tasksQuery = useMemoFirebase(() =>
    firestore ? collection(firestore, 'tasks') : null
    , [firestore]);

  const usersQuery = useMemoFirebase(() =>
    firestore ? collection(firestore, 'users') : null
    , [firestore]);

  const { data: projects, loading: projectsLoading } = useCollection<Project>(projectsQuery);
  const { data: tasks } = useCollection<Task>(tasksQuery);
  const { data: users } = useCollection<User>(usersQuery);

  const userMap = useMemo(() => {
    const map = new Map<string, User>();
    users?.forEach(u => map.set(u.id, u));
    return map;
  }, [users]);

  // Helper to calculate progress
  const getProjectStats = (projectId: string) => {
    if (!tasks) return { progress: 0, completed: 0, total: 0 };
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    const total = projectTasks.length;
    const completed = projectTasks.filter(t => t.status === 'done').length;
    return {
      progress: total > 0 ? (completed / total) * 100 : 0,
      completed,
      total
    };
  };

  if (projectsLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[200px] w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <Link href="/projects/new">
          <Button size="sm" className="gap-1">
            <PlusCircle className="h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      {projects?.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No projects found. Create one to get started.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects?.map((project) => {
          const { progress } = getProjectStats(project.id);
          // Allow members to be optional/missing
          const memberIds = project.members || [];

          return (
            <Card key={project.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="truncate">{project.name}</CardTitle>
                <CardDescription className="line-clamp-2">{project.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Progress</span>
                  <span className="text-sm font-semibold">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} aria-label={`${Math.round(progress)}% complete`} />
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <div className="flex -space-x-2 overflow-hidden">
                  {memberIds.slice(0, 4).map(memberId => {
                    const user = userMap.get(memberId);
                    return (
                      <Avatar key={memberId} className="border-2 border-card inline-block">
                        <AvatarImage src={user?.photoURL} />
                        <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                    );
                  })}
                  {memberIds.length > 4 && (
                    <Avatar className="border-2 border-card">
                      <AvatarFallback>+{memberIds.length - 4}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
                <Link href={`/projects/${project.id}`}>
                  <Button variant="secondary" size="sm">View</Button>
                </Link>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
