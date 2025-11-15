# API de Turmas - Guia de Uso

Este documento descreve como utilizar o serviço de gerenciamento de turmas da aplicação.

## Visão Geral

O serviço de turmas permite criar, listar, atualizar e excluir turmas do sistema. As operações seguem regras de autorização baseadas em roles (papéis) dos usuários.

## Autenticação

Todas as rotas exigem autenticação via JWT. O token deve ser enviado no header `Authorization`:

```
Authorization: Bearer <seu-token-jwt>
```

## Permissões por Role

- **ADMIN**: Pode criar, atualizar e excluir qualquer turma
- **PROFESSOR**: Pode criar turmas para si mesmo, atualizar e excluir apenas suas próprias turmas
- **ALUNO**: Pode apenas visualizar turmas (listar e buscar por ID)

## Endpoints

### Base URL
```
/api/turmas
```

---

## 1. Listar Todas as Turmas

Retorna uma lista com todas as turmas cadastradas no sistema.

**Endpoint:** `GET /api/turmas`

**Permissão:** Qualquer usuário autenticado

**Resposta de Sucesso (200):**
```json
[
  {
    "id": "uuid-da-turma",
    "codigo": "TURMA001",
    "vagas": 30,
    "matriculados": 15,
    "horario": {
      "codigo": "21",
      "dia": 2,
      "turno": 1,
      "nomeDia": "Segunda-feira",
      "nomeTurno": "Manhã",
      "descricao": "Segunda-feira - Manhã"
    },
    "disciplina": {
      "id": "uuid-da-disciplina",
      "codigo": "MAT101",
      "nome": "Matemática I",
      "creditos": 4
    },
    "professor": {
      "id": "uuid-do-professor",
      "nome": "João Silva",
      "siape": "1234567"
    }
  }
]
```

**Exemplo de Requisição (cURL):**
```bash
curl -X GET http://localhost:3000/api/turmas \
  -H "Authorization: Bearer seu-token-jwt"
```

---

## 2. Buscar Turma por ID

Retorna os detalhes de uma turma específica.

**Endpoint:** `GET /api/turmas/:id`

**Permissão:** Qualquer usuário autenticado

**Parâmetros:**
- `id` (path): UUID da turma

**Resposta de Sucesso (200):**
```json
{
  "id": "uuid-da-turma",
  "codigo": "TURMA001",
  "vagas": 30,
  "matriculados": 15,
  "horario": {
    "codigo": "21",
    "dia": 2,
    "turno": 1,
    "nomeDia": "Segunda-feira",
    "nomeTurno": "Manhã",
    "descricao": "Segunda-feira - Manhã"
  },
  "disciplina": {
    "id": "uuid-da-disciplina",
    "codigo": "MAT101",
    "nome": "Matemática I",
    "creditos": 4
  },
  "professor": {
    "id": "uuid-do-professor",
    "nome": "João Silva",
    "siape": "1234567"
  }
}
```

**Resposta de Erro (404):**
```json
{
  "code": "TURMA_INEXISTENTE",
  "message": "Turma não encontrada."
}
```

**Exemplo de Requisição (cURL):**
```bash
curl -X GET http://localhost:3000/api/turmas/uuid-da-turma \
  -H "Authorization: Bearer seu-token-jwt"
```

---

## 3. Criar Turma

Cria uma nova turma no sistema.

**Endpoint:** `POST /api/turmas`

**Permissão:** PROFESSOR ou ADMIN

**Body (JSON):**
```json
{
  "codigo": "TURMA001",
  "vagas": 30,
  "dia": 2,
  "turno": 1,
  "disciplinaId": "uuid-da-disciplina",
  "professorId": "uuid-do-professor"
}
```

**Campos Obrigatórios:**
- `codigo` (string): Código único da turma
- `vagas` (number): Número total de vagas disponíveis
- `dia` (number): Dia da semana (1=Domingo, 2=Segunda, ..., 7=Sábado)
- `turno` (number): Turno (1=Manhã, 2=Tarde, 3=Noite)
- `disciplinaId` (string): UUID da disciplina
- `professorId` (string): UUID do professor

**Validações:**
- `dia` deve estar entre 1 e 7
- `turno` deve estar entre 1 e 3
- O código da turma deve ser único
- A disciplina deve existir
- O professor deve existir
- Professores só podem criar turmas para si mesmos (ADMIN pode criar para qualquer professor)

