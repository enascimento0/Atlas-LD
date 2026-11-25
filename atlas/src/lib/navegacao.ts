/* Mapa do Atlas: alimenta a sidebar e a busca (Ctrl+K). */
import { House, Sparkle, Palette, Shapes, Stack, PhosphorLogo, UsersThree, TextAa, Ruler, Drop, type Icon } from '@phosphor-icons/react'
import { AREAS } from './areas'

export interface ItemNav { rota: string; rotulo: string; icone: Icon; grupo: string; tag?: string; descricao?: string; somenteAdmin?: boolean }

export const NAV: ItemNav[] = [
  { rota: '/', rotulo: 'Início', icone: House, grupo: 'Geral', descricao: 'Página inicial do Atlas' },
  { rota: '/novidades', rotulo: 'Novidades', icone: Sparkle, grupo: 'Geral', descricao: 'O que mudou no Atlas e nos produtos' },
  { rota: '/design-system', rotulo: 'Design System', icone: Palette, grupo: 'Conteúdo', descricao: 'APOL+, componentes, biblioteca de componentes e ícones' },
  ...AREAS.map(a => ({ rota: a.rota, rotulo: a.rotulo, icone: a.icone, grupo: 'Conteúdo', descricao: a.descricao })),
  { rota: '/colaboradores', rotulo: 'Colaboradores', icone: UsersThree, grupo: 'Administração', descricao: 'Perfis, permissões e atividade', somenteAdmin: true },
]

export const DS_ABAS: { rota: string; rotulo: string; icone: Icon; descricao: string }[] = [
  { rota: '/design-system', rotulo: 'Visão geral', icone: Stack, descricao: 'Como o Design System está organizado, regras e utilitários' },
  { rota: '/design-system/componentes', rotulo: 'Componentes', icone: Shapes, descricao: 'Botões, campos, tabelas, modais e padrões de tela, com prévia e código' },
  { rota: '/design-system/cores', rotulo: 'Cores', icone: Palette, descricao: 'Tokens de cor, temas, modo escuro e tokens exportáveis' },
  { rota: '/design-system/tipografia', rotulo: 'Tipografia', icone: TextAa, descricao: 'Escala de estilos de texto e fontes' },
  { rota: '/design-system/espacamento', rotulo: 'Espaçamento e responsividade', icone: Ruler, descricao: 'Grade, medidas, tamanhos de botões e campos, breakpoints' },
  { rota: '/design-system/efeitos', rotulo: 'Raio, sombras e efeitos', icone: Drop, descricao: 'Raio, borda, sombras, camadas e movimento' },
  { rota: '/design-system/icones', rotulo: 'Ícones Phosphor', icone: PhosphorLogo, descricao: '1.512 ícones em 6 pesos, usados por todos os produtos' },
]
