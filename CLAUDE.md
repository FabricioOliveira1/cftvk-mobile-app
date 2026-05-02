# IA_CONTEXT.md — Contexto do Projeto CFTVK para Retomada de Sessão

> Este arquivo é mantido pela IA para preservar contexto entre sessões.
> Última atualização: 2026-02-28

---

## Visão Geral do Projeto

**CFTVK** é um app mobile de gestão de box de CrossFit, construído com **React Native + Expo (expo-router)** e **Firebase** como backend.

O app possui dois perfis principais:
- **Admin**: gerencia aulas, alunos, coaches
- **Student/Coach**: agenda e acompanha treinos (mesma UI por enquanto)

---

## Stack Tecnológica

- **Framework**: React Native com Expo SDK
- **Roteamento**: expo-router (file-based routing com grupos de rota)
- **Backend**: Firebase (Firestore + Auth + Cloud Functions)
- **Linguagem**: TypeScript
- **Ícones**: MaterialIcons via componente `Icon` wrapper
- **Fontes**: Inter (sans, sansMedium, sansBold), Montserrat (display)
- **Tema**: arquivo `theme.ts` na raiz com `Colors` e `Fonts`

---

## Estrutura de Arquivos (Estado: 2026-02-28)

```
app/
├── _layout.tsx               ← Root layout: AuthProvider + guards + redirect por role
├── index.tsx                 ← Tela de login
├── class-detail.tsx          ← Detalhe de aula (treino + lista de presença)
├── edit-member.tsx           ← Criar/editar membro (admin)
├── member-profile.tsx        ← Perfil de membro (admin)
├── new-class.tsx             ← Criar/editar aula (modal; suporta id param para edição)
├── (admin)/                  ← Tabs do admin
│   ├── _layout.tsx           ← Tab bar: Início | Agenda | Membros | Ajustes
│   ├── dashboard.tsx
│   ├── schedule.tsx
│   ├── members.tsx
│   └── settings.tsx
└── (student)/                ← Tabs de aluno e coach
    ├── _layout.tsx           ← Tab bar: Início | Agenda | Histórico | Perfil
    ├── dashboard.tsx
    ├── schedule.tsx
    ├── history.tsx           ← Histórico de reservas do aluno
    └── profile.tsx           ← Perfil do aluno (meu perfil)

components/
├── ClassListItem.tsx         ← Card de aula com reserva/cancelamento/check-in/loading
├── Icon.tsx                  ← Wrapper de MaterialIcons
├── ScreenHeader.tsx          ← Header com logo TVK e nome do usuário
├── SearchFilterHeader.tsx    ← Campo de busca + botão de filtro (com indicador ativo)
├── StatCard.tsx
├── ListItem.tsx
├── LoadingScreen.tsx
├── FAB.tsx
└── ActionButton.tsx

src/
├── context/
│   ├── index.ts
│   └── AuthContext.tsx       ← firebaseUser, appUser (com role), loading, signOut
├── services/
│   ├── classService.ts
│   ├── memberService.ts
│   ├── reservationService.ts
│   ├── userService.ts
│   ├── boxService.ts
│   ├── firebase.ts
│   └── index.ts              ← re-exporta tudo
└── types/
    └── index.ts
```

---

## Modelo de Dados (tipos TypeScript + Firestore)

```typescript
type UserRole = 'admin' | 'coach' | 'student';

interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  plan?: string;              // ex: 'Trimestral - VIP'
  enrollmentActive?: boolean; // status da matrícula
  phone?: string;
  birthDate?: string;
  createdAt: Timestamp;
}

interface Class {
  id: string;
  title: string;              // ex: 'Crossfit'
  coach: string;              // nome do coach
  date: string;               // YYYY-MM-DD
  time: string;               // HH:mm
  capacity: number;
  createdBy: string;          // userId do admin
  sessions?: Session[];
}

interface Session {
  id: string;
  title: string;              // ex: 'Aquecimento', 'WOD'
  details: string;
}

type ReservationStatus = 'BOOKED' | 'NO_SHOW';

interface Reservation {
  id: string;
  userId: string;
  classId: string;
  status: ReservationStatus;
  classDate?: string;         // YYYY-MM-DD — denormalizado para checar se a aula já passou
  classTime?: string;         // HH:mm      — denormalizado para checar se a aula já passou
  createdAt: Timestamp;
}
```

