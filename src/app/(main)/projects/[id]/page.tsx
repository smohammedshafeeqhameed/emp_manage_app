'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Calendar, Clock, CheckCircle2 } from "lucide-react";
import { useCollection, useDoc, useFirestore } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import { Project, Task, User } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';

export default function ProjectDetailsPage() {
    const params = useParams();
    const id = params?.id as string;
    const firestore = useFirestore();

    const projectDocRef = useMemoFirebase(() =>
        firestore && id ? doc(firestore, 'projects', id) : null
        , [firestore, id]);

    const tasksQuery = useMemoFirebase(() =>
        firestore && id ? query(collection(firestore, 'tasks'), where('projectId', '==', id)) : null
        , [firestore, id]);

    const usersQuery = useMemoFirebase(() =>
        firestore ? collection(firestore, 'users') : null
        , [firestore]);

    const { result: project, loading: projectLoading } = useDoc<Project>(projectDocRef);
    const { data: tasks, loading: tasksLoading } = useCollection<Task>(tasksQuery);
    const { data: users } = useCollection<User>(usersQuery);

    const userMap = useMemo(() => {
        const map = new Map<string, User>();
        users?.forEach(u => map.set(u.id, u));
        return map;
    }, [users]);

    // Calculate stats
    const stats = useMemo(() => {
        if (!tasks) return { total: 0, completed: 0, progress: 0 };
        const total = tasks.length;
        const completed = tasks.filter(t => t.status === 'done').length;
        return {
            total,
            completed,
            progress: total > 0 ? (completed / total) * 100 : 0
        };
    }, [tasks]);

    if (projectLoading) {
        return <div className="space-y-4">
            <Skeleton className="h-12 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
            <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
            </div>
        </div>;
    }

    if (!project) {
        return <div>Project not found</div>;
    }

    const manager = userMap.get(project.managerId);
    const members = (project.members || []).map(id => userMap.get(id)).filter(Boolean) as User[];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
                    <div className="flex items-center gap-2 text-muted-foreground mt-1">
                        <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                            {project.status}
                        </Badge>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{format(new Date(project.startDate), 'MMM d, yyyy')}</span>
                        </div>
                        {project.endDate && (
                            <>
                                <span>-</span>
                                <span>{format(new Date(project.endDate), 'MMM d, yyyy')}</span>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link href={`/tasks/new?projectId=${project.id}`}>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Task
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                                {project.description}
                            </p>
                        </CardContent>
                    </Card>

                    <Tabs defaultValue="tasks">
                        <TabsList>
                            <TabsTrigger value="tasks">Tasks ({tasks?.length || 0})</TabsTrigger>
                            <TabsTrigger value="files" disabled>Files</TabsTrigger>
                            <TabsTrigger value="activity" disabled>Activity</TabsTrigger>
                        </TabsList>
                        <TabsContent value="tasks" className="space-y-4 mt-4">
                            {tasks?.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/20">
                                    No tasks created yet.
                                </div>
                            )}
                            {tasks?.map(task => (
                                <Card key={task.id}>
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={task.status === 'done' ? 'text-green-500' : 'text-muted-foreground'}>
                                                <CheckCircle2 className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="font-medium">{task.title}</div>
                                                <div className="text-xs text-muted-foreground flex gap-2">
                                                    <Badge variant="outline" className="text-[10px] px-1 py-0 h-5">{task.priority}</Badge>
                                                    {task.assigneeId && userMap.get(task.assigneeId) && (
                                                        <span>Assigned to {userMap.get(task.assigneeId)?.displayName}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <Badge variant={task.status === 'done' ? 'secondary' : 'outline'}>
                                            {task.status}
                                        </Badge>
                                    </CardContent>
                                </Card>
                            ))}
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Progress</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-muted-foreground">Completion</span>
                                    <span className="font-medium">{Math.round(stats.progress)}%</span>
                                </div>
                                <Progress value={stats.progress} />
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="bg-muted/30 p-3 rounded-lg">
                                    <div className="text-2xl font-bold">{stats.completed}</div>
                                    <div className="text-xs text-muted-foreground">Completed</div>
                                </div>
                                <div className="bg-muted/30 p-3 rounded-lg">
                                    <div className="text-2xl font-bold">{stats.total - stats.completed}</div>
                                    <div className="text-xs text-muted-foreground">Pending</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Team</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {manager && (
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={manager.photoURL} />
                                        <AvatarFallback>{manager.displayName?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">{manager.displayName}</div>
                                        <div className="text-xs text-muted-foreground">Project Manager</div>
                                    </div>
                                </div>
                            )}
                            {manager && members.length > 0 && <Separator />}
                            <div className="space-y-3">
                                {members.map(member => (
                                    <div key={member.id} className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={member.photoURL} />
                                            <AvatarFallback>{member.displayName?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="text-sm font-medium">{member.displayName}</div>
                                            <div className="text-xs text-muted-foreground capitalize">{member.role}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
