import type { Employee, Project, Task, Attendance, DailyStatus } from './types';

export const employees: Employee[] = [
  { id: '1', name: 'Alice Johnson', email: 'alice.j@example.com', role: 'Project Manager', reportingManagerId: null, avatar: 'https://picsum.photos/seed/avatar1/200/200' },
  { id: '2', name: 'Bob Williams', email: 'bob.w@example.com', role: 'Lead Developer', reportingManagerId: '1', avatar: 'https://picsum.photos/seed/avatar2/200/200' },
  { id: '3', name: 'Charlie Brown', email: 'charlie.b@example.com', role: 'UX/UI Designer', reportingManagerId: '1', avatar: 'https://picsum.photos/seed/avatar3/200/200' },
  { id: '4', name: 'Diana Prince', email: 'diana.p@example.com', role: 'Frontend Developer', reportingManagerId: '2', avatar: 'https://picsum.photos/seed/avatar4/200/200' },
  { id: '5', name: 'Ethan Hunt', email: 'ethan.h@example.com', role: 'Backend Developer', reportingManagerId: '2', avatar: 'https://picsum.photos/seed/avatar5/200/200' },
  { id: '6', name: 'Fiona Glenanne', email: 'fiona.g@example.com', role: 'QA Engineer', reportingManagerId: '1', avatar: 'https://picsum.photos/seed/avatar6/200/200' },
];

export const projects: Project[] = [
  { id: 'P1', name: 'Website Redesign', description: 'Complete overhaul of the corporate website.', employeeIds: ['1', '2', '3', '4'] },
  { id: 'P2', name: 'Mobile App Launch', description: 'Develop and launch the new mobile application.', employeeIds: ['1', '2', '5', '6'] },
  { id: 'P3', name: 'Internal CRM Tool', description: 'Build a new Customer Relationship Management tool.', employeeIds: ['1', '2', '4', '5'] },
];

export const tasks: Task[] = [
  { id: 'T1', title: 'Design new homepage mockups', description: 'Create high-fidelity mockups for the new homepage design.', employeeId: '3', projectId: 'P1', deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), priority: 'High', status: 'In Progress' },
  { id: 'T2', title: 'Develop homepage component library', description: 'Build React components for the new homepage.', employeeId: '4', projectId: 'P1', deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), priority: 'High', status: 'Todo' },
  { id: 'T3', title: 'Set up mobile app backend', description: 'Configure server, database, and authentication for the mobile app.', employeeId: '5', projectId: 'P2', deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), priority: 'High', status: 'In Progress' },
  { id: 'T4', title: 'Write E2E tests for login flow', description: 'Use Cypress to write end-to-end tests for user authentication.', employeeId: '6', projectId: 'P2', deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), priority: 'Medium', status: 'Done' },
  { id: 'T5', title: 'API for CRM contacts', description: 'Develop the CRUD API endpoints for managing contacts.', employeeId: '5', projectId: 'P3', deadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(), priority: 'Medium', status: 'Todo' },
  { id: 'T6', title: 'Plan project timeline', description: 'Create a detailed project plan and timeline for all phases.', employeeId: '1', projectId: 'P1', deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), priority: 'High', status: 'Done' },
];

export const attendance: Attendance[] = [
  ...employees.map(emp => ({ id: `${emp.id}-today`, employeeId: emp.id, date: new Date().toISOString().split('T')[0], status: 'Present' as const })),
  { id: 'diana-yesterday', employeeId: '4', date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: 'Vacation' },
  { id: 'ethan-2daysago', employeeId: '5', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: 'Absent' },
];

export const dailyStatuses: DailyStatus[] = [
  { id: 'ds1', employeeId: '2', date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], update: 'Finished setting up the staging server. Started work on the auth middleware.', hoursWorked: 8 },
  { id: 'ds2', employeeId: '3', date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], update: 'Completed the wireframes for the user profile page. Shared with the team for feedback.', hoursWorked: 7.5 },
  { id: 'ds3', employeeId: '4', date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], update: 'Refactored the main navigation component to improve accessibility.', hoursWorked: 8 },
  { id: 'ds4', employeeId: '1', date: new Date().toISOString().split('T')[0], update: 'Onboarding new team members and planning the next sprint.', hoursWorked: 4 },
];
