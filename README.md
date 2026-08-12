# ROMs Manager Server

Servidor de sincronização para o app **ROMs Manager NS** (Nintendo Switch).  
Stack: **Node.js 20 + Express + MongoDB** — rodando via Docker Compose.

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
├── gba/roms/          # Game Boy Advance (.gba)
├── gb/roms/           # Game Boy (.gb)
├── gbc/roms/          # Game Boy Color (.gbc)
├── n64/roms/          # Nintendo 64 (.z64, .n64, .v64)
├── nes/roms/          # Nintendo Entertainment System (.nes)
├── snes/roms/         # Super Nintendo (.sfc, .smc)
├── genesis/roms/      # Sega Genesis / Mega Drive (.md, .bin, .gen)
├── game-gear/roms/    # Sega Game Gear (.gg)
├── master-system/roms/ # Sega Master System (.sms)
└── fbneo/roms/        # FinalBurn Neo — arcade (.zip)
```

> O diretório `data/` é montado como volume no container. Nunca commitar arquivos de ROM.

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

## Licença

MIT
