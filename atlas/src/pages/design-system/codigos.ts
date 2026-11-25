/* Código-fonte de cada componente do Design System (React + CSS), para reproduzir do zero em outro projeto.
   Os arquivos .txt em ./codigos usam blocos "=== chave | arquivo"; a chave é o nome do componente da biblioteca
   (ex.: "Button") ou o id dos demais (ex.: "c-tabela", "x-autocomplete"). */
import acoes from './codigos/acoes.txt?raw'
import dados from './codigos/dados.txt?raw'
import estrutura from './codigos/estrutura.txt?raw'
import feedback from './codigos/feedback.txt?raw'
import formularios from './codigos/formularios.txt?raw'
import navegacao from './codigos/navegacao.txt?raw'
import tokens from './codigos/tokens.txt?raw'
import anexo from './codigos/anexo.txt?raw'
import biblioteca from './codigos/biblioteca.txt?raw'

export interface Arquivo { rotulo: string; codigo: string }

export const CODIGOS: Record<string, Arquivo[]> = {}

for (const texto of [acoes, formularios, dados, navegacao, feedback, estrutura, tokens, anexo, biblioteca]) {
  for (const bloco of texto.split(/^=== /m).slice(1)) {
    const quebra = bloco.indexOf('\n')
    const [chave, arquivo] = bloco.slice(0, quebra).split(' | ').map(s => s.trim())
    ;(CODIGOS[chave] ||= []).push({ rotulo: arquivo, codigo: bloco.slice(quebra + 1).trim() })
  }
}

/* Componentes sem arquivo próprio que reaproveitam o código de outro (mesma implementação). */
const ALIAS: Record<string, string> = { 'Modal Size': 'Modal', 'Menu Lateral': 'c-casca', Header: 'x-cabecalho' }
for (const [nome, origem] of Object.entries(ALIAS)) if (!CODIGOS[nome] && CODIGOS[origem]) CODIGOS[nome] = CODIGOS[origem]
