# Documentação Técnica — Fundição Domínio

Esta documentação provê uma visão clara e detalhada sobre a arquitetura, estrutura de diretórios e fluxos internos do projeto da **Fundição Domínio**.

---

## 1. Arquitetura do Sistema

A aplicação é uma **SPA (Single Page Application)** construída sobre o ecossistema React, TypeScript e empacotada com Vite.
* **Hospedagem:** Netlify (com suporte a roteamento SPA via regras configuradas em `public/_redirects`).
* **Estilização:** Tailwind CSS acoplado a componentes visuais desacoplados e primitivas do Radix UI.
* **Componentes Funcionais:** Utilização de hooks personalizados para desacoplamento de lógica comportamental, animações de scroll e disparos de UI.

---

## 2. Estrutura de Diretórios (`src/`)

```
src/
├── assets/         # Vetores, imagens e arquivos de vídeo (ex: mp4 do hero)
├── components/     # Componentes estruturais e reutilizáveis
│   ├── layout/     # Cabeçalhos, rodapés e barras de ações (Header, Footer, Layout)
│   ├── sections/   # Blocos de conteúdo específicos (Hero, About, SteelAlloys, etc)
│   ├── ui/         # Componentes atômicos de interface baseados no shadcn/ui
│   └── motion/     # Variáveis e variantes de animações com Framer Motion
├── data/           # Datasets estáticos do projeto (ex: catálogo de aços)
├── hooks/          # Hooks customizados para scroll, estados globais e toast
├── lib/            # Funções utilitárias (ex: merging de classes Tailwind CSS)
├── pages/          # Views associadas às rotas
└── App.tsx         # Configuração de rotas e providers da aplicação
```

---

## 3. Roteamento e Páginas

A navegação da aplicação é declarada no arquivo `src/App.tsx` utilizando `react-router-dom`:

| Rota | View correspondente | Descrição |
| :--- | :--- | :--- |
| `/` | `pages/Index.tsx` | Página inicial contendo Hero, Processos, Ligas e Sobre. |
| `/ferro` | `pages/Ferro.tsx` | Catálogo técnico de ligas de ferro fundido (Cinzento, Nodular e Vermicular). |
| `/aco` | `pages/Aco.tsx` | Catálogo técnico estruturado de famílias de aço (Carbono, Baixa Liga, Alta Liga, etc). |
| `/ligas` | *Redirecionamento* | Redireciona via status 301/replace para `/ferro` (legado). |
| `/processo` | `pages/Processo.tsx` | Apresentação visual da linha de produção e controle de qualidade. |
| `/produtos` | `pages/Produtos.tsx` | Portfólio de peças fundidas e usinadas comercializadas. |
| `/orcamento`| `pages/Orcamento.tsx`| Fluxo de cotações com geradores inteligentes de propostas. |
| `/sobre` | *Redirecionamento* | Redireciona para `/` (Home). |
| `/contato` | *Redirecionamento* | Redireciona para `/` (Home). |
| `*` | `pages/NotFound.tsx` | Página de fallback (Erro 404). |

---

## 4. Integração de Leads e Orçamentos

Para evitar o uso de formulários complexos e backend dedicado para envios, o sistema de orçamentos em `pages/Orcamento.tsx` funciona via **mensageria dinâmica**:
1. O usuário seleciona um template de orçamento (ex: *Molde Existente*, *Desenvolvimento*, *Análise Química*).
2. Um modal coleta dados técnicos preliminares (tipo do material, peso, quantidade de amostras).
3. A aplicação realiza o encoding URI (`encodeURIComponent`) destas informações e monta links customizados para **WhatsApp** ou **E-mail**.
4. O usuário é redirecionado ao respectivo canal com a mensagem estruturada pronta, minimizando a fricção de contato.

---

## 5. Sistema de Estilos e Animações

* **Molten Particles (`components/MoltenParticles.tsx`):** Componente dinâmico que simula faíscas incandescentes subindo na tela, construído com canvas/CSS dinâmico.
* **Scroll Animation (`hooks/useScrollAnimation.tsx`):** Hook que utiliza a API `IntersectionObserver` para revelar elementos na viewport progressivamente.
* **Correção de Blurs em Sidebars:** As camadas de overlay e painéis móveis são posicionadas fora da tag `<header>` para evitar conflitos de `backdrop-filter: blur` e `position: fixed`.
