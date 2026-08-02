# Eqtara — Cartografia global, cobertura e coleta de solos

Este pacote adiciona quatro blocos integrados:

1. consulta cartográfica global e somente leitura para `system_admin`;
2. cobertura visual de 500 metros e radar dos pluviômetros;
3. identificação operacional do usuário por talhão e UEI;
4. núcleo de coleta de solos com cinco pontos permanentes por UEI.

## Instalação no projeto local

Extraia o ZIP diretamente sobre a pasta do projeto:

```powershell
Set-Location "C:\Users\Usuário\agrogomes"

$arquivoZip = "$env:USERPROFILE\Downloads\eqtara-cartografia-solos-v1.zip"
Expand-Archive `
  -Path $arquivoZip `
  -DestinationPath "C:\Users\Usuário\agrogomes" `
  -Force
```

## Validação

```powershell
Set-Location "C:\Users\Usuário\agrogomes"

npm run lint
npm run test:mapas-solo
npm run test:offline-navigation
npm run test:offline
npm run test:rain
npm run build
git diff --check
git status --short
```

Para validar as regras com o emulador Firebase:

```powershell
npm run test:rules
```

## Publicação das regras e da prévia

As regras precisam ser publicadas para liberar a consulta cartográfica do System Admin e as coleções de solo:

```powershell
npx firebase deploy `
  --only firestore:rules `
  --project agrogomes-cfa3f

npx firebase hosting:channel:deploy piloto-eqtara `
  --expires 7d `
  --project agrogomes-cfa3f
```

## Acesso do System Admin

O documento do administrador em `usuarios/{uid}` deve possuir:

```json
{
  "role": "system_admin"
}
```

Nesse perfil, a navegação é limitada à Visão Global. A interface consulta somente `fazendas`, `talhoes` e `ueis`, e projeta apenas os campos cartográficos necessários.

## Coleta de solos

- Os pontos `P01` a `P05` são derivados de forma determinística da geometria da UEI.
- Cada ponto possui microárea operacional de 4 metros e margem interna padrão de 5 metros.
- As profundidades `0–10`, `10–20` e `20–30 cm` são registradas separadamente.
- A fotografia é opcional e comprimida no aparelho antes da gravação.
- Registros sem conexão entram na fila de sincronização existente.
- Cinco subamostras concluídas liberam a amostra composta da UEI.

## Limitação conhecida

Resultados laboratoriais, nutrientes, compactação, manejos e produtividade somente aparecerão no histórico ampliado quando essas fontes passarem a gravar `ueiId` e/ou `pontoColetaId`. O pacote já preserva esses identificadores nas novas coletas para permitir essa vinculação sem perder rastreabilidade.
