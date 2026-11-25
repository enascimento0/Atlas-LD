/* Gera o arquivo .MD com TODO o Design System, a partir das mesmas fontes que alimentam as páginas
   (biblioteca.json, códigos .txt, tokens.css, catálogos). Nada é copiado à mão: ao mudar o DS, o arquivo
   baixado muda junto. As tabelas de medidas (raio, borda, z-index, movimento…) espelham as abas
   "Espaçamento" e "Raio, sombras e efeitos" — ao mudar lá, mude em MEDIDAS/EFEITOS aqui. */
import dados from '../../../data/biblioteca.json'
import categoriasIcones from '../../../data/phosphor-categorias.json'
import tokensCss from '../../../styles/tokens.css?raw'
import { CODIGOS } from '../codigos'
import { corDe } from '../biblioteca/paleta'
import { ITENS } from '../componentes/Componentes'
import { TEMAS_TAB, STATUS } from '../fundamentos/Cores'
import { TIPOS } from '../fundamentos/Tipografia'
import { ESPACOS, CSS_RESP } from '../fundamentos/Espacamento'
import { ARMADILHAS, DECISOES, PREFIXOS, REGRAS, SETUP_CSS } from '../regras'

const CATEGORIAS = ['Estrutura', 'Ações', 'Formulários', 'Navegação', 'Feedback', 'Exibição de dados']
const LINGUAGEM: Record<string, string> = { tsx: 'tsx', ts: 'ts', css: 'css', json: 'json', html: 'html', js: 'js', jsx: 'jsx' }
const fmt = (n: number) => n.toLocaleString('pt-BR')

