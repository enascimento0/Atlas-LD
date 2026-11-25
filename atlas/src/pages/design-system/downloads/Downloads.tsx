import { useMemo } from 'react'
import * as Ph from '@phosphor-icons/react'
import { useCopiar } from '../../../lib/preferencias'
import { gerarMarkdown } from './gerarMarkdown'

const NOME_ARQUIVO = 'design-system-ldsoft.md'

const CONTEUDO: [Ph.Icon, string, string][] = [
  [Ph.ListChecks, 'Instruções para a IA', 'Regras obrigatórias e como a IA deve se comportar ao usar o Design System.'],
  [Ph.Palette, 'Cores e tokens', 'tokens.css completo (claro e escuro), 7 temas, status e rampas da biblioteca.'],
  [Ph.TextAa, 'Tipografia', 'Inter, escala fechada de estilos, pesos e estilos Ubuntu/Nunito dos demais produtos.'],
  [Ph.Ruler, 'Espaçamento e efeitos', 'Grade de 8px, medidas, tamanhos de controles, breakpoints, raio, sombras, camadas e movimento.'],
  [Ph.PhosphorLogo, 'Ícones Phosphor', 'Regras de uso, pesos e a lista completa dos ícones por categoria.'],
  [Ph.Shapes, 'Todos os componentes', 'Descrição, propriedades e código React + CSS de cada componente, pronto para reproduzir.'],
]

const PASSOS: [string, string][] = [
  ['Baixe o arquivo', 'Clique em “Baixar .MD” abaixo. O arquivo é gerado na hora com o conteúdo atual do Design System.'],
  ['Anexe na sua IA', 'Envie o arquivo em uma conversa com Claude, ChatGPT, Gemini ou outra IA (ou coloque na pasta do projeto, se usar uma IA de código).'],
  ['Descreva o que precisa', 'Peça o novo módulo, tela ou página web e diga que deve seguir o Design System anexo.'],
  ['Revise o resultado', 'Confira se a IA usou os tokens e componentes do guia. Se algo fugir, peça para corrigir citando a seção.'],
]

const EXEMPLOS = [
  'Usando o Design System anexo, crie a tela de listagem de contratos com filtros por status e período, tabela com paginação e drawer de detalhe.',
  'Crie uma página web em HTML + CSS seguindo o Design System anexo: cabeçalho, três cartões de destaque e um formulário de contato.',
  'Revise o código abaixo e aponte tudo que foge do Design System anexo (cores literais, espaçamentos fora da grade, ícones fora do Phosphor).',
]

const tamanho = (bytes: number) => bytes < 1024 * 1024 ? `${Math.round(bytes / 1024).toLocaleString('pt-BR')} KB` : `${(bytes / 1024 / 1024).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} MB`

export default function Downloads() {
  const copiar = useCopiar()
  const md = useMemo(() => gerarMarkdown(), [])
  const bytes = useMemo(() => new TextEncoder().encode(md).length, [md])
  const secoes = useMemo(() => (md.match(/^## \d+\./gm) ?? []).length, [md])
  const componentes = useMemo(() => (md.match(/^#### /gm) ?? []).length, [md])

  const baixar = () => {
    const url = URL.createObjectURL(new Blob([md], { type: 'text/markdown;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url; a.download = NOME_ARQUIVO
    document.body.appendChild(a); a.click(); a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="hero">
        <svg className="hero-art" width="280" height="280" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="8" height="8" rx="2" stroke="#fff" strokeWidth=".6" /><rect x="13" y="3" width="8" height="8" rx="4" stroke="#fff" strokeWidth=".5" /><rect x="3" y="13" width="8" height="8" rx="4" stroke="#fff" strokeWidth=".5" /><rect x="13" y="13" width="8" height="8" rx="2" stroke="#fff" strokeWidth=".6" /></svg>
        <div className="eyebrow">Downloads · Design System</div>
        <h2>Design System completo em um arquivo .MD</h2>
        <p>Tudo o que o Atlas documenta (regras, tokens, fontes, ícones e todos os componentes com código) em um só arquivo de texto. Entregue a uma IA para criar novos <b>produtos</b>, <b>módulos</b> ou <b>páginas web</b> já no padrão da LDSOFT.</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 20, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" style={{ background: '#fff', color: 'var(--c-sidebar-bg)', borderColor: '#fff' }} onClick={baixar}><Ph.DownloadSimple size={16} weight="bold" />Baixar .MD</button>
        </div>
      </div>

      <div className="grid g3">
        {[['Arquivo', NOME_ARQUIVO], ['Tamanho', tamanho(bytes)], ['Conteúdo', `${secoes} seções · ${componentes} itens`]].map(([k, v]) => (
          <div key={k} className="fato"><div className="k">{k}</div><div className="v" style={{ wordBreak: 'break-all' }}>{v}</div></div>
        ))}
      </div>
      <div className="note" style={{ marginTop: -12 }}>O arquivo é gerado no momento do clique a partir da própria documentação: sempre reflete o Design System atual, sem versão para atualizar à mão.</div>

      <section>
        <h3 className="h3" style={{ marginTop: 0 }}>O que vem no arquivo</h3>
        <div className="grid g3">
          {CONTEUDO.map(([I, t, d]) => (
            <div key={t} className="fato" style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <I size={22} color="var(--c-support)" weight="duotone" style={{ flexShrink: 0, marginTop: 2 }} />
              <div><div className="v" style={{ marginTop: 0, fontSize: 13.5 }}>{t}</div><div className="note" style={{ marginTop: 4 }}>{d}</div></div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="h3" style={{ marginTop: 0 }}>Como usar com uma IA</h3>
        <div className="card">
          {PASSOS.map(([t, d], i) => <div key={t} className="ponto"><div className="n">{i + 1}</div><div><b>{t}</b><span>{d}</span></div></div>)}
        </div>
      </section>

      <section>
        <h3 className="h3" style={{ marginTop: 0 }}>Exemplos de pedido</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {EXEMPLOS.map(e => (
            <button key={e} type="button" className="fato" onClick={() => copiar(e, 'Exemplo de pedido')} style={{ textAlign: 'left', cursor: 'pointer', font: 'inherit', color: 'var(--c-text)', display: 'flex', gap: 12, alignItems: 'center' }} title="Clique para copiar">
              <Ph.Copy size={16} color="var(--c-support)" style={{ flexShrink: 0 }} /><span>{e}</span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="h3" style={{ marginTop: 0 }}>Boas práticas</h3>
        <div className="card" style={{ margin: 0 }}>
          {[
            'Se a IA limitar o tamanho do anexo, envie primeiro as seções 0 a 7 (fundamentos) e, depois, só os componentes que a tela precisa.',
            'Para criar um novo módulo dentro do APOL+, peça também que a IA reaproveite o tokens.css do arquivo, em vez de recriar as cores.',
            'Peça sempre que a IA liste os componentes e tokens usados e aponte lacunas, em vez de improvisar.',
            'Baixe o arquivo de novo sempre que o Design System mudar: não reutilize cópias antigas.',
          ].map((t, i) => <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 12.5, marginBottom: i < 3 ? 10 : 0 }}><Ph.CheckCircle size={16} weight="fill" color="var(--c-success)" style={{ flexShrink: 0, marginTop: 1 }} /><span>{t}</span></div>)}
        </div>
      </section>
    </div>
  )
}
