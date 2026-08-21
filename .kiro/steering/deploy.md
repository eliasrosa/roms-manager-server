---
inclusion: auto
name: deploy
description: Use quando o usuário perguntar sobre deploy, CI/CD, GitHub Actions, ZimaOS, ou pipeline de entrega.
---

# Deploy — ZimaOS

## Visão Geral

O deploy é automático via **GitHub Actions** com um **self-hosted runner** instalado no ZimaOS.  
Qualquer push na branch `main` dispara o workflow.

---

## Fluxo do Pipeline

```
push main → checkout → docker build → SSH deploy
```

1. **Checkout** — `actions/checkout@v5`
2. **Build** — `docker build -t roms-manager:latest .` (no próprio ZimaOS)
3. **Deploy** — SSH para `docker compose up -d --force-recreate` no diretório do CasaOS

---

## Arquivo do Workflow

`.github/workflows/deploy-zimaos.yaml`

---

## Infraestrutura ZimaOS

| Item | Valor |
|------|-------|
| Runner | Self-hosted, instalado em `/media/ZimaOS-HD/AppData/actions-runner` |
| App dir (CasaOS) | `/var/lib/casaos/apps/roms-manager` |
| Volume ROMs | `/media/ZimaOS-HD/Roms` → `/data` no container |
| Volume MongoDB | `/media/ZimaOS-HD/AppData/.mongo/roms-manager` |
| Docker config | `/media/ZimaOS-HD/AppData/actions-runner/docker-config` |

---

## Regras

- **Nunca** usar `sudo` no workflow — o runner não tem permissão. Usar SSH para operações que precisam de root.
- O deploy usa a imagem local (`pull_policy: never`) — não publica no Docker Hub.
- O compose de produção é o `docker-compose-zimaos.yml` (não o `docker-compose.yml` de dev).
- Secrets SSH configurados no GitHub Actions (não commitar chaves).

---

## Setup do Runner

Script de referência em `.zimaos/install.sh` — usado apenas uma vez para configurar o runner.

---

## Troubleshooting

| Problema | Causa provável | Solução |
|----------|---------------|---------|
| `permission denied` no compose | Runner sem acesso ao dir do CasaOS | Usar SSH com usuário privilegiado |
| `disk space 0 MB` | Cache Docker acumulado no disco do sistema | `docker system prune -af` no ZimaOS |
| Build OK mas container não sobe | Porta 8080 já em uso / Mongo não healthy | Verificar logs: `docker compose logs app` |
