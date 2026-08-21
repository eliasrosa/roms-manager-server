---
inclusion: auto
name: contributing
description: Use quando o usuário pedir para criar feature, endpoint, use case, ou adicionar funcionalidade nova ao projeto. Guia o checklist de implementação.
---

# Guia de Contribuição — Nova Feature

## Checklist de Implementação

Ao criar uma nova feature/endpoint, seguir esta ordem:

### 1. Domain (se necessário)

- [ ] Entidade em `src/domain/entities/<Nome>.js` — classe POJO, sem dependências externas
- [ ] Enum em `src/domain/enums/<Nome>.js` — `Object.freeze({})`, helpers de validação
- [ ] Nunca importar nada de `application/`, `infrastructure/` ou `interfaces/`

### 2. Ports (se necessário)

- [ ] Contrato em `src/application/ports/<NomePort>.js` — classe com métodos que lançam `Error('Not implemented')`
- [ ] JSDoc tipado para todos os métodos

### 3. Use Case

- [ ] Arquivo em `src/application/usecases/<NomeUseCase>.js`
- [ ] Classe com construtor que recebe dependências (ports)
- [ ] Método principal: `async execute(...params)`
- [ ] Erros de domínio no mesmo arquivo (ex: `class NotFoundError extends Error`)
- [ ] Export: `module.exports = NomeUseCase` (ou `{ NomeUseCase, CustomError }` se tiver erro custom)

**Template:**
```javascript
class NomeUseCase {
  constructor(romRepository /*, outrasDepencias */) {
    this.romRepository = romRepository;
  }

  async execute(params) {
    // lógica
  }
}

module.exports = NomeUseCase;
```

### 4. Infrastructure (se necessário)

- [ ] Implementação do port em `src/infrastructure/<tipo>/<NomeAdapter>.js`
- [ ] Importar do domain se precisar de enums/entidades

### 5. Testes

- [ ] Arquivo em `src/application/usecases/__tests__/<NomeUseCase>.test.js`
- [ ] Factory functions para mocks (não usar `jest.mock()`)
- [ ] Descrições dos testes em português
- [ ] Testar: caminho feliz, edge cases, erros esperados

**Template:**
```javascript
const NomeUseCase = require('../NomeUseCase');

function makeRepository(overrides = {}) {
  return {
    findAll: jest.fn().mockResolvedValue([]),
    ...overrides,
  };
}

describe('NomeUseCase', () => {
  it('deve fazer X quando Y', async () => {
    const repo = makeRepository({ findAll: jest.fn().mockResolvedValue([...]) });
    const uc = new NomeUseCase(repo);
    const result = await uc.execute(...);
    expect(result).toEqual(...);
  });
});
```

### 6. Controller

- [ ] Novo método async no `RomController` (ou criar novo controller se outro domínio)
- [ ] Traduz `req.params` / `req.query` / `req.body` → chamada ao use case
- [ ] Trata erros de domínio → status HTTP apropriado
- [ ] Erros não tratados são re-thrown (error handler global pega)

### 7. Rota

- [ ] Registrar no router existente (`src/interfaces/http/routes/roms.js`) ou criar novo
- [ ] Usar `wrap(controller.metodo)` para bind + catch async

### 8. DI (app.js)

- [ ] Import do use case
- [ ] Instanciar com dependências
- [ ] Passar para o controller via construtor

### 9. Docs

- [ ] `docs/api.md` — adicionar seção do novo endpoint (formato: método, params, exemplo, response)
- [ ] `docs/architecture.md` — atualizar se houver mudança estrutural (nova entidade, novo fluxo)

### 10. Verificação

- [ ] `npx jest --runInBand` — todos os testes passam
- [ ] `docker compose up -d --build` — container sobe sem erro
- [ ] Testar endpoint com `curl`

---

## Convenções Rápidas

| Item | Padrão |
|------|--------|
| Nome de arquivo (classe) | `PascalCase.js` |
| Nome de arquivo (geral) | `kebab-case.js` |
| Variáveis/funções | `camelCase` |
| Classes | `PascalCase` |
| Module system | CommonJS (`require`/`module.exports`) |
| Testes | Jest, co-located em `__tests__/` |
| Descrição de testes | Português |
| Commits | pt-BR, prefixo convencional (`feat:`, `fix:`, `docs:`, `refactor:`) |

---

## Anti-padrões

- ❌ Não usar `jest.mock()` — preferir injeção de dependência
- ❌ Não importar infrastructure no domain ou application
- ❌ Não colocar lógica de negócio no controller
- ❌ Não instanciar dependências dentro do use case (receber via construtor)
- ❌ Não criar endpoint sem teste unitário do use case
