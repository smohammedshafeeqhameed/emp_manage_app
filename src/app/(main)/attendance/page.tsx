'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { attendance, employees } from '@/lib/data';
import type { DayPicker } from 'react-day-picker';

export default function AttendancePage() {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(employees[0].id);
  const [month, setMonth] = useState<Date>(new Date());

  const employeeAttendance = attendance.filter(
    (a) =>
      a.employeeId === selectedEmployeeId &&
      new Date(a.date).getMonth() === month.getMonth() &&
      new Date(a.date).getFullYear() === month.getFullYear()
  );

  const modifiers: DayPicker['modifiers'] = {
    present: employeeAttendance
      .filter((a) => a.status === 'Present')
      .map((a) => new Date(a.date)),
    absent: employeeAttendance
      .filter((a) => a.status === 'Absent')
      .map((a) => new Date(a.date)),
    vacation: employeeAttendance
      .filter((a) => a.status === 'Vacation')
      .map((a) => new Date(a.date)),
  };

  const modifiersStyles = {
    present: { backgroundColor: '#22c55e', color: 'white' },
    absent: { backgroundColor: '#ef4444', color: 'white' },
    vacation: { backgroundColor: '#f39c12', color: 'white' },
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Attendance Calendar</CardTitle>
            <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.name}
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
          <CardContent className="space-y-2">
             <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full" style={modifiersStyles.present} />
                <span>Present</span>
            </div>
             <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full" style={modifiersStyles.absent} />
                <span>Absent</span>
            </div>
             <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full" style={modifiersStyles.vacation} />
                <span>Vacation</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
