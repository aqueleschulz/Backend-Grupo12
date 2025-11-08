## Módulo de Matrículas

Implementação do fluxo de matrícula/cancelamento/listagem para alunos usando Node.js, Express, PostgreSQL e JWT.

### Requisitos

- Node.js 18+
- PostgreSQL 14+ com schema idêntico ao arquivo `Banco/Banco de dados.sql`
- Variáveis de ambiente configuradas (`.env`) com:
  - `PORT` – porta do servidor (padrão 3000)
  - `DATABASE_URL` **ou** `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
  - `DB_SSL` (opcional, `true` ativa SSL sem validação de certificado)
  - `JWT_SECRET` – chave usada para validar tokens emitidos pelo módulo de autenticação já existente

### Scripts npm

| Comando             | Descrição |
| ------------------- | --------- |
| `npm install`       | Instala dependências |
| `npm run dev`       | Sobe a API em modo desenvolvimento |
| `npm test`          | Executa testes unitários e de integração (usa Jest + pg-mem) |

### Rotas disponíveis

Prefixo: `/api/matriculas` (todas exigem `Bearer <JWT>` com papel `ALUNO`).

1. **POST /** – cria matrícula
   ```bash
   curl -X POST http://localhost:3000/api/matriculas \
     -H "Authorization: Bearer <JWT_DO_ALUNO>" \
     -H "Content-Type: application/json" \
     -d '{ "turmaId": "UUID_DA_TURMA" }'
   ```
   - Erros possíveis: `TURMA_INEXISTENTE`, `JA_MATRICULADO_NA_TURMA`, `SEM_VAGAS`, `CHOQUE_HORARIO`.
2. **GET /?me=true** – lista matrículas do aluno autenticado (id, turma, disciplina, professor, horário e status).
3. **DELETE /:id** – cancela matrícula do próprio aluno (status passa para `CANCELADA`).

### Arquitetura e regras de negócio

- Camadas: `controller → service → repository`. Os repositórios utilizam SQL explícito (`pg`) respeitando os nomes do schema original.
- Segurança:
  - `authenticateJWT` valida o token `Bearer`.
  - `authorizeRoles('ALUNO')` restringe o acesso.
  - `attachAlunoId` resolve o `aluno_id` a partir do `usuario_id` presente no token.
- Matrícula:
  - Fluxo executado dentro de `BEGIN ... SET TRANSACTION ISOLATION LEVEL REPEATABLE READ`.
  - `SELECT ... FOR UPDATE` na linha da turma garante exclusão mútua e evita overbooking.
  - Regras: impedir duplicidade, respeitar capacidade (`turma.vagas`), verificar choque de horário (dia/turno codificados como `dia||turno`), mapear violações de unique para `JA_MATRICULADO_NA_TURMA`.
  - `status` padrão: `ATIVA`. Cancelamentos atualizam para `CANCELADA`.

### Testes automatizados

- **Unitários (`tests/service/matricula.service.spec.js`)**: cobrem todos os ramos do serviço (turma inexistente, duplicidade, sem vagas, choque e caminho feliz, além de cancelamento e listagem).
- **Integração (`tests/integration/matricula.concurrency.spec.js`)**: usa `pg-mem` com transações reais para simular duas requisições competindo pela última vaga – apenas uma matrícula é criada e a outra retorna `SEM_VAGAS`. O teste usa um mutex em `withTransaction` para reproduzir o efeito do `SELECT ... FOR UPDATE` exigido em produção.

Execute:
```bash
cross-env NODE_ENV=test npm test
```

### Validação manual sugerida

1. Gerar JWT válido para um usuário com papel `ALUNO`.
2. Criar duas turmas:
   - `turma A` (vagas = 1, dia=2, turno=1)
   - `turma B` (horário diferente)
3. Realizar:
   - POST `/api/matriculas` para `turma A` → deve retornar 201.
   - POST novamente para a mesma turma com mesmo aluno → 409 `JA_MATRICULADO_NA_TURMA`.
   - Outro aluno tentando `turma A` (quando já lotada) → 409 `SEM_VAGAS`.
   - Enrolar aluno em `turma B` e depois outra com mesmo horário → 409 `CHOQUE_HORARIO`.
   - GET `/api/matriculas?me=true` → lista atualizada.
   - DELETE `/api/matriculas/:id` → 204 e status passa para `CANCELADA`.

### Decisões principais

- Bloqueio pessimista (`FOR UPDATE`) + `REPEATABLE READ` para impedir reservas duplicadas com alta contenção.
- Catálogo centralizado de códigos de erro para manter respostas padronizadas (`{ error: { code, message } }`).
- Testes integrados com `pg-mem` reproduzindo o schema real, garantindo que os repositórios executem SQL equivalente ao PostgreSQL sem depender de infraestrutura externa.
