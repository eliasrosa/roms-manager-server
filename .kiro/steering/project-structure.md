# Projeto — roms-manager-server

## Referência Completa

Arquitetura, modelo de dados, endpoints e plataformas estão documentados em:

#[[file:docs/architecture.md]]

---

## Convenções de Código

- Arquivos em `src/` — CommonJS (`require`/`module.exports`)
- Nomes de arquivos: `kebab-case.js` (exceto classes: `PascalCase.js`)
- Variáveis e funções: `camelCase`
- Classes: `PascalCase`
- Sem TypeScript por ora — JavaScript puro
- Testes com Jest em `__tests__/` ao lado dos arquivos testados

---

## Arquitetura Hexagonal — Regra de Dependência

```
interfaces → application ← infrastructure
                 ↓
              domain
```

- `domain` — não importa nada externo
- `application` — conhece apenas `domain` e seus ports (contratos)
- `infrastructure` — implementa os ports; conhece libs externas (Mongoose, crypto, crc)
- `interfaces` — conhece apenas use cases (via controller)
- `app.js` — único lugar com DI explícita

---

## Docker Compose

### Dev (docker-compose.yml)

```bash
docker compose up -d --build
```

| Serviço         | Imagem          | Porta | Notas                          |
|-----------------|-----------------|-------|--------------------------------|
| `app`           | build local     | 8080  | Aguarda healthcheck do Mongo   |
| `mongo`         | `mongo:7`       | —     | Volume `mongo_data`            |
| `mongo-express` | `mongo-express` | 8081  | Web UI — http://localhost:8081 |

### Produção — ZimaOS (docker-compose-zimaos.yml)

| Serviço | Imagem              | Porta | Notas                              |
|---------|---------------------|-------|------------------------------------|
| `app`   | `roms-manager:latest` | 8080 | Imagem local, volume em /media/ZimaOS-HD/Roms |
| `mongo` | `mongo:7`           | —     | Volume bind em /media/ZimaOS-HD/AppData/.mongo |

---

## Regras Importantes

- **Nunca** commitar arquivos de ROM, save ou cover
- Plataformas definidas em `src/domain/enums/Platform.js` — fonte única de verdade
- Variáveis de ambiente documentadas no `.env.example`
