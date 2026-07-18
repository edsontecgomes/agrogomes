# 05 — Eventos Agronômicos

**Versão:** 1.0  
**Status:** Aprovado  
**Tipo:** Arquitetura Funcional

---

# 1. Objetivo

Este documento estabelece o modelo oficial de Eventos Agronômicos da plataforma Eqtara.

Todo fato relevante ocorrido na fazenda deverá ser representado como um evento estruturado.

Os eventos são a matéria-prima da Memória Agronômica, do GDA e dos motores de inteligência.

---

# 2. Conceito

Um Evento Agronômico representa qualquer ocorrência que possa alterar, explicar ou complementar o conhecimento sobre uma área produtiva.

Nem todo evento modifica o ambiente.

Alguns apenas registram uma observação ou uma condição existente.

---

# 3. Filosofia

A plataforma não será organizada apenas por formulários.

Ela será organizada por eventos.

Cada formulário deverá existir apenas para registrar um ou mais eventos agronômicos.

---

# 4. Estrutura conceitual

Todo evento deverá responder:

```text
O que aconteceu?

↓

Onde aconteceu?

↓

Quando aconteceu?

↓

Quem registrou?

↓

Como aconteceu?

↓

Em quais condições?

↓

Quais evidências existem?

↓

Qual foi o resultado observado?

↓

Qual conhecimento foi produzido?
```

---

# 5. Identidade

Todo evento deverá possuir um identificador permanente.

Esse identificador permitirá:

- auditoria;
- rastreabilidade;
- sincronização;
- versionamento;
- histórico.

---

# 6. Contexto espacial

Sempre que possível o evento deverá estar vinculado a:

- produtor;
- fazenda;
- talhão;
- UEI;
- coordenadas;
- geometria.

Caso a localização seja desconhecida, essa informação deverá ser registrada explicitamente.

---

# 7. Contexto temporal

Todo evento deverá registrar:

- data;
- horário;
- fuso horário;
- safra;
- cultura;
- estágio fenológico (quando aplicável).

---

# 8. Responsável

Todo evento deverá identificar:

- operador;
- técnico;
- produtor;
- equipamento;
- origem automática.

O sistema deverá diferenciar registros humanos de registros automáticos.

---

# 9. Classificação

Os eventos serão classificados em grandes categorias.

## Ambientais

- chuva;
- temperatura;
- vento;
- umidade;
- radiação;
- evapotranspiração.

---

## Solo

- análise química;
- análise física;
- compactação;
- umidade do solo;
- matéria orgânica.

---

## Operacionais

- plantio;
- pulverização;
- adubação;
- dessecação;
- irrigação;
- colheita;
- manutenção.

---

## Monitoramento

- NDVI;
- imagens;
- drone;
- satélite;
- sensores;
- telemetria.

---

## Observações

- pragas;
- doenças;
- plantas daninhas;
- falhas;
- sintomas;
- fotografias;
- anotações.

---

## Econômicos

- custos;
- consumo;
- produtividade;
- receita;
- margem.

---

# 10. Estado do evento

Todo evento poderá assumir estados como:

- planejado;
- em execução;
- concluído;
- cancelado;
- validado;
- corrigido.

O histórico de estados deverá ser preservado.

---

# 11. Evidências

Um evento poderá possuir uma ou mais evidências.

Exemplos:

- fotografias;
- vídeos;
- análises laboratoriais;
- mapas;
- arquivos;
- sensores;
- documentos.

---

# 12. Qualidade

Cada evento deverá possuir indicadores de qualidade.

Exemplos:

- precisão espacial;
- precisão temporal;
- completude;
- consistência;
- origem;
- confiabilidade.

Esses indicadores serão utilizados pelos motores de inteligência.

---

# 13. Versionamento

Eventos poderão ser corrigidos.

Entretanto:

- a versão anterior deverá permanecer auditável;
- alterações deverão registrar responsável;
- alterações deverão registrar data.

A plataforma deverá privilegiar rastreabilidade.

---

# 14. Relação com a Memória Agronômica

Eventos não representam conhecimento.

Eventos representam fatos.

A Memória Agronômica interpreta e relaciona esses fatos.

---

# 15. Relação com o GDA

Sempre que um evento relevante for registrado:

```text
Evento

↓

Validação

↓

Persistência

↓

Memória Agronômica

↓

Atualização do GDA
```

Nem todo evento exigirá processamento imediato.

O Orquestrador decidirá quando atualizar o GDA.

---

# 16. Relação com os motores

Os motores nunca deverão depender diretamente dos formulários.

Eles deverão consumir eventos padronizados.

Isso garante independência entre interface e inteligência.

---

# 17. Eventos compostos

Uma única operação poderá gerar diversos eventos.

Exemplo:

Pulverização

↓

- início
- deslocamento
- aplicação
- pausa
- retomada
- conclusão
- consumo
- clima observado

Todos esses registros pertencem ao mesmo contexto operacional.

---

# 18. Eventos derivados

Alguns eventos poderão ser produzidos automaticamente.

Exemplo:

Após registrar chuva por vários dias consecutivos, o sistema poderá gerar:

"Risco elevado de doenças foliares."

Esse novo registro é um evento derivado.

Sua origem deverá ser identificada como automática.

---

# 19. Eventos previstos

A plataforma também poderá trabalhar com eventos futuros.

Exemplos:

- aplicação programada;
- previsão de chuva;
- coleta planejada;
- inspeção agendada.

Esses eventos deverão ser claramente diferenciados dos eventos ocorridos.

---

# 20. Relação entre eventos

Eventos poderão possuir dependências.

Exemplo:

```text
Análise de solo

↓

Recomendação

↓

Adubação

↓

Produtividade
```

Essa cadeia será utilizada pelos motores para explicar relações de causa e efeito.

---

# 21. Ciclo de vida

O ciclo de vida oficial será:

```text
Planejamento

↓

Execução

↓

Registro

↓

Validação

↓

Persistência

↓

Memória Agronômica

↓

Atualização do GDA

↓

Motores

↓

Conhecimento

↓

Recomendação
```

---

# 22. Eventos e aprendizado

Cada evento deverá responder à pergunta:

"O que este registro permitirá aprender no futuro?"

Caso a resposta seja "nada", o evento deverá ser reavaliado.

A plataforma evita coletar dados sem propósito.

---

# 23. Reutilização

O mesmo evento poderá alimentar:

- dashboards;
- mapas;
- relatórios;
- auditoria;
- IA;
- recomendações;
- estatísticas;
- indicadores.

A lógica nunca deverá ser duplicada.

---

# 24. Princípio da neutralidade

O Evento Agronômico representa apenas um fato.

Ele não interpreta.

Ele não conclui.

Ele não recomenda.

A interpretação pertence aos motores especializados.

---

# 25. Decisão permanente

Todo conhecimento produzido pela Eqtara deverá nascer de Eventos Agronômicos padronizados, rastreáveis, georreferenciados e contextualizados.

Os eventos constituem a linguagem comum entre todos os módulos da plataforma e são a principal fonte de alimentação da Memória Agronômica, do GDA, do Orquestrador Agronômico e do Núcleo de Eficiência.