**Resposta de Sucesso (201):**
```json
{
  "id": "uuid-da-turma",
  "codigo": "TURMA001",
  "vagas": 30,
  "matriculados": 0,
  "horario": {
    "codigo": "21",
    "dia": 2,
    "turno": 1,
    "nomeDia": "Segunda-feira",
    "nomeTurno": "Manhã",
    "descricao": "Segunda-feira - Manhã"
  },
  "disciplina": {
    "id": "uuid-da-disciplina",
    "codigo": "MAT101",
    "nome": "Matemática I",
    "creditos": 4
  },
  "professor": {
    "id": "uuid-do-professor",
    "nome": "João Silva",
    "siape": "1234567"
  }
}
```

**Respostas de Erro:**

**400 - Parâmetros Inválidos:**
```json
{
  "code": "PARAMETRO_INVALIDO",
  "message": "Todos os campos são obrigatórios: codigo, vagas, dia, turno, disciplinaId, professorId."
}
```

**404 - Disciplina ou Professor Não Encontrado:**
```json
{
  "code": "DISCIPLINA_INEXISTENTE",
  "message": "Disciplina não encontrada."
}
```

```json
{
  "code": "PROFESSOR_INEXISTENTE",
  "message": "Professor não encontrado."
}
```

**409 - Código Duplicado:**
```json
{
  "code": "TURMA_CODIGO_DUPLICADO",
  "message": "Já existe uma turma com este código."
}
```

**403 - Permissão Negada:**
```json
{
  "code": "ROLE_FORBIDDEN",
  "message": "Professores só podem criar turmas para si mesmos."
}
```

**Exemplo de Requisição (cURL):**
```bash
curl -X POST http://localhost:3000/api/turmas \
  -H "Authorization: Bearer seu-token-jwt" \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "TURMA001",
    "vagas": 30,
    "dia": 2,
    "turno": 1,
    "disciplinaId": "uuid-da-disciplina",
    "professorId": "uuid-do-professor"
  }'
```

---

## 4. Atualizar Turma

Atualiza os dados de uma turma existente.

**Endpoint:** `PUT /api/turmas/:id`

**Permissão:** PROFESSOR ou ADMIN

**Parâmetros:**
- `id` (path): UUID da turma

**Body (JSON):**
```json
{
  "codigo": "TURMA001",
  "vagas": 35,
  "dia": 3,
  "turno": 2,
  "disciplinaId": "uuid-da-disciplina",
  "professorId": "uuid-do-professor"
}
```

**Campos Opcionais:**
Todos os campos são opcionais. Apenas os campos enviados serão atualizados.

**Validações:**
- A turma deve existir
- Se `dia` for fornecido, deve estar entre 1 e 7
- Se `turno` for fornecido, deve estar entre 1 e 3
- Se `codigo` for fornecido, deve ser único (exceto para a própria turma)
- Se `disciplinaId` for fornecido, a disciplina deve existir
- Se `professorId` for fornecido, o professor deve existir
- Professores só podem atualizar suas próprias turmas (ADMIN pode atualizar qualquer turma)

**Resposta de Sucesso (200):**
```json
{
  "id": "uuid-da-turma",
  "codigo": "TURMA001",
  "vagas": 35,
  "matriculados": 15,
  "horario": {
    "codigo": "32",
    "dia": 3,
    "turno": 2,
    "nomeDia": "Terça-feira",
    "nomeTurno": "Tarde",
    "descricao": "Terça-feira - Tarde"
  },
  "disciplina": {
    "id": "uuid-da-disciplina",
    "codigo": "MAT101",
    "nome": "Matemática I",
    "creditos": 4
  },
  "professor": {
    "id": "uuid-do-professor",
    "nome": "João Silva",
    "siape": "1234567"
  }
}
```

**Respostas de Erro:**

**404 - Turma Não Encontrada:**
```json
{
  "code": "TURMA_INEXISTENTE",
  "message": "Turma não encontrada."
}
```

**403 - Permissão Negada:**
```json
{
  "code": "ROLE_FORBIDDEN",
  "message": "Professores só podem atualizar suas próprias turmas."
}
```

**Exemplo de Requisição (cURL):**
```bash
curl -X PUT http://localhost:3000/api/turmas/uuid-da-turma \
  -H "Authorization: Bearer seu-token-jwt" \
  -H "Content-Type: application/json" \
  -d '{
    "vagas": 35
  }'
```

---

## 5. Excluir Turma

Remove uma turma do sistema.

**Endpoint:** `DELETE /api/turmas/:id`

**Permissão:** PROFESSOR ou ADMIN

