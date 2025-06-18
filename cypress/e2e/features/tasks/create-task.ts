import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

const priorityMap: Record<string, 'low' | 'medium' | 'high'> = {
    baixa: 'low',
    média: 'medium',
    alta: 'high',
};

Given(
    'que o usuário {string} está cadastrado com o e-mail {string} e a senha {string}',
    (name: string, email: string, password: string) => {
        cy.registerUser({ name, email, password });
    },
);

Given(
    'está autenticado com o e-mail {string} e a senha {string}',
    (email: string, password: string) => {
        cy.login(email, password);
    },
);

When('acessa a página de criação de tarefas', () => {
    cy.visit('/tasks/create');
});

When('preenche o título {string}', (title: string) => {
    cy.get('input[name="title"]').clear().type(title);
});

When('preenche a descrição {string}', (description: string) => {
    cy.get('textarea[name="description"]').clear().type(description);
});

When('seleciona a prioridade {string}', (priority: string) => {
    const normalizedPriority = priorityMap[priority.toLowerCase()];
    cy.get('select[name="priority"]').select(normalizedPriority);
});

When('envia o formulário de criação', () => {
    cy.get('form[data-testid="task-form"]').submit();
});

Then('a tarefa {string} deve aparecer na lista de tarefas', (title: string) => {
    cy.url().should('include', '/tasks');
    cy.contains(title).should('be.visible');
});

Then('deve aparecer uma mensagem de erro informando que o título da tarefa é inválido', () => {
    cy.contains('Título da tarefa inválido').should('be.visible');
});