> **Nota sobre `classDate`/`classTime`**: campos opcionais (reservas antigas não os têm).
> São gravados automaticamente em toda nova reserva para suportar a regra "1 reserva por vez"
> sem precisar buscar o documento de aula correspondente.

---

## Contexto de Autenticação

```typescript
const { appUser, firebaseUser, loading, signOut } = useAuth();
// appUser.role === 'admin'   → administrador
// appUser.role === 'coach'   → coach (usa UI de aluno por enquanto)
// appUser.role === 'student' → aluno
```

---

## Navegação por Role (`app/_layout.tsx`)

```typescript
if (appUser.role === 'admin') {
  router.replace('/(admin)/dashboard');
} else {
  // student e coach
  router.replace('/(student)/dashboard');
}
```

Rotas protegidas checadas: `(admin)`, `(student)`, `member-profile`, `edit-member`, `class-detail`, `new-class`.

---

## Serviços disponíveis (`src/services/`)

### classService.ts
- `getClassesByDate(date: string): Promise<Class[]>`
- `createClass(createdBy, payload): Promise<string>`
- `updateClass(id, payload): Promise<void>` ← httpsCallable CF `updateClass` (sincroniza `classDate`/`classTime` nas reservas BOOKED)
- `deleteClass(id): Promise<void>` ← httpsCallable CF `deleteClass` (cascade: deleta reservas vinculadas)
- `getMemberCount(): Promise<number>`
- `getClassCountForToday(): Promise<number>`

### reservationService.ts
- `getReservationsByClass(classId): Promise<Reservation[]>`
- `getReservationCount(classId): Promise<number>`
- `cancelReservation(reservationId): Promise<void>`
- `createReservation(classId, userId, classDate?, classTime?): Promise<string>` ← salva `status: 'BOOKED'`
- `getUserReservationForClass(classId, userId): Promise<Reservation | null>`
- `getUserActiveReservationCount(userId): Promise<number>` ← filtra `status == 'BOOKED'` + aula não passou
- `getHistoryPage(userId, pageSize, lastDoc?): Promise<{ docs, lastDoc }>` ← cursor pagination; query `classDate <= hoje, orderBy classDate DESC, limit`; requer índice composto `(userId ASC, classDate DESC)` — **criado**

### memberService.ts
- `getMembers(): Promise<AppUser[]>`
- `getCoaches(): Promise<AppUser[]>`
- `updateMember(uid, data: Partial<Omit<AppUser, 'id'|'createdAt'>>): Promise<void>`
- `deleteMember(uid): Promise<void>`
- `createMember(name, email, role, password): Promise<void>`

---

## Regras de Negócio — Status de Reserva

### Status (`ReservationStatus`)
```typescript
type ReservationStatus = 'BOOKED' | 'NO_SHOW';
```

| Status | Significado |
|---|---|
| `BOOKED` | Reserva ativa |
| `NO_SHOW` | Aula passou sem cancelamento; definido pelo scheduler `markNoShows` |

> **Nota**: Check-in foi removido do modelo. O app opera apenas com agendamento/reserva.

