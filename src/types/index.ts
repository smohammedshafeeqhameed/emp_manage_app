export type UserRole = 'admin' | 'manager' | 'employee';

export interface User {
    id: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    role: UserRole;
    department?: string;
    reportingManagerId?: string; // ID of the manager
    hourlyRate?: number;
    createdAt: number;
}

export interface Project {
    id: string;
    name: string;
    description: string;
    status: 'active' | 'completed' | 'on-hold';
    managerId: string;
    members: string[]; // User IDs
    startDate: number;
    endDate?: number;
    createdAt: number;
}

export interface Task {
    id: string;
    title: string;
    description: string;
    projectId: string;
    assigneeId?: string;
    reporterId: string; // Who created the task
    status: 'todo' | 'in-progress' | 'review' | 'done';
    priority: 'low' | 'medium' | 'high';
    dueDate?: number;
    createdAt: number;
    updatedAt: number;
}

export interface Attendance {
    id: string;
    userId: string;
    date: string; // YYYY-MM-DD
    checkIn: number; // Timestamp
    checkOut?: number; // Timestamp
    status: 'present' | 'absent' | 'leave';
    workingHours?: number;
    notes?: string;
}

export interface DailyUpdate {
    id: string;
    userId: string;
    date: string; // YYYY-MM-DD
    content: string;
    blocking?: string;
    nextSteps?: string;
    createdAt: number;
}
