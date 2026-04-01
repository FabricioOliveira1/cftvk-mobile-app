# Integração Wellhub (Gympass) — CFTVK

> Documento de referência para a integração entre o app CFTVK e a Wellhub Booking API.
> Mantido atualizado a cada passo implementado.

---

## Status Atual

| Fase | Descrição | Status |
|---|---|---|
| Parceria | Gym ID + Partners Portal | ✅ Concluído |
| Auth Token | Token de autenticação da API | ⏳ Aguardando Wellhub |
| Secret Key | Chave HMAC para validar webhooks | ⏳ Aguardando Wellhub |
| Tipos Firestore | Campos `source`, `wellhubSlotId`, etc. | ✅ Implementado |
| `wellhubWebhook` | Cloud Function HTTP (recebe reservas) | ✅ Implementado |
| `syncClassToWellhub` | Cloud Function callable (registra slots) | ✅ Implementado |
| Badge UI | Badge "Wellhub" na lista de presença | ✅ Implementado |
| Deploy | Deploy das functions para produção | ⏳ Aguardando token |
| Secrets config | Configurar secrets no GCP | ⏳ Aguardando token |
| Sandbox test | Testar end-to-end no Sandbox Wellhub | ⏳ Aguardando token |
| Registro de slots | Sincronizar aulas CFTVK → Wellhub | ⏳ Aguardando token |

---

## Credenciais Necessárias

| Variável | Descrição | Onde obter |
|---|---|---|
| `WELLHUB_AUTH_TOKEN` | Bearer token para chamar a API Wellhub | Partners Portal > API / Wellhub Tech Sales |
| `WELLHUB_SECRET_KEY` | Chave HMAC-SHA1 para validar webhooks (máx 100 chars) | Você define e envia ao Wellhub Tech Sales |
| `WELLHUB_GYM_ID` | ID do seu gym no sistema Wellhub | Já disponível (parceria ativa) |
| `WELLHUB_CLASS_ID` | ID da "classe" no Wellhub (ex: CrossFit genérico) | Partners Portal > Classes/Produtos |

**Como configurar os secrets no Firebase (após obter os valores):**
```bash
firebase functions:secrets:set WELLHUB_AUTH_TOKEN
firebase functions:secrets:set WELLHUB_SECRET_KEY
firebase functions:secrets:set WELLHUB_GYM_ID
firebase functions:secrets:set WELLHUB_CLASS_ID
```

---

## Ambientes

| Ambiente | URL Base |
|---|---|
| Produção | `https://api.partners.gympass.com` |
| Sandbox | `https://apitesting.partners.gympass.com` |

**Para usar o Sandbox:** alterar `WELLHUB_BASE_URL` nos secrets para a URL de sandbox durante os testes.

---

## Fluxo de Dados

```
Usuário Wellhub              Wellhub                    CFTVK Firebase
     |                          |                               |
     |-- Reserva aula --------->|                               |
     |                          |-- POST /wellhubWebhook ------>|
     |                          |   X-Gympass-Signature: ...    |
     |                          |   event_type: booking-requested|
     |                          |   event_data.slot.id: <id>    |
     |                          |   event_data.user.name: "..."  |
     |                          |                               |-- Valida HMAC
     |                          |                               |-- Busca classe por wellhubSlotId
     |                          |                               |-- Verifica capacidade
     |                          |                               |-- Cria reserva {source:'wellhub'}
     |                          |<- PATCH RESERVED -------------|
     |<-- Confirmação ----------|                               |
     |                          |                      Lista de presença mostra "Wellhub"
```

**Cancelamento:**
```
     |-- Cancela no Wellhub --->|                               |
     |                          |-- POST booking-canceled ------>|
     |                          |                               |-- Deleta reserva por bookingNumber
     |                          |<- 200 OK -------------------- |
```

---

## Webhook — Payload Recebido

**Booking:**
```json
{
  "event_type": "booking-requested",
  "event_data": {
    "user": {
      "unique_token": "string",
      "name": "Nome do Usuário",
      "email": "email@exemplo.com"
    },
    "slot": {
      "id": 12345,
      "gym_id": 99999,
      "class_id": 111,
      "booking_number": "BK-ABC123"
    },
    "timestamp": 1234567890,
    "event_id": "evt-xyz"
  }
}
```

**Cancelamento:** mesmo schema, `event_type: "booking-canceled"` ou `"booking-late-canceled"`.