### Cloud Functions (`functions/src/index.ts`)
- **`markNoShows`** (`onSchedule`, every 15 min): query `status == BOOKED` AND `classDate <= hoje`; batch update para `NO_SHOW` — libera o slot "1 reserva ativa" após a aula passar
- **`createUser`** (`onCall`): admin-only; sanitiza role (nunca `admin`); chama `setCustomUserClaims` após criar
- **`deleteUser`** (`onCall`): admin-only; deleta auth + Firestore `users/{uid}` + **cascade**: todas as `reservations` e `prs` do usuário em batch atômico
- **`deleteClass`** (`onCall`): admin-only; deleta `classes/{classId}` + **cascade**: todas as `reservations` vinculadas em batch atômico
- **`updateClass`** (`onCall`): admin-only; atualiza `classes/{classId}` e sincroniza `classDate`/`classTime` nas reservas BOOKED
- **`syncAllUserClaims`** (`onCall`): admin-only; one-time migration — **já executado** (2026-02-27)
- **`migrateReservations`** (`onCall`): migração one-time de `checkedIn: boolean` → `status` — **já executado**

### Segurança (Firestore Rules — `firestore.rules`)
- `reservations`: `create` permitido pelo client (próprio userId, status BOOKED); `update: false` (só admin SDK/scheduler); `delete` permitido (cancelamento pelo próprio aluno)

### UI (client-side)
- **`ClassListItem.tsx`**: `historyMode=true` → sem badge de status; com reserva + aula encerrada/`NO_SHOW` → badge "Encerrado"; com reserva ativa → botão "Cancelar"
- **`(student)/dashboard.tsx`** e **`(student)/schedule.tsx`**: sem timer 30s, sem check-in
- **`class-detail.tsx`**: lista de presença mostra nome + plano; admin vê botão `...` (Ver Perfil / Cancelar Reserva)

---

## Regras de Negócio — Reservas de Aulas (aluno/coach)

Implementadas em `handleReserve` de `(student)/dashboard.tsx` e `(student)/schedule.tsx`.

### Regra 1 — Janela de abertura (12h antes)
> A reserva só fica disponível a partir de **12h antes do início da aula**.

- Aula às 06:00 → reservas abrem às 18:00 do dia anterior
- Aula às 20:00 → reservas abrem às 08:00 do mesmo dia
- Bloqueio: `now < classStart - 12h`
- Mensagem: _"As reservas para esta aula abrem [hoje/amanhã/DD/MM] às HH:mm."_

### Regra 2 — Prazo de encerramento (15min antes)
> A reserva encerra **15 minutos antes do início da aula**.

- Aula às 20:00 → último horário de reserva às 19:45
- Bloqueio: `now > classStart - 15min`
- Mensagem: _"As reservas para esta aula encerraram 15 minutos antes do início."_

### Regra 3 — Limite de 1 reserva ativa por vez
> O aluno só pode ter **1 aula reservada por vez** (não pode acumular reservas futuras).

- Ao tentar reservar, consulta `getUserActiveReservationCount(userId)`
- Conta reservas onde `status == 'BOOKED'` E a aula ainda não aconteceu (usando `classDate`/`classTime`)
- Se `count >= 1` → bloqueia
- Mensagem: _"Você já possui uma aula reservada. Cancele a reserva atual para agendar uma nova."_

### Ordem de validação em `handleReserve`
1. Verificação de capacidade (lotada)
2. Janela de abertura (12h)
3. Prazo de encerramento (15min)
4. Limite de 1 reserva ativa → query Firestore aqui (só chega neste ponto se as regras anteriores passarem)
5. Criar reserva com `classDate` e `classTime` gravados

> **Importante**: as regras 1 e 2 são validadas client-side (sem I/O). A regra 3 faz uma query Firestore,
> por isso fica por último para minimizar leituras desnecessárias.

> **Nota**: Estas regras se aplicam apenas a `(student)/`. O grupo `(admin)/` não tem restrições de reserva.

---

## Funcionalidades Implementadas

### `app/_layout.tsx`
- Guard de autenticação: redireciona para login se não autenticado
- Redirect por role: admin → `/(admin)/dashboard`, outros → `/(student)/dashboard`

