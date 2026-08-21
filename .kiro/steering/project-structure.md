# Estrutura do Projeto — roms-manager-server

## Visão Geral

Servidor de sincronização para o app **ROMs Manager NS** (Nintendo Switch).  
Stack: **Node.js 24 + Express + MongoDB (Mongoose)** — rodando via Docker Compose.  
Arquitetura: **Hexagonal (Ports & Adapters)**.

---

## Estrutura do Projeto

```
roms-manager-server/
├── src/
│   ├── app.js                              # Boot: DI, Express, start
│   ├── domain/
│   │   ├── enums/
│   │   │   └── Platform.js                # Enum frozen + isValidPlatform()
│   │   └── entities/
│   │       └── Rom.js                     # Entidade pura (POJO) com toManifestEntry()
│   ├── application/
│   │   ├── ports/
│   │   │   ├── RomRepository.js           # Contrato do repositório
│   │   │   └── FileStorage.js             # Contrato do filesystem
│   │   └── usecases/
│   │       ├── ListRoms.js                # Filtro e listagem de ROMs
│   │       ├── GetManifest.js             # Manifest leve para sync
│   │       ├── DownloadRom.js             # Resolve path + valida existência
│   │       └── SyncRoms.js                # Indexação (syncAll / syncPlatform)
│   ├── infrastructure/
│   │   ├── db/
│   │   │   ├── connection.js              # Conexão Mongoose
│   │   │   └── RomModel.js               # Schema Mongoose (usa Platform enum)
│   │   ├── repositories/
│   │   │   └── MongoRomRepository.js      # Implementa RomRepository via Mongoose
│   │   ├── storage/
│   │   │   └── LocalFileStorage.js        # Implementa FileStorage via fs + crypto + crc
│   │   └── indexer/
│   │       └── RomIndexer.js              # Fachada sobre SyncRoms
│   └── interfaces/
│       └── http/
│           ├── controllers/
│           │   └── RomController.js       # Handlers HTTP → use cases
│           └── routes/
│               └── roms.js               # Monta Express Router com DI
│
├── .github/
│   └── workflows/
│       └── deploy-zimaos.yaml            # CI/CD: deploy automático no ZimaOS
├── .zimaos/
│   └── install.sh                        # Script de setup do runner no ZimaOS
├── data/                                  # Volume montado em /data no container
├── docs/
│   ├── api.md                            # Referência da API
│   └── architecture.md                   # Arquitetura e fluxos
├── .env.example
├── .gitignore
├── Dockerfile                            # node:24-alpine, expõe porta 8080
├── docker-compose.yml                    # Dev: app + mongo:7 + mongo-express
├── docker-compose-zimaos.yml             # Produção: compose do CasaOS/ZimaOS
└── package.json                          # Dependências: express, mongoose, dotenv, crc
```

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

## Estrutura do diretório `data/`

Montado como volume em `/data` no container.  
**Nunca commitar arquivos de ROM, save ou cover** — apenas a estrutura de pastas.

```
data/
├── gba/roms/           # Game Boy Advance (.gba)
├── gb/roms/            # Game Boy (.gb)
├── gbc/roms/           # Game Boy Color (.gbc)
├── n64/roms/           # Nintendo 64 (.z64, .n64, .v64)
├── nes/roms/           # Nintendo Entertainment System (.nes)
├── snes/roms/          # Super Nintendo (.sfc, .smc)
├── genesis/roms/       # Sega Genesis / Mega Drive (.md, .bin, .gen)
├── game-gear/roms/     # Sega Game Gear (.gg)
├── master-system/roms/ # Sega Master System (.sms)
└── fbneo/roms/         # FinalBurn Neo — arcade (.zip)
```

Plataformas definidas em `src/domain/enums/Platform.js` — fonte única de verdade.

---

## Modelo — Rom

```js
{
  platform: String,   // enum das plataformas (indexed)
  filename: String,   // ex: 'Mario Kart (USA).gba'
  size: Number,       // bytes
  md5: String,        // hash MD5 hex lowercase
  sha1: String,       // hash SHA1 hex lowercase
  crc32: String,      // hash CRC32 hex uppercase (ex: 'AD4D5EC2')
  modified: Date,
  createdAt: Date,    // timestamps automático
  updatedAt: Date,
}
// Índice único: { platform, filename }
```

Os três hashes são calculados em um único `readStream` por arquivo.  
Skip de reindexação: se `size` e `modified` não mudaram, o arquivo é pulado.

---

## Endpoints

| Método | Path | Descrição |
|--------|------|-----------|
| `GET`  | `/` | Status básico (health simplificado) |
| `GET`  | `/health` | Status do servidor |
| `GET`  | `/roms` | Lista ROMs com filtros opcionais |
| `GET`  | `/roms/:platform/manifest` | Manifest leve para sync (filename + size + crc32) |
| `GET`  | `/roms/:platform/:filename` | Download direto da ROM |
| `POST` | `/roms/sync?platform=gba` | Re-indexa ROMs (platform opcional = todas) |

### Filtros — `GET /roms`

| Query param | Notas |
|-------------|-------|
| `platform`  | Filtra por plataforma |
| `md5`       | Case-insensitive |
| `sha1`      | Case-insensitive |
| `crc32`     | Case-insensitive |

---

## Fluxo de Sync — App Nintendo Switch

1. **`GET /roms/:platform/manifest`** — recebe lista leve com `filename`, `size`, `crc32`
2. App compara com o storage local (por filename + crc32)
3. **`GET /roms/:platform/:filename`** — baixa apenas as ROMs ausentes ou divergentes
4. Verifica CRC32 local após download para confirmar integridade

O manifest usa CRC32 para minimizar payload. MD5/SHA1 disponíveis via `GET /roms`.

---

## Variáveis de Ambiente

| Variável    | Padrão                                   | Descrição               |
|-------------|------------------------------------------|-------------------------|
| `PORT`      | `8080`                                   | Porta HTTP do servidor  |
| `MONGO_URI` | `mongodb://localhost:27017/roms-manager` | URI de conexão MongoDB  |
| `DATA_DIR`  | `./data`                                 | Diretório base de ROMs  |

---

## Docker Compose

### Dev (docker-compose.yml)

| Serviço         | Imagem          | Porta | Notas                          |
|-----------------|-----------------|-------|--------------------------------|
| `app`           | build local     | 8080  | Aguarda healthcheck do Mongo   |
| `mongo`         | `mongo:7`       | —     | Volume `mongo_data`            |
| `mongo-express` | `mongo-express` | 8081  | Web UI — http://localhost:8081 |

```bash
docker compose up -d --build
```

### Produção — ZimaOS (docker-compose-zimaos.yml)

| Serviço | Imagem              | Porta | Notas                              |
|---------|---------------------|-------|------------------------------------|
| `app`   | `roms-manager:latest` | 8080 | Imagem local, volume em /media/ZimaOS-HD/Roms |
| `mongo` | `mongo:7`           | —     | Volume bind em /media/ZimaOS-HD/AppData/.mongo |

---

## Convenções de Código

- Arquivos em `src/` — CommonJS (`require`/`module.exports`)
- Nomes de arquivos: `kebab-case.js` (exceto classes: `PascalCase.js`)
- Variáveis e funções: `camelCase`
- Classes: `PascalCase`
- Sem TypeScript por ora — JavaScript puro
- Testes com Jest em `__tests__/` ao lado dos arquivos testados
