# ROMs Manager Server

Servidor de sincronização para o app **ROMs Manager NS** (Nintendo Switch).  
Serve arquivos (ROMs, covers, saves) via HTTP e gera automaticamente um `manifest.json` com hash MD5 e metadados de cada arquivo.

---

## Instalação

Requer apenas **Python 3.8+** (sem dependências externas — somente stdlib).

```bash
git clone https://github.com/eliasrosa/roms-manager-server
cd roms-manager-server
```

---

## Uso

```bash
python3 serve.py [--port PORT] [--dir DIR] [--regenerate-interval SECS]
```

| Flag | Padrão | Descrição |
|------|--------|-----------|
| `--port` / `-p` | `8080` | Porta HTTP do servidor |
| `--dir` / `-d` | `./data` | Diretório base com roms/covers/saves |
| `--regenerate-interval` | `60` | Intervalo (em segundos) de regeneração automática do manifest |

### Exemplos

```bash
# Iniciar com configurações padrão
python3 serve.py

# Porta customizada e diretório específico
python3 serve.py --port 9090 --dir /mnt/sd/data

# Regenerar manifest a cada 30 segundos
python3 serve.py --regenerate-interval 30
```

---

## Endpoints HTTP

| Método | Path | Descrição |
|--------|------|-----------|
| `GET` | `/manifest.json` | Retorna manifest com todos os arquivos, MD5 e tamanho |
| `GET` | `/roms/<arquivo>` | Download direto de ROM |
| `GET` | `/covers/<arquivo>` | Download direto de cover |
| `GET` | `/saves/<arquivo>` | Download direto de save |
| `GET` | `/health` | Status do servidor (`{"status": "ok", "time": <epoch>}`) |

O `manifest.json` é regenerado a cada requisição nesse endpoint, garantindo que esteja sempre atualizado.

---

## Estrutura esperada de `data/`

```
data/
├── roms/        # .nsp, .xci, .nro
├── covers/      # .jpg, .png
└── saves/       # qualquer formato
```

Se o diretório `data/` não existir ao iniciar o servidor, ele será criado automaticamente com a estrutura acima.

---

## Uso com Docker

### Build da imagem

```bash
docker build -t roms-manager-server .
```

### Executar com volume e porta

```bash
docker run -d \
  -p 8080:8080 \
  -v /caminho/local/data:/data \
  roms-manager-server
```

Substituir `/caminho/local/data` pelo diretório local que contém suas ROMs, covers e saves.

### Usando imagem do Docker Hub

```bash
docker run -d \
  -p 8080:8080 \
  -v /caminho/local/data:/data \
  eliasrosa/roms-manager-server
```

---

## Configuração no Switch

No app **ROMs Manager NS**, configure:
- **Host**: IP do computador onde o servidor está rodando (ex: `192.168.0.10`)
- **Port**: porta configurada no servidor (padrão: `8080`)

---

## Licença

MIT — veja [LICENSE](../roms-manager-ns/LICENSE) no repositório principal.
