'use server';

/**
 * @fileOverview Task prioritization AI agent.
 *
 * - prioritizeTasks - A function that handles the task prioritization process.
 * - PrioritizeTasksInput - The input type for the prioritizeTasks function.
 * - PrioritizeTasksOutput - The return type for the prioritizeTasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PrioritizeTasksInputSchema = z.object({
  tasks: z.array(
    z.object({
      taskId: z.string().describe('Unique identifier for the task.'),
      description: z.string().describe('Detailed description of the task.'),
      deadline: z.string().describe('The deadline for the task (ISO format).'),
      dependencies: z.array(z.string()).describe('List of task IDs that must be completed before this task can start.'),
      employeeAvailability: z.string().describe('Employee availability in hours for this task.'),
    })
  ).describe('A list of tasks to prioritize.'),
});
export type PrioritizeTasksInput = z.infer<typeof PrioritizeTasksInputSchema>;

const PrioritizeTasksOutputSchema = z.object({
  prioritizedTasks: z.array(
    z.object({
      taskId: z.string().describe('Unique identifier for the task.'),
      priority: z.number().describe('The priority of the task (1 being highest).'),
      reason: z.string().describe('The reasoning behind the assigned priority.'),
    })
  ).describe('A list of tasks with assigned priorities and reasons.'),
});
export type PrioritizeTasksOutput = z.infer<typeof PrioritizeTasksOutputSchema>;

export async function prioritizeTasks(input: PrioritizeTasksInput): Promise<PrioritizeTasksOutput> {
  return prioritizeTasksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'prioritizeTasksPrompt',
  input: {schema: PrioritizeTasksInputSchema},
  output: {schema: PrioritizeTasksOutputSchema},
  prompt: `You are an AI project management assistant. Your goal is to prioritize tasks based on their deadlines, dependencies, and employee availability.

Given the following tasks:

{{#each tasks}}
Task ID: {{taskId}}
Description: {{description}}
Deadline: {{deadline}}
Dependencies: {{dependencies}}
Employee Availability: {{employeeAvailability}}

{{/each}}

Prioritize these tasks. Assign a priority (1 being the highest) and provide a brief explanation for each task's priority. Consider deadlines, dependencies, and employee availability when assigning priorities.

Ensure that the output is a JSON object conforming to the following schema:

${JSON.stringify(PrioritizeTasksOutputSchema.shape, null, 2)}`,
});

const prioritizeTasksFlow = ai.defineFlow(
  {
    name: 'prioritizeTasksFlow',
    inputSchema: PrioritizeTasksInputSchema,
    outputSchema: PrioritizeTasksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
