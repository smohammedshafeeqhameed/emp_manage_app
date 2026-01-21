import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle } from "lucide-react";
import { projects, tasks, employees } from "@/lib/data";

export default function ProjectsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <Button size="sm" className="gap-1">
          <PlusCircle className="h-4 w-4" />
          New Project
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => {
          const projectTasks = tasks.filter((t) => t.projectId === project.id);
          const completedTasks = projectTasks.filter((t) => t.status === 'Done').length;
          const progress = projectTasks.length > 0 ? (completedTasks / projectTasks.length) * 100 : 0;
          const projectEmployees = employees.filter(e => project.employeeIds.includes(e.id));

          return (
            <Card key={project.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{project.name}</CardTitle>
                <CardDescription>{project.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Progress</span>
                  <span className="text-sm font-semibold">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} aria-label={`${Math.round(progress)}% complete`} />
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <div className="flex -space-x-2">
                  {projectEmployees.slice(0, 4).map(emp => (
                    <Avatar key={emp.id} className="border-2 border-card">
                      <AvatarImage src={emp.avatar} />
                      <AvatarFallback>{emp.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  ))}
                  {projectEmployees.length > 4 && (
                    <Avatar className="border-2 border-card">
                      <AvatarFallback>+{projectEmployees.length - 4}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
                <Button variant="secondary" size="sm">View</Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
