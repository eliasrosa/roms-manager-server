# Estrutura do Projeto — roms-manager-server

## Visão Geral

Servidor de sincronização para o app **ROMs Manager NS** (Nintendo Switch).  
Stack: **Node.js 20 + Express + MongoDB (Mongoose)** — rodando via Docker Compose.

---

## Estrutura do Projeto

```
roms-manager-server/
├── src/                        # Código-fonte da aplicação
│   ├── app.js                  # Entry point: Express, CORS, rotas, start()
│   └── db.js                   # Conexão Mongoose (connect, eventos)
│
├── data/                       # Volume montado em /data no container
│   ├── gba/
│   │   └── roms/               # ROMs Game Boy Advance (.gba)
│   ├── gb/
│   │   └── roms/               # ROMs Game Boy (.gb)
│   ├── gbc/
│   │   └── roms/               # ROMs Game Boy Color (.gbc)
│   └── n64/
│       └── roms/               # ROMs Nintendo 64 (.z64, .n64, .v64)
│
├── .env.example                # Variáveis de ambiente (referência)
├── .gitignore
├── Dockerfile                  # node:20-alpine, expõe porta 8080
├── docker-compose.yml          # Serviços: app + mongo:7 + mongo-express
├── package.json                # Dependências: express, mongoose, dotenv, crc
├── README.md
```

---

## Estrutura do diretório `data/`

O diretório `data/` é montado como volume em `/data` no container.  
**Nunca commitar arquivos de ROM, save ou cover** — apenas a estrutura de pastas.

A estrutura é organizada por **plataforma**, cada uma com suas próprias subpastas:

```
data/
├── gba/
│   └── roms/               # Game Boy Advance (.gba)
├── gb/
│   └── roms/               # Game Boy (.gb)
├── gbc/
│   └── roms/               # Game Boy Color (.gbc)
├── n64/
│   └── roms/               # Nintendo 64 (.z64, .n64, .v64)
├── nes/
│   └── roms/               # Nintendo Entertainment System (.nes)
├── snes/
│   └── roms/               # Super Nintendo (.sfc, .smc)
├── genesis/
│   └── roms/               # Sega Genesis / Mega Drive (.md, .bin, .gen)
├── game-gear/
│   └── roms/               # Sega Game Gear (.gg)
├── master-system/
│   └── roms/               # Sega Master System (.sms)
└── fbneo/
    └── roms/               # FinalBurn Neo — arcade (.zip)
```

Plataformas suportadas: `gba`, `gb`, `gbc`, `n64`, `nes`, `snes`, `genesis`, `game-gear`, `master-system`, `fbneo`.

O `manifest.json` é gerado automaticamente no diretório `data/` pelo servidor —  
**não commitar** o `manifest.json`.

---

## Estrutura do `src/`

```
src/
├── app.js                  # Entry point: Express, CORS, rotas, boot (connect + indexAll)
├── db.js                   # Conexão Mongoose
├── models/
│   └── Rom.js              # Schema: platform, filename, size, md5, sha1, crc32, modified
├── routes/
│   └── roms.js             # Rotas de ROMs
└── services/
    └── indexer.js          # Varre data/<platform>/roms/ e faz upsert no Mongo
```

---

## Modelo — Rom

```js
{
  platform: String,   // enum das plataformas suportadas (indexed)
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

Os três hashes são calculados em um único `readStream` por arquivo (sem ler o arquivo duas vezes).  
Skip de reindexação: se `size` e `modified` não mudaram, o arquivo é pulado.

---

## Endpoints

| Método | Path | Descrição |
|--------|------|-----------|
| `GET`  | `/health` | Status do servidor |
| `GET`  | `/roms` | Lista ROMs com filtros opcionais |
| `GET`  | `/roms/:platform/manifest` | Manifest leve para sync (filename + size + crc32) |
| `GET`  | `/roms/:platform/:filename` | Download direto da ROM |
| `POST` | `/roms/sync?platform=gba` | Re-indexa ROMs (platform opcional = todas) |

### Filtros — `GET /roms`

| Query param | Exemplo | Notas |
|-------------|---------|-------|
| `platform`  | `?platform=gba` | Filtra por plataforma |
| `md5`       | `?md5=4e46dd...` | Case-insensitive |
| `sha1`      | `?sha1=856a08...` | Case-insensitive |
| `crc32`     | `?crc32=AD4D5EC2` | Case-insensitive |

Filtros são combináveis entre si.

---

## Fluxo de Sync — App Nintendo Switch

O app no Switch usa o endpoint de manifest para sincronizar ROMs de forma eficiente:

1. **`GET /roms/:platform/manifest`** — recebe lista leve com `filename`, `size`, `crc32`
2. App compara com o storage local (por filename + crc32)
3. **`GET /roms/:platform/:filename`** — baixa apenas as ROMs ausentes ou divergentes
4. Após download, verifica CRC32 local para confirmar integridade do arquivo

O manifest usa CRC32 (4 bytes) em vez de MD5/SHA1 para minimizar payload na comparação.  
MD5 e SHA1 ficam disponíveis via `GET /roms` para verificação mais rigorosa se necessário.

---

## Variáveis de Ambiente

| Variável    | Padrão                                    | Descrição               |
|-------------|-------------------------------------------|-------------------------|
| `PORT`      | `8080`                                    | Porta HTTP do servidor  |
| `MONGO_URI` | `mongodb://localhost:27017/roms-manager`  | URI de conexão MongoDB  |
| `DATA_DIR`  | `./data`                                  | Diretório base de arquivos |

---

## Docker Compose

| Serviço         | Imagem          | Porta | Notas                              |
|-----------------|-----------------|-------|------------------------------------|
| `app`           | build local     | 8080  | Aguarda healthcheck do Mongo       |
| `mongo`         | `mongo:7`       | —     | Volume `mongo_data` para persistência |
| `mongo-express` | `mongo-express` | 8081  | Web UI — http://localhost:8081     |

```bash
# Subir ambiente
docker compose up --build

# Subir em background
docker compose up -d --build
```

---

## Convenções de Código

- Arquivos em `src/` — CommonJS (`require`/`module.exports`)
- Nomes de arquivos: `kebab-case.js`
- Variáveis e funções: `camelCase`
- Modelos Mongoose: `PascalCase` em `src/models/`
- Rotas: `src/routes/`
- Services: `src/services/`
- Sem TypeScript por ora — JavaScript puro
