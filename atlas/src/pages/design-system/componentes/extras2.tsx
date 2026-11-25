/* Componentes novos do Design System (continuação de extras.tsx): Toast, editor rico, PDF e utilitário de datas. */
import { useState } from 'react'
import * as Ph from '@phosphor-icons/react'
import type { Extra } from './extras'

type Simples = 'success' | 'error' | 'info' | 'warning'
type Notif = 'prazo' | 'alerta' | 'info' | 'sucesso' | 'promocao'
const ICONE_T: Record<Simples, Ph.Icon> = { success: Ph.CheckCircle, error: Ph.WarningCircle, info: Ph.Info, warning: Ph.WarningCircle }
const ICONE_N: Record<Notif, Ph.Icon> = { prazo: Ph.WarningCircle, alerta: Ph.Siren, info: Ph.Info, sucesso: Ph.CheckCircle, promocao: Ph.Megaphone }
const TEXTO_N: Record<Notif, [string, string]> = {
  prazo: ['3 prazos vencem hoje', 'Veja a Agenda.'],
  alerta: ['Notificação prioritária', 'Oposição publicada na RPI 2812.'],
  info: ['RPI 2812 disponível', 'Os despachos já foram importados.'],
  sucesso: ['Processo cadastrado', 'Incluído na carteira.'],
  promocao: ['Webseek Radar: 30 dias grátis', 'Monitore sua marca na web.'],
}
const TEXTO_T: Record<Simples, string> = { success: 'Processo salvo.', error: 'Não foi possível salvar.', info: 'Item excluído.', warning: 'Atenção: prazo curto.' }

