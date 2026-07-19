# 08 — Núcleo de Eficiência Agronômica

**Versão:** 1.0  
**Status:** Aprovado  
**Tipo:** Arquitetura de Inteligência Agronômica

---

# 1. Objetivo

Este documento define oficialmente o Núcleo de Eficiência Agronômica da plataforma Eqtara.

O Núcleo de Eficiência será responsável por analisar como o potencial agronômico disponível foi convertido em produtividade, resultado econômico e estabilidade operacional.

Seu objetivo principal será explicar:

```text
Quanto potencial existia?

↓

Quanto resultado foi alcançado?

↓

Quanto potencial foi perdido?

↓

Onde ocorreu a perda?

↓

Por que ocorreu?

↓

Qual intervenção possui maior capacidade de recuperação?
```

---

# 2. Definição

O Núcleo de Eficiência Agronômica é o conjunto de motores responsáveis por medir, comparar e explicar a conversão do potencial produtivo em resultado observado.

Ele deverá integrar informações sobre:

- ambiente;
- solo;
- água;
- genética;
- manejo;
- operação;
- resposta da planta;
- produtividade;
- custos;
- margem;
- risco.

---

# 3. Posição na arquitetura

O Núcleo de Eficiência deverá operar entre o Motor de Conhecimento e o Motor de Recomendação.

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

O Motor de Conhecimento organiza fatos, padrões, inferências e evidências.

O Núcleo de Eficiência transforma esse conhecimento em explicações sobre potencial, conversão, gargalos, perdas e retorno.

O Motor de Recomendação transforma essas explicações em alternativas de ação.

---

# 4. Princípio central

O Núcleo de Eficiência deverá responder à pergunta:

> Por que determinada área não converteu todo o seu potencial em produtividade e lucro?

Ele não deverá se limitar a classificar áreas como boas ou ruins.

Deverá explicar:

- qual era o potencial;
- qual foi o resultado;
- qual eficiência foi alcançada;
- qual fator limitou;
- qual impacto estimado;
- qual possibilidade de recuperação existe;
- qual confiança acompanha a conclusão.

---

# 5. Visão biológica da conversão

A análise deverá considerar o fluxo agronômico:

```text
Potencial climático

↓

Condição do solo

↓

Disponibilidade de água

↓

Desenvolvimento radicular

↓

Disponibilidade de nutrientes

↓

Desenvolvimento vegetativo

↓

Formação de biomassa

↓

Formação de grãos

↓

Produtividade

↓

Resultado econômico
```

Uma limitação em uma etapa poderá reduzir a eficiência das etapas posteriores.

O sistema deverá evitar atribuir causalidade definitiva quando existirem apenas correlações ou evidências incompletas.

---

# 6. Visão integrada

A eficiência deverá ser analisada por cinco pilares principais:

```text
Ambiente

Genética

Manejo

Operação

Resposta da Planta
```

Esses pilares deverão funcionar como estrutura de organização da análise.

Nenhum pilar deverá ser interpretado isoladamente quando existirem relações relevantes com os demais.

---

# 7. Pilar Ambiente

O pilar Ambiente deverá considerar:

- chuva;
- temperatura;
- radiação;
- evapotranspiração;
- relevo;
- solo;
- armazenamento de água;
- drenagem;
- compactação;
- disponibilidade hídrica;
- eventos extremos.

O ambiente define parte importante do potencial e das limitações da área.

---

# 8. Pilar Genética

O pilar Genética deverá considerar:

- cultura;
- cultivar;
- híbrido;
- ciclo;
- estabilidade;
- adaptação;
- resistência;
- população recomendada;
- potencial genético;
- histórico de desempenho.

A genética não deverá ser avaliada apenas pela maior produtividade média.

Também deverão ser considerados:

- estabilidade;
- risco;
- resposta ao ambiente;
- resposta ao manejo;
- resultado econômico.

---

# 9. Pilar Manejo

O pilar Manejo deverá considerar:

- correção do solo;
- adubação;
- população;
- espaçamento;
- época de plantio;
- proteção da cultura;
- cobertura do solo;
- rotação;
- irrigação;
- intervenções corretivas;
- decisões técnicas.

