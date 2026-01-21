import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { dailyStatuses, employees } from "@/lib/data";

export default function ReportsPage() {
  const groupedByDate = dailyStatuses.reduce((acc, status) => {
    const date = new Date(status.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(status);
    return acc;
  }, {} as Record<string, typeof dailyStatuses>);

  const getEmployee = (employeeId: string) => {
    return employees.find((e) => e.id === employeeId);
  };
  
  const sortedDates = Object.keys(groupedByDate).sort((a,b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Status Reports</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible defaultValue={sortedDates[0]}>
          {sortedDates.map((date) => (
            <AccordionItem key={date} value={date}>
              <AccordionTrigger className="text-lg font-semibold">{date}</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {groupedByDate[date].map((status) => {
                    const employee = getEmployee(status.employeeId);
                    return (
                      <div key={status.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={employee?.avatar} />
                              <AvatarFallback>{employee?.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{employee?.name}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Hours Worked: <span className="font-semibold text-foreground">{status.hoursWorked}h</span>
                          </div>
                        </div>
                        <p className="text-muted-foreground">{status.update}</p>
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
  );
}
