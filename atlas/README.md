# Atlas · LDSOFT

Portal do time de produtos: documentação, design system e benchmarks de todos os produtos da LDSOFT.
Feito em **React + TypeScript + Vite**, com a identidade visual do **APOL+** (tokens copiados de `src/index.css` do APOL+).

## Rodar

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # gera a pasta dist/ (estática, funciona em qualquer servidor)
npm run preview    # serve o build localmente
```

> Abrir `dist/index.html` direto pelo explorador de arquivos não funciona (o navegador bloqueia módulos em `file://`). Use `npm run preview` ou publique a pasta `dist/` num servidor.

## O que já existe

| Rota | Conteúdo |
| --- | --- |
| `#/` | Início: busca, seções, atualizações |
| `#/design-system` | Visão geral das 3 guias |
| `#/design-system/apol` | DS do APOL+ (base do Atlas): cores ao vivo, tipografia, espaçamento, 15 componentes interativos, pontos a padronizar |
| `#/design-system/biblioteca` | Biblioteca de componentes dos demais produtos (Figma): 40 componentes com prévia ao vivo e playground de propriedades, cores, tipografia, sombras |
| `#/design-system/icones` | Galeria dos 1.512 ícones Phosphor em 6 pesos, busca em PT/EN, código React/HTML/SVG |
| `#/design-system/downloads` | Baixa o Design System completo em um arquivo `.md` (regras, tokens, fontes, ícones e todos os componentes com código), gerado na hora por `pages/design-system/downloads/gerarMarkdown.ts` para uso em IA |
| `#/produtos`, `#/benchmarks` | Bibliotecas de conteúdo dinâmico: listagem com filtros, página de leitura, editor por blocos, documentos anexados, rascunho/publicação e histórico |
| `#/colaboradores` | Administração (só administradores): perfis, áreas autorizadas, permissão de publicar e atividade recente |
| `#/novidades` | Página "em construção" |

Recursos globais: busca com **Ctrl K** (ou `/`), modo claro/escuro e os 7 temas do APOL+ (salvos no navegador), sidebar recolhível, layout responsivo.

## Conteúdo dinâmico, login e permissões (simulação)

Não há backend: tudo é simulado no navegador por `src/lib/api.ts` (dados no `localStorage`, arquivos no IndexedDB). A API lê a sessão e **valida cada ação** com `src/lib/permissoes.ts` antes de gravar; a interface só esconde botões por conveniência. Para ligar um backend real, troque o corpo das funções de `api.ts`, mantendo as assinaturas.

| Usuário | Senha | Perfil |
| --- | --- | --- |
| `produtos01` (já preenchido no login) | `Atlas@2026` | Administrador (Time de Produtos) |
| `colab01` | `Atlas@2026` | Colaborador: Produtos e Benchmarks, **sem** autorização de publicar |
| `colab02` | `Atlas@2026` | Colaborador: Benchmarks, com autorização de publicar |
| `leitor01` | `Atlas@2026` | Leitor |

Para recomeçar do zero, limpe o armazenamento do site no navegador.

## Estrutura

```
src/
├── styles/
│   ├── tokens.css        ← tokens do APOL+ (fonte da verdade visual do Atlas)
│   ├── app.css           ← casca: sidebar, topbar, páginas de documentação
│   ├── apol.css          ← réplica das classes de componentes do APOL+
│   └── biblioteca.css    ← réplica dos componentes da Biblioteca + galeria de ícones
├── lib/
│   ├── navegacao.ts      ← itens da sidebar e das guias do DS (adicione páginas aqui)
│   └── preferencias.tsx  ← modo, tema, toast e "copiar"
├── components/
│   ├── layout/           ← Shell (sidebar + topbar) e BuscaGlobal (Ctrl K)
│   └── ui/Doc.tsx        ← Cabecalho, Secao, Sumario, BotaoCopiar, Codigo
├── pages/
│   ├── Inicio.tsx, EmConstrucao.tsx
│   └── design-system/
│       ├── apol/         ← ApolFundamentos, ApolComponentes, secoes.ts (sumário)
│       ├── biblioteca/   ← Biblioteca.tsx (catálogo + fundamentos) e demos.tsx (prévias)
│       └── icones/       ← Icones.tsx (galeria)
└── data/
    ├── biblioteca.json            ← gerado do Figma
    └── phosphor-categorias.json   ← gerado do Figma
scripts/
├── extrair-figma.mjs   ← lê os .fig e gera src/data/*.json
└── descricoes.json     ← descrições em português e categorias de cada componente
```

## Atualizar os dados do Figma

1. No Figma, **File › Save local copy** dos arquivos *DS - Biblioteca de componentes* e *Icons (Phosphor)*.
2. Rode:
   ```bash
   npm run dados:figma -- "C:/caminho/DS - Biblioteca de componentes.fig" "C:/caminho/Icons (Phosphor).fig"
   ```
3. Componentes novos aparecem no catálogo com categoria "Outros": adicione a descrição e a categoria em `scripts/descricoes.json` e rode de novo. Para dar prévia ao vivo a um componente, crie uma entrada em `DEMOS` (`src/pages/design-system/biblioteca/demos.tsx`).

## Atualizar o DS do APOL+

Os tokens ficam em `src/styles/tokens.css` e precisam acompanhar `src/index.css` do APOL+. Os componentes documentados estão em `apol.css` + `ApolComponentes.tsx`.

## Adicionar uma página

1. Crie o componente em `src/pages/`.
2. Registre a rota em `src/App.tsx`.
3. Adicione o item em `NAV` (`src/lib/navegacao.ts`): ele aparece na sidebar e na busca automaticamente.
