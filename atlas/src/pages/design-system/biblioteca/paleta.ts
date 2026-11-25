/* Paleta da Biblioteca adaptada à marca: as rampas Brand Primary (amarelo), Brand Secondary (azul-violeta)
   e Gray do Figma passam a usar as variações de azul e os neutros do APOL+. Os mesmos valores estão em
   src/styles/biblioteca.css (.lib) — ao mudar um, mude o outro. */
export const REMAP: Record<string, string> = {
  // Brand Primary → azul de apoio do APOL+ (--c-support)
  'Brand Primary/300': '#CCE0F5', 'Brand Primary/400': '#4D8FD1', 'Brand Primary/500': '#0059AD', 'Brand Primary/600': '#004A8F', 'Brand Primary/700': '#003E7E',
  // Brand Secondary → azul-marinho da marca APOL+ (--c-brand / --c-sidebar-bg)
  'Brand Secondary/300': '#B8C7D9', 'Brand Secondary/400': '#2D4B70', 'Brand Secondary/500': '#0D2137', 'Brand Secondary/600': '#0A1A2D', 'Brand Secondary/700': '#001A33',
  // Gray → neutros do APOL+
  'Gray/50': '#F9FAFB', 'Gray/100': '#F3F4F6', 'Gray/200': '#E5E7EB', 'Gray/300': '#D1D5DB', 'Gray/400': '#9CA3AF', 'Gray/500': '#6B7280',
  'Gray/600': '#4B5563', 'Gray/700': '#374151', 'Gray/800': '#1F2937', 'Gray/900': '#111827',
  'Black & White/Black': '#1F2937',
}

/** Hex efetivo de um estilo de cor da biblioteca (já com a paleta azul aplicada) */
export const corDe = (nome: string, hex: string) => REMAP[nome] ?? hex
