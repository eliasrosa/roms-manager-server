# Arquitetura — ROMs Manager Server

## Visão Geral

O servidor expõe uma API REST que o app **ROMs Manager NS** (Nintendo Switch) consome para sincronizar ROMs localmente. O servidor indexa os arquivos do disco no MongoDB, calcula hashes e serve os arquivos via HTTP.

---

## Stack

| Componente  | Tecnologia         |
|-------------|--------------------|
| Runtime     | Node.js 20         |
| Framework   | Express            |
| Banco       | MongoDB 7 (Mongoose) |
| Hashing     | crypto (MD5, SHA1) + crc (CRC32) |
| Infra       | Docker Compose     |

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

## Estrutura do `src/`

```
src/
├── app.js          # Boot: conecta DB, indexa ROMs, sobe Express
├── db.js           # Conexão Mongoose com eventos de log
├── models/
│   └── Rom.js      # Schema Mongoose
├── routes/
│   └── roms.js     # Rotas da API
└── services/
    └── indexer.js  # Lógica de indexação e hashing
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

O `indexer.js` varre `data/<platform>/roms/` e faz upsert no MongoDB.

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
    │  GET /roms/:platform/manifest     │
    │──────────────────────────────────▶│
    │  { filename, size, crc32 }[]      │
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

**Por que CRC32 no manifest?**
- 4 bytes vs 16 (MD5) ou 20 (SHA1) — payload menor em listas grandes
- Suficiente para detectar divergência entre arquivos
- MD5/SHA1 disponíveis via `GET /roms` para verificação mais rigorosa se necessário

---

## Plataformas Suportadas

| Platform       | Extensões              |
|----------------|------------------------|
| `gba`          | `.gba`                 |
| `gb`           | `.gb`                  |
| `gbc`          | `.gbc`                 |
| `n64`          | `.z64`, `.n64`, `.v64` |
| `nes`          | `.nes`                 |
| `snes`         | `.sfc`, `.smc`         |
| `genesis`      | `.md`, `.bin`, `.gen`  |
| `game-gear`    | `.gg`                  |
| `master-system`| `.sms`                 |
| `fbneo`        | `.zip`                 |