/** Cerca de código com crases suficientes para nunca ser fechada por um ``` interno. */
function cerca(codigo: string, linguagem = '') {
  const maior = Math.max(0, ...(codigo.match(/`+/g) ?? []).map(s => s.length))
  const c = '`'.repeat(Math.max(3, maior + 1))
  return `${c}${linguagem}\n${codigo.trim()}\n${c}`
}
const celula = (t: string) => t.replace(/\|/g, '\\|').replace(/\n/g, ' ')
function tabela(cab: string[], linhas: string[][]) {
  return [`| ${cab.map(celula).join(' | ')} |`, `| ${cab.map(() => '---').join(' | ')} |`, ...linhas.map(l => `| ${l.map(celula).join(' | ')} |`)].join('\n')
}

/* ───────── Medidas e efeitos (espelham as abas Espaçamento e Efeitos) ───────── */
const MEDIDAS: string[][] = [
  ['Área de conteúdo (main)', '20px'],
  ['Célula de tabela', '8px 16px · densa 8px 8px'],
  ['Card de filtros — cabeçalho / corpo / rodapé', '16px 24px · 16px · 16px 24px'],
  ['Linha de formulário', 'gap 8px · altura mín. 32px · rótulo 150px'],
  ['Modal', 'padding 24px'],
  ['Drawer — cabeçalho / corpo / rodapé', '14px 18px · 18px 20px · 16px 24px'],
  ['Drawer de detalhe — cabeçalho', '20px 22px 18px'],
  ['Card de painel / KPI', '12px 16px'],
  ['Cartão de seção no drawer', '14px 16px · gap 10px'],
]
const BOTOES: string[][] = [
  ['Small (padrão)', '32px', '14 / 600 · padding 8×16'],
  ['Medium', '44px', '16 / 600 · padding 8×16'],
  ['Large', '56px', '18 / 600 · padding 16×24'],
]
const CONTROLES: string[][] = [
  ['Campo de filtro (.field-row)', '32px', '6px', 'fonte 12.5px, padding 0 16px, borda 1.5px'],
  ['Campo de formulário (.fg)', '34px', '7px', 'fonte 13px, padding 0 18px'],
  ['Multi-select (botão)', '36px', '8px', 'fonte 13px'],
  ['Botão de menu de ações', '32px', '8px', 'outline na cor de destaque'],
  ['Ordenar / paginação', '28px', '6px', 'botão quadrado de 28px'],
  ['Switch', '19px', '10px', 'largura 34px'],
  ['Botão de ajuda (FAB)', '48px', '50%', 'canto inferior direito, 24px de margem'],
  ['Topbar', '56px', '—', 'fundo surface, sombra 0 1px 4px'],
]
const BREAKPOINTS: string[][] = [
  ['≤ 1100px', 'KPIs do dashboard: 5 → 3 + 2 por linha'],
  ['≤ 900px', 'Formulário de filtros em 1 coluna (.mf-two-col)'],
  ['≤ 768px', 'Sidebar vira overlay; drawers em tela cheia'],
  ['≤ 640px', 'Barra de resultados e paginação empilham em coluna'],
  ['≤ 479px', 'Ajustes de login'],
]
const CASCA: string[][] = [
  ['Sidebar', 'largura 220px (200–420 arrastável), recolhível (só ícones + menu flutuante); fundo --c-sidebar-bg; raio 0 12px 12px 0; sombra 4px 0 20px rgba(0,0,0,.28); transição .28s'],
  ['Item de menu', 'padding 9px 14px, margem 1px 8px; hover rgba(255,255,255,.07); ativo rgba(255,255,255,.10) + inset 3px 0 0 #fff; ícone 18 (20 recolhido), nome 13px'],
  ['Topbar', 'altura 56px, fundo --c-surface, sombra 0 1px 4px rgba(0,0,0,.06)'],
  ['Main', 'flex 1, overflow auto, padding 20px, fundo --c-bg'],
  ['Tela dividida', 'dois lados com divisória arrastável, proporção 30–70% lembrada no localStorage'],
]
const RAIOS: string[][] = [
  ['4px', 'xs', 'chip "E", fechar toast'], ['6px', 'sm', 'campo de filtro, paginação, sigla'], ['8px', 'md', 'todos os botões, aviso, select'],
  ['10px', 'lg', 'card, tabela, popover, toast simples'], ['12px', 'xl', 'modal, menu de ações, drawer, notificação'], ['999px', 'pill', 'badge de status, chip'],
]
const BORDAS: string[][] = [
  ['Campo, chip, paginação', '1.5px', '--c-border'], ['Botões, card, tabela, modal', '1px', '--c-border'],
  ['Divisória interna, linha de tabela', '1px', '--c-border-soft'], ['Cabeçalho de tabela (inferior)', '1.5px', '--c-border-soft'],
  ['Aba ativa (inferior)', '2px', '--c-support'], ['Dropzone e estado vazio rico', '1.5px tracejada', '--c-border'],
]
const SOMBRAS: string[][] = [['--shadow-sm', 'Card, tabela, card de filtros'], ['--shadow-md', 'Toast simples, autocomplete'], ['--shadow-lg', 'Modal, menu, drawer, popover']]
const CAMADAS: string[][] = [
  ['Coluna de ações fixa da tabela', '2'], ['Card de filtros (sticky)', '10'], ['Autocomplete', '20'], ['Menu de ações, popover', '40'],
  ['Modal genérico, dropdown da topbar', '50'], ['Botão de ajuda / painel de ajuda', '800 / 850'], ['Overlay / drawer de configuração', '8000 / 8001'],
  ['Drawer de detalhe e painel de componente', '9001'], ['Toast', '9500'], ['Overlay / tela cheia da ajuda', '9600 / 9610'], ['Modal de confirmação', '10000'],
]
const MOVIMENTO: string[][] = [
  ['Hover de botão, borda e fundo', '.15s'], ['Abrir drawer', 'right .3s cubic-bezier(.4, 0, .2, 1)'], ['Recolher sidebar', 'width .28s cubic-bezier(.4, 0, .2, 1)'],
  ['"Mais filtros" (accordion)', 'max-height .4s ease'], ['Entrada de toast e painel', '.2s–.22s ease-out · translateY(8px) → 0'],
  ['Skeleton (só em cards/tiles)', '1.6s linear infinite'], ['Spinner', '.7s linear infinite'],
]
const PESOS_TEXTO: string[][] = [
  ['400', 'Corpo de texto'], ['500', 'Botões próprios em Tailwind (confirmação)'], ['600', 'Botões, rótulos de campo, abas'],
  ['700', 'Ênfase, cabeçalhos de tabela e de card'], ['800', 'Título de página e de drawer, overlines, KPI'],
]
const PESOS_ICONE: string[][] = [
  ['thin', 'Ilustrações grandes e decorativas'], ['light', 'Interfaces leves, telas de marketing'], ['regular', 'Padrão em todos os produtos'],
  ['bold', 'Ações pequenas (fechar, +) e ênfase'], ['fill', 'Estado ativo (aba, menu) e status'], ['duotone', 'Destaques e estados vazios'],
]

const arquivosDe = (chave: string) => CODIGOS[chave] ?? []
function blocosDeCodigo(chave: string, nivel = '####') {
  return arquivosDe(chave).map(a => {
    const ext = a.rotulo.split('.').pop()?.toLowerCase() ?? ''
    return `${nivel} \`${a.rotulo}\`\n\n${cerca(a.codigo, LINGUAGEM[ext] ?? '')}`
  }).join('\n\n')
}

/* ───────── Seções ───────── */
function cabecalho(hoje: string) {
  return `# Design System LDSOFT — Atlas · Guia completo para IA

> Arquivo gerado automaticamente pelo Atlas em ${hoje} (fonte Figma: **${dados.arquivo}**, exportada em ${dados.exportado}).
> Contém tudo: regras, tokens de cor, tipografia, espaçamento, efeitos, ícones e **todos os componentes com propriedades e código React + CSS**.

## 0. Instruções para a IA (leia primeiro)

Você está criando interface para um produto da LDSOFT. Siga **exatamente** este Design System. Em caso de dúvida, o que está neste arquivo vale mais do que o seu padrão de mercado.

**Obrigatório**

1. **Cor sempre por token** \`var(--c-*)\`. Nunca escreva azul, fundo, texto ou borda como hex literal (quebra os 7 temas e o modo escuro). Exceções: \`#fff\` sobre cor cheia e HTML de impressão/PDF.
2. **Copie o tokens.css** da seção 3 para o projeto antes de qualquer componente. Todo o resto depende dele.
3. **Fonte Inter**, corpo-base de **13px** (não 16px). Use só a escala tipográfica da seção 4; não crie tamanhos fora dela.
4. **Grade de 8px** (4 como meio-passo). Nunca 6, 10 ou 14px em código novo; em tabelas, nunca 6, 7, 10 ou 12.
5. **Ícones só Phosphor** (\`@phosphor-icons/react\`), \`size={14}\` como padrão, peso \`regular\` (\`fill\` para estado ativo).
6. **Reaproveite os componentes da seção 8.** Antes de criar qualquer coisa, procure o componente equivalente e copie o código dele. Nunca invente classe CSS: se precisar criar, use o prefixo do contexto (seção 2.3).
7. **Botões:** três tamanhos (small 32px — padrão, medium 44px, large 56px). Um botão primário (filled) por área; secundários em outline; ações fracas em text.
8. **Listagens** seguem a receita da seção 8 (Página de listagem): cabeçalho, card de filtros, estado inicial, barra de resultados, tabela e paginação (20/50/100).
9. **Textos da interface em português do Brasil**, números sempre via \`formatarNumero\` (pt-BR).
10. **Respeite as regras e as armadilhas** das seções 2.4 e 2.5: são erros que já custaram retrabalho.

**Ao entregar:** liste quais componentes e tokens deste guia você usou e aponte qualquer lacuna (algo que o guia não cobre) em vez de improvisar.

### Como usar este arquivo

- **Novo módulo/produto:** anexe este arquivo e peça, por exemplo: *"Usando o Design System anexo, crie a tela de listagem de [X] com filtros por [Y], tabela com as colunas [Z] e drawer de detalhe."*
- **Página web / landing:** *"Crie uma página web em HTML/React com o Design System anexo, com cabeçalho, 3 cartões de destaque e formulário de contato."*
- **Revisão:** *"Revise este código e aponte tudo que foge do Design System anexo."*
- Se a IA limitar o tamanho do anexo, envie primeiro as seções 0 a 7 (fundamentos) e, depois, só os componentes de que a tela precisa (seção 8).`
}

function sumario(extrasApoio: boolean) {
  const base = [
    ['1. Mapa do sistema', 'mapa-do-sistema'], ['2. Como é construído, regras e armadilhas', 'como-e-construido-regras-e-armadilhas'],
    ['3. Cores e tokens', 'cores-e-tokens'], ['4. Tipografia', 'tipografia'], ['5. Espaçamento, medidas e responsividade', 'espacamento-medidas-e-responsividade'],
    ['6. Raio, borda, sombras, camadas e movimento', 'raio-borda-sombras-camadas-e-movimento'], ['7. Ícones Phosphor', 'icones-phosphor'],
    ['8. Componentes', 'componentes'],
  ]
  if (extrasApoio) base.push(['9. Código de apoio', 'codigo-de-apoio'])
  return `## Sumário\n\n${base.map(([t, a]) => `- [${t}](#${a})`).join('\n')}`
}

function mapa() {
  const comCodigo = ITENS.filter(i => CODIGOS[i.chave]).length
  return `## 1. Mapa do sistema

| Área | O que contém |
| --- | --- |
| Componentes | ${ITENS.length} componentes (${comCodigo} com código React + CSS), com propriedades e variantes |
| Cores | Tokens de marca, superfície, texto, status e estados de campo · 7 temas · modo escuro · rampas da biblioteca |
| Tipografia | Inter (interface) + escala fechada · estilos Ubuntu/Nunito da biblioteca |
| Espaçamento | Grade de 8px · medidas · tamanhos de controles · breakpoints |
| Efeitos | Raio, borda, sombras, camadas (z-index), movimento |
| Ícones | Phosphor: ${fmt(Object.values(categoriasIcones as Record<string, string[]>).flat().length)} ícones em 6 pesos |`
}

function construcao() {
  return `## 2. Como é construído, regras e armadilhas

### 2.1 Decisões de arquitetura

${tabela(['Decisão', 'Como é no projeto'], DECISOES.map(d => [d[0], d[1]]))}

### 2.2 Setup mínimo para reproduzir

${cerca(SETUP_CSS, 'css')}

### 2.3 Prefixos de classe

${tabela(['Prefixo', 'Contexto'], PREFIXOS.map(p => ['`' + p[0] + '`', p[1]]))}

### 2.4 Regras

${REGRAS.map(([t, d], i) => `${i + 1}. **${t}.** ${d}`).join('\n')}

### 2.5 Armadilhas conhecidas

${ARMADILHAS.map(([t, d], i) => `${i + 1}. **${t}.** ${d}`).join('\n')}`
}

function cores() {
  const dark = tokensCss
  const agrupadas: Record<string, { nome: string; hex: string; op: number }[]> = {}
  for (const c of dados.cores) {
    const chave = c.grupo === 'Highlight' ? c.nome.split('/').slice(0, 2).join('/') : c.grupo
    ;(agrupadas[chave] ||= []).push({ nome: c.nome, hex: corDe(c.nome, c.hex), op: c.opacidade })
  }
  const ordem = (n: string) => { const m = n.match(/\/(\d+)$/); return m ? +m[1] : 0 }
  const rampas = Object.entries(agrupadas).flatMap(([g, cs]) =>
    [...cs].sort((a, b) => ordem(a.nome) - ordem(b.nome)).map(c => [g, '`' + c.nome + '`', '`' + c.hex + '`', c.op < 1 ? `${Math.round(c.op * 100)}%` : '100%']))
  const tokensJson = arquivosDe('x-tokens')[0]?.codigo ?? ''
  return `## 3. Cores e tokens

### 3.1 Regra de ouro

Toda cor vem de \`var(--c-*)\`. Azul é sempre \`var(--c-support)\` (azul literal quebra os 7 temas). Fundo, texto e borda nunca são literais (quebram o modo escuro). Exceções: \`#fff\` sobre cor cheia e HTML de impressão/PDF. Precisa de uma cor que não existe? Crie o **token** primeiro (para status, sempre o par \`--c-<status>-bg\` + \`--c-<status>-txt\`) e só então use no componente.

### 3.2 Uso dos tokens

| Token | Uso |
| --- | --- |
| \`--c-brand\` · \`--c-brand-hover\` | Título de página, marca e hover |
| \`--c-sidebar-bg\` | Fundo da sidebar (muda com o tema) |
| \`--c-support\` · \`-h\` · \`-a\` | Destaque: botão, link, foco · hover · pressionado/ativo |
| \`--c-secondary\` · \`-h\` | Secundária (verde) e hover |
| \`--c-bg\` | Fundo da aplicação |
| \`--c-surface\` | Card, drawer, modal |
| \`--c-surface-2\` | Rodapé, área secundária, hover |
| \`--c-text\` | Texto principal |
| \`--c-neutral\` · \`--c-neutral-h\` | Texto secundário, rótulos · hover |
| \`--c-text-muted\` | Terciário, placeholder, legenda |
| \`--c-border\` · \`--c-border-soft\` | Borda padrão · divisória interna |
| \`--c-table-head\` · \`--c-table-head-txt\` | Fundo e texto do cabeçalho de tabela |
| \`--c-img-bg\` | Fundo atrás de figura de marca |
| \`--c-input-error\` | Borda e mensagem de erro |
| \`--c-input-border-disabled\` · \`--c-input-bg-disabled\` · \`--c-input-text-disabled\` | Campo desabilitado |
| \`--c-lembrete\` · \`--c-lembrete-bg\` | Sininho de lembrete |

### 3.3 Status — cheia · fundo · texto

Success: concluído, ativo. Danger: erro, exclusão, arquivado. Warning: exigência, prazo. Info: em andamento. IA: recursos de IA.

${tabela(['Status', 'Cheia', 'Fundo', 'Texto'], STATUS.map(([rot, k]) => [rot, `\`--c-${k}\``, `\`--c-${k}-bg\``, `\`${k === 'ai' ? '--c-ai-hover' : `--c-${k}-txt`}\``]))}

### 3.4 Temas de destaque

Cada tema é uma classe \`theme-*\` no \`body\` e troca só \`--c-support*\` e \`--c-sidebar-bg\`. No escuro, o destaque clareia para não sumir sobre a superfície escura.

${tabela(['Tema', 'Claro · support / -h / -a', 'Sidebar', 'Escuro · support / -h / -a'], TEMAS_TAB.map(([n, c, s, e]) => [n, c.map(x => '`' + x + '`').join(' / '), '`' + s + '`', e.map(x => '`' + x + '`').join(' / ')]))}

### 3.5 tokens.css (arquivo completo — copie para o projeto)

Modo escuro = classe \`dark-mode\` no \`html\`; tema = classe \`theme-*\` no \`body\`. São independentes e se combinam.

${cerca(dark, 'css')}

### 3.6 Tema e modo escuro em código

${blocosDeCodigo('x-tema')}

### 3.7 Rampas de cor da biblioteca

${dados.cores.length} estilos de cor usados pelos demais produtos da LDSOFT (já com a paleta azul/neutra do APOL+ aplicada). Servem de apoio para ilustração e materiais; **a interface usa os tokens da seção 3.5**.

${tabela(['Grupo', 'Estilo', 'Hex', 'Opacidade'], rampas)}

### 3.8 Tokens exportáveis (JSON)

Formato pronto para Style Dictionary ou qualquer ferramenta de tokens.

${cerca(tokensJson, 'json')}`
}

