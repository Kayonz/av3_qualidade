/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock do middleware de autenticação para simular a autenticação durante o teste
jest.mock('../../middlewares/auth.middleware', () => ({
    authenticate: (req: any, res: any, next: any) => {
        req.userId = testUser.id ?? 1;
        next();
    },
}));

import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import app from '../../app';
import { prisma } from '../../utils/prisma';
import { setupTestDB, disconnectTestDB, testUser } from '../setup.test.db';

beforeAll(async () => {
    await setupTestDB();
});

afterAll(async () => {
    await disconnectTestDB();
});

describe('TaskController', () => {
    describe('POST /api/tasks', () => {
        it('deve criar tarefa com dados válidos', async () => {
            // Arrange (preparar)
            const taskData = {
                title: `Tarefa válida ${new Date()}`,
                description: 'Essa é uma tarefa válida',
                completed: false,
                priority: 'low',
            };

            // Act (agir)
            const response = await request(app).post('/api/tasks').send(taskData);

            // Assert (verificar)
            expect(response.statusCode).toBe(StatusCodes.CREATED);
            expect(response.body).toEqual({
                ...taskData,
                id: expect.any(Number),
                userId: 1,
                dueDate: null,
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
            });

            const taskInDB = await prisma.task.findFirst({ where: { title: taskData.title } });
            expect(taskInDB).toEqual(
                expect.objectContaining({
                    ...taskData,
                    id: expect.any(Number),
                    userId: 1,
                    createdAt: expect.any(Date),
                    updatedAt: expect.any(Date),
                }),
            );
        });
    });
});

describe('GET /api/tasks', () => {
    it('deve retornar lista de tarefas do usuário', async () => {
      await prisma.task.createMany({
        data: [
          { title: 'Tarefa 1', userId: testUser.id, completed: false, priority: 'low' },
          { title: 'Tarefa 2', userId: testUser.id, completed: true, priority: 'high' },
        ],
      }); //mocka tarefas dentro do banco
  
      const response = await request(app).get('/api/tasks');//faz o get para verificar as tarefas criadas
  
      expect(response.statusCode).toBe(StatusCodes.OK); // ve seu deu tudo certo com as tarefas criadas
      expect(Array.isArray(response.body)).toBe(true); //retornar lista de tarefas ate a linha 82
      expect(response.body.length).toBeGreaterThanOrEqual(2);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ title: 'Tarefa 1' }),
          expect.objectContaining({ title: 'Tarefa 2' }),
        ]),
      );
    });
  });
  
  describe('PUT /api/tasks/:id', () => {
    it('deve retornar 404 ao tentar atualizar tarefa inexistente', async () => {
        const response = await request(app)//faz a requisição na api (app.js)
            .put('/api/tasks/999999')//faz o update na api na tarefa 999
            .send({ title: 'Tentativa de update de tarefa inexistente' });//retorna o titulo de informando que a tarefa do id 999 é inexiste nessa bomba
    
        expect(response.status).toBe(StatusCodes.NOT_FOUND);//status code de não localizado
        expect(response.body).toEqual({ message: 'Tarefa não encontrada' });//resposta esperada de tarefa não encontrada
    });
});
  