O sistema deverá distinguir manejo planejado de manejo efetivamente executado.

---

# 10. Pilar Operação

O pilar Operação deverá considerar:

- qualidade da execução;
- velocidade;
- sobreposição;
- falhas;
- interrupções;
- largura operacional;
- tempo;
- operador;
- equipamento;
- condição de trabalho;
- consumo;
- aderência ao planejamento.

Uma recomendação agronomicamente correta poderá produzir resultado inferior quando for mal executada.

---

# 11. Pilar Resposta da Planta

O pilar Resposta da Planta deverá representar o que a cultura demonstrou ao longo do ciclo.

Exemplos:

- emergência;
- estabelecimento;
- população real;
- vigor;
- desenvolvimento;
- biomassa;
- sanidade;
- florescimento;
- enchimento;
- produtividade;
- qualidade;
- estabilidade.

A resposta da planta será a principal ligação entre ambiente, genética, manejo e resultado final.

---

# 12. Unidade mínima de análise

A UEI será a menor unidade de análise do Núcleo de Eficiência.

Cada UEI poderá possuir:

- potencial próprio;
- eficiência própria;
- gargalos próprios;
- resposta própria;
- confiança própria.

A análise individual não deverá impedir a consolidação em nível de talhão.

---

# 13. Unidade de decisão

O talhão será a principal unidade de decisão operacional.

O Núcleo de Eficiência deverá analisar a distribuição dos resultados entre as UEIs e apoiar uma estratégia executável para o talhão.

Essa estratégia deverá informar:

- quantidade de hectares beneficiados;
- percentual do talhão beneficiado;
- áreas com resposta inferior;
- áreas com risco;
- custos;
- retorno;
- trade-offs;
- restrições operacionais.

---

# 14. Entradas principais

O Núcleo de Eficiência poderá utilizar:

- GDA;
- Memória Agronômica;
- eventos agronômicos;
- conhecimento científico;
- indicadores estatísticos;
- modelos de aprendizagem;
- dados climáticos;
- análises de solo;
- mapas de produtividade;
- telemetria;
- imagens;
- observações;
- custos;
- preços;
- metas do produtor.

---

# 15. Entradas mínimas

Nem toda análise exigirá todos os dados disponíveis.

Cada motor interno deverá declarar:

- dados obrigatórios;
- dados recomendados;
- dados opcionais;
- período necessário;
- cobertura mínima;
- qualidade mínima;
- limitações quando faltarem dados.

---

# 16. Saídas principais

O Núcleo de Eficiência deverá produzir:

- estimativas de potencial;
- resultado observado;
- eficiência;
- perda estimada;
- gargalos;
- fatores contribuintes;
- curvas de resposta;
- oportunidades de recuperação;
- análise econômica;
- estratégia do talhão;
- confiança;
- cobertura;
- limitações;
- evidências.

---

# 17. Motores internos

O Núcleo de Eficiência será composto pelos seguintes motores:

```text
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
```

Esses motores poderão evoluir de forma independente, desde que respeitem os contratos compartilhados.

---

# 18. Motor de Potencial

O Motor de Potencial deverá estimar o resultado tecnicamente possível para determinado contexto.

Ele poderá calcular potenciais como:

- climático;
- edáfico;
- genético;
- manejável;
- operacional;
- econômico;
- integrado.

O potencial deverá possuir:

- valor ou faixa;
- unidade;
- período;
- contexto;
- método;
- confiança;
- limitações.

---

# 19. Potencial não é meta

Potencial representa uma referência técnica contextualizada.

Meta representa um objetivo definido pelo produtor ou pela gestão.

Uma meta poderá ser:

- inferior ao potencial;
- compatível com o potencial;
- superior ao potencial estimado;
- economicamente inadequada.

O sistema deverá diferenciar claramente esses conceitos.

---

# 20. Motor de Conversão

O Motor de Conversão deverá comparar potencial e resultado observado.

Conceito básico:

```text
Eficiência de conversão
=
Resultado observado
÷
Potencial estimado
```

Essa relação deverá ser utilizada com cautela.

O resultado não deverá ser apresentado sem:

