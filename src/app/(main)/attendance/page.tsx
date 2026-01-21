'use client';

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUser, useCollection, useFirestore } from '@/firebase';
import { collection, query, where, orderBy, doc, setDoc, updateDoc } from 'firebase/firestore';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import { Attendance, User } from '@/types';
import { Loader2, LogIn, LogOut } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { DayPickerProps } from 'react-day-picker';

export default function AttendancePage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [month, setMonth] = useState<Date>(new Date());
  const [submitting, setSubmitting] = useState(false);

  // Fetch all users to populate select (if admin/manager)
  // For now, let's allow selecting user to view THEIR attendance if admin, 
  // currently simplified to view OWN attendance or select if manager.
  // Assuming simplified: User views own attendance. If I am manager, I might want to see others.
  // Keeping it simple: View Own + Action Buttons. 
  // But wait, the previous UI had "Select Employee". I should try to support that if possible, 
  // or default to current user.

  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(undefined);

  // Set default selected user once user is loaded
  if (user && !selectedUserId) {
    setSelectedUserId(user.uid);
  }

  const effectiveUserId = selectedUserId || user?.uid;

  const usersQuery = useMemoFirebase(() =>
    firestore ? query(collection(firestore, 'users'), orderBy('displayName')) : null
    , [firestore]);

  const attendanceQuery = useMemoFirebase(() =>
    firestore && effectiveUserId ? query(
      collection(firestore, 'attendance'),
      where('userId', '==', effectiveUserId)
    ) : null
    , [firestore, effectiveUserId]);

  const { data: users } = useCollection<User>(usersQuery);
  const { data: attendanceRecords, loading } = useCollection<Attendance>(attendanceQuery);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayRecord = attendanceRecords?.find(r => r.date === todayStr);

  const handleCheckIn = async () => {
    if (!user || !firestore) return;
    setSubmitting(true);
    try {
      const id = `${user.uid}_${todayStr}`;
      await setDoc(doc(firestore, 'attendance', id), {
        userId: user.uid,
        date: todayStr,
        checkIn: Date.now(),
        status: 'present',
      });
      toast({ title: "Checked In", description: "You have checked in successfully." });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to check in.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckOut = async () => {
    if (!user || !firestore || !todayRecord) return;
    setSubmitting(true);
    try {
      const now = Date.now();
      const durationMs = now - todayRecord.checkIn;
      const hours = durationMs / (1000 * 60 * 60);

      await updateDoc(doc(firestore, 'attendance', todayRecord.id), {
        checkOut: now,
        workingHours: Number(hours.toFixed(2))
      });
      toast({ title: "Checked Out", description: "You have checked out successfully." });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to check out.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const modifiers: DayPickerProps['modifiers'] = {
    present: attendanceRecords?.filter((a) => a.status === 'present').map((a) => new Date(a.date)) || [],
    absent: attendanceRecords?.filter((a) => a.status === 'absent').map((a) => new Date(a.date)) || [],
    leave: attendanceRecords?.filter((a) => a.status === 'leave').map((a) => new Date(a.date)) || [],
  };

  const modifiersStyles = {
    present: { backgroundColor: '#22c55e', color: 'white' },
    absent: { backgroundColor: '#ef4444', color: 'white' },
    leave: { backgroundColor: '#f39c12', color: 'white' },
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2 space-y-6">
        {user?.uid === effectiveUserId && (
          <Card>
            <CardHeader>
              <CardTitle>Today's Action</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              {!todayRecord ? (
                <Button onClick={handleCheckIn} disabled={submitting}>
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                  Check In
                </Button>
              ) : !todayRecord.checkOut ? (
                <div className="flex items-center gap-4">
                  <div className="text-sm">
                    Checked in at: <span className="font-semibold">{format(todayRecord.checkIn, 'h:mm a')}</span>
                  </div>
                  <Button onClick={handleCheckOut} disabled={submitting} variant="outline">
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
                    Check Out
                  </Button>
                </div>
              ) : (
                <div className="text-sm text-green-600 font-semibold flex items-center gap-2">
                  Full Day Completed ({todayRecord.workingHours} hrs)
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Attendance Calendar</CardTitle>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Employee" />
              </SelectTrigger>
              <SelectContent>
                {users?.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.displayName || emp.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              month={month}
              onMonthChange={setMonth}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              className="rounded-md border"
            />
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Legend</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full" style={modifiersStyles.present} />
              <span>Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full" style={modifiersStyles.absent} />
              <span>Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full" style={modifiersStyles.leave} />
              <span>Leave</span>
            </div>
            {effectiveUserId && (
              <div className="pt-4 border-t mt-4">
                <h4 className="font-semibold mb-2">Summary ({format(month, 'MMMM')})</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Days Present:</span>
                    <span>{attendanceRecords?.filter(r =>
                      new Date(r.date).getMonth() === month.getMonth() &&
                      new Date(r.date).getFullYear() === month.getFullYear() &&
                      r.status === 'present'
                    ).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Hours:</span>
                    <span>{attendanceRecords?.filter(r =>
                      new Date(r.date).getMonth() === month.getMonth() &&
                      new Date(r.date).getFullYear() === month.getFullYear()
                    ).reduce((acc, curr) => acc + (curr.workingHours || 0), 0).toFixed(1)}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
