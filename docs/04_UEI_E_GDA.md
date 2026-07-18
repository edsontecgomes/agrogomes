# 04 — UEI, GDA e Memória Agronômica

**Versão:** 1.0  
**Status:** Aprovado  
**Tipo:** Arquitetura Funcional

---

# 1. Objetivo

Este documento define oficialmente a relação entre:

- UEI (Unidade Experimental Inteligente)
- GDA (Gêmeo Digital Agronômico)
- Memória Agronômica

Esses três elementos constituem o núcleo da inteligência permanente da plataforma Eqtara.

---

# 2. Visão Geral

Cada talhão é dividido em uma ou mais UEIs.

Cada UEI possui exatamente um GDA ativo.

O GDA utiliza continuamente a Memória Agronômica para interpretar o estado atual da área.

Fluxo conceitual:

```text
Talhão
      ↓
UEI
      ↓
GDA
      ↓
Memória Agronômica
      ↓
Conhecimento
      ↓
Recomendação
```

---

# 3. O que é uma UEI

UEI significa:

**Unidade Experimental Inteligente**

A UEI representa a menor unidade territorial utilizada para aprendizagem agronômica.

Ela não representa apenas um hectare.

Ela representa um ambiente relativamente homogêneo.

Sua dimensão poderá variar conforme:

- qualidade dos dados;
- relevo;
- tipo de solo;
- resolução das imagens;
- objetivo da análise;
- manejo.

---

# 4. Responsabilidades da UEI

Cada UEI deverá possuir:

- identidade permanente;
- geometria;
- centroide;
- área;
- histórico;
- GDA;
- Memória Agronômica.

A UEI nunca deverá ser recriada a cada safra.

Ela evolui continuamente.

---

# 5. Identidade permanente

A identidade da UEI deverá permanecer estável ao longo dos anos.

Mesmo que ocorram mudanças de cultura ou manejo, a UEI continua representando a mesma região física.

Isso permite comparar safras diferentes.

---

# 6. GDA

O GDA representa o estado digital interpretado da UEI.

Ele não é apenas um banco de dados.

Ele representa a "visão atual" que a plataforma possui daquela área.

---

# 7. Função do GDA

O GDA deverá consolidar:

- indicadores;
- tendências;
- limitações;
- potenciais;
- histórico;
- eficiência;
- recomendações;
- hipóteses;
- confiança.

Ele deverá responder:

> Como esta UEI se encontra neste momento?

---

# 8. Atualização contínua

Sempre que um novo evento ocorrer, o GDA deverá ser atualizado.

Exemplos:

- chuva;
- plantio;
- pulverização;
- análise de solo;
- NDVI;
- produtividade;
- observações.

O GDA nunca deverá depender apenas de processamento manual.

---

# 9. Memória Agronômica

A Memória Agronômica representa a história contextualizada da UEI.

Ela preserva não apenas eventos, mas também suas relações.

Ela responde:

- o que aconteceu;
- onde aconteceu;
- quando aconteceu;
- em quais condições;
- qual foi o resultado.

---

# 10. Estrutura da Memória

Cada registro deverá possuir contexto.

Exemplo:

```text
Evento

↓

Condições

↓

Resposta

↓

Conhecimento produzido
```

Sem contexto, o evento perde valor analítico.

---

# 11. Aprendizagem

Sempre que ocorrer um novo evento, a Memória Agronômica deverá registrar:

- condição inicial;
- intervenção;
- condições ambientais;
- resposta observada;
- conhecimento produzido.

---

# 12. Conhecimento progressivo

No início da vida de uma UEI haverá pouco histórico.

Nesse estágio o GDA poderá utilizar:

- conhecimento científico;
- ambientes semelhantes;
- histórico regional;
- aprendizado anonimizado.

À medida que o histórico cresce, o peso das informações próprias aumenta.

---

# 13. Ciclo permanente

O ciclo de aprendizagem será:

```text
Evento

↓

Memória

↓

Atualização do GDA

↓

Nova interpretação

↓

Nova recomendação

↓

Nova execução

↓

Novo evento
```

Esse ciclo nunca termina.

---

# 14. Estados do GDA

O GDA deverá manter diferentes estados.

Exemplos:

- inicial;
- em aprendizagem;
- consolidado;
- experimental;
- histórico.

Esses estados auxiliam na interpretação da qualidade do conhecimento disponível.

---

# 15. Indicadores

O GDA deverá consolidar indicadores como:

- produtividade;
- chuva acumulada;
- estabilidade;
- variabilidade;
- eficiência;
- risco;
- potencial.

Novos indicadores poderão ser adicionados futuramente.

---

# 16. Hipóteses

O GDA poderá registrar hipóteses.

Exemplo:

> "Existe forte evidência de limitação por compactação."

Hipóteses deverão permanecer separadas de fatos observados.

---

# 17. Evidências

Toda hipótese deverá possuir evidências.

Exemplos:

- análises;
- sensores;
- imagens;
- observações;
- histórico.

---

# 18. Confiança

Toda interpretação deverá possuir um nível de confiança.

A confiança deverá aumentar conforme:

- aumenta o histórico;
- aumenta a cobertura;
- melhora a qualidade dos dados.

---

# 19. Independência

Cada UEI possui seu próprio GDA.

Cada GDA possui sua própria Memória Agronômica.

Entretanto, conhecimentos poderão ser compartilhados entre ambientes semelhantes.

---

# 20. Relação entre UEIs

As UEIs não são ilhas.

Elas podem ser comparadas.

Podem formar grupos.

Podem contribuir para estratégias do talhão.

---

# 21. Papel na IA

Toda inteligência futura da Eqtara deverá utilizar o GDA como principal fonte de contexto.

Os motores não deverão consultar diretamente milhares de eventos históricos sempre que possível.

O GDA será responsável por consolidar essas informações.

---

# 22. Papel na recomendação

As recomendações deverão considerar:

- estado atual;
- histórico;
- tendências;
- confiança;
- cobertura;
- eficiência;
- objetivos do produtor.

---

# 23. Persistência

A Memória Agronômica é permanente.

Ela nunca deverá ser descartada ao final de uma safra.

Safras representam capítulos da memória, não memórias independentes.

---

# 24. Evolução

Novos sensores, modelos e motores poderão enriquecer o GDA sem alterar a identidade da UEI.

Isso garante continuidade histórica.

---

# 25. Decisão permanente

Toda inteligência da Eqtara deverá partir da seguinte relação:

UEI representa o ambiente físico.

GDA representa a interpretação digital desse ambiente.

Memória Agronômica representa a história contextualizada da área.

Esses três componentes constituem o núcleo permanente do conhecimento da plataforma.