- unidade;
- contexto;
- confiança;
- qualidade do potencial;
- qualidade do resultado.

---

# 21. Perda de potencial

A perda poderá ser representada conceitualmente por:

```text
Perda estimada
=
Potencial estimado
-
Resultado observado
```

Ela poderá ser expressa em:

- produtividade;
- percentual;
- receita;
- margem;
- área afetada;
- probabilidade.

A perda estimada não deverá ser tratada como medição exata quando depender de modelos.

---

# 22. Motor de Gargalos

O Motor de Gargalos deverá identificar fatores que limitaram a conversão.

Exemplos:

- deficiência hídrica;
- excesso hídrico;
- baixa fertilidade;
- compactação;
- população inadequada;
- cultivar pouco adaptada;
- falha operacional;
- doença;
- época de plantio;
- baixa qualidade de execução.

Cada gargalo deverá possuir:

- tipo;
- intensidade;
- período;
- área afetada;
- evidências;
- impacto;
- confiança;
- possibilidade de intervenção.

---

# 23. Gargalo principal e contribuintes

O sistema deverá distinguir:

## Gargalo principal

Fator com maior impacto estimado na perda.

## Fatores contribuintes

Fatores que ampliaram ou condicionaram o efeito do gargalo principal.

Exemplo:

```text
Gargalo principal:
Baixa disponibilidade hídrica.

Fatores contribuintes:
Compactação, baixa infiltração e período crítico da cultura.
```

---

# 24. Gargalos independentes e encadeados

Alguns gargalos poderão agir de forma independente.

Outros poderão formar uma cadeia.

Exemplo:

```text
Compactação

↓

Menor infiltração

↓

Menor armazenamento de água

↓

Estresse hídrico

↓

Menor enchimento de grãos

↓

Redução de produtividade
```

O Núcleo deverá representar essas relações quando houver evidências suficientes.

---

# 25. Motor de Curvas de Resposta

O Motor de Curvas de Resposta deverá analisar a relação entre uma variável e uma resposta.

Exemplos:

- chuva × produtividade;
- nitrogênio × produtividade;
- fósforo × produtividade;
- população × produtividade;
- compactação × produtividade;
- data de plantio × produtividade;
- custo × margem.

As curvas deverão registrar:

- população analisada;
- período;
- contexto;
- dispersão;
- ajuste;
- estabilidade;
- confiança;
- limitações.

---

# 26. Correlação e causalidade

Uma curva ou correlação não deverá ser apresentada automaticamente como relação causal.

O sistema deverá distinguir:

- associação;
- correlação;
- hipótese causal;
- relação apoiada por experimento;
- conhecimento científico consolidado.

---

# 27. Motor Econômico

O Motor Econômico deverá transformar resultados agronômicos em consequências econômicas.

Ele deverá considerar:

- custo da intervenção;
- custo por hectare;
- produtividade esperada;
- preço;
- receita;
- margem;
- retorno;
- risco;
- custo da não intervenção;
- tempo de retorno;
- impacto operacional.

---

# 28. Moeda e período econômico

Toda análise econômica deverá registrar:

- moeda;
- data de referência;
- preço utilizado;
- origem do preço;
- custos considerados;
- período;
- impostos ou descontos relevantes;
- limitações.

Valores econômicos sem data de referência não deverão ser comparados diretamente.

---

# 29. Motor de Estratégia do Talhão

O Motor de Estratégia deverá consolidar análises das UEIs em uma alternativa executável.

Ele deverá considerar:

- distribuição espacial;
- quantidade de hectares;
- percentual beneficiado;
- intensidade dos gargalos;
- capacidade operacional;
- custo;
- retorno;
- risco;
- objetivo do produtor;
- restrições.

---

# 30. Objetivos de otimização

A estratégia poderá otimizar diferentes objetivos.

Exemplos:

- maior produtividade;
- maior margem;
- menor risco;
- maior estabilidade;
- menor custo;
- maior percentual de área beneficiada;
- recuperação de áreas críticas;
- equilíbrio entre retorno e risco.

O objetivo escolhido deverá ser explícito.

---

# 31. Maioria do talhão