**Header de autenticação:** `X-Gympass-Signature: <HMAC-SHA1 hex uppercase do body>`

---

## URL do Webhook (configurar no Partners Portal)

Após o primeiro deploy:
```
https://us-central1-cftvk-edcff.cloudfunctions.net/wellhubWebhook
```
Configurar esta URL em: Partners Portal > Integrações > Webhook URL

---

## Estrutura Firestore — Campos Adicionados

**Collection `classes`:**
```
wellhubSlotId?: string   // ID do slot no Wellhub após sincronização
```

**Collection `reservations`:**
```
source?: 'app' | 'wellhub'          // origem da reserva (ausente = 'app' para dados legados)
wellhubBookingNumber?: string        // ex: "BK-ABC123" — usado para cancelamentos
wellhubUserName?: string             // nome exibido na lista de presença
wellhubUserId?: string               // unique_token do usuário no Wellhub
```
Para reservas Wellhub, `userId` é definido como `wellhub_<unique_token>` (não existe na collection `users`).

---

## Cloud Functions Implementadas

### `wellhubWebhook` (onRequest — HTTP público)
- Arquivo: `functions/src/index.ts`
- Valida assinatura HMAC-SHA1 (`X-Gympass-Signature`)
- `booking-requested`: verifica capacidade → cria reserva → PATCH RESERVED/REJECTED
- `booking-canceled` / `booking-late-canceled`: deleta reserva por `wellhubBookingNumber`
- Responde HTTP 200 imediatamente (Wellhub requer < 1 segundo)
- Secrets: `WELLHUB_AUTH_TOKEN`, `WELLHUB_SECRET_KEY`, `WELLHUB_GYM_ID`

### `syncClassToWellhub` (onCall — admin only)
- Arquivo: `functions/src/index.ts`
- Recebe: `{ classId: string, wellhubClassId: string }`
- Cria um "slot" no Wellhub para a aula CFTVK
- Salva `wellhubSlotId` de volta no documento da aula no Firestore
- Secrets: `WELLHUB_AUTH_TOKEN`, `WELLHUB_GYM_ID`

---

## UI — Badge "Wellhub"

- Arquivo: `app/class-detail.tsx`
- Na aba "LISTA DE PRESENÇA", reservas com `source === 'wellhub'` mostram badge verde "Wellhub" no lugar do plano
- Nome exibido: `wellhubUserName` do documento de reserva
- Avatar segue o mesmo padrão mas sem badge "EU"

---

## ✅ CHECKPOINT — 2026-03-29

### O que foi implementado nesta sessão

| Arquivo | O que mudou |
|---|---|
| `src/types/index.ts` | `Class.wellhubSlotId`, `Reservation.source/wellhubBookingNumber/wellhubUserName/wellhubUserId` |
| `functions/src/index.ts` | `wellhubWebhook` (HTTP + HMAC) e `syncClassToWellhub` (callable admin) |
| `app/class-detail.tsx` | Badge verde "Wellhub" na lista de presença |
| `WELLHUB_INTEGRATION.md` | Este documento criado |

**Código pronto, aguardando credenciais para deploy e testes.**

---

## Próximos Passos (retomar quando tiver o Auth Token)

1. **Configurar secrets** via `firebase functions:secrets:set`
2. **Deploy:**
   ```bash
   "C:\Program Files\nodejs\node.exe" "C:\Users\fabri\AppData\Roaming\npm\node_modules\firebase-tools\lib\bin\firebase.js" deploy --only functions:wellhubWebhook,functions:syncClassToWellhub
   ```
3. **Configurar webhook URL** no Partners Portal Wellhub
4. **Testar no Sandbox:** simular booking-requested e verificar reserva criada no Firestore
5. **Sincronizar slots:** para cada aula ativa, chamar `syncClassToWellhub` com o `wellhubClassId` correto
6. **Ir para produção:** trocar `WELLHUB_BASE_URL` secret para URL de produção

---

## Notas Técnicas

- Node.js 24: `fetch` nativo disponível, sem necessidade de `node-fetch`
- Timeout Wellhub: 1 segundo para resposta HTTP, 15 minutos para o PATCH de confirmação
- Retry: Wellhub tenta 3x em caso de timeout
- `reason_category` válidos para REJECTED: `CLASS_IS_FULL`, `USAGE_RESTRICTION`, `USER_ALREADY_BOOKED`
- Fuso horário Brasil: offset `-03:00` nos `occur_date` enviados ao Wellhub
