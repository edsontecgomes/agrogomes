# 07 — Orquestrador Agronômico

**Versão:** 1.0  
**Status:** Aprovado  
**Tipo:** Arquitetura de Processamento e Integração

---

# 1. Objetivo

Este documento define oficialmente o papel, os limites e o fluxo de funcionamento do Orquestrador Agronômico da plataforma Eqtara.

O Orquestrador é a infraestrutura responsável por coordenar o processamento dos eventos agronômicos.

Ele organiza a execução dos motores, controla falhas, preserva rastreabilidade e garante que os resultados sejam produzidos de forma segura, repetível e auditável.

---

# 2. Definição

O Orquestrador Agronômico é o coordenador central do processamento inteligente da Eqtara.

Ele não deverá concentrar todas as regras científicas, estatísticas, agronômicas ou econômicas.

Sua função principal será decidir:

- o que processar;
- quando processar;
- em qual ordem processar;
- quais motores executar;
- qual contexto fornecer;
- como persistir os resultados;
- como registrar auditoria;
- como retomar uma execução interrompida.

---

# 3. Princípio de separação

O Orquestrador coordena.

Os motores interpretam.

A Memória Agronômica preserva.

O GDA consolida.

A recomendação orienta.

Essa separação deverá ser mantida para evitar um componente central excessivamente complexo.

---

# 4. Posição na arquitetura

Fluxo conceitual:

```text
Módulos e integrações

↓

Eventos Agronômicos

↓

Orquestrador Agronômico

↓

Validação e contexto

↓

Motores especializados

↓

Memória Agronômica e GDA

↓

Resultados e recomendações

↓

Interface e operação
```

---

# 5. Responsabilidades principais

O Orquestrador deverá ser responsável por:

- receber eventos;
- validar contratos;
- identificar duplicidades;
- construir contexto;
- selecionar os motores;
- ordenar o processamento;
- controlar dependências;
- salvar checkpoints;
- persistir resultados;
- registrar auditoria;
- controlar falhas;
- permitir reprocessamento;
- atualizar o estado da execução;
- publicar resultados para outros componentes.

---

# 6. O que o Orquestrador não deverá fazer

O Orquestrador não deverá:

- calcular diretamente recomendações agronômicas complexas;
- conter regras específicas de cultivares;
- determinar sozinho causas agronômicas;
- calcular curvas estatísticas internamente;
- substituir os motores especializados;
- armazenar conhecimento apenas em memória temporária;
- depender de componentes visuais;
- criar resultados sem rastreabilidade.

---

# 7. Entrada oficial

A principal entrada do Orquestrador será um Evento Agronômico padronizado.

Outras entradas poderão existir, como:

- solicitações de investigação;
- comandos de reprocessamento;
- atualização de modelos;
- execução agendada;
- simulações;
- reconstrução de GDA;
- validações manuais.

Toda entrada deverá possuir contrato explícito.

---

# 8. Identidade da execução

Cada processamento deverá possuir um identificador único de execução.

Esse identificador permitirá:

- rastrear todas as etapas;
- relacionar logs;
- localizar falhas;
- retomar o fluxo;
- identificar a versão dos motores;
- evitar execução duplicada;
- auditar resultados.

Exemplo conceitual:

```text
executionId
```

---

# 9. Correlação

Eventos relacionados deverão poder compartilhar um identificador de correlação.

Exemplos:

- vários eventos de uma mesma ordem de serviço;
- registros gerados por uma mesma operação;
- eventos pertencentes a uma investigação;
- resultados de um mesmo ciclo de processamento.

Exemplo conceitual:

```text
correlationId
```

---

# 10. Fluxo oficial de processamento

O fluxo principal deverá seguir esta sequência:

```text
Recepção

↓

Validação estrutural

↓

Validação de acesso e contexto

↓

Idempotência

↓

Enriquecimento do contexto

↓

Persistência do evento

↓

Seleção dos motores

↓

Execução dos motores

↓

Consolidação dos resultados

↓

Atualização da Memória Agronômica

↓

Atualização do GDA

↓

Auditoria

↓

Publicação dos resultados
```

