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
├── docker-compose.yml          # Serviços: app + mongo:7
├── package.json                # Dependências: express, mongoose, dotenv
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

## Variáveis de Ambiente

| Variável    | Padrão                                    | Descrição               |
|-------------|-------------------------------------------|-------------------------|
| `PORT`      | `8080`                                    | Porta HTTP do servidor  |
| `MONGO_URI` | `mongodb://localhost:27017/roms-manager`  | URI de conexão MongoDB  |

---

## Docker Compose

| Serviço | Imagem         | Porta | Notas                              |
|---------|----------------|-------|------------------------------------|
| `app`   | build local    | 8080  | Aguarda healthcheck do Mongo       |
| `mongo` | `mongo:7`      | —     | Volume `mongo_data` para persistência |

```bash
# Subir ambiente
docker compose up --build

# Subir em background
docker compose up -d --build
```

---

## Estrutura do `src/`

```
src/
├── app.js                  # Entry point: Express, CORS, rotas, boot (connect + indexAll)
├── db.js                   # Conexão Mongoose
├── models/
│   └── Rom.js              # Schema: platform, filename, size, md5, modified
├── routes/
│   └── roms.js             # Rotas de ROMs
└── services/
    └── indexer.js          # Varre data/<platform>/roms/ e faz upsert no Mongo
```

---

## Modelo — Rom

```js
{
  platform: String,   // enum: 'gba' | 'gb' | 'gbc' | 'n64'  (indexed)
  filename: String,   // ex: 'Mario Kart (USA).gba'
  size: Number,       // bytes
  md5: String,
  modified: Date,
  createdAt: Date,    // timestamps automático
  updatedAt: Date,
}
// Índice único: { platform, filename }
```

---

## Endpoints

| Método | Path | Descrição |
|--------|------|-----------|
| `GET`  | `/health` | Status do servidor |
| `GET`  | `/roms?platform=gba` | Lista ROMs (platform opcional) |
| `GET`  | `/roms/:platform/:filename` | Download direto da ROM |
| `POST` | `/roms/sync?platform=gba` | Re-indexa ROMs (platform opcional = todas) |

---

## Variáveis de Ambiente

| Variável    | Padrão                                    | Descrição               |
|-------------|-------------------------------------------|-------------------------|
| `PORT`      | `8080`                                    | Porta HTTP do servidor  |
| `MONGO_URI` | `mongodb://localhost:27017/roms-manager`  | URI de conexão MongoDB  |
| `DATA_DIR`  | `./data`                                  | Diretório base de arquivos |

---

## Docker Compose

| Serviço | Imagem         | Porta | Notas                              |
|---------|----------------|-------|------------------------------------|
| `app`   | build local    | 8080  | Aguarda healthcheck do Mongo       |
| `mongo` | `mongo:7`      | —     | Volume `mongo_data` para persistência |

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