function tipografia() {
  const cats = ['Headlines', 'Subtitles', 'Paragraph', 'Labels']
  const lib = cats.map(c => `#### ${c}\n\n${tabela(['Estilo', 'Fonte', 'Peso', 'Tamanho', 'Altura de linha'],
    dados.textos.filter(t => t.categoria === c).map(t => [t.rotulo, t.familia, t.peso, `${t.tamanho}px`, String(t.alturaLinha)]))}`).join('\n\n')
  return `## 4. Tipografia

### 4.1 Família e base

Família única na interface: **Inter**, com corpo-base de **13px** (não 16px). A escala é fechada: não crie tamanhos fora dela. Campo e célula: 12.5px. Títulos: 20 · 16 · 14px. O peso 800 é usado no CSS mas a Inter é carregada só até 700; se o projeto carregar a Inter completa, inclua 800 no \`@import\`.

### 4.2 Escala de estilos

Escala fechada: 12.5 · 12 · 13 · 11.5 · 11 · 10.5 · 10, mais 20 / 18 / 16 / 14 para títulos e botões.

${tabela(['Estilo', 'Especificação (tamanho · peso · detalhe)', 'Exemplo'], TIPOS.map(([n, , ex, spec]) => [n, spec, ex]))}

### 4.3 Pesos

${tabela(['Peso', 'Uso'], PESOS_TEXTO)}

### 4.4 Estilos da biblioteca (demais produtos)

**Ubuntu** nos títulos e subtítulos, **Nunito** em parágrafos e rótulos e **Inter Semi Bold** nos rótulos de botão e chip. Usados pelos demais produtos da LDSOFT; a interface do Atlas segue a escala da seção 4.2.

${lib}`
}