Em muitos casos, a recomendação deverá priorizar a opção que melhor atende a maioria das UEIs ou dos hectares do talhão.

Entretanto, essa regra não deverá ser absoluta.

O sistema poderá justificar outra estratégia quando:

- áreas minoritárias possuírem alto impacto econômico;
- existirem riscos ambientais;
- houver restrição operacional;
- o objetivo for recuperação de áreas críticas;
- a distribuição dos resultados justificar tratamento diferenciado.

---

# 32. Áreas de exceção

Quando uma estratégia geral não atender determinadas UEIs, o sistema deverá indicar:

- quais áreas são exceções;
- quantos hectares representam;
- por que respondem de forma diferente;
- qual alternativa seria mais adequada;
- se o tratamento diferenciado é operacionalmente viável.

---

# 33. Confiança

Toda saída do Núcleo de Eficiência deverá possuir confiança.

A confiança poderá considerar:

- qualidade dos dados;
- cobertura espacial;
- cobertura temporal;
- consistência;
- estabilidade do padrão;
- quantidade de observações;
- adequação do modelo;
- qualidade das evidências;
- similaridade do contexto.

---

# 34. Cobertura

A cobertura deverá ser informada separadamente da confiança.

Exemplo:

```text
Confiança:
Alta

Cobertura:
58% do talhão
```

Uma conclusão poderá ser confiável para a área observada, mas não representar todo o talhão.

---

# 35. Classes de confiança

A interface poderá utilizar classes como:

```text
muito_baixa
baixa
moderada
alta
muito_alta
```

A classificação deverá ser sustentada por critérios documentados.

---

# 36. Dados insuficientes

Quando os dados forem insuficientes, o Núcleo deverá produzir uma saída válida informando:

- análise indisponível ou parcial;
- dados faltantes;
- impacto da ausência;
- confiança possível;
- coleta recomendada;
- próxima oportunidade de análise.

A ausência de dados não deverá gerar uma recomendação artificialmente precisa.

---

# 37. Qualidade da evidência

As evidências deverão possuir peso conforme sua qualidade.

Exemplo conceitual:

```text
Medição direta validada
>
Sensor calibrado
>
Registro operacional consistente
>
Observação técnica
>
Inferência histórica
>
Referência externa genérica
```

A ordem exata poderá variar conforme o tipo de análise.

---

# 38. Conhecimento local e externo

O Núcleo poderá combinar:

- histórico da UEI;
- histórico do talhão;
- histórico da fazenda;
- ambientes semelhantes;
- dados regionais;
- ciência;
- aprendizado anonimizado.

O peso do conhecimento próprio deverá aumentar à medida que a memória local se torna mais consistente.

---

# 39. Ambientes semelhantes

Quando utilizar aprendizado de outras áreas, o sistema deverá comparar similaridade por fatores como:

- solo;
- clima;
- relevo;
- cultura;
- cultivar;
- manejo;
- regime de chuva;
- produtividade;
- região;
- histórico.

A similaridade deverá possuir medida e confiança.

---

# 40. Personalização progressiva

O Núcleo deverá evoluir de análises mais gerais para análises mais personalizadas.

Fluxo:

```text
Conhecimento científico geral

↓

Conhecimento regional

↓

Histórico da fazenda

↓

Histórico do talhão

↓

Histórico próprio da UEI
```

A personalização deverá ocorrer sem ignorar evidências externas de alta qualidade.

---

# 41. Temporalidade

A eficiência deverá ser analisada em diferentes escalas:

- evento;
- operação;
- estágio da cultura;
- ciclo;
- safra;
- sequência de safras;
- tendência histórica.

Uma conclusão válida para uma safra não deverá ser automaticamente generalizada para todas as safras.

---

# 42. Estabilidade

Além da eficiência média, o Núcleo deverá avaliar estabilidade.

Uma alternativa poderá apresentar:

- alta média e alta variabilidade;
- média moderada e alta estabilidade;
- alto retorno com alto risco;
- menor retorno com maior previsibilidade.

A estratégia deverá apresentar esses trade-offs.

---

# 43. Comparações justas

Comparações deverão considerar contextos equivalentes.

