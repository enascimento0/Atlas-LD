# Evolução funcional do Atlas --- Hub de Produtos LDSOFT

## Contexto

O Atlas é o hub de informações e conhecimento do time de Produtos da
LDSOFT. Seu objetivo é centralizar documentações, materiais de Design
System, informações sobre produtos, benchmarks e guias internos.

A plataforma será disponibilizada para toda a empresa, funcionando como
uma fonte centralizada de consulta e documentação.

A proposta é evoluir o Atlas para uma experiência de gestão de
conhecimento semelhante ao Notion, aproveitando conceitos de
organização, navegação, criação de páginas e edição de conteúdo,
mantendo integralmente a identidade visual, os componentes, os padrões
de interface e a linguagem visual já existentes no projeto.

**Importante:** não redesenhe o Atlas. Trabalhe sobre a estrutura e o
design atual.

## 1. Arquitetura da informação

A navegação deverá contemplar as seguintes áreas:

-   Design System
-   Produtos
-   Benchmarks
-   Guias e contribuições

O Design System deverá permanecer como está.

As demais áreas deverão funcionar como bibliotecas de conteúdo dinâmico.

## 2. Gestão de conteúdo

Implementar funcionalidades de criação, edição, consulta e gerenciamento
de conteúdos nas áreas Produtos e Benchmarks.

Cada registro deverá funcionar como uma página independente, com
endereço e identificação próprios.

Ao acessar Produtos ou Benchmarks, usuários autorizados deverão
encontrar uma ação para criar novo conteúdo.

Oferecer duas possibilidades:

### A. Criar manualmente

Abrir um editor de páginas com suporte a:

-   Título e descrição.
-   Texto formatado.
-   Cabeçalhos e subtítulos.
-   Listas ordenadas e não ordenadas.
-   Imagens.
-   Tabelas.
-   Links.
-   Arquivos anexados.
-   Separadores de conteúdo.
-   Blocos organizáveis e editáveis.

A experiência deverá ser inspirada no editor do Notion, com edição
fluida e organização por blocos.

### B. Inserir documentos

Permitir que usuários autorizados adicionem documentos a uma nova página
ou a uma página existente.

Os documentos deverão ficar associados ao respectivo conteúdo, com
identificação, organização e possibilidade de consulta.

A ingestão de materiais internos deverá respeitar os fluxos de
processamento já existentes ou previstos para o projeto.

Não expor procedimentos técnicos internos de ingestão na interface
pública do Atlas.

## 3. Estrutura das páginas

Cada página criada deverá possuir:

-   Título.
-   Descrição.
-   Categoria.
-   Autor ou responsável.
-   Data de criação.
-   Data da última atualização.
-   Status: rascunho ou publicado.
-   Conteúdo principal.
-   Documentos e materiais relacionados.

Criar uma experiência de leitura limpa, com boa hierarquia tipográfica,
espaçamento consistente e navegação intuitiva.

Quando o usuário acessar um produto ou benchmark, deverá conseguir
visualizar sua documentação e seus materiais dentro da própria página.

## 4. Gestão de permissões

Implementar um sistema de controle de acesso baseado em perfis e
permissões.

### Administrador --- Time de Produtos

-   Acesso administrativo global.
-   Criar, editar e excluir conteúdos.
-   Publicar e despublicar páginas.
-   Gerenciar colaboradores e permissões.
-   Gerenciar todas as áreas do Atlas.

### Colaborador

-   Criar conteúdos nas áreas autorizadas.
-   Editar conteúdos conforme suas permissões.
-   Inserir documentos.
-   Gerenciar seus próprios rascunhos.
-   Publicar somente quando possuir autorização.

### Leitor --- Demais colaboradores da LDSOFT

-   Visualizar conteúdos publicados.
-   Navegar pelas páginas.
-   Consultar documentos e materiais.
-   Pesquisar informações.

Os controles de criação e edição devem aparecer somente para usuários
autorizados.

As permissões devem ser aplicadas no backend, e não apenas por ocultação
de elementos na interface.

O time de Produtos deverá ser o único responsável pela administração
global do Atlas.

## 5. Publicação e organização

Implementar um fluxo de publicação com:

-   Criação em rascunho.
-   Edição.
-   Pré-visualização.
-   Publicação.
-   Atualização de conteúdo publicado.
-   Despublicação.
-   Exclusão mediante confirmação.

Páginas publicadas deverão ficar disponíveis para consulta dos usuários
com acesso à respectiva área.

## 6. Experiência de navegação

A navegação deverá ser simples e intuitiva, seguindo os princípios de
organização de conhecimento do Notion.

Implementar:

-   Listagem de páginas.
-   Filtros por categoria.
-   Identificação de atualizações recentes.
-   Navegação entre páginas relacionadas.
-   Indicadores de autoria e atualização.
-   Estados vazios com orientações de utilização.

## 7. Histórico e rastreabilidade

Registrar informações importantes sobre as alterações realizadas:

-   Usuário responsável.
-   Data e horário.
-   Tipo de alteração.
-   Histórico de atualizações.

Preservar a rastreabilidade das documentações e permitir que
administradores identifiquem quem realizou cada alteração.

## 8. Diretrizes de implementação

Antes de desenvolver:

1.  Analise a arquitetura atual do Atlas.
2.  Identifique os componentes, padrões visuais e estruturas de
    navegação existentes.
3.  Identifique o sistema atual de autenticação e permissões.
4.  Verifique a estrutura de dados e os mecanismos de armazenamento
    disponíveis.
5.  Reaproveite os componentes existentes sempre que possível.

Não criar interfaces desconectadas do padrão atual.

Não alterar desnecessariamente o layout, a identidade visual, as cores,
a tipografia ou os componentes já implementados.

Priorizar consistência, escalabilidade, facilidade de manutenção e uma
experiência de utilização familiar.

**Resultado esperado:** transformar o Atlas em uma plataforma de
conhecimento colaborativa, na qual o time de Produtos administra e
organiza as informações, enquanto os demais colaboradores da LDSOFT
conseguem consultar, pesquisar e consumir todo o conhecimento
disponibilizado.
