'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { create, collections } from '@/lib/firebase/firestore';
import { DailyUpdate } from '@/types';
import { useUser } from '@/firebase';

const formSchema = z.object({
    content: z.string().min(5, 'Update content must be at least 5 characters'),
    blocking: z.string().optional(),
    nextSteps: z.string().optional(),
});

export default function NewReportPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useUser();
    const [submitting, setSubmitting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            content: '',
            blocking: '',
            nextSteps: '',
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!user) return;
        setSubmitting(true);
        try {
            await create<DailyUpdate>(collections.daily_updates, {
                userId: user.uid,
                date: format(new Date(), 'yyyy-MM-dd'),
                content: values.content,
                blocking: values.blocking,
                nextSteps: values.nextSteps,
                createdAt: Date.now(),
            });

            toast({
                title: "Report Submitted",
                description: "Your daily report has been submitted successfully.",
            });
            router.push('/reports');
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to submit report.",
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
                    <CardTitle>Submit Daily Report</CardTitle>
                    <CardDescription>
                        Share what you accomplished today, any blockers, and your plan for tomorrow.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            <FormField
                                control={form.control}
                                name="content"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>What did you accomplish today?</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="- Completed the login page endpoint&#10;- Fixed bug #123"
                                                className="min-h-[120px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="blocking"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Any blockers?</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Waiting for API spec..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="nextSteps"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Next Steps (Tomorrow)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="- Start work on dashboard&#10;- Team sync"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end space-x-2">
                                <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? 'Submitting...' : 'Submit Report'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