### `app/(admin)/_layout.tsx`
- Tab bar com 4 abas: Início | Agenda | Membros | Ajustes
- **Guard de role**: redireciona para `/(student)/dashboard` se usuário autenticado não for admin

### `app/class-detail.tsx`
- Abas: "Treino" (sessões/WOD) e "Lista de Presença"
- Footer dinâmico:
  - Aba Treino: botão Reservar / Cancelar (todos os usuários)
  - Aba Presença (só admin): **Editar Aula** (→ `/new-class?id=X`) + **Excluir Aula**
- Check-in de alunos pelo admin
- **Excluir Aula**: avisa sobre reservas ativas ("Esta aula possui N aluno(s) com reserva ativa. As reservas serão canceladas automaticamente.") antes de confirmar exclusão; usa CF `deleteClass` que realiza cascade

### `app/edit-member.tsx`
- Cria novo membro (via Cloud Function `createUser`) ou edita existente
- Campos: nome, email, senha inicial (só criação), telefone, data nasc., tipo, plano, status matrícula
- Salva: `name`, `role`, `phone`, `birthDate`, `plan`, `enrollmentActive` via `updateMember`
- Após `deleteMember` redireciona para `/(admin)/members`

### `app/(admin)/members.tsx`
- Busca por nome
- Filtro por: Perfil (coach/aluno), Status da Matrícula (ativo/inativo), Plano
- Filtros em bottom sheet modal com estado pendente até "APLICAR FILTROS"
- Indicador visual (ponto dourado) no botão quando há filtros ativos

### `app/(admin)/new-class.tsx`
- Cria ou edita aula (detecta via `isEditing = !!id`)
- Seletor de data, horário, coach, capacidade, múltiplas sessões

### `app/(student)/dashboard.tsx`
- **Card "Próxima Aula"**: busca aula do dia com reserva `status === 'BOOKED'` do aluno e horário >= agora
- **Card "PRs Recentes"**: busca `getUserPRs` e exibe o mais recente; botão "Novo PR" → `/prs`
- **Seção "Aulas de Hoje"**: scroll horizontal de `ClassListItem` com reserve/cancel/check-in
- `computeNextClass()` recalcula via setter funcional após cada reserve/cancel/check-in
- Helper `isInCheckInWindow(date, time)`: retorna `true` se `classStart <= now <= classStart+15min`
- Timer 30s: força re-render periódico para transição automática do botão Cancelar → Check-in

### `app/(student)/schedule.tsx`
- Seletor de 7 dias (hoje + 6 próximos)
- Lista de aulas do dia selecionado com reserva/cancelamento/check-in
- Mesmas regras de negócio de reserva do dashboard
- Estado `reservationStatuses: Record<string, ReservationStatus>` para rastrear status por aula
- `load()` captura `status` junto com `reservationId` ao buscar reservas do usuário
- Helper `isInCheckInWindow` e timer 30s (mesmo padrão do dashboard)

### `app/(student)/history.tsx`
- `FlatList` com infinite scroll (`onEndReached`, threshold 0.3) — 10 itens por página
- Paginação cursor-based via `getHistoryPage` (`startAfter` Firestore)
- Trigger de histórico: `classDate < hoje` OU `classDate == hoje AND classTime+60min < agora` (aula terminou)
- Filtro client-side para o dia atual usando `isPastClass(classDate, classTime)` — usa `classTime` denormalizado na reserva
- Cards usam `ClassListItem` com `historyMode` — visual idêntico à agenda, sem botões de ação
- Status: `CHECKED_IN` → badge "Presente" (verde) / outros → badge "Faltou" (cinza)
- Tap no card navega para `/class-detail?id=cls.id` (treino e sessões completos)
- Índice composto Firestore: `reservations (userId ASC, classDate DESC)` — **criado**

### `app/(student)/profile.tsx`
- Exibe: avatar, nome, role, email, telefone, data nasc., plano, status matrícula
- Botão de logout

---

## Padrões e Convenções

