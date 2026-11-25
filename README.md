# Atlas · LDSOFT

O **Atlas** é o hub de conhecimento do time de Produtos da LDSOFT. Ele reúne num só lugar:

- o **Design System** usado pelos produtos (cores, tipografia, espaçamento, efeitos, componentes e ícones);
- as páginas de cada **produto** (briefings, fluxos, telas, arquitetura da informação, pesquisas);
- os **benchmarks** (análises de concorrentes e referências, com tabelas comparativas).

A ideia é que funcione como um "Notion interno" disponível para toda a empresa, mantendo a identidade visual do **APOL+**.

> **Status:** protótipo funcional apenas de front-end. Não há backend: login, conteúdo e arquivos são simulados no navegador (veja [Dados e backend](#dados-e-backend)).

---

## Como rodar

Requer Node.js 20.19 ou superior (exigência do Vite).

```bash
cd atlas
npm install
npm run dev        # http://localhost:5173
```

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento com recarga automática |
| `npm run build` | Verifica os tipos e gera o site estático em `atlas/dist/` |
| `npm run preview` | Serve o build localmente |
| `npm run lint` | Roda o oxlint |
| `npm run dados:figma` | Regenera os dados do Figma (veja [atlas/README.md](atlas/README.md)) |

O build usa caminhos relativos e rotas com `#`, então a pasta `dist/` funciona em qualquer servidor estático ou subpasta, sem configuração no servidor. Abrir `dist/index.html` direto pelo explorador de arquivos não funciona; use `npm run preview`.

### Usuários de demonstração

Todos usam a senha `Atlas@2026`.

| Login | Perfil |
| --- | --- |
| `produtos01` | Administrador (Time de Produtos) |
| `colab01` | Colaborador em Produtos e Benchmarks, **sem** permissão de publicar |
| `colab02` | Colaborador em Benchmarks, **com** permissão de publicar |
| `leitor01` | Leitor |

Para voltar aos dados iniciais, limpe o armazenamento do site no navegador.

---

## Funcionalidades

| Área | Rota | O que tem |
| --- | --- | --- |
| Início | `#/` | Busca, atalhos para as seções e atualizações recentes |
| Design System | `#/design-system/...` | Visão geral, componentes com prévia ao vivo e código, cores e temas, tipografia, espaçamento e responsividade, raio/sombras/efeitos, galeria dos 1.512 ícones Phosphor, e download do DS inteiro em `.md` (pensado para uso com IA) |
| Produtos | `#/produtos` | Biblioteca de páginas por produto, com filtros |
| Benchmarks | `#/benchmarks` | Biblioteca de análises, com tabela comparativa entre produtos |
| Colaboradores | `#/colaboradores` | Administração de perfis, áreas autorizadas, permissão de publicar e atividade (somente administradores) |
| Novidades | `#/novidades` | O que mudou no Atlas e nos produtos |

Em Produtos e Benchmarks, cada página tem endereço próprio (`#/produtos/<slug>`) e código (`PRD-0001`, `BMK-0001`). Elas são escritas num **editor por blocos** (títulos, texto, listas, citações, imagens, tabelas, comparativos, links, arquivos e separadores) e podem ter documentos anexados. Cada página passa por **rascunho → publicado** e guarda um histórico de alterações.

Recursos globais: busca com **Ctrl K** ou `/`, modo claro/escuro, temas do APOL+, sidebar recolhível e layout responsivo.

### Perfis e permissões

| Perfil | Pode |
| --- | --- |
| **Administrador** | Tudo: criar, editar, excluir, publicar e despublicar em qualquer área, além de gerenciar colaboradores |
| **Colaborador** | Criar conteúdo nas áreas autorizadas e gerenciar os próprios rascunhos. Só publica ou edita conteúdo publicado se tiver a permissão de publicar |
| **Leitor** | Ver, navegar e pesquisar conteúdo publicado |

---

## Como está codado

**Stack:** React 19 · TypeScript · Vite · React Router (`HashRouter`) · ícones [Phosphor](https://phosphoricons.com/) · oxlint. Não há biblioteca de UI nem framework de CSS: os estilos são CSS puro baseado nos tokens do APOL+.

### Estrutura

```
.
├── .docs/                       ← especificações e referências de design
│   ├── atlas_evolucao_funcional.md
│   └── DESIGN-SYSTEM-1-LP.md
└── atlas/                       ← a aplicação
    ├── scripts/                 ← extração dos dados do Figma
    └── src/
        ├── main.tsx             ← ponto de entrada (router + preferências + CSS)
        ├── App.tsx              ← login e rotas (páginas carregadas sob demanda)
        ├── lib/                 ← regras e dados, sem interface
        ├── components/
        │   ├── layout/          ← Shell (sidebar + topbar) e BuscaGlobal
        │   ├── conteudo/        ← editor e leitor de blocos, documentos, comparativo
        │   └── ui/              ← diálogos, seletores de data, blocos de documentação
        ├── pages/
        │   ├── Inicio, Login, Novidades, Colaboradores
        │   ├── conteudo/        ← AreaLista, Pagina, Editor (reaproveitados por área)
        │   └── design-system/   ← fundamentos, componentes, ícones e downloads
        ├── data/                ← JSON gerado a partir do Figma
        └── styles/              ← tokens.css (fonte da verdade visual) e demais folhas
```

### Arquivos-chave em `atlas/src/lib/`

| Arquivo | Papel |
| --- | --- |
| `api.ts` | **API simulada.** É a única porta de acesso aos dados: lê a sessão, valida permissões e grava. Também migra dados salvos em versões anteriores |
| `permissoes.ts` | Todas as regras de acesso num só lugar. A API usa essas funções para bloquear ações, e a interface usa as mesmas funções para esconder botões |
| `tipos.ts` | Modelo de dados: `Usuario`, `Pagina`, `Bloco`, `Documento`, `Registro` (histórico) |
| `areas.ts` | Configuração das áreas de conteúdo (rota, prefixo do código, categorias). Uma área nova entra aqui e ganha listagem, página e editor automaticamente |
| `navegacao.ts` | Itens da sidebar e abas do Design System, também usados pela busca global |
| `semente.ts` | Usuários de demonstração e páginas de exemplo |
| `arquivos.ts` | Imagens e anexos guardados no IndexedDB |
| `html.ts` | Sanitização do HTML vindo do editor e validação de links |
| `preferencias.tsx` | Modo claro/escuro, tema, toasts e "copiar" |

### Dados e backend

Tudo roda no navegador:

- conteúdo, usuários e histórico ficam no `localStorage` (chave `atlas.dados.v1`);
- arquivos ficam no IndexedDB (banco `atlas-arquivos`);
- a sessão é lida pela própria `api.ts`, e cada ação é validada como um servidor faria.

Por isso os dados existem só naquele navegador e não são compartilhados entre pessoas. **Para ligar um backend real**, troque o corpo das funções exportadas por `api.ts` (e `arquivos.ts`) por chamadas HTTP, mantendo as assinaturas: o resto da aplicação não precisa mudar.

### Convenções

- Código, nomes de arquivos, funções e textos em **português**.
- O visual vem dos tokens em `styles/tokens.css`, que acompanham o `src/index.css` do APOL+. Não use cores ou medidas soltas.
- Ícones sempre do Phosphor (`@phosphor-icons/react`).
- Para adicionar uma página: crie o componente em `pages/`, registre a rota em `App.tsx` e o item em `NAV` (`lib/navegacao.ts`).

Mais detalhes de manutenção, como atualizar os dados do Figma ou o DS do APOL+, estão em [atlas/README.md](atlas/README.md). A especificação funcional completa está em [.docs/atlas_evolucao_funcional.md](.docs/atlas_evolucao_funcional.md).
