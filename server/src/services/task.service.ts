import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { InvalidTaskNameError } from '../errors/task/InvalidTaskNameError';
import { TaskNotFoundError } from '../errors/task/TaskNotFoundError';
import { prisma } from '../utils/prisma';

export class TaskService {
    static async createTask(
        userId: number,
        data: {
            title: string;
            description?: string;
            dueDate?: string | null;
            priority?: string;
        },
    ) {
        if (/^\d/.test(data.title)) {
            throw new InvalidTaskNameError();
        }

        const task = await prisma.task.create({
            data: {
                title: data.title,
                description: data.description,
                dueDate: data.dueDate ? new Date(data.dueDate) : null,
                priority: data.priority,
                userId,
            },
        });

        return task;
    }

    static async getTasks(userId: number, filters: { completed?: string; priority?: string }) {
        const { completed, priority } = filters;

        const tasks = await prisma.task.findMany({
            where: {
                userId,
                ...(completed !== undefined && { completed: completed === 'true' }),
                ...(priority && { priority }),
            },
            orderBy: { createdAt: 'desc' },
        });

        return tasks;
    }

    static async getTaskById(userId: number, id: number) {
        const task = await prisma.task.findUnique({
            where: { id, userId },
        });

        if (!task) {
            throw new TaskNotFoundError();
        }

        return task;
    }

    static async updateTask(
        userId: number,
        id: number,
        data: {
            title?: string;
            description?: string;
            completed?: boolean;
            dueDate?: string | null;
            priority?: string;
        },
    ) {
        try {
            const updatedTask = await prisma.task.update({
                where: { id, userId },
                data: {
                    title: data.title,
                    description: data.description,
                    completed: data.completed,
                    dueDate: data.dueDate ? new Date(data.dueDate) : null,
                    priority: data.priority,
                },
            });
    
            return updatedTask;
        } catch (error: any) {
            if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new TaskNotFoundError();
            }
            throw error;
        }
    }

    static async deleteTask(userId: number, id: number) {
        try{
            await prisma.task.delete({
                where: { id, userId },
            });
        }    
        catch (error: any) {
            if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
              throw new TaskNotFoundError();
            }
            throw error;
        }
    }
}