1. **Estilos**: `StyleSheet.create` inline no mesmo arquivo — sem CSS externo
2. **Cores**: sempre `Colors.*` de `theme.ts`
3. **Fontes**: sempre `Fonts.*` de `theme.ts`
4. **Ícones**: `<Icon name="..." />` (MaterialIcons)
5. **Navegação**: `router.push({ pathname: '/rota', params: { id } })`
6. **SafeAreaView**: de `react-native-safe-area-context` com `edges={['bottom']}` quando há header Stack
7. **Modais/bottom sheets**: `Modal` com `Pressable` backdrop + `View` sheet + handle cinza no topo
8. **Admin-only**: checar `appUser?.role === 'admin'`
9. **Editar aula**: navegar para `/new-class` com `params: { id }` — **não criar edit-class.tsx**
10. **`handleReserve` em telas de aluno**: recebe objeto `Class` completo (não `classId, capacity`)

---

## Arquitetura de Segurança (Auth/Authorization)

### Camadas (Defense in Depth)

```
JWT Custom Claims  →  Firestore Rules  →  Cloud Functions  →  UI Guards
(role no token)       (enforcement DB)    (lógica negócio)    (UX apenas)
```

### Custom Claims Firebase
- **O que é**: campo `{ role }` embutido no token JWT do Firebase Auth
- **Como funciona**: definido pela CF `createUser` (novas contas) e `syncAllUserClaims` (migração)
- **Vantagem**: verificação sem leitura do Firestore (0 reads extras por operação)
- **Estado atual**: todos os usuários existentes sincronizados em 2026-02-27; novas contas recebem automaticamente

### Fluxo de Autenticação (`src/context/AuthContext.tsx`)
1. `onAuthStateChanged` detecta login
2. `fbUser.getIdToken(true).catch(() => {})` — força refresh do token para receber claims atualizados (erro não bloqueia login)
3. `getDoc('users/{uid}')` — carrega perfil do Firestore para dados de UI (`name`, `plan`, etc.)

### Proteções Implementadas

| Vetor de Ataque | Proteção |
|---|---|
| Aluno se auto-promove para admin | Firestore Rule: `update` bloqueia mudança no campo `role` |
| Unauthenticated cria conta admin | CF `createUser`: exige auth + role admin do caller + `safeRole` (nunca 'admin') |
| Unauthenticated deleta qualquer conta | CF `deleteUser`: exige auth + role admin do caller |
| Estudante acessa rotas `/(admin)/` | `(admin)/_layout.tsx`: `useEffect` redireciona não-admins |
| Client altera `status` de reserva diretamente | Firestore Rule: `update: false` em `reservations` |

### O que ainda usa Firestore lookup (não custom claim)
As CFs `adminCheckIn` e `migrateReservations` ainda fazem `getDoc('users/{uid}')` para verificar role.
Isso é correto e funcional — a migração para `request.auth.token.role` é uma otimização futura
que requer apenas substituir o `getDoc` por `if (request.auth.token['role'] !== 'admin')`.
A Firestore Rule de `classes` write também ainda usa `get()` document lookup.

---

## Decisões Arquiteturais

