# 10 — Motor de Conversão

**Versão:** 1.0  
**Status:** Aprovado  
**Tipo:** Motor de Inteligência

---

# 1. Objetivo

O Motor de Conversão é responsável por medir quanto do potencial produtivo estimado foi efetivamente convertido em resultado observado.

Ele representa o primeiro indicador de eficiência da plataforma Eqtara.

Seu objetivo não é explicar as causas da perda.

Seu objetivo é medir a distância entre:

- potencial;
- resultado observado.

A explicação dessas diferenças será responsabilidade do Motor de Gargalos.

---

# 2. Pergunta central

O Motor de Conversão deverá responder:

> Quanto do potencial disponível foi efetivamente transformado em produtividade e resultado econômico?

---

# 3. Papel na arquitetura

Fluxo oficial:

```text
Motor de Potencial

↓

Motor de Conversão

↓

Motor de Gargalos

↓

Curvas de Resposta

↓

Motor Econômico

↓

Estratégia do Talhão
```

Sem uma estimativa de potencial válida, não deverá existir cálculo de conversão.

---

# 4. Conceito de conversão

Conversão representa a eficiência com que uma área transformou seu potencial em resultado.

Ela não mede apenas produtividade.

Ela mede a utilização do potencial disponível.

Duas áreas podem produzir 70 sc/ha.

Uma poderá possuir conversão excelente.

Outra poderá possuir conversão baixa.

Tudo dependerá do potencial previamente estimado.

---

# 5. Princípios

O Motor deverá seguir os seguintes princípios:

- conversão depende do potencial;
- conversão depende do resultado observado;
- conversão nunca deverá ser interpretada isoladamente;
- toda conversão deverá possuir confiança;
- toda conversão deverá possuir cobertura;
- toda conversão deverá informar limitações.

---

# 6. Relação básica

Conceitualmente:

```text
Eficiência de Conversão

=

Resultado Observado

÷

Potencial Estimado
```

Essa relação deverá ser interpretada dentro do contexto agronômico e nunca de forma absoluta.

---

# 7. Resultado observado

O resultado observado poderá representar:

- produtividade;
- biomassa;
- qualidade;
- margem;
- receita;
- outro indicador definido pelo modelo.

A unidade utilizada deverá ser explicitamente registrada.

---

# 8. Tipos de conversão

O Motor poderá calcular diferentes dimensões.

## Conversão Agronômica

Produtividade obtida em relação ao potencial produtivo.

---

## Conversão Econômica

Margem obtida em relação ao potencial econômico.

---

## Conversão Operacional

Qualidade da execução em relação ao planejamento.

---

## Conversão Hídrica

Aproveitamento do potencial hídrico disponível.

---

## Conversão Nutricional

Resposta observada em relação ao potencial nutricional.

---

## Conversão Integrada

Síntese produzida pelo Núcleo de Eficiência.

---

# 9. Unidade mínima

A conversão deverá ser calculada inicialmente para cada UEI.

Posteriormente poderá ser consolidada para:

- talhão;
- fazenda;
- produtor.

---

# 10. Entradas

O Motor utilizará principalmente:

- potencial estimado;
- resultado observado;
- GDA;
- Memória Agronômica;
- confiança do potencial;
- cobertura;
- qualidade dos dados.

---

# 11. Saídas

Cada cálculo deverá produzir:

- eficiência;
- perda estimada;
- potencial utilizado;
- potencial não convertido;
- confiança;
- cobertura;
- limitações;
- evidências utilizadas.

---

# 12. Conversão não utilizada

Além da eficiência, o Motor deverá informar quanto potencial permaneceu sem conversão.

Exemplo:

```text
Potencial

90 sc/ha

Resultado

72 sc/ha

Conversão

80%

Potencial não convertido

18 sc/ha
```

Esse valor será utilizado posteriormente pelo Motor de Gargalos.

---

# 13. Conversão parcial

Nem toda perda representa desperdício.

Parte do potencial poderá permanecer indisponível devido a:

- riscos climáticos;
- restrições econômicas;
- limitações operacionais;
- objetivos do produtor.

O Motor deverá registrar essa diferença sem emitir julgamento.

---

# 14. Faixas de eficiência

A plataforma poderá utilizar classes como:

```text
Muito Alta

Alta

Moderada

Baixa

Muito Baixa
```

Os limites dessas classes deverão ser documentados separadamente e poderão evoluir conforme novas evidências.

---

# 15. Conversão superior a 100%

Em situações excepcionais, o resultado observado poderá superar o potencial inicialmente estimado.

Quando isso ocorrer, o sistema deverá:

- registrar a ocorrência;
- revisar a estimativa do potencial;
- identificar novas evidências;
- permitir reprocessamento.

Esse comportamento representa aprendizado do modelo e não erro automático.

---

# 16. Linha do tempo

O cálculo deverá considerar o momento em que foi realizado.

Exemplo:

```text
Potencial estimado

↓

Intervenções

↓

Eventos

↓

Resultado observado

↓

Conversão calculada
```

A conversão nunca deverá utilizar informações futuras para recalcular um resultado histórico sem preservar versões.

---

# 17. Comparações

Comparações somente deverão ocorrer entre contextos equivalentes.

Exemplos:

- mesma cultura;
- mesmo indicador;
- mesma unidade;
- períodos comparáveis;
- qualidade semelhante dos dados.

---

# 18. Conversão temporal

A eficiência poderá ser acompanhada ao longo do ciclo.

Exemplos:

- estabelecimento;
- desenvolvimento vegetativo;
- florescimento;
- enchimento;
- colheita.

Isso permitirá identificar em que fase ocorreu maior perda.

---

# 19. Conversão espacial

Além da dimensão temporal, o Motor deverá analisar a distribuição espacial da conversão.

A plataforma deverá identificar:

- áreas de alta conversão;
- áreas intermediárias;
- áreas críticas.

Essas informações alimentarão mapas e análises do talhão.

---

# 20. Conversão por fator

Quando houver dados suficientes, a conversão poderá ser decomposta por fator.

Exemplos:

- água;
- solo;
- genética;
- manejo;
- operação.

Essa decomposição será aprofundada pelo Motor de Gargalos.

---

# 21. Relação com o Motor de Gargalos

O Motor de Conversão informa:

**quanto foi perdido.**

O Motor de Gargalos explicará:

**por que foi perdido.**

Essa separação deverá ser preservada.

---

# 22. Relação com Curvas de Resposta

As Curvas de Resposta utilizarão os resultados da conversão para entender como diferentes variáveis influenciaram a eficiência.

---

# 23. Relação com o Motor Econômico

O Motor Econômico transformará perdas de conversão em:

- perda financeira;
- margem perdida;
- retorno potencial;
- custo da não intervenção.

---

# 24. Relação com a Estratégia do Talhão

Após calcular a conversão de cada UEI, o sistema poderá consolidar:

- média;
- distribuição;
- dispersão;
- estabilidade;
- percentual de hectares.

Essa consolidação permitirá recomendar estratégias em nível de talhão.

---

# 25. Confiança

Toda conversão deverá possuir confiança.

A confiança dependerá de:

- qualidade do potencial;
- qualidade do resultado observado;
- quantidade de evidências;
- cobertura espacial;
- cobertura temporal;
- consistência.

---

# 26. Cobertura

A cobertura representa quanto da realidade foi efetivamente analisada.

Exemplo:

```text
Conversão

84%

Cobertura

76% da área
```

Cobertura e confiança deverão ser informadas separadamente.

---

# 27. Limitações

Sempre que existirem limitações relevantes, elas deverão ser registradas.

Exemplos:

- ausência de mapa de produtividade;
- poucas análises de solo;
- baixa precisão espacial;
- histórico insuficiente;
- baixa representatividade.

---

# 28. Reprocessamento

Sempre que o Potencial for recalculado, a Conversão deverá ser recalculada.

A versão anterior deverá permanecer disponível para auditoria.

---

# 29. Auditoria

Cada cálculo deverá registrar:

- analysisId;
- executionId;
- versão do motor;
- versão do potencial utilizado;
- resultado observado;
- eficiência calculada;
- confiança;
- cobertura;
- data.

---

# 30. Evolução do modelo

Inicialmente o Motor utilizará regras determinísticas simples.

Com o amadurecimento da plataforma, poderá incorporar:

- modelos estatísticos;
- aprendizado de máquina;
- calibração regional;
- validação contínua;
- aprendizado com novas safras.

Toda evolução deverá preservar comparabilidade entre versões.

---

# 31. Decisão permanente

O Motor de Conversão representa a primeira medida objetiva de eficiência da plataforma Eqtara.

Seu papel é quantificar quanto do potencial produtivo estimado foi efetivamente transformado em resultado observado.

Ele não identifica causas nem produz recomendações.

Sua função é medir, de forma rastreável, contextualizada e explicável, a distância entre o potencial disponível e o desempenho obtido.

Essa informação servirá de base para que os motores seguintes identifiquem gargalos, construam curvas de resposta, estimem impactos econômicos e proponham estratégias capazes de aumentar a eficiência agronômica de cada UEI e de cada talhão.