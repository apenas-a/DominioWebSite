# GEMINI.md - Diretrizes de Desenvolvimento (Tool-System)

Este arquivo contém as instruções e mandatos para o desenvolvimento do projeto Tool-System. Estas regras têm precedência sobre os comportamentos padrão do agente.

## 🏗️ Arquitetura do Sistema
- **Backend:** .NET 8 Web API (Arquitetura Hexagonal, com isolamento do núcleo da regra de negócio).
- **Frontend:** Vue.js 3 + Tailwind CSS + Vite.
- **Banco de Dados:** MySQL 8.0 rodando em container Docker.
- **Segurança:** Autenticação via JWT com suporte a Roles (`Admin`, `Consultor`).

## 🛠️ Regras de Ouro (Mandatos)
1. **Mapeamento de Dados:** Sempre use `[JsonPropertyName("camelCase")]` nos Models do C# para garantir que o frontend (Vue) receba as propriedades no padrão esperado, independentemente da serialização global.
2. **Nomenclatura:** 
   - Backend: PascalCase para propriedades e classes.
   - Frontend: camelCase para variáveis de estado e objetos JSON.
3. **Segurança de Acesso:** Rotas administrativas no backend devem ser protegidas com `[Authorize(Roles = UsuarioPerfis.Admin)]`.
4. **Persistência de Moldes:** O campo `TipoMaterial` é obrigatório para Moldes e deve ser exibido em azul claro (`text-sky-400`) na tela de detalhes.
5. **Versionamento (Git) e Fluxo por Tasks:** 
   - **Nomenclatura:** Manter os prefixos de branch (ex.: `Feat/Backend/analiseDeDados`) e de commit (ex.: `Feat: Criação de algoritimo de analise Dados entre endpoints`).
   - **Trabalho Fracionado:** O desenvolvimento deve ser realizado estritamente task por task. Se a demanda não estiver dividida previamente, o agente deve analisá-la, dividi-la em tasks e seguir esse mesmo fluxo.
   - **Validação e Commits:** Ao concluir cada task, o agente deve testar a alteração, explicar claramente o que foi feito e solicitar o seu feedback para saber se pode realizar o commit antes de ir para a próxima.
   - **Segurança:** Nunca incluir credenciais ou dados sensíveis em commits.
6. **Banco de Dados:** Qualquer alteração de schema via `ALTER TABLE` deve ser espelhada manualmente no arquivo `banco-de-dados/Database.sql`.

## 🤖 Configuração de Agentes e Habilidades
Foram configurados 6 subagentes especializados na pasta `.gemini/agents/`:
- **amc**: Agente Mentor de Código. Segue o protocolo de pair-programming e ensino ativo.
- **backend-architect**: Mantém a Arquitetura Hexagonal, clean code e isolamento do domínio.
- **frontend-developer**: Cria telas interativas, animadas e fluidas, deixando a lógica de negócio no backend.
- **dev-mobile**: Especialista em design e UI/UX mobile. Reaproveita componentes existentes do frontend, organizando-os de forma criativa, bem posicionada e animada, evitando o empilhamento genérico e sequencial de elementos.
- **devops-specialist**: Otimiza e protege containers Docker e trata o banco de dados com cuidado máximo.
- **cybersecurity-expert**: Analisa falhas de segurança graves, reportando o essencial para evitar ruído excessivo.

## 🎓 Protocolo AMC (Agente Mentor de Código)
Este projeto adota a filosofia AMC para todas as interações:
1. **Ensino Ativo:** Toda mudança de código deve ser explicada (o "porquê" e o "como").
2. **Ciclo de Sessão:** Planejamento -> Execução -> Revisão -> Registro de Aprendizado.
3. **Surgical Changes:** Nunca "melhore" código adjacente não solicitado.
4. **Verificação de Compreensão:** O agente deve validar se o usuário entendeu a abordagem antes de prosseguir.
5. **Transparência:** Se houver múltiplos caminhos, apresente as opções e deixe o usuário decidir.

## 🚀 Comandos Frequentes
- **Build Completo:** `docker-compose up -d --build`
- **Logs da API:** `docker-compose logs -f api`
- **Hash de Senha:** Utilizar `HashGeneratorService` para operações de BCrypt.
