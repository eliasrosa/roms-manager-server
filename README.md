# ROMs Manager Server

Servidor de sincronização para o app **ROMs Manager NS** (Nintendo Switch).  
Stack: **Node.js 24 + Express + MongoDB** — rodando via Docker Compose.

---

## Requisitos

- [Docker](https://docs.docker.com/get-docker/) + [Docker Compose](https://docs.docker.com/compose/)

---

## Instalação

```bash
git clone https://github.com/eliasrosa/roms-manager-server
cd roms-manager-server
cp .env.example .env
```

---

## Subindo o ambiente

```bash
docker compose up -d --build
```

| Serviço         | URL                      | Descrição              |
|-----------------|--------------------------|------------------------|
| API             | http://localhost:8080    | Servidor principal     |
| mongo-express   | http://localhost:8081    | Web UI do MongoDB      |

---

## Estrutura de arquivos

As ROMs ficam no diretório `data/`, organizado por plataforma:

```
data/
├── nes/roms/           # Nintendo Entertainment System
├── snes/roms/          # Super Nintendo
├── gb/roms/            # Game Boy
├── gbc/roms/           # Game Boy Color
├── gba/roms/           # Game Boy Advance
├── n64/roms/           # Nintendo 64
├── genesis/roms/       # Sega Genesis / Mega Drive
├── master-system/roms/ # Sega Master System
├── game-gear/roms/     # Sega Game Gear
├── sega-cd/roms/       # Sega CD
├── saturn/roms/        # Sega Saturn
├── dc/roms/            # Sega Dreamcast
├── psx/roms/           # PlayStation
├── psp/roms/           # PlayStation Portable
├── gc/roms/            # GameCube
├── wii/roms/           # Wii
└── fbneo/roms/         # FinalBurn Neo — arcade
```

> O diretório `data/` é montado como volume no container. Nunca commitar arquivos de ROM.

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

```
GET /roms?platform=gba
GET /roms?crc32=AD4D5EC2
GET /roms?md5=4e46dd3ae5c9c70c49587d093517049a
GET /roms?sha1=856a08e8f60f817b96add5bf2f6db186bea832ef
GET /roms?platform=gba&crc32=AD4D5EC2
```

---

## Fluxo de sync — App Nintendo Switch

1. App faz `GET /roms/:platform/manifest` → recebe lista com `filename`, `size`, `crc32`
2. Compara com o storage local (por filename + crc32)
3. Baixa apenas as ROMs ausentes ou divergentes via `GET /roms/:platform/:filename`
4. Verifica CRC32 localmente após o download para confirmar integridade

---

## Variáveis de Ambiente

| Variável    | Padrão                                   | Descrição               |
|-------------|------------------------------------------|-------------------------|
| `PORT`      | `8080`                                   | Porta HTTP do servidor  |
| `MONGO_URI` | `mongodb://localhost:27017/roms-manager` | URI de conexão MongoDB  |
| `DATA_DIR`  | `./data`                                 | Diretório base de ROMs  |

---

## Documentação

- [Arquitetura e fluxos](docs/architecture.md)
- [API Reference](docs/api.md)

---

## Deploy — ZimaOS

O deploy é automático via GitHub Actions (self-hosted runner no ZimaOS).  
Qualquer push na `main` dispara o workflow `.github/workflows/deploy-zimaos.yaml`:

1. Checkout do código
2. `docker build` da imagem `roms-manager:latest`
3. SSH no ZimaOS para `docker compose up -d --force-recreate`

---

## Licença

MIT
