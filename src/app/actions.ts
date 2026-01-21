'use server';

import { run } from 'genkit';
import { prioritizeTasksFlow } from '@/ai/flows/prioritizeTasks';
import type { Task, Employee } from '@/lib/types';

export async function getPrioritizedTasks(tasks: Task[], employees: Employee[]) {
  const { prioritizedTasks } = await run(prioritizeTasksFlow, { tasks, employees });
  return { prioritizedTasks };
}
