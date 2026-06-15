# Sistema de Mentoria Univates

Sistema de mentoria acadêmica com Node.js, Express, EJS e SQLite.

## Requisitos

- Node.js 18+

## Instalação

```bash
npm install
cp .env.example .env
npm start
```

Acesse: http://localhost:3000

Modo desenvolvimento com reload automático:

```bash
npm run dev
```

## Login (modo dev)

Não há senha. Informe apenas o e-mail institucional `@universo.univates.br`.

- Contas válidas são criadas automaticamente no primeiro login (papel `ALUNO`).
- Outros domínios (ex.: `@gmail.com`) são bloqueados com mensagem clara.
- Sessão expira em 24h (configurável) e renova a cada requisição (`rolling`).

## Usuários de teste (seed)

| E-mail | Papel | Descrição |
|--------|-------|-----------|
| `admin@universo.univates.br` | ADMIN | Aprova/reprova mentores |
| `aluno@universo.univates.br` | ALUNO | Perfil e busca de mentores |
| `mentor.aprovado@universo.univates.br` | MENTOR | Visível na busca |
| `mentor.pendente@universo.univates.br` | MENTOR | Aguardando aprovação admin |

## Funcionalidades

- **Autenticação** por e-mail `@universo.univates.br` com auto-registro
- **Papéis**: ALUNO, MENTOR, ADMIN com autorização nas rotas
- **Perfil do aluno**: nome, foto (URL), curso, disciplinas de interesse
- **Perfil do mentor**: curso, disciplinas, disponibilidade por dia
- **Busca de mentores** com filtros (disciplina, curso, disponibilidade) — só aprovados
- **Solicitação de mentoria** com e-mail ao mentor
- **Aceitar/recusar** solicitação com e-mail ao aluno
- **Agendamento** online (link Meet) ou presencial (local)
- **Cancelamento** com auditoria (quem cancelou + motivo)
- **Conclusão** e avaliação 1–5 pelo aluno
- **Admin**: aprovar/reprovar mentores pendentes
- **Histórico** separado em futuras e passadas
- **E-mails**: mock no console; SMTP opcional via `.env`

## Fluxo de teste manual

1. **Login aluno** — `aluno@universo.univates.br` → buscar mentores → ver Maria Mentor
2. **Login gmail** — `teste@gmail.com` → deve exibir erro de domínio
3. **Novo aluno** — `seu.nome@universo.univates.br` → conta criada automaticamente
4. **Solicitar mentoria** — aluno escolhe disciplina e envia → e-mail no console
5. **Login mentor** — `mentor.aprovado@universo.univates.br` → aceitar solicitação
6. **Agendar** — definir data, tipo online/presencial e link ou local → e-mails no console
7. **Histórico** — aluno e mentor veem data, tipo e link/local
8. **Concluir** — mentor marca como concluída → aluno recebe e-mail pedindo avaliação
9. **Avaliar** — aluno dá nota 1–5 no histórico → média atualizada no mentor
10. **Admin** — `admin@universo.univates.br` → aprovar `mentor.pendente@...` → aparece na busca

## E-mail (SMTP opcional)

Por padrão, e-mails são exibidos no console como `[EMAIL MOCK]`.

Para envio real, configure no `.env`:

```
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=senha
MAIL_FROM=mentoria@universo.univates.br
```

## Estrutura

```
src/
├── server.js           # Bootstrap Express
├── config/database.js  # SQLite + init automático
├── middleware/         # Auth e papéis
├── services/           # Auth e e-mail
├── dao/                # Acesso ao banco
├── controllers/        # Lógica das rotas
├── routes/             # Definição de rotas
└── views/              # Templates EJS
database/
├── schema.sql
└── seed.sql
```

## Critérios de aceite

| Critério | Status |
|----------|--------|
| Login `@universo.univates.br` funciona | OK |
| Login `@gmail.com` falha com mensagem clara | OK |
| Usuário criado no 1º login | OK |
| Sessão expira e renova (rolling 24h) | OK |
| Papéis ALUNO/MENTOR/ADMIN nas rotas | OK |
| Mentor não aprovado fora da busca | OK |
| Filtros de busca funcionam | OK |
| Fluxo solicitação → agendamento → conclusão → avaliação | OK |
| E-mails mock (SMTP opcional) | OK |
