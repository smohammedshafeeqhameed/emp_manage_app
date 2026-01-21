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
import { tasks, employees } from "@/lib/data";
import { PrioritizeTasksDialog } from "./prioritize-tasks-dialog";

export default function TasksPage() {
  const getEmployeeName = (employeeId: string) => {
    return employees.find((e) => e.id === employeeId)?.name || 'Unassigned';
  };

  const getPriorityVariant = (priority: 'Low' | 'Medium' | 'High'): 'outline' | 'secondary' | 'destructive' => {
    switch (priority) {
      case 'High':
        return 'destructive';
      case 'Medium':
        return 'secondary';
      case 'Low':
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Tasks</CardTitle>
        <div className="flex gap-2">
          <PrioritizeTasksDialog tasks={tasks} employees={employees} />
          <Button size="sm" className="gap-1">
            <PlusCircle className="h-4 w-4" />
            Add Task
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead className="hidden md:table-cell">Assigned To</TableHead>
              <TableHead className="hidden md:table-cell">Deadline</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">{task.title}</TableCell>
                <TableCell className="hidden md:table-cell">{getEmployeeName(task.employeeId)}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {new Date(task.deadline).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge variant={getPriorityVariant(task.priority)}>{task.priority}</Badge>
                </TableCell>
                <TableCell>
                   <Badge variant={task.status === 'Done' ? 'default' : 'outline'} className={task.status === 'Done' ? 'bg-green-600 text-white' : ''}>
                    {task.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
