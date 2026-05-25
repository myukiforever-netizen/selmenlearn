# Phase 1 — MVP Core : Plan de Développement Détaillé

> **Durée :** 8 semaines  
> **Objectif :** Un utilisateur peut créer un compte, importer du contenu texte ou PDF, obtenir des flashcards générées automatiquement par l'IA, et les réviser avec l'algorithme de répétition espacée (SM-2).

---

## Table des Matières

1. [Semaines 1-2 — Setup & Infrastructure](#semaines-1-2--setup--infrastructure)
2. [Semaine 3 — Pipeline d'Ingestion](#semaine-3--pipeline-dingestion)
3. [Semaine 4 — Génération de Flashcards via Claude API](#semaine-4--génération-de-flashcards-via-claude-api)
4. [Semaine 5 — Interface Flashcard](#semaine-5--interface-flashcard)
5. [Semaine 6 — Algorithme SM-2](#semaine-6--algorithme-sm-2)
6. [Semaine 7 — Dashboard & Streak](#semaine-7--dashboard--streak)
7. [Semaine 8 — Tests & Déploiement v0.1](#semaine-8--tests--déploiement-v01)
8. [Résumé Phase 1](#résumé-phase-1)

---

## Semaines 1-2 — Setup & Infrastructure

### Objectif
Projet initialisé, base de données migrée, authentification fonctionnelle, CI/CD opérationnel.

### Stack mis en place
| Outil | Usage |
|---|---|
| Next.js 15 (App Router) | Frontend |
| Hono.js + Node.js | Backend API |
| PostgreSQL + Prisma | Base de données |
| Redis (Upstash) | Cache + job queue |
| Clerk | Authentification |
| Vercel | Déploiement frontend |
| Railway | Déploiement backend |
| GitHub Actions | CI/CD |

### Arborescence complète

```
Selmen Evolution/
├── .gitignore
├── .github/workflows/ci.yml
│
├── selmenlearn/                        ← FRONTEND
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── postcss.config.mjs
│   ├── .env.local.example
│   └── src/
│       ├── middleware.ts               ← Protection Clerk
│       ├── app/
│       │   ├── layout.tsx              ← Root layout (Clerk + ReactQuery)
│       │   ├── page.tsx                ← Landing / redirect
│       │   ├── globals.css
│       │   ├── (auth)/
│       │   │   ├── sign-in/[[...sign-in]]/page.tsx
│       │   │   └── sign-up/[[...sign-up]]/page.tsx
│       │   └── (dashboard)/
│       │       ├── layout.tsx          ← Sidebar + Header
│       │       ├── page.tsx            ← Redirect vers /decks
│       │       └── decks/
│       │           ├── page.tsx        ← Liste des decks
│       │           ├── new/page.tsx    ← Formulaire création
│       │           └── [id]/page.tsx   ← Détail + cartes
│       ├── components/
│       │   ├── ui/
│       │   │   ├── button.tsx
│       │   │   ├── card.tsx
│       │   │   ├── badge.tsx
│       │   │   ├── input.tsx
│       │   │   ├── textarea.tsx
│       │   │   └── progress.tsx
│       │   ├── layout/
│       │   │   ├── Sidebar.tsx
│       │   │   └── Header.tsx
│       │   ├── deck/
│       │   │   ├── DeckCard.tsx
│       │   │   ├── DeckGrid.tsx
│       │   │   ├── NewDeckForm.tsx
│       │   │   ├── CardList.tsx
│       │   │   └── EmptyDecksState.tsx
│       │   ├── landing/
│       │   │   └── LandingPage.tsx
│       │   └── providers/
│       │       └── ReactQueryProvider.tsx
│       ├── lib/
│       │   ├── api.ts
│       │   └── utils.ts
│       ├── stores/
│       │   └── useUserStore.ts
│       └── types/
│           └── index.ts
│
└── selmenlearn-api/                    ← BACKEND
    ├── package.json
    ├── tsconfig.json
    ├── Dockerfile
    ├── .env.example
    ├── prisma/
    │   └── schema.prisma
    └── src/
        ├── index.ts
        ├── middleware/
        │   └── auth.ts
        ├── lib/
        │   ├── prisma.ts
        │   └── redis.ts
        ├── routes/
        │   ├── users.ts
        │   ├── decks.ts
        │   └── cards.ts
        ├── services/
        │   ├── ai.ts
        │   ├── sm2.ts
        │   └── streak.ts
        └── jobs/
            └── cardGenerationQueue.ts
```

### Schéma Base de Données (Prisma)

```prisma
model User {
  id        String    @id @default(cuid())
  clerkId   String    @unique
  email     String    @unique
  name      String?
  xp        Int       @default(0)
  level     Int       @default(1)
  streak    Int       @default(0)
  lastStudy DateTime?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  decks        Deck[]
  cardReviews  CardReview[]
  sessions     Session[]
  achievements Achievement[]
}

model Deck {
  id          String   @id @default(cuid())
  userId      String
  title       String
  description String?
  subject     String?
  sourceType  String   @default("manual")
  isPublic    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user     User      @relation(...)
  cards    Card[]
  sessions Session[]
}

model Card {
  id       String @id @default(cuid())
  deckId   String
  front    String
  back     String
  cardType String @default("definition")

  deck    Deck         @relation(...)
  reviews CardReview[]
  answers SessionAnswer[]
}

model CardReview {
  id           String    @id @default(cuid())
  userId       String
  cardId       String
  easeFactor   Float     @default(2.5)
  interval     Int       @default(1)
  repetitions  Int       @default(0)
  nextReview   DateTime  @default(now())
  lastReviewed DateTime?

  @@unique([userId, cardId])
  @@index([userId, nextReview])
}

model Session {
  id           String    @id @default(cuid())
  userId       String
  deckId       String
  mode         String    @default("sprint")
  startedAt    DateTime  @default(now())
  endedAt      DateTime?
  xpGained     Int       @default(0)
  cardsStudied Int       @default(0)

  answers SessionAnswer[]
}

model SessionAnswer {
  id         String   @id @default(cuid())
  sessionId  String
  cardId     String
  rating     Int
  isCorrect  Boolean
  timeMs     Int
  answeredAt DateTime @default(now())
}

model Achievement {
  id         String   @id @default(cuid())
  userId     String
  badgeId    String
  unlockedAt DateTime @default(now())

  @@unique([userId, badgeId])
}
```

### CI/CD — GitHub Actions

Deux jobs parallèles déclenchés sur `push main` et `pull_request` :
- **frontend** : `npm ci` → `type-check` → `lint` → `build`
- **backend** : `npm ci` → `prisma generate` → `tsc --noEmit`

### Variables d'environnement requises

```bash
# Frontend (.env.local)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
NEXT_PUBLIC_API_URL=http://localhost:4000

# Backend (.env)
NODE_ENV=development
PORT=4000
DATABASE_URL="postgresql://user:pass@localhost:5432/selmenlearn"
REDIS_URL="redis://localhost:6379"
CLERK_SECRET_KEY=sk_test_...
ANTHROPIC_API_KEY=sk-ant-...
```

### Commandes de démarrage

```bash
# Frontend
cd selmenlearn
cp .env.local.example .env.local   # puis remplir les clés
npm install
npm run dev                         # → http://localhost:3000

# Backend
cd selmenlearn-api
cp .env.example .env                # puis remplir les clés
npm install
npm run db:push                     # crée les tables en base
npm run dev                         # → http://localhost:4000
```

---

## Semaine 3 — Pipeline d'Ingestion

### Objectif
Un utilisateur peut coller du texte ou uploader un PDF. Le contenu est découpé en chunks intelligents et mis en file d'attente pour la génération de flashcards.

### Service d'ingestion

```typescript
// src/services/ai.ts

export function splitIntoChunks(text: string, maxTokens: number): string[] {
  // Découpage par paragraphes (double saut de ligne), fusion si trop courts
  const paragraphs = text
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 30);

  const chunks: string[] = [];
  let current = "";

  for (const para of paragraphs) {
    const combined = current ? `${current}\n\n${para}` : para;
    // ~1 token = 4 caractères
    if (combined.length / 4 > maxTokens && current.length > 0) {
      chunks.push(current.trim());
      current = para;
    } else {
      current = combined;
    }
  }

  if (current.trim().length > 0) chunks.push(current.trim());
  return chunks.length > 0 ? chunks : [text.trim()];
}
```

### Pipeline de traitement

```
Contenu brut (texte / PDF)
    ↓
splitIntoChunks() — découpage par concept (max 500 tokens)
    ↓
cardGenerationQueue.add() — mise en file BullMQ
    ↓
[Réponse immédiate au client : { status: "processing" }]
    ↓
[En arrière-plan] Worker BullMQ
    ↓
generateFlashcards() par chunk — appel Claude API
    ↓
prisma.card.create() × N — insertion en base
    ↓
deck.updatedAt = now() — signal de fin
```

### Routes d'import

```
POST /decks              → Créer deck + lancer génération si content fourni
GET  /decks              → Liste des decks de l'utilisateur
GET  /decks/:id          → Détail deck + cartes + stats dues
PATCH /decks/:id         → Modifier titre/description
DELETE /decks/:id        → Supprimer deck (cascade cartes)
```

### Worker BullMQ (traitement asynchrone)

```typescript
// src/jobs/cardGenerationQueue.ts

const worker = new Worker("card-generation", async (job) => {
  const { deckId, userId, content, subject } = job.data;

  const chunks = splitIntoChunks(content, 500);

  for (const [i, chunk] of chunks.entries()) {
    const cards = await generateFlashcards(chunk, subject);

    await prisma.$transaction(
      cards.map(card => prisma.card.create({
        data: {
          deckId, front: card.front, back: card.back, cardType: card.cardType,
          reviews: { create: { userId, nextReview: new Date() } },
        },
      }))
    );

    if (i < chunks.length - 1) await delay(300); // rate limiting
  }

  await prisma.deck.update({ where: { id: deckId }, data: { updatedAt: new Date() } });
}, { connection: redis, concurrency: 3 });
```

---

## Semaine 4 — Génération de Flashcards via Claude API

### Objectif
Intégrer Claude API pour transformer automatiquement chaque chunk de texte en 3 à 8 flashcards pédagogiquement optimisées.

### Prompt Engineering

```typescript
// src/services/ai.ts

export async function generateFlashcards(
  chunk: string,
  subject?: string
): Promise<GeneratedCard[]> {
  const message = await claude.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: `Tu es un expert en pédagogie et sciences cognitives. Tu génères des flashcards
optimisées pour la mémorisation à long terme, en appliquant le rappel actif.
Règles absolues :
- La question (front) force l'apprenant à PRODUIRE une réponse
- La réponse (back) est complète et compréhensible sans contexte
- Chaque carte couvre UN SEUL concept
- Réponds UNIQUEMENT avec du JSON valide`,
    messages: [{
      role: "user",
      content: `Génère des flashcards pertinentes à partir de ce contenu${subject ? ` (sujet : ${subject})` : ""}.

Contenu : ${chunk}

Format JSON :
[{ "front": "Question ?", "back": "Réponse.", "cardType": "definition" }]`
    }],
  });

  const jsonMatch = content.text.match(/\[[\s\S]*\]/);
  return JSON.parse(jsonMatch[0]) as GeneratedCard[];
}
```

### Types de cartes générées

| cardType | Formulation | Exemple |
|---|---|---|
| `definition` | "Qu'est-ce que X ?" | "Qu'est-ce que la mitose ?" |
| `application` | "Comment fait-on X ?" | "Comment calculer une dérivée ?" |
| `example` | "Donne un exemple de X" | "Donne un exemple de métaphore" |
| `comparison` | "Quelle est la diff. entre X et Y ?" | "Différence entre TCP et UDP ?" |

### Gestion des erreurs et robustesse

- Extraction JSON par regex même si Claude ajoute du texte autour
- Validation minimale : `front.length > 0 && back.length > 0`
- 3 tentatives automatiques via BullMQ (`attempts: 3, backoff: exponential`)
- Délai 300ms entre chunks pour respecter le rate limit Claude

---

## Semaine 5 — Interface Flashcard

### Objectif
Interface de révision avec animation flip 3D, boutons de notation SM-2, barre de progression, et transitions entre cartes.

### Composant FlashCard

```typescript
// src/components/flashcard/FlashCard.tsx

export function FlashCard({ front, back, onRate }: FlashCardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="perspective-1000 w-full max-w-lg mx-auto">
      <motion.div
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        onClick={() => !flipped && setFlipped(true)}
      >
        {/* Recto — Question */}
        <div style={{ backfaceVisibility: "hidden" }}>
          <p>{front}</p>
          <span>Tape pour révéler</span>
        </div>

        {/* Verso — Réponse + boutons SM-2 */}
        <div style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
          <p>{back}</p>
          <div className="flex gap-3">
            {["À revoir", "Difficile", "Bien", "Facile"].map((label, rating) => (
              <button key={rating} onClick={() => onRate(rating as 0|1|2|3)}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
```

### Page de session `/study/[deckId]`

Flux complet :
1. Charger les cartes dues (`GET /decks/:id/due`, max 20)
2. Afficher les cartes une par une avec animation slide
3. Sur notation → `POST /cards/:id/review` → carte suivante
4. Dernière carte → écran de fin avec récapitulatif XP

### Micro-interactions

| Événement | Animation |
|---|---|
| Clic recto | Flip 3D (0.4s ease-in-out) |
| Transition carte → carte | Slide gauche (0.25s) |
| Réponse correcte | Flash vert + particules |
| Réponse incorrecte | Shake léger + flash rose |
| Session terminée | Confettis + écran victoire |

---

## Semaine 6 — Algorithme SM-2

### Objectif
Implémenter l'algorithme SuperMemo 2 qui planifie chaque révision au bon moment pour maximiser la rétention à long terme.

### Implémentation pure SM-2

```typescript
// src/services/sm2.ts

export function sm2(state: CardState, rating: 0 | 1 | 2 | 3): SM2Result {
  let { easeFactor, interval, repetitions } = state;

  if (rating < 2) {
    // Réponse incorrecte → reset
    repetitions = 0;
    interval = 1;
  } else {
    // Réponse correcte → incrémenter
    if (repetitions === 0)      interval = 1;
    else if (repetitions === 1) interval = 3;
    else                         interval = Math.round(interval * easeFactor);
    repetitions += 1;
  }

  // Mise à jour EaseFactor (borné à 1.3 minimum)
  const q = [1, 3, 4, 5][rating]; // qualité interne 1-5
  easeFactor = Math.max(
    1.3,
    easeFactor + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)
  );

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);
  nextReview.setHours(6, 0, 0, 0); // révision à 6h du matin

  return { easeFactor, interval, repetitions, nextReview };
}
```

### Intervalles typiques générés

| Notation | Répétition 1 | Répétition 2 | Répétition 3 | Répétition 4 |
|---|---|---|---|---|
| Toujours "Bien" | J+1 | J+3 | J+7 | J+16 |
| Toujours "Facile" | J+1 | J+3 | J+9 | J+22 |
| Mélangé | Variable | Variable | Variable | Variable |

### Route de révision

```
POST /cards/:id/review
Body : { rating: 0|1|2|3, timeMs: number, sessionId?: string }

→ Upsert CardReview (nouveaux ease/interval/nextReview)
→ Enregistrement SessionAnswer
→ Mise à jour XP utilisateur (+10 ou +15 selon rating)
→ Mise à jour streak
→ Retour : { nextReview, interval, xpGained, streak }
```

---

## Semaine 7 — Dashboard & Streak

### Objectif
Dashboard clair avec les stats de l'apprenant, système de streak quotidien, et liste des decks avec badges "cartes dues".

### Dashboard `/dashboard/decks`

Éléments affichés :
- Grille de DeckCards avec compteur "X à réviser"
- Badge de streak en header (flamme animée)
- Compteur XP total
- État vide avec call-to-action si aucun deck

### Logique Streak

```typescript
// src/services/streak.ts

export async function updateStreak(userId: string): Promise<number> {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);

  const lastStudy = user.lastStudy ? new Date(user.lastStudy) : null;
  if (lastStudy) lastStudy.setHours(0, 0, 0, 0);

  // Déjà compté aujourd'hui → pas de changement
  if (lastStudy?.getTime() === today.getTime()) return user.streak;

  const newStreak =
    !lastStudy || lastStudy < yesterday
      ? 1                    // Gap > 1 jour → reset
      : user.streak + 1;     // Hier → incrément

  await prisma.user.update({
    where: { id: userId },
    data: { streak: newStreak, lastStudy: new Date() },
  });

  return newStreak;
}
```

### Endpoints stats

```
GET /users/me          → profil complet (xp, level, streak, ...)
GET /users/me/stats    → { totalCards, dueCards, masteredCards, xp, level, streak }
```

---

## Semaine 8 — Tests & Déploiement v0.1

### Objectif
Tester le parcours complet, corriger les bugs, déployer sur Vercel + Railway.

### Checklist de validation MVP

**Fonctionnel :**
- [ ] Création de compte + connexion (Clerk)
- [ ] Création d'un deck (saisie manuelle)
- [ ] Import texte → génération flashcards < 30s
- [ ] Session de révision SM-2 complète (flip, 4 boutons, progression)
- [ ] Planification correcte de la prochaine révision
- [ ] Streak quotidien mis à jour après session
- [ ] Dashboard avec stats basiques (XP, streak, cartes dues)
- [ ] Redirection si non connecté

**Performance :**
- [ ] TTFB < 200ms (Vercel Edge)
- [ ] Animation flip 60fps (Framer Motion GPU)
- [ ] Génération flashcards : feedback < 5s (loading state visible)
- [ ] API health check répond < 100ms

**Mobile (375px) :**
- [ ] Interface flashcard utilisable sur iPhone SE
- [ ] Touch targets ≥ 44×44px
- [ ] Sidebar cachée → hamburger menu
- [ ] Formulaire nouveau deck fonctionnel

### Déploiement

```
Frontend → Vercel
  - Connect GitHub repo
  - Root directory: selmenlearn
  - Env vars: CLERK_*, NEXT_PUBLIC_API_URL

Backend → Railway
  - Connect GitHub repo
  - Root directory: selmenlearn-api
  - Dockerfile detected automatiquement
  - Env vars: DATABASE_URL, REDIS_URL, CLERK_SECRET_KEY, ANTHROPIC_API_KEY

Base de données → Supabase (PostgreSQL gratuit)
  - Copier DATABASE_URL dans Railway env

Redis → Upstash (gratuit tier)
  - Copier REDIS_URL dans Railway env
```

---

## Résumé Phase 1

| Semaine | Livrable | Technologies |
|---|---|---|
| 1-2 | Structure complète, auth, DB migrée, CI/CD | Next.js 15, Hono, Prisma, Clerk, GitHub Actions |
| 3 | Import texte + PDF → chunks + queue | pdf-parse, BullMQ, Redis |
| 4 | Génération flashcards auto via IA | Claude API (claude-sonnet-4-6) |
| 5 | Interface flashcard 3D + session de révision | Framer Motion, TanStack Query |
| 6 | Algorithme SM-2 + scheduling | SM-2 pur, Prisma upsert |
| 7 | Dashboard + streak quotidien | Next.js Server Components, Zustand |
| 8 | Tests, bugfixes, déploiement | Vercel, Railway, Supabase, Upstash |

**Au terme de la Phase 1**, l'utilisateur peut :
1. Créer un compte et se connecter
2. Coller un texte ou uploader un PDF
3. Obtenir ses flashcards générées en < 30 secondes
4. Réviser avec l'algorithme SM-2 (4 boutons de notation)
5. Voir son streak et ses stats dans le dashboard

**Prochaine étape → Phase 2 :** Quiz adaptatifs, système XP/niveaux, badges, mascotte Lumi, streaks visuels avancés.

---

*Phase 1 développée le 25 mai 2026*
