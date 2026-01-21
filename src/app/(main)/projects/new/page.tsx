'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { create, collections } from '@/lib/firebase/firestore';
import { Project, User } from '@/types';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';

const formSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    managerId: z.string({ required_error: "Please select a project manager" }),
    members: z.array(z.string()).refine((value) => value.length > 0, {
        message: "You must select at least one team member.",
    }),
    status: z.enum(['active', 'completed', 'on-hold']),
    startDate: z.date({
        required_error: "A start date is required.",
    }),
    endDate: z.date().optional(),
});

export default function AddProjectPage() {
    const router = useRouter();
    const { toast } = useToast();
    const firestore = useFirestore();
    const [submitting, setSubmitting] = useState(false);

    // Fetch all users for manager and members selection
    const usersQuery = useMemoFirebase(() =>
        firestore ? query(collection(firestore, 'users'), orderBy('displayName')) : null
        , [firestore]);

    const { data: users } = useCollection<User>(usersQuery);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            description: '',
            status: 'active',
            members: [],
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setSubmitting(true);
        try {
            await create<Project>(collections.projects, {
                name: values.name,
                description: values.description,
                status: values.status as any,
                managerId: values.managerId,
                members: values.members,
                startDate: values.startDate.getTime(),
                endDate: values.endDate ? values.endDate.getTime() : undefined,
                createdAt: Date.now(),
            });

            toast({
                title: "Success",
                description: "Project created successfully.",
            });
            router.push('/projects');
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to create project.",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="max-w-3xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Project</CardTitle>
                    <CardDescription>
                        Define a new project, assign a manager and select team members.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Project Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Website Redesign" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Status</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="active">Active</SelectItem>
                                                    <SelectItem value="on-hold">On Hold</SelectItem>
                                                    <SelectItem value="completed">Completed</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Describe the project goals and scope..."
                                                className="resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="managerId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Project Manager</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a manager" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {users?.filter(u => ['admin', 'manager'].includes(u.role)).map((user) => (
                                                        <SelectItem key={user.id} value={user.id}>
                                                            {user.displayName || user.email}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="startDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Start Date</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-full pl-3 text-left font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(field.value, "PPP")
                                                            ) : (
                                                                <span>Pick a date</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        disabled={(date) =>
                                                            date < new Date("1900-01-01")
                                                        }
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="members"
                                render={() => (
                                    <FormItem>
                                        <div className="mb-4">
                                            <FormLabel>Team Members</FormLabel>
                                            <FormDescription>
                                                Select the employees who will be working on this project.
                                            </FormDescription>
                                        </div>
                                        <Card className="p-4">
                                            <ScrollArea className="h-[200px]">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {users?.map((user) => (
                                                        <FormField
                                                            key={user.id}
                                                            control={form.control}
                                                            name="members"
                                                            render={({ field }) => {
                                                                return (
                                                                    <FormItem
                                                                        key={user.id}
                                                                        className="flex flex-row items-start space-x-3 space-y-0"
                                                                    >
                                                                        <FormControl>
                                                                            <Checkbox
                                                                                checked={field.value?.includes(user.id)}
                                                                                onCheckedChange={(checked) => {
                                                                                    return checked
                                                                                        ? field.onChange([...field.value, user.id])
                                                                                        : field.onChange(
                                                                                            field.value?.filter(
                                                                                                (value) => value !== user.id
                                                                                            )
                                                                                        )
                                                                                }}
                                                                            />
                                                                        </FormControl>
                                                                        <FormLabel className="font-normal cursor-pointer">
                                                                            {user.displayName || user.email}
                                                                            <span className="text-xs text-muted-foreground ml-1 capitalize">({user.role})</span>
                                                                        </FormLabel>
                                                                    </FormItem>
                                                                )
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                            </ScrollArea>
                                        </Card>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? 'Creating...' : 'Create Project'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
