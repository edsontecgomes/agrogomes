# Eqtara — rota completa de coleta de solos (v4)

Este pacote contém o projeto completo com o aprimoramento do Núcleo de Coleta
de Solos.

## O que foi incluído

- o mapa enquadra automaticamente o talhão selecionado;
- todas as UEIs e todos os pontos de coleta do talhão ficam visíveis;
- os pontos são preparados e mantidos localmente para o trabalho offline;
- quando o mapa on-line não está disponível, uma cartografia vetorial local
  preserva os limites, as UEIs, os pontos e a posição do colaborador;
- o mapa não é recriado a cada atualização do GPS, eliminando o efeito de
  imagem piscando;
- botão **Exportar rota GPX** para GPS de mão;
- waypoints contínuos na rota completa: P01–P05, P06–P10 e assim por diante;
- os códigos permanentes originais da UEI e do ponto continuam preservados;
- a seleção de um ponto de outra UEI muda automaticamente a UEI em coleta.

## Aplicação no projeto local

Extraia o ZIP diretamente em `C:\Users\Usuário\agrogomes`, permitindo a
substituição dos arquivos existentes. Depois execute:

```powershell
Set-Location "C:\Users\Usuário\agrogomes"
npm install
npm run lint
npm run test:mapas-solo
npm run build
git diff --check
git status --short
```

O arquivo GPX é gerado pelo próprio navegador e pode ser importado em
equipamentos e aplicativos compatíveis com GPX 1.1.