O sistema deverá evitar comparar diretamente:

- culturas diferentes;
- safras muito distintas;
- ambientes incompatíveis;
- custos de períodos diferentes;
- produtividades com unidades diferentes;
- áreas com cobertura insuficiente.

---

# 44. Linha de base

Toda análise de eficiência deverá possuir uma linha de base.

A linha de base poderá ser:

- histórico próprio;
- média do talhão;
- grupo semelhante;
- meta;
- cenário sem intervenção;
- referência científica;
- potencial estimado.

A origem da linha de base deverá ser informada.

---

# 45. Cenários

O Núcleo poderá produzir cenários como:

```text
Sem intervenção

Intervenção mínima

Intervenção recomendada

Intervenção intensiva

Tratamento diferenciado
```

Cada cenário deverá incluir:

- resultado esperado;
- custo;
- margem;
- risco;
- confiança;
- hectares beneficiados;
- limitações.

---

# 46. Simulação

Simulações deverão ser claramente identificadas como projeções.

Elas não deverão ser apresentadas como resultados observados.

Toda simulação deverá registrar:

- premissas;
- variáveis;
- modelo;
- versão;
- incerteza;
- cenário de comparação.

---

# 47. Resultado observado e resultado esperado

O sistema deverá diferenciar:

```text
Resultado observado
=
Aquilo que realmente ocorreu.

Resultado esperado
=
Estimativa produzida antes ou depois de uma intervenção.
```

A comparação entre os dois será fundamental para o aprendizado.

---

# 48. Validação das recomendações

Após uma intervenção, o Núcleo deverá comparar:

- resultado esperado;
- execução real;
- condições ocorridas;
- resultado observado;
- diferença;
- explicação;
- aprendizado.

Esse processo permitirá melhorar os motores ao longo do tempo.

---

# 49. Retroalimentação

O ciclo de eficiência deverá ser:

```text
Potencial estimado

↓

Gargalo identificado

↓

Intervenção recomendada

↓

Execução

↓

Resultado observado

↓

Comparação

↓

Aprendizado

↓

Atualização dos motores
```

---

# 50. Explicabilidade

Cada conclusão deverá informar:

- pergunta respondida;
- dados utilizados;
- período;
- área;
- método;
- evidências;
- fatores favoráveis;
- fatores contrários;
- confiança;
- cobertura;
- limitações;
- alternativas.

---

# 51. Transparência dos cálculos

Quando aplicável, o sistema deverá permitir consultar:

- fórmula;
- parâmetros;
- unidades;
- origem dos valores;
- transformações;
- versão do modelo;
- arredondamentos;
- hipóteses.

A complexidade técnica poderá ser resumida na interface, mas não deverá ser irrecuperável.

---

# 52. Auditoria

Toda análise deverá registrar:

- analysisId;
- executionId;
- UEI ou talhão;
- período;
- motores;
- versões;
- entradas;
- saídas;
- confiança;
- cobertura;
- evidências;
- data;
- estado;
- responsável pelo processamento.

---

# 53. Estados de uma análise

Estados sugeridos:

```text
solicitada
em_preparacao
processando
parcial
concluida
dados_insuficientes
falhou
substituida
reprocessada
```

O histórico deverá ser preservado.

---

# 54. Resultados parciais

O Núcleo poderá produzir resultados parciais.

Exemplo:

- potencial estimado;
- eficiência calculada;
- gargalo ainda não confirmado;
- análise econômica indisponível.

A interface deverá apresentar claramente o que está completo e o que ainda falta.

---

# 55. Modo experimental

Novos modelos poderão operar em modo experimental.

Resultados experimentais deverão:

- ser identificados;
- não substituir automaticamente resultados oficiais;
- permitir comparação;
- coletar métricas;
- registrar divergências;
- depender de validação quando necessário.

---

# 56. Limites científicos

O Núcleo deverá reconhecer limites como:

- ausência de experimento controlado;
- variáveis ocultas;
- dados observacionais;
- pequena amostra;
- baixa representatividade;
- viés de seleção;
- mudanças de manejo;
- mudanças climáticas;
- erro de medição.

---

# 57. Limites operacionais