function espacamento() {
  return `## 5. Espaçamento, medidas e responsividade

### 5.1 Grade e escala

Múltiplos de 8, com 4 como meio-passo. Em tabelas é obrigatório e sem exceção. Fora da grade (não use em código novo): 6, 10 e 14px.

${tabela(['Token', 'Valor', 'Uso'], ESPACOS.map(([t, px, uso]) => ['`--' + t + '`', `${px}px`, uso]))}

### 5.2 Medidas de referência

${tabela(['Elemento', 'Medida'], MEDIDAS)}

### 5.3 Tamanhos de controles

${tabela(['Botão', 'Altura', 'Tipografia · padding'], BOTOES)}

Todos os botões: raio 8 · gap 8 · borda 1px.

${tabela(['Controle', 'Altura', 'Raio', 'Observação'], CONTROLES)}

Regras de botão: um primário (filled) por área; ações secundárias em outline; ações fracas em text. Use **medium** em formulários largos e **large** só em telas de decisão.

### 5.4 Tabela

${tabela(['Regra', 'Valor'], [
    ['Padding de célula (cabeçalho e corpo)', '8px 16px'], ['Tabela densa — mínimo lateral', '8px'], ['Nunca', '6, 7, 10 ou 12px'],
    ['Largura de coluna', 'Múltiplo de 8 (rótulo + 32px, arredondado)'], ['Tamanho de página', '20 · 50 · 100 (padrão 20)'],
  ])}

O modificador por tela (\`.mp-table--minha-tela { min-width: 0; width: 100% }\`) é obrigatório; sem ele a tabela nasce com \`min-width: 1300px\` e rola na horizontal.

### 5.5 Responsividade

${tabela(['Largura', 'Efeito'], BREAKPOINTS)}

| Peça | Medida |
| --- | --- |
| Drawer | 65% · mín. 480px (tela cheia sob demanda e no mobile) |
| Sidebar | 220px · 200–420 (arrastável e recolhível; ≤ 768px vira overlay) |
| Modal | 448 · 560px (máx. 92vw no mobile) |

${cerca(CSS_RESP, 'css')}

### 5.6 Casca da aplicação

Sidebar à esquerda, topbar no alto e a área de conteúdo rolável. Quem rola é o \`main\`, nunca o \`body\`. O código do layout está no componente *Casca da aplicação* (seção 8).

${tabela(['Peça', 'Especificação'], CASCA)}`
}

