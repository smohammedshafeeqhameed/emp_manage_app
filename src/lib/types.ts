import { FieldValue } from "firebase/firestore";

export type Employee = {
  id: string;
  name: string;
  email: string;
  role: string;
  reportingManagerId: string | null;
  avatar: string;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  employeeId: string;
  projectId: string;
  deadline: string | FieldValue;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Todo' | 'In Progress' | 'Done';
};

export type Project = {
  id: string;
  name: string;
  description: string;
  employeeIds: string[];
};

export type Attendance = {
  id: string;
  employeeId: string;
  date: string;
  status: 'Present' | 'Absent' | 'Vacation';
};

export type DailyStatus = {
  id: string;
  employeeId: string;
  date: string;
  update: string;
  hoursWorked: number;
};