Uma intervenção tecnicamente adequada poderá ser inviável por:

- equipamento;
- tempo;
- disponibilidade de insumo;
- largura operacional;
- logística;
- equipe;
- custo;
- janela de aplicação;
- restrições legais ou ambientais.

A estratégia deverá considerar esses limites.

---

# 58. Limites econômicos

Uma intervenção poderá produzir ganho agronômico e ainda assim não ser economicamente recomendada.

O Núcleo deverá diferenciar:

- viabilidade agronômica;
- viabilidade operacional;
- viabilidade econômica;
- prioridade estratégica.

---

# 59. Indicadores principais

Indicadores futuros poderão incluir:

- potencial estimado;
- eficiência de conversão;
- perda de potencial;
- margem perdida;
- estabilidade;
- risco;
- intensidade do gargalo;
- área afetada;
- retorno esperado;
- confiança;
- cobertura.

---

# 60. Eficiência multidimensional

A eficiência não deverá ser representada apenas por um único número.

Ela poderá possuir dimensões como:

- agronômica;
- hídrica;
- nutricional;
- genética;
- operacional;
- econômica;
- ambiental;
- temporal.

Um indicador consolidado poderá existir, mas deverá permitir decomposição.

---

# 61. Eficiência hídrica

A eficiência hídrica poderá analisar relações como:

- produtividade por milímetro disponível;
- produtividade por milímetro efetivamente aproveitado;
- perda associada à distribuição;
- efeito de estresse em períodos críticos;
- capacidade de armazenamento;
- infiltração.

O total de chuva isolado não será suficiente.

---

# 62. Eficiência nutricional

A eficiência nutricional poderá considerar:

- nutriente aplicado;
- nutriente disponível;
- resposta produtiva;
- absorção estimada;
- equilíbrio;
- custo;
- retorno;
- fatores limitantes.

A ausência de resposta não deverá ser atribuída automaticamente ao nutriente analisado.

---

# 63. Eficiência genética

A eficiência genética poderá considerar:

- potencial da cultivar;
- adaptação;
- estabilidade;
- interação com ambiente;
- interação com manejo;
- resultado observado;
- risco.

---

# 64. Eficiência operacional

A eficiência operacional poderá considerar:

- área planejada;
- área executada;
- qualidade;
- tempo;
- velocidade;
- consumo;
- sobreposição;
- falhas;
- paradas;
- aderência ao planejamento.

---

# 65. Eficiência econômica

A eficiência econômica poderá considerar:

```text
Margem obtida

÷

Capital ou custo empregado
```

Outras métricas poderão ser utilizadas conforme o contexto.

Toda métrica deverá possuir definição explícita.

---

# 66. Integração com o GDA

O GDA poderá consolidar as saídas atuais do Núcleo de Eficiência.

Exemplos:

- potencial atual;
- eficiência recente;
- gargalos ativos;
- tendência;
- oportunidade;
- risco;
- estratégia;
- confiança.

O histórico completo permanecerá na Memória Agronômica.

---

# 67. Integração com a Memória Agronômica

A Memória Agronômica deverá preservar:

- análises;
- versões;
- resultados;
- evidências;
- recomendações;
- execuções;
- respostas;
- aprendizado.

Isso permitirá comparar a evolução da eficiência ao longo do tempo.

---

# 68. Integração com o Orquestrador

O Orquestrador deverá:

- construir o contexto;
- selecionar os motores;
- controlar a ordem;
- salvar checkpoints;
- persistir resultados;
- atualizar o GDA;
- atualizar a memória;
- registrar auditoria;
- tratar falhas.

O Núcleo de Eficiência não deverá assumir essas responsabilidades de coordenação.

---

# 69. Integração com o Motor de Recomendação

O Núcleo deverá entregar ao Motor de Recomendação:

- gargalos;
- oportunidades;
- cenários;
- custos;
- retornos;
- riscos;
- confiança;
- cobertura;
- restrições;
- trade-offs.

O Motor de Recomendação decidirá como estruturar as alternativas de ação.

---

# 70. Integração com o Modo Investigação

O Modo Investigação poderá utilizar o Núcleo para responder perguntas específicas.