function ToastPrevia() {
  const [pilha, setPilha] = useState<{ id: number; tipo: 's' | 'n'; v: string }[]>([{ id: 0, tipo: 'n', v: 'prazo' }, { id: 1, tipo: 's', v: 'success' }])
  const add = (tipo: 's' | 'n', v: string) => setPilha(p => [...p, { id: Date.now() + Math.random(), tipo, v }].slice(-4))
  const fechar = (id: number) => setPilha(p => p.filter(x => x.id !== id))
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
        <span className="note" style={{ margin: 0 }}>Simples:</span>
        {(['success', 'error', 'info', 'warning'] as Simples[]).map(v => <button key={v} type="button" className="chip compacto" onClick={() => add('s', v)}>{v}</button>)}
        <span className="note" style={{ margin: '0 0 0 8px' }}>Notificação:</span>
        {(['prazo', 'alerta', 'info', 'sucesso', 'promocao'] as Notif[]).map(v => <button key={v} type="button" className="chip compacto" onClick={() => add('n', v)}>{v}</button>)}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end', minHeight: 140 }}>
        {pilha.map(x => {
          if (x.tipo === 'n') {
            const I = ICONE_N[x.v as Notif]; const [t, m] = TEXTO_N[x.v as Notif]
            return (
              <div key={x.id} className={`dsp-tn dsp-tn--${x.v}`}>
                <span className="dsp-tn__ic"><I size={18} weight="fill" /></span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}><b style={{ fontSize: 13, color: 'var(--c-text)' }}>{t}</b><span style={{ fontSize: 12, color: 'var(--c-text-muted)' }}>{m}</span></div>
                <button type="button" className="dsp-tn__x" onClick={() => fechar(x.id)} aria-label="Fechar"><Ph.X size={14} /></button>
              </div>
            )
          }
          const I = ICONE_T[x.v as Simples]
          return (
            <div key={x.id} className={`dsp-ts dsp-ts--${x.v}`}>
              <I size={16} weight="fill" /><span>{TEXTO_T[x.v as Simples]}</span>
              <button type="button" className="dsp-ts__x" onClick={() => fechar(x.id)} aria-label="Fechar"><Ph.X size={13} weight="bold" /></button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const RichText = () => (
  <div style={{ width: 420, border: '1px solid var(--c-border)', borderRadius: 8, overflow: 'hidden', background: 'var(--c-surface)' }}>
    <div style={{ display: 'flex', gap: 4, padding: 6, borderBottom: '1px solid var(--c-border)', background: 'var(--c-surface-2)' }}>
      {[Ph.TextB, Ph.TextItalic, Ph.TextAa, Ph.LinkSimple].map((I, i) => <span key={i} style={{ width: 28, height: 28, display: 'grid', placeItems: 'center', borderRadius: 6, background: i === 0 ? 'var(--c-border)' : 'transparent', color: 'var(--c-text)' }}><I size={14} weight={i === 0 ? 'bold' : 'regular'} /></span>)}
    </div>
    <div style={{ padding: 12, fontSize: 13, minHeight: 72, color: 'var(--c-text)' }}><b>Atualização</b> do portal em <i>novembro</i>. <a style={{ color: 'var(--c-support)' }}>Saiba mais</a></div>
  </div>
)

const PdfPrevia = () => (
  <div style={{ width: 420, border: '1px solid var(--c-border)', borderRadius: 12, overflow: 'hidden', background: 'var(--c-surface)', boxShadow: 'var(--shadow-lg)' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid var(--c-border)', background: 'var(--c-surface-2)' }}>
      <b style={{ fontSize: 13 }}>Guia GRU 2026/0142.pdf</b>
      <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center', height: 28, padding: '0 12px', borderRadius: 8, background: 'var(--c-support)', color: '#fff', fontSize: 12, fontWeight: 600 }}><Ph.DownloadSimple size={14} />Baixar PDF</span>
        <Ph.X size={16} />
      </span>
    </div>
    <div style={{ height: 110, background: 'var(--c-bg)', display: 'grid', placeItems: 'center' }}><div style={{ width: 120, height: 90, background: '#fff', border: '1px solid var(--c-border)', boxShadow: 'var(--shadow-sm)' }} /></div>
  </div>
)

const CalcDatas = () => (
  <div style={{ width: 320, padding: 16, background: 'var(--c-surface)', borderRadius: 12, boxShadow: 'var(--shadow-lg)', border: '1px solid var(--c-border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
    <b style={{ fontSize: 15 }}>Utilitário de Datas</b>
    <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--c-border)' }}>
      {['Cálculo', 'Entre datas', 'Dia da semana'].map((t, i) => <span key={t} style={{ padding: '8px 10px', fontSize: 12, fontWeight: 600, color: i === 0 ? 'var(--c-support)' : 'var(--c-neutral)', borderBottom: i === 0 ? '2px solid var(--c-support)' : '2px solid transparent', marginBottom: -1 }}>{t}</span>)}
    </div>
    <div className="fg"><label>Data base</label><input readOnly value="2026-11-17" /></div>
    <div className="fg"><label>Número de dias</label><input readOnly value="30" /></div>
    <div style={{ background: 'var(--c-info-bg)', color: 'var(--c-info-txt)', borderRadius: 8, padding: 10, textAlign: 'center', fontWeight: 700 }}>17/Dez/2026</div>
  </div>
)

export const EXTRAS_2: Extra[] = [
  { chave: 'Toast', nome: 'Toast', categoria: 'Feedback', icone: Ph.Bell, descricao: 'Substitui o toast antigo da biblioteca. Dois tipos num só provider, em portal no canto inferior direito: toast simples (uma linha) e notificação (título + texto). Cores sempre pelo par -bg/-txt do status.', propriedades: [{ nome: 'Tipo', valores: ['simples', 'notificação'] }, { nome: 'Variante (simples)', valores: ['success', 'error', 'info', 'warning'] }, { nome: 'Tipo (notificação)', valores: ['prazo', 'alerta', 'info', 'sucesso', 'promocao'] }, { nome: 'Duração', valores: ['4s', '8s com ação', '10s notificação', 'null = até fechar'] }], previa: ToastPrevia },
  { chave: 'x-richtext', nome: 'Editor de texto rico', categoria: 'Formulários', icone: Ph.TextAa, descricao: 'Editor WYSIWYG (Tiptap) com barra mínima: negrito, itálico, parágrafo e link. Sem imagem no corpo.', propriedades: [{ nome: 'Barra', valores: ['negrito', 'itálico', 'parágrafo', 'link'] }], previa: RichText },
  { chave: 'x-pdf', nome: 'Pré-visualização de PDF', categoria: 'Feedback', icone: Ph.FilePdf, descricao: 'Modal com o visualizador nativo do navegador em um iframe, com "Baixar PDF" e fechar. Fecha com Esc ou clique fora.', propriedades: [{ nome: 'Ação', valores: ['Baixar PDF', 'Fechar'] }], previa: PdfPrevia },
  { chave: 'x-calc-datas', nome: 'Utilitário de datas', categoria: 'Ações', icone: Ph.CalendarCheck, descricao: 'Modal com três abas: cálculo de datas (somar ou subtrair dias, corridos ou úteis), dias entre datas e dia da semana.', propriedades: [{ nome: 'Aba', valores: ['Cálculo', 'Entre datas', 'Dia da semana'] }, { nome: 'Contagem', valores: ['corridos', 'úteis'] }], previa: CalcDatas },
]
