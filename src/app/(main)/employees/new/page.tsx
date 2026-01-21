'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { create, collections } from '@/lib/firebase/firestore';
import { User, UserRole } from '@/types';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';

const formSchema = z.object({
    displayName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    role: z.enum(['admin', 'manager', 'employee'] as [string, ...string[]]),
    department: z.string().min(2, 'Department is required'),
    reportingManagerId: z.string().optional(),
    hourlyRate: z.coerce.number().min(0, 'Hourly rate must be positive'),
});

export default function AddEmployeePage() {
    const router = useRouter();
    const { toast } = useToast();
    const firestore = useFirestore();
    const [submitting, setSubmitting] = useState(false);

    // Fetch managers for the dropdown
    const managersQuery = useMemoFirebase(() =>
        firestore ? query(collection(firestore, 'users'), where('role', 'in', ['admin', 'manager'])) : null
        , [firestore]);

    const { data: managers } = useCollection<User>(managersQuery);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            displayName: '',
            email: '',
            role: 'employee',
            department: '',
            reportingManagerId: '',
            hourlyRate: 0,
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setSubmitting(true);
        try {
            // In a real app, you might trigger a Cloud Function to create the Auth user
            // changing the type of role to UserRole to satisfy TS
            await create<User>(collections.users, {
                ...values,
                role: values.role as UserRole,
                // Using email as ID for simplicity if we don't have Auth UID yet, 
                // OR letting firestore generate ID and we update it. 
                // Ideally we use a consistent ID. 
                // But the 'create' helper generates a random ID.
                // We will just store it.
                photoURL: '',
                createdAt: Date.now(),
            });

            toast({
                title: "Success",
                description: "Employee created successfully.",
            });
            router.push('/employees');
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to create employee.",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Add New Employee</CardTitle>
                    <CardDescription>
                        Create a new employee record in the system.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            <FormField
                                control={form.control}
                                name="displayName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="john@example.com" type="email" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="role"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Role</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a role" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="employee">Employee</SelectItem>
                                                    <SelectItem value="manager">Manager</SelectItem>
                                                    <SelectItem value="admin">Admin</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="department"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Department</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Engineering" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="hourlyRate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Hourly Rate ($)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="reportingManagerId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Reporting Manager</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a manager" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="none">None</SelectItem>
                                                {managers?.map((manager) => (
                                                    <SelectItem key={manager.id} value={manager.id}>
                                                        {manager.displayName || manager.email}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? 'Creating...' : 'Create Employee'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