Exemplos:

- Por que esta cultivar produziu mais?
- Qual variável melhor explica a produtividade?
- Qual manejo atende a maior parte do talhão?
- Quantos hectares responderiam a determinada intervenção?
- A chuva ou a compactação foi o principal limitante?
- Qual alternativa oferece maior margem?

---

# 71. Contratos

Cada motor interno deverá possuir contratos separados para:

- entrada;
- saída;
- versão;
- falha;
- confiança;
- evidência;
- unidade;
- auditoria.

Esses contratos serão documentados antes da implementação em TypeScript.

---

# 72. Independência tecnológica

O Núcleo de Eficiência deverá ser independente de:

- React;
- componentes visuais;
- navegação;
- Firebase;
- formulários;
- dispositivo.

A infraestrutura poderá fornecer dados e persistência, mas as regras deverão permanecer no domínio e na inteligência.

---

# 73. Estrutura física futura

Estrutura sugerida:

```text
src/
└── intelligence/
    └── efficiency/
        ├── contracts/
        ├── potential/
        ├── conversion/
        ├── bottlenecks/
        ├── response-curves/
        ├── economics/
        ├── field-strategy/
        ├── confidence/
        ├── evidence/
        └── shared/
```

Essa estrutura representa o destino arquitetural.

A migração ocorrerá gradualmente.

---

# 74. Evolução por fases

A implementação deverá ocorrer em fases.

## Fase 1 — Contratos

Definir entradas, saídas, unidades, confiança e evidências.

## Fase 2 — Potencial

Criar o primeiro Motor de Potencial com regras explícitas e simples.

## Fase 3 — Conversão

Comparar potencial e resultado.

## Fase 4 — Gargalos

Classificar fatores limitantes com evidências.

## Fase 5 — Curvas

Construir relações entre variáveis e respostas.

## Fase 6 — Economia

Transformar ganhos e perdas em resultados econômicos.

## Fase 7 — Estratégia do Talhão

Consolidar UEIs em opções executáveis.

## Fase 8 — Integração

Conectar o Núcleo ao Orquestrador e ao Motor de Recomendação.

---

# 75. Compatibilidade

A implementação deverá preservar:

- Orquestrador existente;
- contratos atuais quando possível;
- GDA;
- UEIs;
- módulos operacionais;
- Firestore;
- PWA;
- funcionamento offline.

Não será criado um aplicativo paralelo.

---

# 76. Critérios de qualidade

Uma análise do Núcleo somente deverá ser considerada válida quando:

- possuir contexto;
- utilizar unidades consistentes;
- registrar evidências;
- informar confiança;
- informar cobertura;
- declarar limitações;
- preservar rastreabilidade;
- possuir versão;
- diferenciar observado de estimado.

---

# 77. Critérios de sucesso

O Núcleo será bem-sucedido quando conseguir:

- identificar perdas relevantes;
- explicar os fatores limitantes;
- priorizar oportunidades;
- comparar alternativas;
- medir retorno;
- informar riscos;
- apoiar uma estratégia executável;
- aprender com o resultado observado;
- aumentar a confiança ao longo do tempo.

---

# 78. Decisão permanente

O Núcleo de Eficiência Agronômica será a camada responsável por explicar como o potencial de cada UEI e talhão é convertido em produtividade, estabilidade e resultado econômico.

Ele deverá analisar ambiente, genética, manejo, operação e resposta da planta de forma integrada.

Toda conclusão deverá ser contextualizada, rastreável, explicável e acompanhada de confiança, cobertura, evidências e limitações.

O Núcleo não deverá apenas indicar onde houve baixa produtividade.

Ele deverá explicar:

- qual potencial existia;
- quanto foi convertido;
- quanto foi perdido;
- quais fatores limitaram;
- quais áreas foram afetadas;
- qual intervenção possui maior potencial de recuperação;
- qual alternativa oferece melhor equilíbrio entre produtividade, margem, risco e viabilidade operacional.

A partir desse núcleo, a Eqtara deverá evoluir de um sistema que registra a fazenda para um sistema que compreende como cada hectare transforma condições, decisões e operações em resultado.