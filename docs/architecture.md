# Arquitetura — ROMs Manager Server

## Visão Geral

O servidor expõe uma API REST que o app **ROMs Manager NS** (Nintendo Switch) consome para sincronizar ROMs localmente. O servidor indexa os arquivos do disco no MongoDB, calcula hashes e serve os arquivos via HTTP.

---

## Stack

| Componente  | Tecnologia         |
|-------------|--------------------|
| Runtime     | Node.js 24         |
| Framework   | Express            |
| Banco       | MongoDB 7 (Mongoose) |
| Hashing     | crypto (MD5, SHA1) + crc (CRC32) |
| Infra       | Docker Compose     |
| CI/CD       | GitHub Actions (self-hosted runner no ZimaOS) |

---

## Serviços (Docker Compose)

```
┌─────────────────────────────────────────┐
│              Docker Compose             │
│                                         │
│  ┌──────────┐      ┌─────────────────┐  │
│  │   app    │─────▶│    mongo:7      │  │
│  │ :8080    │      │  (mongo_data)   │  │
│  └──────────┘      └─────────────────┘  │
│                            ▲            │
│  ┌──────────────────┐      │            │
│  │  mongo-express   │──────┘            │
│  │    :8081         │                   │
│  └──────────────────┘                   │
└─────────────────────────────────────────┘
```

---

## Arquitetura Hexagonal (Ports & Adapters)

```
interfaces → application ← infrastructure
                 ↓
              domain
```

- **domain** — entidades puras e enums, sem dependências externas
- **application** — use cases e ports (contratos/interfaces)
- **infrastructure** — implementações concretas (Mongoose, filesystem, crypto)
- **interfaces** — controllers HTTP e rotas Express
- **app.js** — composição raiz (DI explícita)

---

## Estrutura do `src/`

```
src/
├── app.js                          # Boot: DI, conecta DB, indexa, sobe Express
├── domain/
│   ├── enums/
│   │   └── Platform.js             # Enum frozen + isValidPlatform()
│   └── entities/
│       └── Rom.js                  # Entidade pura (POJO)
├── application/
│   ├── ports/
│   │   ├── RomRepository.js        # Contrato do repositório
│   │   └── FileStorage.js          # Contrato do filesystem
│   └── usecases/
│       ├── ListRoms.js             # Filtro e listagem
│       ├── DownloadRom.js          # Resolve path + valida existência
│       └── SyncRoms.js             # Indexação (syncAll / syncPlatform)
├── infrastructure/
│   ├── db/
│   │   ├── connection.js           # Conexão Mongoose
│   │   └── RomModel.js             # Schema Mongoose
│   ├── repositories/
│   │   └── MongoRomRepository.js   # Implementa RomRepository
│   ├── storage/
│   │   └── LocalFileStorage.js     # Implementa FileStorage (fs + crypto + crc)
│   └── indexer/
│       └── RomIndexer.js           # Fachada sobre SyncRoms
└── interfaces/
    └── http/
        ├── controllers/
        │   └── RomController.js    # Handlers HTTP → use cases
        └── routes/
            └── roms.js             # Express Router com DI
```

---

## Modelo de Dados — Rom

```js
{
  platform: String,   // enum das plataformas suportadas (indexed)
  filename: String,   // nome do arquivo
  size: Number,       // tamanho em bytes
  md5: String,        // hex lowercase
  sha1: String,       // hex lowercase
  crc32: String,      // hex uppercase (ex: 'AD4D5EC2')
  modified: Date,     // mtime do arquivo no disco
  createdAt: Date,
  updatedAt: Date,
}
// Índice único: { platform, filename }
```

---

## Indexação

O `SyncRoms` use case (via `LocalFileStorage`) varre `data/<platform>/roms/` e faz upsert no MongoDB.

**Otimização de skip:** se `size` e `modified` do arquivo forem iguais ao registro existente, o arquivo é pulado sem recalcular hashes.

**Hashing em single-stream:** MD5, SHA1 e CRC32 são calculados em uma única leitura do arquivo:

```
arquivo → readStream → chunk → md5.update(chunk)
                             → sha1.update(chunk)
                             → crc32(chunk, acc)
```

---

## Fluxo de Sync — App Nintendo Switch

```
Switch App                          Servidor
    │                                   │
    │  GET /roms?platform=gba           │
    │──────────────────────────────────▶│
    │  { roms: [...], total: N }        │
    │◀──────────────────────────────────│
    │                                   │
    │  [compara com storage local]      │
    │                                   │
    │  GET /roms/:platform/:filename    │  (apenas divergentes)
    │──────────────────────────────────▶│
    │  <binário da ROM>                 │
    │◀──────────────────────────────────│
    │                                   │
    │  [verifica CRC32 local]           │
    │                                   │
```

O app compara por `crc32` + `filename`. Se divergente, baixa o arquivo.  
MD5/SHA1 disponíveis na listagem para verificação mais rigorosa se necessário.

---

## Plataformas Suportadas

| Platform       | Folder   | Extensões                              |
|----------------|----------|----------------------------------------|
| `nes`          | `nes/roms/` | `.nes`, `.unf`, `.unif`, `.fds`      |
| `snes`         | `snes/roms/` | `.sfc`, `.smc`, `.fig`, `.swc`, `.bs`, `.st` |
| `gb`           | `gb/roms/` | `.gb`                                 |
| `gbc`          | `gbc/roms/` | `.gbc`                               |
| `gba`          | `gba/roms/` | `.gba`, `.sgb`                       |
| `n64`          | `n64/roms/` | `.z64`, `.n64`, `.v64`               |
| `genesis`      | `genesis/roms/` | `.md`, `.gen`, `.bin`, `.smd`     |
| `master-system`| `master-system/roms/` | `.sms`, `.bin`             |
| `game-gear`    | `game-gear/roms/` | `.gg`, `.bin`                  |
| `sega-cd`      | `sega-cd/roms/` | `.cue`, `.bin`, `.iso`, `.chd`   |
| `saturn`       | `saturn/roms/` | `.cue`, `.bin`, `.iso`, `.chd`    |
| `dc`           | `dc/roms/` | `.chd`, `.cdi`, `.gdi`, `.cue`, `.bin` |
| `psx`          | `psx/roms/` | `.chd`, `.cue`, `.bin`, `.iso`       |
| `psp`          | `psp/roms/` | `.iso`, `.cso`, `.pbp`, `.chd`       |
| `gc`           | `gc/roms/` | `.iso`, `.gcm`, `.chd`, `.rvz`        |
| `wii`          | `wii/roms/` | `.iso`, `.chd`, `.rvz`, `.wbfs`, `.wia`, `.m3u` |
| `fbneo`        | `fbneo/roms/` | `.zip`                             |

Extensões definidas em `src/domain/enums/Platform.js` — fonte única de verdade.  
O indexador filtra apenas arquivos com extensão válida para a plataforma.

---

## Deploy

Deploy automático via GitHub Actions → ZimaOS.  
Ver detalhes no steering `deploy.md` ou no workflow `.github/workflows/deploy-zimaos.yaml`.