---

# 11. Recepção

A recepção deverá registrar inicialmente:

- identificador do evento;
- tipo;
- origem;
- produtor;
- fazenda;
- data de recebimento;
- versão do contrato;
- estado inicial.

O recebimento não significa que o evento já foi validado.

---

# 12. Validação estrutural

A validação estrutural deverá verificar:

- campos obrigatórios;
- tipos de dados;
- versão do contrato;
- formato das datas;
- identificadores;
- geometria;
- valores permitidos;
- consistência mínima.

Eventos estruturalmente inválidos não deverão seguir para os motores.

---

# 13. Validação de acesso

O Orquestrador deverá confirmar que o evento pertence ao contexto correto.

Deverá validar, sempre que aplicável:

- producerId;
- farmId;
- talhaoId;
- ueiId;
- usuário responsável;
- permissões;
- vínculo entre as entidades.

Essa etapa deverá impedir o processamento de dados em contexto incorreto.

---

# 14. Idempotência

O mesmo evento poderá chegar mais de uma vez por causa de:

- sincronização offline;
- repetição de requisição;
- falha de conexão;
- reenvio automático;
- duplicidade de integração.

O Orquestrador deverá impedir que o mesmo evento produza efeitos duplicados.

A idempotência poderá utilizar:

- identificador permanente do evento;
- chave de idempotência;
- versão;
- origem;
- assinatura dos dados;
- estado de processamento.

---

# 15. Chave de idempotência

Cada evento processável deverá possuir uma chave capaz de identificar logicamente aquela ocorrência.

Exemplo conceitual:

```text
idempotencyKey
```

A mesma chave não deverá produzir duas execuções definitivas para o mesmo contexto e versão.

---

# 16. Enriquecimento do contexto

Antes de executar os motores, o Orquestrador poderá reunir:

- dados da UEI;
- estado atual do GDA;
- eventos relacionados;
- safra;
- cultura;
- estágio fenológico;
- condições climáticas;
- análises;
- recomendações anteriores;
- parâmetros do produtor;
- versões dos modelos.

Esse conjunto formará o contexto de processamento.

---

# 17. Contexto mínimo

O contexto entregue aos motores deverá conter apenas o necessário para a execução.

O Orquestrador não deverá enviar indiscriminadamente todo o histórico disponível.

A seleção deverá considerar:

- tipo de evento;
- objetivo;
- período;
- localização;
- dependências;
- necessidade do motor.

---

# 18. Seleção dos motores

Nem todo evento deverá executar todos os motores.

Exemplos:

- chuva poderá atualizar clima, água e risco;
- análise de solo poderá atualizar fertilidade e potencial;
- produtividade poderá atualizar eficiência e curvas;
- operação poderá atualizar execução, custo e rastreabilidade.

O Orquestrador deverá selecionar os motores compatíveis com o evento e com o estado atual do sistema.

---

# 19. Registro de motores

Os motores deverão ser registrados por contratos claros.

Cada motor deverá informar:

- nome;
- versão;
- tipos de entrada aceitos;
- dependências;
- saídas;
- prioridade;
- condições de execução;
- política de falha;
- possibilidade de reprocessamento.

---

# 20. Ordem de execução

A ordem de execução deverá respeitar dependências.

Fluxo planejado:

```text
Motor Científico

↓

Motor Estatístico

↓

Motor de Aprendizagem

↓

Motor de Conhecimento

↓

Núcleo de Eficiência Agronômica

↓

Motor de Recomendação
```

Nem toda execução precisará percorrer todas as etapas.

---

# 21. Execução paralela

Motores independentes poderão ser executados em paralelo quando isso não comprometer:

- consistência;
- ordem lógica;
- rastreabilidade;
- recursos;
- reprodutibilidade.

