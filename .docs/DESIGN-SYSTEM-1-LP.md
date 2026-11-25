# Design System — Webseek Figurativo

Tirado da LP do Webseek Figurativo ([styles.css](styles.css)), que segue a identidade LDSoft: **Sora + Inter**, azuis sólidos, **sem degradês** e cantos de 8px nos botões.

> **Navegação:** este documento **não** usa a barra superior (topbar) da LP. A navegação passa a ser uma **barra lateral**, criada a partir da sidebar do simulador (`.app__side`). Veja a seção [Navegação lateral](#8-navegação-lateral).

Legenda: **[LP]** = valor que já está na LP · **[proposta]** = sugestão para completar o sistema, que ainda não existe na LP.

---

## 1. Cores

### 1.1 Marca (tokens já usados na LP) [LP]

| Token | Hex | Uso |
|---|---|---|
| `--blue3` | `#0080FF` | **Azul principal**: botão primário, links, eyebrow, foco de campo, ícones de destaque |
| `--blue4` | `#0061D6` | Hover do azul principal; texto do botão claro |
| `--blue8` | `#0167C0` | Azul "de produto": item ativo da sidebar, checkbox, seleção, botões de contorno |
| `--blue2` | `#29ABE2` | Azul-claro Webseek: logotipo, realces de texto (`.hl`), anel de foco, ícones sobre fundo escuro |
| `--blue1` | `#2191FF` | Azul de apoio (reservado) |
| `--blue7` | `#051D34` | **Azul-marinho**: fundos escuros (hero, seções de destaque, CTA final, sidebar escura) |
| — | `#03121F` | Marinho mais escuro (rodapé) |

### 1.2 Neutros [LP]

| Token | Hex | Uso |
|---|---|---|
| `--white` | `#FFFFFF` | Fundo de cards, campos, sidebar clara |
| `--lightblue` | `#F5F8FF` | Fundo de seção clara, fundo de ícones |
| `--lightgray` | `#F9F9F9` | Rodapé de modal |
| `--gray` | `#E3E3E3` | Borda de cards da LP |
| `--black` | `#1A1A1A` | Texto principal |
| `--black2` | `#303030` | Texto dentro do app (títulos, valores) |
| `--black3` | `#626275` | Texto secundário / descrições |

**Cinzas de interface (usados dentro do app/simulador):**

| Hex | Uso |
|---|---|
| `#F4F5F7` | Fundo da área de trabalho do app |
| `#F5F6F8` / `#EEF2F7` | Fundo de miniaturas, imagens e chips |
| `#F1F2F4` | Fundo de botão-ícone neutro |
| `#ECEDEF` | Divisórias (sidebar, cabeçalho, modal) |
| `#E3E5E8` / `#E6E8EB` | Bordas de card e de resultados |
| `#D6D9DE` | Borda de botão de contorno; linha tracejada |
| `#C9CDD3` | Borda de campo de formulário |
| `#9CA3AF` | Placeholder, texto desabilitado |
| `#6B7280` | Rótulos, ícones secundários |
| `#4B5563` | Ícones da sidebar, texto de checkbox |

**Azuis de superfície (estados):**

| Hex | Uso |
|---|---|
| `#EAF4FB` | Fundo do item ativo da sidebar |
| `#F3F8FD` | Hover de menus e botões de contorno; card de referência |
| `#E3F2FB` / `#CDE8F8` | Botão de ação "pesquisar" (normal / hover) |

### 1.3 Feedback [LP]

| Token | Hex | Uso |
|---|---|---|
| `--ok` | `#16A36A` | Sucesso |
| `--danger` | `#DE2828` | Erro, validação, item "negativo" |
| — | `#FDECEC` | Fundo para ícone ou badge de erro |
| — | `#8A5A00` | Toast de aviso |

### 1.4 Transparências sobre fundo escuro (`--blue7`) [LP]

| Valor | Uso |
|---|---|
| `rgba(255,255,255,.9 / .8 / .78)` | Texto de parágrafo |
| `rgba(255,255,255,.7 / .6 / .55)` | Texto auxiliar, rodapé, aviso legal |
| `rgba(255,255,255,.14)` | Borda de card |
| `rgba(255,255,255,.08 / .06)` | Divisória / fundo de card |
| `rgba(41,171,226,.15)` | Fundo de ícone (azul-claro) |

### 1.5 Regras de uso
- **Sem degradês** em fundos, botões ou cards. A única exceção é o brilho radial que segue o cursor no hero.
- Fundos alternam entre **branco → `--lightblue` → `--blue7`** para separar seções.
- Texto sobre `--blue3` ou `--blue7` é sempre branco.
- Overlay de modal: `rgba(5,29,52,.55)` (marinho a 55%).

---

## 2. Tipografia

### 2.1 Famílias [LP]

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@500;600;700&family=Quicksand:wght@400;500&display=swap" rel="stylesheet">
```

| Token | Família | Uso |
|---|---|---|
| `--font-title` | `"Sora", "Inter", sans-serif` | Títulos h1–h3, números de passos |
| `--font` | `"Inter", "Roboto", system-ui, sans-serif` | Corpo, botões, campos, toda a interface do app |
| — | `"Quicksand"` 500 | **Só** no logotipo textual "webseek" (cor `--blue2`) |

### 2.2 Escala

| Estilo | Família / peso | Tamanho | Altura de linha | Observação |
|---|---|---|---|---|
| H1 | Sora 600 | `clamp(2rem, 3.6vw, 3.1rem)` (32–50px) | 1.2 | letter-spacing `-.01em` |
| H2 | Sora 600 | `clamp(1.6rem, 2.8vw, 2.25rem)` (26–36px) | 1.2 | idem |
| H3 | Sora 600 | 1.1rem (17.6px) | 1.2 | títulos de card |
| Título de página (app) | Inter 600 | 1.5rem (24px) | 1.2 | `--black2`, com linha tracejada embaixo |
| Lead | Inter 400 | 1.05–1.08rem (17px) | 1.55 | `--black3` |
| Corpo | Inter 400 | 1rem (16px) | 1.55 | `--black` |
| Corpo de card | Inter 400 | .94–.95rem (15px) | 1.55 | `--black3` |
| Botão | Inter 600 | 14px (15px no `--lg`) | 1 | |
| Campo / input | Inter 400 | .95rem (15px) | — | |
| Rótulo de campo | Inter 500 | .875rem (14px) | — | |
| Rótulo flutuante (app) | Inter 400 | .74rem (12px) | 1.2 | `#6B7280` |
| Muted / legenda | Inter 400 | .875rem (14px) | — | `--black3` |
| Eyebrow | Inter 700 | .78rem (12.5px) | — | MAIÚSCULAS, letter-spacing `.1em`, `--blue3` |
| Badge / tag | Inter 700 | .72rem (11.5px) | — | MAIÚSCULAS, letter-spacing `.06em` |
| Erro de campo | Inter 500 | .76rem (12px) | — | `--danger` |

---

## 3. Espaçamento

A LP usa valores múltiplos de 2. Para o sistema, a proposta é padronizar numa **escala de base 4** que cobre quase todos esses valores. **[proposta]** (os valores já existem na LP; os nomes dos tokens são novos)

| Token | Valor | Onde aparece na LP |
|---|---|---|
| `--space-1` | 4px | gap entre ícone e texto em chips |
| `--space-2` | 8px | gap entre amostras, gap mínimo de grids pequenos |
| `--space-3` | 12px | gap de botões lado a lado, padding de card compacto |
| `--space-4` | 16px | gap padrão de formulário, margem lateral no celular |
| `--space-5` | 20px | gap entre cards (grids) |
| `--space-6` | 24px | margem lateral do container, padding do conteúdo do app |
| `--space-7` | 28px | padding interno de card de conteúdo |
| `--space-8` | 32px | padding de botão, padding do formulário |
| `--space-10` | 40px | espaço entre blocos |
| `--space-11` | 44px | espaço entre título de seção e conteúdo |
| `--space-16` | 64px | padding vertical de seção no celular |
| `--space-22` | 88px | padding vertical de seção no desktop |

### Layout [LP]
- **Container:** `max-width: 1200px` (1320px a partir de 1600px), padding lateral 24px (16px no celular).
- **Container estreito:** `max-width: 820px` (FAQ, formulário centralizado).
- **Seção:** `padding: 88px 0` (64px no celular).
- **Grid de cards:** `gap: 20px`; 3 ou 4 colunas no desktop → 2 no tablet → 1 no celular.

### Breakpoints [LP]

| Nome | Faixa |
|---|---|
| Celular pequeno | ≤ 380px |
| Celular | ≤ 760px |
| Tablet | ≤ 1024px |
| Notebook compacto | ≤ 1100px / ≤ 1280px |
| Monitor grande | ≥ 1600px |

---

## 4. Raios, sombras e foco [LP]

| Token | Valor | Uso |
|---|---|---|
| `--radius-btn` | 8px | Botões, campos, miniaturas, ícone quadrado de passos |
| — | 6px | Campos e botões de contorno do app (densidade maior) |
| — | 10px | Ícone de card (48×48) |
| `--radius` | 12px | Cards, janela do app, modal |
| — | 16px | Card de formulário |
| — | 50% / 255px | Botão-ícone redondo, avatar, badge em pílula |

| Token | Valor | Uso |
|---|---|---|
| `--shadow` | `0 8px 24px -12px rgba(5,29,52,.18)` | Hover de card, menus suspensos, formulário |
| `--shadow-lg` | `0 24px 60px -24px rgba(0,0,0,.5)` | Modal, janela do app, toast |

**Foco (acessibilidade):** `outline: 3px solid var(--blue2); outline-offset: 2px` em todo elemento interativo.
**Foco de campo:** `border-color: var(--blue3); box-shadow: 0 0 0 3px rgba(0,128,255,.15)`.

---

## 5. Botões

### 5.1 Base `.btn` [LP]

```css
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: .6rem;
  height: 3rem; padding: 0 32px; border-radius: 8px; border: 1px solid transparent;
  font: 600 14px/1 var(--font); white-space: nowrap; cursor: pointer;
  transition: background .2s, color .2s, border-color .2s;
}
```

### 5.2 Variantes

| Variante | Fundo | Texto | Borda | Hover | Quando usar |
|---|---|---|---|---|---|
| `--primary` | `--blue3` | branco | — | fundo `--blue4` | Ação principal (1 por tela/bloco) |
| `--light` | branco | `--blue4` | — | fundo `--lightblue` | Ação principal sobre fundo azul (`--blue3`) |
| `--ghost` | transparente | branco | `rgba(255,255,255,.6)` | fundo branco, texto `--blue7` | Ação secundária sobre fundo escuro |
| `.obtn` (contorno, app) | branco | `--blue8` | `#D6D9DE` | fundo `#F3F8FD`, borda `--blue8` | Ações secundárias dentro do app (Ações, Comparar) |
| `--secondary` **[proposta]** | branco | `--blue3` | `--blue3` | fundo `--lightblue` | Ação secundária sobre fundo claro |

### 5.3 Tamanhos

| Tamanho | Altura | Padding horizontal | Fonte |
|---|---|---|---|
| `--sm` | 40px | 20px | 14px |
| padrão | 48px | 32px | 14px |
| `--lg` | 54px | 28px | 15px |
| `.obtn` | 40px | 14px | 15px / 500 |
| `--block` | largura 100% | — | — |

### 5.4 Botão-ícone `.tool` [LP]
Redondo, 40×40px, fundo `#F1F2F4`, ícone `#4B5563`.
- Hover: `#E5E7EB`
- Ativo (`aria-pressed="true"`): fundo `--blue3`, ícone branco
- Destaque (pesquisar): fundo `#E3F2FB`, ícone `--blue8`

### 5.5 Estados
- **Desabilitado:** texto `#B5BAC1`, `cursor: not-allowed`, sem hover.
- **Carregando:** `aria-busy="true"` → `opacity: .6; pointer-events: none`.
- No celular, os botões de CTA ocupam 100% da largura.

---

## 6. Cards

### 6.1 Card base do app `.card` [LP]
```css
.card { background: #fff; border: 1px solid #E6E8EB; border-radius: 12px; }
```
Padding conforme a densidade: 12px (compacto), 16–18px (formulário/listagem).

### 6.2 Card de conteúdo (`.feature`, `.pain__card`, `.steps li`) [LP]
- Fundo branco, borda `1px solid --gray`, raio 12px, padding 26–28px.
- Estrutura: **ícone → título (H3) → texto** (`--black3`, 15px).
- **Ícone:** quadrado de 46–48px, raio 10px, fundo `--lightblue`, ícone `--blue3` (24–26px, traço 2).
  - Variante de alerta: fundo `#FDECEC`, ícone `--danger`.

### 6.3 Variantes
| Variante | Visual | Uso |
|---|---|---|
| `--wide` (escuro) | fundo e borda `--blue7`, texto branco, ícone `--blue2` sobre `rgba(41,171,226,.15)` | Destaque principal, ocupa 2 colunas |
| `--accent` | borda `--blue3`, fundo `--lightblue`, ícone sobre branco | Destaque secundário, linha inteira |
| Passo numerado | número em quadrado 40×40, raio 8px, fundo `--blue3`, Sora 600 | Fluxos de "como funciona" |
| Card de formulário | raio 16px, padding 32px (24px no celular), `--shadow` | Formulários |
| Card de resultado `.res` | borda `#E3E5E8`, raio 8px, padding 8px; hover com `--shadow`; selecionado com borda + anel `--blue8` | Grade de resultados/imagens |
| Card de comparação | borda `#E3E5E8`, raio 10px; referência com borda `--blue8` e fundo `#F3F8FD` | Comparar itens |

### 6.4 Badge / tag [LP]
Pílula (`border-radius: 255px`), padding `5px 12px`, fundo `--blue3`, texto branco, 11.5px/700, MAIÚSCULAS.

---

## 7. Formulários [LP]

| Elemento | Especificação |
|---|---|
| Input (LP) | altura 48px, padding 0 14px, raio 8px, borda `#C9CDD3`, fonte 15px |
| Input com rótulo flutuante (app) | altura 44px, raio 6px, rótulo de 12px "cortando" a borda no topo (`top: -9px`, fundo branco) |
| Foco | borda `--blue3` + anel `rgba(0,128,255,.15)` |
| Erro | borda `--danger` + mensagem de 12px em `--danger` abaixo |
| Checkbox / radio | 18×18px, `accent-color: --blue8` (app) ou `--blue3` (LP) |
| Separador | `border-top: 1.5px dashed #D6D9DE` |

---

## 8. Navegação lateral

Substitui a topbar. É derivada da sidebar do simulador (`.app__side`), que já existe na LP só na versão recolhida.

### 8.1 Recolhida (64px) [LP]
```css
.sidebar          { width: 64px; background: #fff; border-right: 1px solid #ECEDEF;
                    display: flex; flex-direction: column; align-items: center; padding: 14px 0; gap: 10px; }
.sidebar__item    { width: 64px; height: 48px; display: grid; place-items: center; color: #4B5563; }
.sidebar__item.is-active { background: #EAF4FB; color: var(--blue8); box-shadow: inset 3px 0 0 var(--blue8); }
.sidebar__toggle  { position: absolute; right: -12px; top: 18px; width: 24px; height: 24px; border-radius: 50%;
                    background: #fff; border: 1px solid #E3E5E8; color: #6B7280; }
```
- Ícones de 20px, traço 1.8, `stroke-linecap: round`.
- Item ativo: **barra de 3px à esquerda** em `--blue8` + fundo `#EAF4FB`.
- Logotipo "LD" no rodapé da barra (Sora 700, `#C9CDD3`).

### 8.2 Expandida (240px) [proposta]
- Largura **240px**, abre pelo botão `.sidebar__toggle` (seta gira 180°), transição `width .25s ease`.
- Item: altura 48px, padding `0 20px`, gap 12px entre ícone e rótulo, Inter 500 / 15px, `#4B5563`.
- Hover: fundo `#F3F8FD`, texto `--blue8`.
- Ativo: mesmo da versão recolhida (barra de 3px + `#EAF4FB` + `--blue8`), com texto em 600.
- Topo: logotipo "webseek" (Quicksand 500, `--blue2`) com 64px de altura e divisória `#ECEDEF`.
- Grupos de menu: título em estilo **eyebrow** (11px, 700, MAIÚSCULAS, `#9CA3AF`), padding `16px 20px 8px`.
- Recolhida: o rótulo do item aparece como **tooltip** à direita (fundo `--black2`, texto branco, raio 6px, 13px).
- Foco: `outline: 3px solid --blue2; outline-offset: -3px` (por dentro, para não ser cortado).

### 8.3 Variante escura [proposta]
Para combinar com o marinho da marca: fundo `--blue7`, ícones/texto `rgba(255,255,255,.72)`, hover `rgba(255,255,255,.06)` com texto branco, ativo com fundo `rgba(41,171,226,.15)`, texto/ícone `--blue2` e barra de 3px em `--blue2`. Divisórias `rgba(255,255,255,.08)`.

### 8.4 Responsivo [proposta]
| Faixa | Comportamento |
|---|---|
| ≥ 1280px | Expandida por padrão (o usuário pode recolher) |
| 761–1279px | Recolhida (64px) por padrão |
| ≤ 760px | Escondida; abre como **gaveta** sobre o conteúdo (largura 280px, overlay `rgba(5,29,52,.55)`), acionada por botão de menu 44×44px no cabeçalho |

### 8.5 Cabeçalho do conteúdo (ao lado da sidebar) [LP]
Altura 60px (52px no celular), fundo branco, borda inferior `#ECEDEF`, padding `0 24px`. Contém o nome do módulo (`--blue8`, 17px) e o usuário à direita (avatar redondo de 30px, separado por uma borda vertical `#E3E5E8`).

---

## 9. Outros componentes [LP]

| Componente | Especificação |
|---|---|
| **Menu suspenso** | fundo branco, borda `#E3E5E8`, raio 8px, `--shadow`, padding 6px, mín. 230px; item com padding `10px 12px`, raio 6px, hover `#F3F8FD` |
| **Modal** | caixa branca raio 12px, máx. 900px, `--shadow-lg`; cabeçalho/rodapé com padding `16–18px 22px` e divisória `#ECEDEF`; rodapé com fundo `--lightgray`; botão fechar redondo de 34px, fundo `#F1F2F4` |
| **Toast** | fundo `--black2` (aviso: `#8A5A00`), texto branco 14px/500, raio 8px, padding `12px 18px`, centralizado embaixo |
| **Spinner** | 44px, borda 3px `#E3E8EF` com topo `--blue3`, gira 0,8s |
| **Accordion (FAQ)** | card com borda `--gray`, raio 12px; aberto fica com borda `--blue3`; ícone "+" em `--blue3` que gira 45° |
| **Lista com check** | marcador redondo de 22–24px: ✓ em `--blue3` sobre `--lightblue` (positivo) ou ✕ em `--danger` sobre `#FDECEC` (negativo) |
| **Estado vazio** | centralizado, ícone 48px `#D1D5DB`, texto `#9CA3AF` |

---

## 10. Ícones e movimento

**Ícones [LP]:** traço (outline), estilo Lucide/Feather, `stroke="currentColor"`, `stroke-linecap/linejoin="round"`. Tamanhos: 14px (setas pequenas), 18–20px (interface), 24–26px (cards). Traço 1.6–1.8 na interface e 2–2.4 em destaques.

**Movimento [LP]:**
| Uso | Valor |
|---|---|
| Hover de cor | `.15s–.2s` |
| Abrir menu / gaveta | `.22s–.25s ease` |
| Entrada de conteúdo | `fadeUp .7s cubic-bezier(.2,.7,.2,1)`, em cascata a cada .1s |
- Respeitar `prefers-reduced-motion`: desligar animações e transições.

---

## 11. Tokens prontos (CSS)

```css
:root {
  /* Marca */
  --blue1: #2191FF; --blue2: #29ABE2; --blue3: #0080FF; --blue4: #0061D6;
  --blue7: #051D34; --blue8: #0167C0;
  /* Neutros */
  --white: #FFFFFF; --lightblue: #F5F8FF; --lightgray: #F9F9F9; --gray: #E3E3E3;
  --black: #1A1A1A; --black2: #303030; --black3: #626275;
  /* Feedback */
  --ok: #16A36A; --danger: #DE2828;
  /* Tipografia */
  --font: "Inter", "Roboto", system-ui, sans-serif;
  --font-title: "Sora", "Inter", sans-serif;
  /* Forma */
  --radius-btn: 8px; --radius: 12px;
  --shadow: 0 8px 24px -12px rgba(5, 29, 52, .18);
  --shadow-lg: 0 24px 60px -24px rgba(0, 0, 0, .5);
  /* Espaçamento [proposta] */
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
  --space-5: 20px; --space-6: 24px; --space-7: 28px; --space-8: 32px;
  --space-10: 40px; --space-11: 44px; --space-16: 64px; --space-22: 88px;
  /* Navegação lateral [proposta] */
  --sidebar-w: 64px; --sidebar-w-open: 240px;
}
```
