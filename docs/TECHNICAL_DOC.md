# Documentação Técnica - Landing Page Fundição Domínio

Este documento apresenta a arquitetura, organização de pastas e especificações técnicas da landing page da Fundição Domínio.

---

## 1. Visão Geral do Sistema

A aplicação é uma landing page institucional moderna voltada para a captação de clientes industriais (leads de fundição e metalurgia). O design utiliza uma paleta escura (marrom terra, cinza industrial e laranja/cobre fundido em gradientes vibrantes) e animações que remetem à fundição e fundição de metais.

---

## 2. Tecnologias Utilizadas

- **Core:** React 18, TypeScript, Vite
- **Estilização:** Tailwind CSS (versão 3), classes utilitárias personalizadas
- **UI & Ícones:** Radix UI primitives, Lucide React icons, shadcn/ui
- **Roteamento:** React Router DOM (v6)
- **Gerenciamento de Estado de Dados:** TanStack React Query (v5)

---

## 3. Estrutura de Diretórios

A estrutura do código fonte segue o padrão padrão do ecossistema React/Vite:

```
src/
├── assets/             # Imagens, vetores e arquivos de mídia (ex: vídeo do hero)
├── components/         # Componentes compartilhados e encapsulados
│   ├── layout/         # Componentes de estrutura (Header, Footer, Layout global)
│   ├── sections/       # Seções de conteúdo das páginas (About, Hero, Products)
│   └── ui/             # Primitivas visuais reutilizáveis do shadcn/ui
├── hooks/              # Custom hooks do React (ex: animação de scroll, toast)
├── lib/                # Funções utilitárias auxiliares (ex: clsx/tailwind-merge wrapper)
├── pages/              # Views principais vinculadas às rotas do sistema
├── App.css             # Estilos básicos do App
├── App.tsx             # Configuração de rotas e providers
├── index.css           # Variáveis HSL do Tailwind, animações e gradientes globais
└── main.tsx            # Ponto de entrada do React
```

---

## 4. Rotas e Páginas

A navegação da aplicação é controlada por rotas definidas no `src/App.tsx`:

- **`/` (Início):** Apresenta o Hero, sinais de confiança (selos), seção "Sobre", e prévias informativas de ligas e processos.
- **`/ligas` (Ligas):** Informações detalhadas sobre ligas de ferro fundido e microestruturas (Cinzento, Nodular e Vermicular).
- **`/processo` (Processo):** Apresentação das etapas do processo produtivo e políticas de controle de qualidade.
- **`/produtos` (Produtos):** Galeria e catálogo de peças industriais produzidas.
- **`/orcamento` (Orçamento):** Tela de conversão de leads com canais de atendimento direto via e-mail e WhatsApp, com modelos estruturados baseados nas demandas mais comuns.

---

## 5. Arquitetura de Comunicação e Leads (Orçamento)

Para simplificar o fluxo de orçamento sem a necessidade de formulários extensos, o sistema implementa a estratégia de **Templates de Mensagem**:

- **Frentes de Atendimento:**
  1. *Molde Existente:* Direcionado a clientes que já possuem ferramental.
  2. *Desenvolvimento Completo:* Direcionado a projetos que partem do desenho técnico 2D/3D.
  3. *Análise Química:* Serviço laboratorial de espectrometria.
  
- **Mecanismo:**
  - Cada card gera links parametrizados via `encodeURIComponent` contendo os dados preliminares necessários (ex: tipo de metal, peso, quantidade de amostras).
  - O cliente clica no link e é redirecionado ao WhatsApp Web/App ou cliente de E-mail já com a mensagem estruturada pronta para envio ou edição.

---

## 6. Sistema de Design e Animações

- **Variáveis de Cores (index.css):**
  - `--background`: Tom marrom terra escuro profundo.
  - `--accent` e `--molten`: Tons laranjas e cobres simulando o metal derretido.
- **Micro-interações:**
  - `MoltenParticles`: Efeito dinâmico simulando fagulhas de fundição subindo no fundo das telas.
  - `useScrollAnimation`: Hook personalizado utilizando o `IntersectionObserver` para revelar elementos gradualmente no scroll da página.