A paralelização não deverá ser utilizada quando um motor depender do resultado de outro.

---

# 22. Resultado intermediário

Cada motor deverá produzir uma saída estruturada.

Essa saída poderá conter:

- fatos derivados;
- indicadores;
- hipóteses;
- inferências;
- conhecimentos;
- alertas;
- confiança;
- cobertura;
- limitações;
- evidências utilizadas.

Resultados intermediários deverão ser rastreáveis.

---

# 23. Checkpoints

O Orquestrador deverá salvar checkpoints ao longo da execução.

Um checkpoint representa um estado seguro a partir do qual o processamento poderá ser retomado.

Exemplos:

```text
evento_validado
contexto_construido
motor_cientifico_concluido
motor_estatistico_concluido
eficiencia_concluida
gda_atualizado
auditoria_concluida
```

---

# 24. Finalidade dos checkpoints

Os checkpoints permitirão:

- retomada após falha;
- diagnóstico;
- redução de reprocessamento;
- acompanhamento;
- auditoria;
- comparação de versões;
- execução assíncrona futura.

---

# 25. Estado da execução

Cada execução deverá possuir um estado.

Estados sugeridos:

```text
recebida
validando
rejeitada
aguardando
processando
parcial
concluida
falhou
cancelada
reprocessando
```

O histórico de mudanças de estado deverá ser preservado.

---

# 26. Falhas

As falhas deverão ser classificadas.

## Falha de entrada

Contrato inválido ou contexto insuficiente.

## Falha de autorização

Usuário ou origem sem acesso ao contexto.

## Falha temporária

Problema de conexão, indisponibilidade ou limite de recurso.

## Falha de motor

Erro durante o processamento de um motor específico.

## Falha de persistência

Erro ao salvar evento, checkpoint ou resultado.

## Falha de consistência

Resultado incompatível com contratos ou contexto.

---

# 27. Política de falha

Cada motor deverá declarar sua política de falha.

Uma falha poderá:

- interromper toda a execução;
- permitir continuação parcial;
- gerar nova tentativa;
- encaminhar para revisão;
- registrar resultado indisponível;
- utilizar resultado anterior válido.

A decisão deverá ser explícita e auditável.

---

# 28. Novas tentativas

Falhas temporárias poderão permitir novas tentativas.

A política deverá definir:

- número máximo de tentativas;
- intervalo;
- crescimento do intervalo;
- tipos de erro elegíveis;
- condição de cancelamento;
- registro de cada tentativa.

Falhas lógicas não deverão ser repetidas automaticamente sem mudança de contexto.

---

# 29. Processamento parcial

Algumas execuções poderão terminar parcialmente.

Exemplo:

- Motor Científico concluído;
- Motor Estatístico concluído;
- Motor Econômico indisponível por ausência de preço.

Nesse caso, o sistema deverá registrar:

- o que foi concluído;
- o que não foi executado;
- por que não foi executado;
- quais resultados permanecem válidos;
- quais dados faltam.

---

# 30. Persistência do evento

O evento validado deverá ser preservado antes da produção de conhecimentos derivados, sempre que a arquitetura de execução permitir.

Isso reduz o risco de existir resultado sem evento de origem.

A persistência deverá manter:

- conteúdo original;
- versão;
- origem;
- qualidade;
- auditoria;
- contexto.

---

# 31. Atualização da Memória Agronômica

Após o processamento, a Memória Agronômica poderá receber:

- o evento validado;
- relações com eventos anteriores;
- resultados derivados;
- hipóteses;
- conhecimentos;
- limitações;
- confiança;
- evidências;
- versão dos motores.

Fato e interpretação deverão permanecer separados.

---

# 32. Atualização do GDA

O GDA deverá ser atualizado após a consolidação dos resultados relevantes.

A atualização poderá incluir:

- estado atual;
- indicadores;
- tendências;
- potenciais;
- gargalos;
- eficiência;
- riscos;
- recomendações;
- confiança;
- cobertura.

