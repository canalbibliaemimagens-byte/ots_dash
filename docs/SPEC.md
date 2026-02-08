# OTS Dashboard — Especificação Técnica

## Visão Geral

Dashboard web para monitoramento e controle da frota de bots Oracle Trader v2.
Deploy no **Vercel** com Next.js.

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────────────────┐
│                         VERCEL (Next.js)                            │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ Fleet View   │  │ Bot Detail   │  │ Command Center           │  │
│  │ (all bots)   │  │ (single bot) │  │ (controls)               │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
│                             │                                       │
│                    ┌────────▼────────┐                              │
│                    │  WebSocket Hook │                              │
│                    │  (useHub)       │                              │
│                    └────────┬────────┘                              │
└─────────────────────────────┼───────────────────────────────────────┘
                              │ wss://
                    ┌─────────▼─────────┐
                    │    OTS Hub        │
                    │ 163.176.175.219   │
                    └───────────────────┘
```

---

## Protocolo WebSocket

### Conexão
```
wss://hub-ip:8000/ws/dashboard-{session_id}
```

### Autenticação
```json
→ {"type": "auth", "payload": {"token": "...", "role": "admin"}}
← {"type": "ack", "payload": {"status": "authenticated"}}
```

### Mensagens Recebidas (Hub → Dashboard)

#### 1. Telemetria (streaming)
```json
← {
  "type": "telemetry",
  "instance_id": "bot-v2-conta1",
  "payload": {
    "balance": 10500.00,
    "equity": 10520.00,
    "floating_pnl": 20.00,
    "status": "RUNNING",
    "open_positions": [
      {
        "symbol": "EURUSD",
        "direction": "BUY",
        "volume": 0.01,
        "pnl": 20.00,
        "open_price": 1.0850,
        "current_price": 1.0870
      }
    ],
    "timestamp": 1770503610
  }
}
```

#### 2. Sinais (quando bot gera sinal)
```json
← {
  "type": "signal",
  "instance_id": "bot-v2-conta1",
  "payload": {
    "symbol": "EURUSD",
    "direction": "BUY",
    "confidence": 0.78,
    "hmm_state": "BULL",
    "timestamp": 1770503610
  }
}
```

#### 3. Alertas
```json
← {
  "type": "alert",
  "instance_id": "bot-v2-conta1",
  "payload": {
    "level": "warning|error|info",
    "message": "Daily loss limit reached",
    "timestamp": 1770503610
  }
}
```

### Mensagens Enviadas (Dashboard → Hub)

#### 1. Comandos
```json
→ {
  "type": "command",
  "id": "cmd-uuid",
  "payload": {
    "target": "bot-v2-conta1",  
    "action": "pause|resume|close_all|status",
    "params": {}
  }
}

← {"type": "ack", "payload": {"ref_id": "cmd-uuid", "status": "success"}}
```

#### 2. Subscription (filtrar bots)
```json
→ {
  "type": "subscribe",
  "payload": {
    "instances": ["bot-v2-conta1", "bot-v2-conta2"],
    "events": ["telemetry", "signal", "alert"]
  }
}
```

---

## Metadata de Ordens (Comment)

O Executor do Trader insere metadados no campo `comment` de cada ordem.
O Dashboard pode extrair essas informações para exibição detalhada.

### Formato do Comment
```
OV2|EURUSD|BUY|0.78|BULL|1770503610
```

| Campo | Descrição |
|-------|-----------|
| `OV2` | Identificador (Oracle V2) |
| `EURUSD` | Símbolo |
| `BUY` | Direção |
| `0.78` | Confiança do modelo (0-1) |
| `BULL` | Estado HMM |
| `1770503610` | Timestamp Unix |

### Uso no Dashboard
- **Trade History**: Mostrar confiança e estado HMM de cada trade
- **Análise**: Correlacionar performance com nível de confiança
- **Filtros**: Filtrar trades por estado HMM ou range de confiança

### Extração
```javascript
function parseOrderComment(comment) {
  const parts = comment.split('|');
  if (parts[0] !== 'OV2') return null;
  return {
    symbol: parts[1],
    direction: parts[2],
    confidence: parseFloat(parts[3]),
    hmmState: parts[4],
    timestamp: parseInt(parts[5])
  };
}
```

---

## REST Endpoints (OTS Hub)

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/health` | GET | Status básico |
| `/api/v1/status` | GET | Status detalhado |
| `/api/v1/telemetry/{id}` | GET | Última telemetria |
| `/api/v1/telemetry/{id}/history` | GET | Histórico (futuro) |
| `/api/v1/command` | POST | Enviar comando |
| `/api/v1/instances` | GET | Lista de bots |