function efeitos() {
  const sombrasLib = ['Light', 'Dark'].map(m => `**${m}** (${m === 'Light' ? '12%' : '32%'} de opacidade, para fundos ${m === 'Light' ? 'claros' : 'escuros'})\n\n${tabela(['Nível', 'CSS'],
    dados.sombras.filter(s => s.nome.includes(m)).map(s => ['`' + s.nome + '`', '`' + s.css + '`']))}`).join('\n\n')
  return `## 6. Raio, borda, sombras, camadas e movimento

### 6.1 Raio

${tabela(['Valor', 'Nome', 'Uso'], RAIOS)}

Também: 7px no campo de formulário (\`.fg\`) e no botão de fechar do drawer; 50% em ícones circulares de modal e estado vazio.

### 6.2 Borda

${tabela(['Uso', 'Espessura', 'Cor'], BORDAS.map(b => [b[0], b[1], '`' + b[2] + '`']))}

### 6.3 Sombras

Três níveis para a interface (\`--shadow-sm/md/lg\`); no escuro a opacidade sobe. O drawer de detalhe usa uma própria: \`-8px 0 40px rgba(0,0,0,.2)\`.

${tabela(['Token', 'Uso'], SOMBRAS.map(s => ['`' + s[0] + '`', s[1]]))}

**Níveis de elevação da biblioteca** — duas famílias com os mesmos 4 níveis, cor base \`#000014\`.

${sombrasLib}

Também fazem parte dos efeitos: \`Blur/100–400\` (desfoque de fundo de 4 a 24px) e \`Focus/Light\` / \`Focus/Dark\` (anel de foco de 4px). No produto, o foco de campo é a borda na cor de destaque, sem halo (\`border-color: var(--c-support)\`).

### 6.4 Camadas (z-index)

Modal sobre drawer: passe \`zIndex\` ao Modal. O modal de confirmação já é 10000, acima de qualquer coisa.

${tabela(['Camada', 'z-index'], CAMADAS)}

### 6.5 Movimento

${tabela(['Animação', 'Valor'], MOVIMENTO.map(m => [m[0], '`' + m[1] + '`']))}

Respeite \`prefers-reduced-motion: reduce\`: toasts e notificações desligam a animação de entrada.`
}