O GDA deverá registrar a data e a versão da atualização.

---

# 33. Atualização atômica e consistência

Quando possível, atualizações relacionadas deverão ser persistidas de forma transacional ou coordenada.

Exemplo:

```text
Evento persistido
+
Checkpoint salvo
+
Memória atualizada
+
GDA atualizado
```

Quando uma única transação não for tecnicamente possível, o Orquestrador deverá utilizar estados e compensações para preservar consistência.

---

# 34. Compensação

Quando uma etapa já persistida precisar ser revertida ou neutralizada, o sistema deverá preferir eventos de compensação em vez de apagar o histórico.

Exemplos:

- cancelamento;
- correção;
- invalidação;
- substituição;
- reprocessamento.

A compensação deverá preservar rastreabilidade.

---

# 35. Auditoria

Toda execução deverá gerar auditoria.

A auditoria deverá registrar:

- executionId;
- correlationId;
- evento de origem;
- usuário ou sistema responsável;
- contexto;
- motores executados;
- versões;
- horários;
- duração;
- checkpoints;
- falhas;
- resultados;
- alterações produzidas.

---

# 36. Versão dos motores

Toda saída deverá identificar a versão do motor que a produziu.

Exemplos conceituais:

```text
motorName
motorVersion
contractVersion
modelVersion
```

Isso permitirá reconstruir e comparar resultados.

---

# 37. Reprodutibilidade

Sempre que tecnicamente possível, uma execução deverá poder ser reproduzida com:

- mesmo evento;
- mesmo contexto;
- mesmas versões;
- mesmos parâmetros;
- mesmas regras.

Quando houver componentes não determinísticos, essa condição deverá ser registrada.

---

# 38. Reprocessamento

O Orquestrador deverá permitir reprocessar eventos históricos quando ocorrer:

- atualização de motor;
- correção de dados;
- inclusão de novas evidências;
- mudança de contrato;
- investigação;
- reconstrução do GDA;
- auditoria.

O reprocessamento não deverá apagar o resultado anterior.

---

# 39. Tipos de reprocessamento

O sistema poderá suportar:

## Reprocessamento de evento

Executa novamente um evento específico.

## Reprocessamento de período

Executa eventos de um intervalo temporal.

## Reprocessamento de UEI

Reconstrói interpretações de uma UEI.

## Reprocessamento de talhão

Recalcula consolidações e estratégia.

## Reprocessamento por versão

Atualiza resultados produzidos por uma versão antiga de motor.

---

# 40. Prioridade de processamento

As execuções poderão possuir prioridades.

Exemplos:

- crítica;
- alta;
- normal;
- baixa;
- histórica.

Eventos operacionais urgentes poderão ter prioridade sobre reconstruções históricas.

---

# 41. Processamento síncrono

O processamento síncrono poderá ser utilizado quando:

- a resposta for rápida;
- o usuário depender do retorno imediato;
- os motores forem leves;
- não houver grande volume.

A interface não deverá ficar bloqueada por processamentos longos.

---

# 42. Processamento assíncrono

O processamento assíncrono será preferível quando:

- houver vários motores;
- o volume for elevado;
- houver integrações externas;
- o processamento puder demorar;
- houver reprocessamento histórico;
- a execução não exigir resposta imediata.

Mesmo no modelo assíncrono, o usuário deverá poder acompanhar o estado.

---

# 43. Funcionamento offline

O Orquestrador deverá considerar o funcionamento offline-first da plataforma.

Eventos coletados offline poderão permanecer em fila local até que exista conexão.

Ao sincronizar, deverão preservar:

- identificador original;
- data real do evento;
- data de sincronização;
- origem;
- chave de idempotência;
- ordem local;
- contexto disponível.

---

# 44. Ordem de sincronização

Eventos offline relacionados deverão ser processados respeitando sua ordem lógica.

Exemplo:

```text
ordem iniciada
↓
operação executada
↓
operação pausada
↓
operação retomada
↓
ordem finalizada
```

A data de sincronização não deverá substituir a data real do acontecimento.

---

# 45. Eventos fora de ordem

O Orquestrador deverá tratar eventos que chegam fora da sequência esperada.

Ele poderá:

- aguardar dependências;
- processar parcialmente;
- reconstruir a sequência;
- marcar inconsistência;
- reprocessar a memória;
- solicitar revisão.

O evento não deverá ser descartado apenas por chegar atrasado.

---

# 46. Dependências ausentes

Quando um evento depender de informação ainda indisponível, o Orquestrador deverá registrar essa dependência.

Estados possíveis:

- aguardando evento;
- aguardando contexto;
- aguardando validação;
- aguardando integração;
- aguardando dado complementar.

---

# 47. Agendamento

Alguns processamentos poderão ser executados por agenda.

Exemplos:

- consolidação diária;
- atualização de indicadores;
- reconstrução semanal;
- análise ao final da safra;
- atualização de tendências;
- auditoria periódica.

Execuções agendadas também deverão possuir identidade e auditoria.

---

# 48. Observabilidade

O Orquestrador deverá produzir informações operacionais como:

- quantidade de execuções;
- duração média;
- taxa de sucesso;
- taxa de falha;
- filas;
- tentativas;
- motores mais lentos;
- eventos rejeitados;
- reprocessamentos;
- uso de recursos.

---

# 49. Saúde dos motores

Cada motor deverá possuir estado de saúde.

Exemplos:

```text
disponivel
degradado
indisponivel
em_manutencao
experimental
```

O Orquestrador poderá evitar um motor indisponível ou utilizar estratégia alternativa.

---

# 50. Modo experimental

Motores novos poderão operar inicialmente em modo experimental.

Nesse modo:

- resultados não deverão substituir automaticamente os oficiais;
- comparações poderão ser realizadas;
- métricas deverão ser coletadas;
- divergências deverão ser registradas;
- validação humana poderá ser exigida.

---

# 51. Resultados oficiais e experimentais

O sistema deverá distinguir:

- resultado oficial;
- resultado experimental;
- simulação;
- hipótese;
- recomendação preliminar.

A interface não deverá apresentar todos como equivalentes.

---

# 52. Compatibilidade de contratos

O Orquestrador deverá controlar a compatibilidade entre:

- eventos;
- contextos;
- motores;
- saídas;
- memória;
- GDA.

Quando houver incompatibilidade, a execução deverá falhar de forma explícita ou utilizar adaptador documentado.

---

# 53. Adaptadores

Durante migrações, adaptadores poderão converter contratos antigos para contratos novos.

Os adaptadores deverão possuir:

- versão de origem;
- versão de destino;
- regras de conversão;
- limitações;
- testes;
- auditoria.

Adaptadores não deverão ocultar perda de informação.

---

# 54. Segurança

O Orquestrador deverá respeitar:

- controle de acesso;
- isolamento entre produtores;
- isolamento entre fazendas;
- validação de origem;
- proteção de dados;
- auditoria;
- princípio do menor privilégio.

Nenhum motor deverá receber dados de produtores sem autorização.

---

# 55. Privacidade e aprendizado agregado

Quando houver processamento com dados agregados de ambientes semelhantes, o Orquestrador deverá garantir:

- anonimização;
- autorização;
- segregação;
- ausência de exposição indevida;
- rastreabilidade da origem agregada;
- respeito à legislação.

---

# 56. Integração com o Núcleo de Eficiência

O Núcleo de Eficiência Agronômica será integrado como conjunto de motores especializados.

Fluxo:

```text
Conhecimento consolidado

↓

Motor de Potencial

↓

Motor de Conversão

↓

Motor de Gargalos

↓

Motor de Curvas de Resposta

↓

Motor Econômico

↓

Motor de Estratégia do Talhão

↓

Motor de Recomendação
```

