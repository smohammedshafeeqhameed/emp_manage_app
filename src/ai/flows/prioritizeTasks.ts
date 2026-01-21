import { defineFlow } from 'genkit';
import { z } from 'zod';
import { ai } from '../genkit';

const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  employeeId: z.string(),
  projectId: z.string(),
  deadline: z.string(),
  priority: z.enum(['Low', 'Medium', 'High']),
  status: z.enum(['Todo', 'In Progress', 'Done']),
});

const employeeSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
});

export const prioritizeTasksFlow = defineFlow(
  {
    name: 'prioritizeTasksFlow',
    inputSchema: z.object({
      tasks: z.array(taskSchema),
      employees: z.array(employeeSchema),
    }),
    outputSchema: z.object({
      prioritizedTasks: z.array(
        taskSchema.extend({
          justification: z.string(),
          newPriority: z.enum(['Low', 'Medium', 'High', 'Critical']),
        })
      ),
    }),
  },
  async ({ tasks, employees }) => {
    const prompt = `
      You are an expert project manager. Your goal is to optimize team productivity by prioritizing tasks effectively.
      Analyze the following lists of tasks and employees.

      Employees:
      ${JSON.stringify(employees, null, 2)}

      Tasks to prioritize (only consider tasks with 'Todo' or 'In Progress' status):
      ${JSON.stringify(tasks.filter(t => t.status !== 'Done'), null, 2)}
      
      Instructions:
      1. Re-evaluate the priority of each task based on its deadline, original priority, and the role of the assigned employee.
      2. A task with a closer deadline should generally have a higher priority.
      3. Critical tasks blocking other team members should be marked as 'Critical'.
      4. Consider the roles of the employees. A task assigned to a lead developer might be more foundational than others.
      5. Generate a new prioritized list of these tasks.
      6. For each task, provide a brief justification for its new priority level.
      7. Return ONLY the JSON object containing the prioritized tasks.
    `;

    const llmResponse = await ai.generate({
      prompt,
      model: 'googleai/gemini-1.5-flash',
      output: {
        schema: z.object({
          prioritizedTasks: z.array(
            taskSchema.extend({
              justification: z.string().describe('Reasoning for the assigned priority.'),
              newPriority: z.enum(['Low', 'Medium', 'High', 'Critical']).describe('The newly evaluated priority.'),
            })
          ),
        }),
      },
    });

    return llmResponse.output() ?? { prioritizedTasks: [] };
  }
);