function icones() {
  const cats = Object.entries(categoriasIcones as Record<string, string[]>).sort(([a], [b]) => a.localeCompare(b))
  const total = cats.reduce((n, [, l]) => n + l.length, 0)
  return `## 7. Ícones Phosphor

A biblioteca de ícones única da LDSOFT: **Phosphor** (\`@phosphor-icons/react\`), ${fmt(total)} ícones em 6 pesos. Tamanho padrão **14px**.

\`\`\`tsx
import { HouseIcon } from '@phosphor-icons/react'

<HouseIcon size={14} />                 {/* peso regular (padrão) */}
<HouseIcon size={14} weight="fill" />   {/* estado ativo */}
\`\`\`

O nome do componente é o nome da lista abaixo + \`Icon\` (ex.: \`House\` → \`HouseIcon\`). Em HTML puro, use as classes \`ph ph-<nome-em-kebab-case>\` (ex.: \`ph ph-house\`).

${tabela(['Peso', 'Uso'], PESOS_ICONE.map(p => ['`' + p[0] + '`', p[1]]))}

### Lista completa por categoria

${cats.map(([c, l]) => `**${c}** (${l.length}): ${[...l].sort().join(', ')}`).join('\n\n')}`
}

function componentes() {
  const usadas = new Set<(typeof CODIGOS)[string]>()
  const porCat = CATEGORIAS.map(cat => {
    const itens = ITENS.filter(i => i.categoria === cat).sort((a, b) => a.nome.localeCompare(b.nome))
    if (!itens.length) return ''
    const corpo = itens.map(i => {
      const partes: string[] = [`#### ${i.nome}`, '', i.descricao, '', `- **Categoria:** ${i.categoria}`, `- **Identificador:** \`${i.chave}\``]
      if (i.variantes) partes.push(`- **Variantes na biblioteca:** ${fmt(i.variantes)}`)
      const props: [string, string[], string?][] = i.lib
        ? Object.entries(i.lib.propriedades as Record<string, string[]>).map(([k, v]) => [k, v])
        : (i.apol?.propriedades ?? i.extra?.propriedades ?? []).map(p => [p.nome, p.valores, p.nota])
      if (props.length) partes.push('', '**Propriedades**', '', tabela(['Propriedade', 'Valores', 'Nota'], props.map(([k, v, n]) => [k, v.join(' · '), n ?? ''])))
      const arqs = CODIGOS[i.chave]
      if (arqs) { usadas.add(arqs); partes.push('', '**Código para reproduzir do zero**', '', blocosDeCodigo(i.chave, '#####')) }
      else if (i.apol) partes.push('', '**Código (HTML com as classes do APOL+)**', '', cerca(i.apol.codigo, 'html'))
      else partes.push('', '*Sem código documentado: use as propriedades acima e os tokens do guia para montar o componente.*')
      return partes.join('\n')
    }).join('\n\n---\n\n')
    return `### ${cat} (${itens.length})\n\n${corpo}`
  }).filter(Boolean).join('\n\n')
  return { texto: `## 8. Componentes\n\n${ITENS.length} componentes, agrupados por categoria. Cada um traz descrição, propriedades e o código React + CSS para reproduzi-lo. Toda cor vem de token (\`var(--c-*)\`) e os ícones são do Phosphor.\n\n${porCat}`, usadas }
}

/** Código que não pertence a um componente (utilitários, tokens, tema…) e ainda não foi impresso. */
function apoio(usadas: Set<(typeof CODIGOS)[string]>) {
  const vistos = new Set<(typeof CODIGOS)[string]>(usadas)
  vistos.add(CODIGOS['x-tema'] ?? []); vistos.add(CODIGOS['x-tokens'] ?? [])
  const chaves = Object.keys(CODIGOS).filter(k => { const a = CODIGOS[k]; if (vistos.has(a)) return false; vistos.add(a); return true })
  if (!chaves.length) return ''
  return `## 9. Código de apoio\n\n${chaves.map(k => `### ${k}\n\n${blocosDeCodigo(k)}`).join('\n\n')}`
}

export function gerarMarkdown(): string {
  const hoje = new Date().toLocaleDateString('pt-BR')
  const { texto: comps, usadas } = componentes()
  const extra = apoio(usadas)
  return [cabecalho(hoje), sumario(!!extra), mapa(), construcao(), cores(), tipografia(), espacamento(), efeitos(), icones(), comps, extra]
    .filter(Boolean).join('\n\n---\n\n') + '\n'
}
