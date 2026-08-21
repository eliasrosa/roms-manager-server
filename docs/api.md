# API Reference — ROMs Manager Server

Base URL: `http://<host>:8080`

---

## `GET /`

Status básico do servidor (health simplificado).

**Response**
```json
{ "status": "ok", "time": 1723456789000 }
```

---

## `GET /health`

Retorna o status do servidor.

**Response**
```json
{ "status": "ok", "time": 1723456789000 }
```

---

## `GET /roms`

Lista ROMs indexadas. Todos os filtros são opcionais e combináveis.

**Query params**

| Param      | Tipo   | Descrição |
|------------|--------|-----------|
| `platform` | string | Filtra por plataforma (`gba`, `gb`, `gbc`, etc.) |
| `md5`      | string | Filtra por hash MD5 (case-insensitive) |
| `sha1`     | string | Filtra por hash SHA1 (case-insensitive) |
| `crc32`    | string | Filtra por hash CRC32 (case-insensitive) |

**Exemplos**
```
GET /roms
GET /roms?platform=gba
GET /roms?crc32=AD4D5EC2
GET /roms?platform=snes&md5=4e46dd3ae5c9c70c49587d093517049a
```

**Response**
```json
{
  "total": 1,
  "roms": [
    {
      "_id": "...",
      "platform": "gba",
      "filename": "Ace Combat Advance (USA, Europe).gba",
      "size": 4194304,
      "md5": "4e46dd3ae5c9c70c49587d093517049a",
      "sha1": "856a08e8f60f817b96add5bf2f6db186bea832ef",
      "crc32": "AD4D5EC2",
      "modified": "2009-09-20T04:30:42.000Z",
      "createdAt": "2026-08-11T23:42:51.969Z",
      "updatedAt": "2026-08-11T23:42:51.969Z"
    }
  ]
}
```

---

## `GET /roms/:platform/manifest`

Retorna manifest leve para uso no fluxo de sync do app Nintendo Switch.  
Contém apenas `filename`, `size` e `crc32` — sem metadados extras.

**Params**

| Param      | Tipo   | Descrição |
|------------|--------|-----------|
| `platform` | string | Plataforma desejada (`gba`, `snes`, etc.) |

**Exemplo**
```
GET /roms/gba/manifest
```

**Response**
```json
{
  "platform": "gba",
  "total": 92,
  "roms": [
    { "filename": "Ace Combat Advance (USA, Europe).gba", "size": 4194304, "crc32": "AD4D5EC2" },
    { "filename": "Advance Wars (USA) (Rev 1).gba", "size": 4194304, "crc32": "C845B05C" }
  ]
}
```

---

## `GET /roms/:platform/:filename`

Download direto de uma ROM.

**Params**

| Param      | Tipo   | Descrição |
|------------|--------|-----------|
| `platform` | string | Plataforma da ROM |
| `filename` | string | Nome do arquivo (URL-encoded se necessário) |

**Exemplo**
```
GET /roms/gba/Ace%20Combat%20Advance%20(USA%2C%20Europe).gba
```

**Response**
- `200` — arquivo binário com `Content-Disposition: attachment`
- `404` — ROM não encontrada no banco ou arquivo ausente no disco

---

## `POST /roms/sync`

Re-indexa ROMs do disco para o MongoDB. Calcula MD5, SHA1 e CRC32.  
Arquivos sem alteração em `size` e `modified` são pulados (skipped).

**Query params**

| Param      | Tipo   | Descrição |
|------------|--------|-----------|
| `platform` | string | (opcional) Indexa apenas essa plataforma. Sem o param, indexa todas. |

**Exemplos**
```
POST /roms/sync
POST /roms/sync?platform=gba
```

**Response**
```json
{
  "results": [
    { "platform": "gba", "indexed": 2, "skipped": 90 },
    { "platform": "snes", "indexed": 0, "skipped": 879 }
  ]
}
```

| Campo     | Descrição |
|-----------|-----------|
| `indexed` | Arquivos inseridos ou atualizados |
| `skipped` | Arquivos sem alteração (size + modified iguais) |
