# 03 — Modelo de Domínio da Plataforma

**Versão:** 1.0  
**Status:** Aprovado  
**Tipo:** Modelo de Domínio Oficial

---

# 1. Objetivo

O Modelo de Domínio define os principais conceitos da Eqtara e os relacionamentos entre eles.

Ele representa o negócio agrícola independentemente da tecnologia utilizada.

Todo desenvolvimento futuro deverá respeitar este modelo.

---

# 2. Filosofia do domínio

A Eqtara não organiza informações apenas em tabelas.

Ela organiza conhecimento.

Cada entidade representa um elemento real da produção agrícola.

Os relacionamentos são tão importantes quanto as entidades.

---

# 3. Cadeia principal

```text
Produtor
        ↓
Fazenda
        ↓
Talhão
        ↓
UEI
        ↓
GDA
        ↓
Memória Agronômica
        ↓
Motores
        ↓
Eficiência
        ↓
Recomendações
```

---

# 4. Produtor

Representa o responsável pela operação agrícola.

Pode possuir:

- uma ou mais fazendas;
- vários usuários;
- diferentes culturas;
- diferentes safras.

Identificador preferencial:

```text
producerId
```

---

# 5. Fazenda

Representa a unidade administrativa.

Uma fazenda possui:

- limites;
- talhões;
- usuários;
- equipamentos;
- estoque;
- histórico.

Identificador:

```text
farmId
```

---

# 6. Talhão

Representa a principal unidade operacional.

Cada talhão possui:

- geometria;
- área;
- cultura;
- histórico;
- operações;
- UEIs.

As decisões operacionais deverão ser apresentadas preferencialmente neste nível.

---

# 7. UEI

UEI significa:

**Unidade Experimental Inteligente**

É a menor unidade espacial de aprendizagem.

Cada UEI possui:

- identidade;
- geometria;
- centroide;
- área;
- histórico;
- GDA;
- Memória Agronômica.

A UEI representa o ambiente.

Não representa apenas um hectare.

---

# 8. GDA

GDA significa:

**Gêmeo Digital Agronômico**

O GDA representa o estado digital interpretado da UEI.

Ele consolida:

- histórico;
- indicadores;
- potenciais;
- limitações;
- eficiência;
- recomendações;
- confiança.

Existe exatamente um GDA ativo para cada UEI.

---

# 9. Memória Agronômica

É o histórico inteligente da UEI.

Ela não armazena apenas eventos.

Ela relaciona:

- eventos;
- contexto;
- resposta;
- conhecimento produzido.

---

# 10. Evento Agronômico

Todo fato relevante gera um Evento Agronômico.

Exemplos:

- chuva;
- operação;
- análise de solo;
- adubação;
- plantio;
- pulverização;
- colheita;
- observação técnica.

Todo evento deverá possuir:

- data;
- localização;
- responsável;
- origem.

---

# 11. Observação

Uma observação representa conhecimento humano.

Exemplos:

- presença de pragas;
- falhas;
- sintomas;
- fotos;
- comentários.

Observações poderão alimentar os motores de inteligência.

---

# 12. Operação

Uma operação representa uma atividade executada.

Exemplos:

- plantio;
- pulverização;
- adubação;
- aplicação;
- colheita.

Ela deverá registrar:

- planejamento;
- execução;
- operador;
- máquinas;
- insumos;
- localização.

---

# 13. Condição Ambiental

Representa o ambiente no momento do evento.

Inclui:

- chuva;
- temperatura;
- umidade;
- vento;
- radiação;
- solo;
- compactação.

---

# 14. Potencial

Potencial representa aquilo que poderia ser obtido.

Não representa produtividade.

Existirão diferentes potenciais:

- climático;
- edáfico;
- genético;
- operacional;
- econômico;
- integrado.

---

# 15. Resultado

Resultado representa aquilo que realmente ocorreu.

Exemplos:

- produtividade;
- custo;
- margem;
- retorno;
- qualidade.

---

# 16. Eficiência

Eficiência mede quanto do potencial foi convertido em resultado.

Conceitualmente:

```text
Resultado

÷

Potencial
```

A eficiência nunca deverá existir sem contexto.

---

# 17. Gargalo

Gargalo representa o fator que mais limitou a conversão.

Cada gargalo deverá possuir:

- tipo;
- intensidade;
- confiança;
- prioridade;
- impacto.

---

# 18. Curva de Resposta

Uma curva representa a relação entre:

uma variável explicativa

e

uma resposta observada.

Exemplos:

- chuva × produtividade;
- adubação × produtividade;
- compactação × produtividade.

---

# 19. Recomendação

Representa uma ação sugerida.

Ela deverá possuir:

- objetivo;
- justificativa;
- benefício;
- custo;
- risco;
- prioridade;
- confiança.

---

# 20. Conhecimento

Conhecimento representa padrões consolidados.

Ele nasce da combinação entre:

- ciência;
- histórico;
- experiências;
- aprendizado.

Conhecimento não é igual a recomendação.

---

# 21. Hipótese

Hipóteses representam explicações ainda não confirmadas.

Uma hipótese poderá evoluir para conhecimento quando sustentada por evidências suficientes.

---

# 22. Evidência

Toda conclusão deverá ser sustentada por evidências.

As evidências poderão ser:

- sensores;
- análises;
- máquinas;
- observações;
- imagens;
- registros históricos.

---

# 23. Confiança

A confiança acompanha toda inferência.

Ela representa a qualidade da conclusão.

Não representa certeza absoluta.

---

# 24. Cobertura

Cobertura mede quanto da realidade foi efetivamente observado.

Uma análise poderá possuir:

- alta confiança;
- baixa cobertura.

Ou:

- alta cobertura;
- baixa confiança.

Esses conceitos são independentes.

---

# 25. Estratégia do Talhão

Representa a decisão consolidada para um talhão.

Ela será construída a partir das análises individuais das UEIs.

---

# 26. Investigação

Representa um processo de análise.

Ela deverá registrar:

- pergunta;
- hipóteses;
- evidências;
- conclusão;
- limitações.

---

# 27. Relacionamentos

```text
Produtor

↓

Fazenda

↓

Talhão

↓

UEI

↓

GDA

↓

Memória Agronômica

↓

Eventos

↓

Motores

↓

Conhecimento

↓

Eficiência

↓

Recomendação
```

---

# 28. Princípio do domínio

Nenhuma entidade deverá existir apenas porque facilita a programação.

Ela deverá representar um conceito real da agricultura.

---

# 29. Evolução

Novas entidades poderão ser adicionadas.

Entretanto, nenhuma deverá romper a cadeia principal do domínio.

---

# 30. Decisão permanente

O Modelo de Domínio da Eqtara passa a ser a referência oficial para:

- contratos TypeScript;
- Firestore;
- Orquestrador;
- Núcleo de Eficiência;
- IA;
- documentação;
- integrações futuras.