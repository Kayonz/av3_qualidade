Feature: Criação de tarefas
  Como um usuário autenticado
  Desejo criar novas tarefas
  Para organizar e acompanhar minhas atividades

  Background:
    Given que o usuário "John" está cadastrado com o e-mail "john@user.example" e a senha "123456"
    And está autenticado com o e-mail "john@user.example" e a senha "123456"
    And acessa a página de criação de tarefas

  Scenario: Criação bem-sucedida de uma nova tarefa
    When preenche o título "Entregar trabalho final de QTSW"
    And preenche a descrição "Trabalho final da UC de Qualidade e Teste de Software"
    And seleciona a prioridade "alta"
    And envia o formulário de criação
    Then a tarefa "Entregar trabalho final de QTSW" deve aparecer na lista de tarefas

   Scenario: Falha ao criar tarefa com título iniciando com número
    When preenche o título "1 tarefa inválida"
    And preenche a descrição "Descrição qualquer"
    And seleciona a prioridade "baixa"
    And envia o formulário de criação
    Then deve aparecer uma mensagem de erro informando que o título da tarefa é inválido

  Scenario: Criação de tarefas com asteristicos
  When preenche o título "*****TESTE*****"
  And preenche a descrição "*********************************"
  And envia o formulário de criação
  Then a tarefa "*****TESTE*****" deve aparecer na lista de tarefas