O Orquestrador deverá coordenar as dependências entre essas etapas.

---

# 57. Estratégia do talhão

Após as análises das UEIs, o Orquestrador poderá solicitar uma consolidação em nível de talhão.

Essa consolidação deverá utilizar:

- distribuição das condições;
- quantidade de hectares;
- percentual beneficiado;
- custos;
- restrições operacionais;
- riscos;
- objetivos do produtor;
- trade-offs.

---

# 58. Integração com a interface

A interface deverá consultar o estado e os resultados das execuções por meio de contratos de aplicação.

Ela não deverá conhecer detalhes internos do encadeamento dos motores.

A interface poderá exibir:

- processamento em andamento;
- resultado disponível;
- execução parcial;
- dados insuficientes;
- falha;
- necessidade de revisão;
- confiança.

---

# 59. Integração com notificações

O Orquestrador poderá produzir notificações quando:

- houver falha crítica;
- uma recomendação estiver pronta;
- dados forem insuficientes;
- uma investigação for concluída;
- um risco for identificado;
- uma execução exigir validação humana.

Notificação não substitui persistência e auditoria.

---

# 60. Governança

Mudanças no Orquestrador deverão ser tratadas como mudanças estruturais.

Alterações em:

- fluxo;
- estados;
- contratos;
- checkpoints;
- políticas de falha;
- ordem dos motores;
- persistência;

deverão ser documentadas, testadas e versionadas.

---

# 61. Evolução incremental

O Orquestrador existente deverá ser preservado e ampliado progressivamente.

A evolução deverá evitar:

- reescrita total;
- migração abrupta;
- perda de compatibilidade;
- substituição simultânea de todos os motores;
- mudança massiva de contratos.

---

# 62. Arquitetura física futura

Estrutura sugerida:

```text
src/
└── intelligence/
    └── orchestrator/
        ├── contracts/
        ├── context/
        ├── engines/
        ├── execution/
        ├── checkpoints/
        ├── idempotency/
        ├── audit/
        ├── retry/
        ├── registry/
        └── persistence/
```

Essa estrutura representa um destino arquitetural.

A migração deverá ocorrer gradualmente sobre a aplicação existente.

---

# 63. Contrato conceitual de execução

Uma execução deverá possuir, no mínimo:

```text
Identidade

Evento de origem

Contexto

Estado

Checkpoint atual

Motores selecionados

Versões

Resultados

Falhas

Tentativas

Auditoria

Datas
```

---

# 64. Critérios de conclusão

Uma execução somente deverá ser considerada concluída quando:

- todas as etapas obrigatórias terminarem;
- resultados válidos forem persistidos;
- a Memória Agronômica for atualizada quando aplicável;
- o GDA for atualizado quando aplicável;
- a auditoria for registrada;
- o estado final for salvo.

---

# 65. Critérios de sucesso

O sucesso do Orquestrador não deverá ser medido apenas pela ausência de erros.

Também deverá considerar:

- consistência dos resultados;
- rastreabilidade;
- tempo de processamento;
- capacidade de retomada;
- qualidade da auditoria;
- ausência de duplicidades;
- compatibilidade;
- capacidade de reprocessamento.

---

# 66. Decisão permanente

O Orquestrador Agronômico é a infraestrutura central de coordenação da inteligência da Eqtara.

Ele deverá garantir que cada evento seja validado, contextualizado, processado, persistido e auditado de forma segura.

O Orquestrador não substitui os motores especializados.

Ele coordena sua execução.

A Memória Agronômica preserva a história.

O GDA consolida o estado atual.

O Núcleo de Eficiência explica a conversão do potencial em resultado.

O Motor de Recomendação transforma essas interpretações em ações possíveis.

A evolução da inteligência da Eqtara deverá ocorrer pela ampliação progressiva desse fluxo, preservando a infraestrutura já construída e evitando reescritas desnecessárias.