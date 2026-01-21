'use client';

import { useMemo } from 'react';
import Link from 'next/link';
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import { User } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function EmployeesPage() {
  const firestore = useFirestore();

  // Fetch only employees and managers, not admins if preferred, or all users
  const employeesQuery = useMemoFirebase(() =>
    firestore ? query(collection(firestore, 'users'), where('role', 'in', ['employee', 'manager'])) : null
    , [firestore]);

  const { data: employees, loading } = useCollection<User>(employeesQuery);

  const managerMap = useMemo(() => {
    if (!employees) return new Map<string, string>();
    return employees.reduce((acc, emp) => {
      // Assuming managers act as reporting managers
      if (emp.role === 'manager' || emp.role === 'admin') {
        acc.set(emp.id, emp.displayName || emp.email);
      }
      return acc;
    }, new Map<string, string>());
  }, [employees]);

  const getManagerName = (managerId?: string) => {
    if (!managerId) return 'N/A';
    // If the manager is not in the list (e.g. is an admin not fetched), this might show Unknown
    return managerMap.get(managerId) || 'Unknown';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Employees</CardTitle>
          <Link href="/employees/new">
            <Button size="sm" className="gap-1">
              <PlusCircle className="h-4 w-4" />
              Add Employee
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Role</TableHead>
                <TableHead className="hidden md:table-cell">Department</TableHead>
                <TableHead className="hidden md:table-cell">Reporting Manager</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[150px]" />
                        <Skeleton className="h-3 w-[100px] md:hidden" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))}
              {!loading && employees?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                    No employees found.
                  </TableCell>
                </TableRow>
              )}
              {!loading && employees?.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={employee.photoURL} alt={employee.displayName || employee.email} />
                        <AvatarFallback>{(employee.displayName || employee.email).substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="font-medium">
                        <div>{employee.displayName || employee.email}</div>
                        <div className="text-sm text-muted-foreground md:hidden">{employee.role}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell capitalize">{employee.role}</TableCell>
                  <TableCell className="hidden md:table-cell">{employee.department || '-'}</TableCell>
                  <TableCell className="hidden md:table-cell">{getManagerName(employee.reportingManagerId)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <Link href={`/employees/${employee.id}`}>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
