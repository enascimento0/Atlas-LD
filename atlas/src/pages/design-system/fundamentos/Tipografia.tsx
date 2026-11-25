import { useState } from 'react'
import dados from '../../../data/biblioteca.json'
import { Secao, Sumario, type ItemToc } from '../../../components/ui/Doc'
import { Tabela, useAncora } from './pecas'

export const TIPOS: [string, React.CSSProperties, string, string][] = [
  ['Título/Página', { fontSize: 20, fontWeight: 800, color: 'var(--c-brand)' }, 'Relatório de Processos', '20 · 800 · --c-brand'],
  ['Título/Drawer', { fontSize: 16, fontWeight: 800 }, 'Detalhe do Processo', '16 · 800 · --c-text'],
  ['Título/Modal', { fontSize: 16, fontWeight: 600 }, 'Excluir oportunidade?', '16 · 600 · --c-text'],
  ['Botão/Small', { fontSize: 14, fontWeight: 600 }, 'Pesquisar', '14 · 600 · lh 1'],
  ['Botão/Medium', { fontSize: 16, fontWeight: 600 }, 'Pesquisar', '16 · 600 · lh 1'],
  ['Botão/Large', { fontSize: 18, fontWeight: 600 }, 'Pesquisar', '18 · 600 · lh 1'],
  ['Título/Card', { fontSize: 13, fontWeight: 700 }, 'Filtros de Pesquisa', '13 · 700'],
  ['Corpo/Base', { fontSize: 13 }, 'O titular foi notificado do despacho publicado na RPI.', '13 · 400'],
  ['Corpo/Campo e tabela', { fontSize: 12.5 }, '912345678 · APOL MARCAS · Classe 35', '12.5 · 400 · o mais usado'],
  ['Seção/Overline', { fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.6px' }, 'Dados do processo', '12 · 800 · UPPER · .6px'],
  ['Rótulo/Linha', { fontSize: 12, fontWeight: 600, color: 'var(--c-neutral-h)' }, 'Responsável:', '12 · 600 · --c-neutral-h'],
  ['Corpo/Metadado', { fontSize: 11.5, color: 'var(--c-neutral)' }, 'Pasta 2026/0142 · Empresa Exemplo Ltda.', '11.5 · 400 · --c-neutral'],
  ['Tabela/Cabeçalho', { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.3px', color: 'var(--c-table-head-txt)' }, 'Data de depósito', '11 · 700 · UPPER · .3px'],
  ['Rótulo/Legenda', { fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--c-text-muted)' }, 'Número do processo', '10.5 · 700 · UPPER · .5px'],
  ['Micro', { fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.4px', color: 'var(--c-text-muted)' }, 'Ordenar', '10 · 600 · UPPER · .4px'],
  ['Valor/KPI', { fontSize: 20, fontWeight: 800, lineHeight: 1.2 }, 'R$ 31,7 mil', '20 · 800 · lh 1.2'],
]

const SECOES: ItemToc[] = [
  { id: 'familia', titulo: '1. Família e base', termos: 'inter 13px fonte' },
  { id: 'escala', titulo: '2. Escala de estilos', termos: 'tamanho peso título corpo' },
  { id: 'pesos', titulo: '3. Pesos', termos: 'bold 800 700 600' },
  { id: 'biblioteca', titulo: '4. Estilos da biblioteca', termos: 'ubuntu nunito headline paragraph label' },
]

export default function Tipografia() {
  useAncora()
  const [texto, setTexto] = useState('')
  const [cat, setCat] = useState('Headlines')
  const cats = ['Headlines', 'Subtitles', 'Paragraph', 'Labels']
  return (
    <div className="doc-cols">
      <div>
        <Secao id="familia" num="01" titulo="Família e base" lead="Família única na interface: Inter, com corpo-base de 13px (não 16px). A escala é fechada: não crie tamanhos fora dela.">
          <div className="grid g4">
            {[['Fonte', 'Inter 300–700'], ['Corpo base', '13px'], ['Campo e célula', '12.5px'], ['Títulos', '20 · 16 · 14px']].map(([k, v]) => <div key={k} className="fato"><div className="k">{k}</div><div className="v">{v}</div></div>)}
          </div>
          <div className="note">O peso 800 é usado no CSS mas a Inter é carregada só até 700; o navegador sintetiza o negrito. Se o projeto carregar a Inter completa, inclua 800 no <code>@import</code>.</div>
        </Secao>

        <Secao id="escala" num="02" titulo="Escala de estilos" lead="Digite abaixo para testar seu próprio texto em todos os estilos. Escala fechada: 12.5 · 12 · 13 · 11.5 · 11 · 10.5 · 10, mais 20 / 18 / 16 / 14 para títulos e botões.">
          <input className="campo" style={{ maxWidth: 420, marginBottom: 12 }} placeholder="Teste um texto…" value={texto} onChange={e => setTexto(e.target.value)} />
          <div className="card">
            {TIPOS.map(([n, st, ex, spec]) => (
              <div key={n} className="tipo-row"><div className="n">{n}</div><div style={st}>{texto || ex}</div><div className="spec">{spec}</div></div>
            ))}
          </div>
        </Secao>

        <Secao id="pesos" num="03" titulo="Pesos">
          <Tabela cab={['Peso', 'Uso']} linhas={[['400', 'Corpo de texto'], ['500', 'Botões próprios em Tailwind (confirmação)'], ['600', 'Botões, rótulos de campo, abas'], ['700', 'Ênfase, cabeçalhos de tabela e de card'], ['800', 'Título de página e de drawer, overlines, KPI']]} />
        </Secao>

        <Secao id="biblioteca" num="04" titulo="Estilos da biblioteca" lead={<><b>Ubuntu</b> nos títulos e subtítulos, <b>Nunito</b> em parágrafos e rótulos, e <b>Inter Semi Bold</b> nos rótulos de botão e chip. Usados pelos demais produtos da LDSOFT; a interface do Atlas segue a escala acima.</>}>
          <div className="abas" style={{ marginBottom: 12 }}>{cats.map(c => <button key={c} className={`aba ${cat === c ? 'on' : ''}`} onClick={() => setCat(c)}>{c}<span className="cont">{dados.textos.filter(t => t.categoria === c).length}</span></button>)}</div>
          <div className="card" style={{ background: '#fff', color: '#000014', colorScheme: 'light' }}>
            {dados.textos.filter(t => t.categoria === cat).map(t => (
              <div key={t.nome} className="tipo-lib">
                <div className="n">{t.rotulo}</div>
                <div className="ex" style={{ fontFamily: t.familia, fontWeight: t.peso === 'Bold' ? 700 : t.peso === 'Light' ? 300 : 400, fontSize: t.tamanho, lineHeight: t.alturaLinha }}>{texto || (cat === 'Paragraph' ? 'O titular foi notificado do despacho publicado.' : 'Atlas LDSOFT')}</div>
                <div className="s">{t.familia} {t.peso} · {t.tamanho}px · lh {t.alturaLinha}</div>
              </div>
            ))}
          </div>
        </Secao>
      </div>
      <Sumario itens={SECOES} />
    </div>
  )
}
