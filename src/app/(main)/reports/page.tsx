'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import { DailyUpdate, User } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function ReportsPage() {
  const firestore = useFirestore();

  const updatesQuery = useMemoFirebase(() =>
    firestore ? query(collection(firestore, 'daily_updates'), orderBy('createdAt', 'desc')) : null
    , [firestore]);

  const usersQuery = useMemoFirebase(() =>
    firestore ? collection(firestore, 'users') : null
    , [firestore]);

  const { data: updates, loading: updatesLoading } = useCollection<DailyUpdate>(updatesQuery);
  const { data: users } = useCollection<User>(usersQuery);

  const userMap = useMemo(() => {
    const map = new Map<string, User>();
    users?.forEach(u => map.set(u.id, u));
    return map;
  }, [users]);

  const groupedByDate = useMemo(() => {
    if (!updates) return {};
    return updates.reduce((acc, update) => {
      // Assuming date is stored as YYYY-MM-DD string as per type
      const date = update.date;
      // Format it nicely
      const dateDate = new Date(date);
      const displayDate = isValidDate(dateDate) ? dateDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }) : date;

      if (!acc[displayDate]) {
        acc[displayDate] = [];
      }
      acc[displayDate].push(update);
      return acc;
    }, {} as Record<string, DailyUpdate[]>);
  }, [updates]);

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  function isValidDate(d: any) {
    return d instanceof Date && !isNaN(d.getTime());
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Daily Status Reports</CardTitle>
          <Link href="/reports/new">
            <Button size="sm" className="gap-1">
              <PlusCircle className="h-4 w-4" />
              New Report
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {updatesLoading && (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          )}

          {!updatesLoading && sortedDates.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No reports submitted yet.
            </div>
          )}

          <Accordion type="single" collapsible defaultValue={sortedDates[0]}>
            {sortedDates.map((date) => (
              <AccordionItem key={date} value={date}>
                <AccordionTrigger className="text-lg font-semibold">{date}</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-4">
                    {groupedByDate[date].map((status) => {
                      const employee = userMap.get(status.userId);
                      return (
                        <div key={status.id} className="p-4 border rounded-lg bg-card/50">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={employee?.photoURL} />
                                <AvatarFallback>{employee?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{employee?.displayName || employee?.email}</span>
                            </div>
                          </div>
                          <div className="space-y-2 mt-2">
                            <div>
                              <h4 className="text-sm font-semibold text-muted-foreground">Update</h4>
                              <p className="text-sm whitespace-pre-wrap">{status.content}</p>
                            </div>
                            {status.blocking && (
                              <div>
                                <h4 className="text-sm font-semibold text-destructive/80">Blocking</h4>
                                <p className="text-sm text-destructive">{status.blocking}</p>
                              </div>
                            )}
                            {status.nextSteps && (
                              <div>
                                <h4 className="text-sm font-semibold text-muted-foreground">Next Steps</h4>
                                <p className="text-sm whitespace-pre-wrap">{status.nextSteps}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