| Decisão | Escolha | Motivo |
|---|---|---|
| Tab bars separadas | Grupos `(admin)/` e `(student)/` | UIs completamente diferentes, escalável |
| Coach por ora | Grupo `(student)/` | Mesma UI, separa quando tiver chamada de presença |
| Edição de aula | `/new-class?id=X` | `new-class.tsx` já suporta `isEditing = !!id` |
| `edit-class.tsx` | NÃO criar | Desnecessário |
| SafeAreaView | `edges={['bottom']}` | Evita double padding com header Stack |
| Filtros members | Estado pendente + botão Aplicar | Evita filtragem em tempo real |
| Regras de reserva | Client-side (tempo) + Firestore (1 por vez) | Tempo = sem I/O; contagem = 1 query no final |
| `classDate`/`classTime` em Reservation | Denormalização | Evita N+1 queries para checar se aula passou |
| Check-in | CF `checkIn` + `adminCheckIn` + scheduler `markNoShows` | Server-side time, imutável pelo client |
| `status` em Reservation | `BOOKED \| CHECKED_IN \| NO_SHOW` | Substituiu `checkedIn: boolean`; Firestore Rules bloqueiam update pelo client |
| `migrateReservations` CF | Migração one-time admin-only | Converte docs antigos `checkedIn: boolean` → `status` — já executada |
| Custom Claims Firebase | `{ role }` no token JWT via `setCustomUserClaims` | Elimina lookups de role; definido na criação de usuário e sincronizado one-time |
| `deleteUser`/`createUser` CF | Auth + admin check obrigatório | Impede deleção/criação por não-admins ou unauthenticated |
| `role` imutável pelo client | Firestore Rule: `update` bloqueia mudança de `role` | Impede auto-promoção de privilégio |
| Guard admin em `(admin)/_layout.tsx` | `useEffect` redireciona não-admins | Defense in depth além do root layout |
| `markNoShows` filtro de data | `where('classDate', '<=', todayStr)` | Limita reads do scheduler a reservas passadas, controlando custo com crescimento |
| Cascade delete de usuário | CF `deleteUser`: batch reservas + PRs + auth + user doc | Evita registros órfãos no Firestore; operação atômica via batch |
| Cascade delete de aula | CF `deleteClass`: batch aula + reservas vinculadas | Evita reservas órfãs; substitui `deleteDoc` client-side (sem permissão para cascade) |
| `updateClass` via CF | CF `updateClass`: atualiza aula + sincroniza `classDate`/`classTime` nas reservas BOOKED | Mantém campos denormalizados consistentes; Firestore Rules bloqueiam `update` pelo client |
| Check-in window UI | Timer 30s + `isInCheckInWindow()` no client | Botão transita automaticamente Cancelar → Check-in sem reload da tela |
| Aviso antes de excluir aula | `handleDeleteClass` conta `BOOKED` e exibe alerta customizado | UX profissional: admin ciente do impacto antes de confirmar ação destrutiva |

---

## Pendências / Débito Técnico

- [x] PRs Recentes: implementado (`prService.ts`, tela `app/prs.tsx`, card no dashboard)
- [x] Cascade delete de usuário: CF `deleteUser` agora deleta reservas + PRs em batch atômico (2026-02-28)
- [x] Cascade delete de aula: CF `deleteClass` agora deleta reservas vinculadas em batch atômico (2026-02-28)
- [x] Sync `classDate`/`classTime` ao editar aula: CF `updateClass` atualiza campos denormalizados nas reservas BOOKED (2026-02-28)
- [x] Check-in UI no card da aula: `ClassListItem` exibe botão "Check-in" na janela de 15min e "Confirmado" após check-in (2026-02-28)
- [x] Histórico com paginação: `history.tsx` reescrito com `FlatList` + cursor pagination + `ClassListItem` com `historyMode`; índice Firestore criado (2026-02-28)
- [ ] Coach: separar em grupo `(coach)/` quando feature de chamada de presença for implementada
- [ ] Foto do coach/aluno: `AppUser` não tem campo de foto — sempre usa ícone fallback
- [ ] `createMember` (Cloud Function) não recebe `phone`/`birthDate` — só é possível adicionar após criação via edição
- [ ] CFs `adminCheckIn` e `migrateReservations` ainda fazem `getDoc` para checar role (funcional, mas pode migrar para `request.auth.token['role']` no futuro)
- [ ] Firestore Rule de `classes` write ainda usa `get()` document lookup — pode ser otimizado para `request.auth.token.role == 'admin'` após garantir que todos os usuários têm claims
- [ ] Penalidades por NO_SHOW: campo `status === 'NO_SHOW'` disponível no Firestore, lógica de penalidade não implementada