**Parâmetros:**
- `id` (path): UUID da turma

**Validações:**
- A turma deve existir
- A turma não pode ter matrículas ativas
- Professores só podem excluir suas próprias turmas (ADMIN pode excluir qualquer turma)

**Resposta de Sucesso (204):**
Sem conteúdo no body.

**Respostas de Erro:**

**404 - Turma Não Encontrada:**
```json
{
  "code": "TURMA_INEXISTENTE",
  "message": "Turma não encontrada."
}
```

**409 - Turma com Matrículas:**
```json
{
  "code": "TURMA_COM_MATRICULAS",
  "message": "Não é possível excluir turma com matrículas ativas."
}
```

**403 - Permissão Negada:**
```json
{
  "code": "ROLE_FORBIDDEN",
  "message": "Professores só podem excluir suas próprias turmas."
}
```

**Exemplo de Requisição (cURL):**
```bash
curl -X DELETE http://localhost:3000/api/turmas/uuid-da-turma \
  -H "Authorization: Bearer seu-token-jwt"
```

---

## Códigos de Horário

### Dias da Semana
- `1` = Domingo
- `2` = Segunda-feira
- `3` = Terça-feira
- `4` = Quarta-feira
- `5` = Quinta-feira
- `6` = Sexta-feira
- `7` = Sábado

### Turnos
- `1` = Manhã
- `2` = Tarde
- `3` = Noite

### Código do Horário
O código do horário é gerado automaticamente no formato `{dia}{turno}`:
- Segunda-feira de manhã = `21`
- Terça-feira à tarde = `32`
- Quinta-feira à noite = `53`

---

## Regras de Negócio

1. **Criação de Turmas:**
   - Professores só podem criar turmas atribuídas a si mesmos
   - Administradores podem criar turmas para qualquer professor
   - O código da turma deve ser único no sistema

2. **Atualização de Turmas:**
   - Professores só podem atualizar turmas das quais são responsáveis
   - Administradores podem atualizar qualquer turma
   - Não é possível atualizar o código para um código já existente em outra turma

3. **Exclusão de Turmas:**
   - Professores só podem excluir suas próprias turmas
   - Administradores podem excluir qualquer turma
   - Turmas com matrículas ativas não podem ser excluídas

4. **Visualização:**
   - Todos os usuários autenticados podem visualizar turmas
   - A resposta inclui informações completas da disciplina e do professor

---

## Exemplos de Uso

### Exemplo 1: Professor criando uma turma para si mesmo

```bash
curl -X POST http://localhost:3000/api/turmas \
  -H "Authorization: Bearer token-do-professor" \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "MAT101-A",
    "vagas": 40,
    "dia": 2,
    "turno": 1,
    "disciplinaId": "uuid-disciplina-matematica",
    "professorId": "uuid-do-professor-logado"
  }'
```

### Exemplo 2: Admin criando uma turma para outro professor

```bash
curl -X POST http://localhost:3000/api/turmas \
  -H "Authorization: Bearer token-do-admin" \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "FIS201-B",
    "vagas": 25,
    "dia": 4,
    "turno": 3,
    "disciplinaId": "uuid-disciplina-fisica",
    "professorId": "uuid-de-outro-professor"
  }'
```

### Exemplo 3: Aluno listando turmas disponíveis

```bash
curl -X GET http://localhost:3000/api/turmas \
  -H "Authorization: Bearer token-do-aluno"
```

### Exemplo 4: Professor atualizando apenas o número de vagas

```bash
curl -X PUT http://localhost:3000/api/turmas/uuid-da-turma \
  -H "Authorization: Bearer token-do-professor" \
  -H "Content-Type: application/json" \
  -d '{
    "vagas": 50
  }'
```

---

## Códigos de Status HTTP

- `200` - Sucesso (GET, PUT)
- `201` - Criado com sucesso (POST)
- `204` - Sucesso sem conteúdo (DELETE)
- `400` - Requisição inválida
- `401` - Não autenticado
- `403` - Sem permissão
- `404` - Recurso não encontrado
- `409` - Conflito (código duplicado, turma com matrículas)
- `500` - Erro interno do servidor

---

## Notas Importantes

1. Todos os IDs são UUIDs (identificadores únicos universais)
2. O campo `matriculados` é calculado automaticamente e não pode ser atualizado diretamente
3. O horário é representado como um objeto com informações completas na resposta
4. A validação de permissões é feita automaticamente pelo middleware de autorização
5. Turmas excluídas não podem ser recuperadas