---

## Páginas e Componentes

### 1. Fleet Overview (`/`)
- **Grid de bots** com status cards
- **Métricas agregadas**: Total balance, Total PnL, Bots online
- **Alertas recentes**
- **Quick actions**: Pause All, Resume All

### 2. Bot Detail (`/bot/[id]`)
- **Header**: Status, Balance, Equity, Uptime
- **Chart**: Equity curve (tempo real)
- **Positions Table**: Open positions com PnL live
- **Trade History**: Últimos trades
- **Controls**: Pause, Resume, Close All, Force Sync
- **Logs**: Stream de eventos

### 3. Signals (`/signals`)
- **Timeline** de sinais gerados por todos os bots
- **Filtros**: Por bot, símbolo, direção, período
- **Estatísticas**: Win rate, média de confiança

### 4. Settings (`/settings`)
- **Conexão Hub**: URL, Token
- **Notificações**: Telegram, Email (futuro)
- **Thresholds**: Alertas de drawdown, loss limit

---

## Features Essenciais

### Real-time
- [ ] Telemetria live (WebSocket)
- [ ] Equity chart atualizado a cada 1s quando posição aberta
- [ ] Notificações sonoras para alertas
- [ ] Badge de status com cores (🟢 Running, 🟡 Idle, 🔴 Error)

### Controles
- [ ] Pausar/Resumir bot individual
- [ ] Pausar/Resumir todos
- [ ] Fechar todas posições de um bot
- [ ] Forçar reconexão

### Monitoramento
- [ ] Lista de bots com status
- [ ] Posições abertas por bot
- [ ] PnL flutuante em tempo real
- [ ] Histórico de trades do dia
- [ ] Alertas de limite (drawdown, loss)

### Métricas
- [ ] Total balance consolidado
- [ ] Total PnL do dia
- [ ] Win rate (se disponível)
- [ ] Quantidade de trades

---

## Stack Proposta

| Componente | Tecnologia |
|------------|------------|
| Framework | Next.js 14 (App Router) |
| Deploy | Vercel |
| Estilo | TailwindCSS + shadcn/ui |
| Charts | Recharts ou Lightweight Charts |
| State | Zustand ou Context API |
| WebSocket | native WebSocket + custom hook |

---

## Variáveis de Ambiente

```env
# Vercel env vars
NEXT_PUBLIC_HUB_URL=wss://163.176.175.219:8000
NEXT_PUBLIC_HUB_TOKEN=OTS_HUB_TOKEN_0702226
```

---

## Fluxo de Dados

```
1. Dashboard conecta → ws://hub/ws/dashboard-{uuid}
2. Envia auth com role="admin"
3. Hub autentica e adiciona à lista de admins
4. Hub faz broadcast de telemetria de todos bots → Dashboard
5. Dashboard exibe em real-time
6. Admin envia comando → Hub roteia para bot específico
7. Bot responde → Hub encaminha para Dashboard
```

---

## Próximos Passos

1. **Fase 1**: Scaffolding Next.js + conexão WebSocket básica
2. **Fase 2**: Fleet Overview com cards de status
3. **Fase 3**: Bot Detail com controles
4. **Fase 4**: Charts e histórico
5. **Fase 5**: Alertas e notificações
