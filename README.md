# archivist-stack

**One substrate, three shipped products.**

`archivist-stack` is the reusable backbone behind a portfolio of otherwise
unrelated applications — a technical-success value engine, an AI LEGO backlog
manager, and a reverse-ATS. Different domains, different users, different
business models. The same architectural bones underneath all three. This repo
is those bones: extracted, made domain-neutral, and packaged so the next
product starts from the pattern instead of being rebuilt from muscle memory.

It is a **template you clone and own**, not a framework you depend on. There is
no versioned package to track, no upstream to stay in sync with. Fork it, rename
the nouns, and it's yours.

---

## Table of contents

- [Why this exists](#why-this-exists)
- [The five layers](#the-five-layers)
- [Repository map](#repository-map)
- [Quickstart](#quickstart)
- [Environment variables](#environment-variables)
- [Using each layer](#using-each-layer)
- [Adapting the template to a new product](#adapting-the-template-to-a-new-product)
- [The calibration boundary (your IP)](#the-calibration-boundary-your-ip)
- [What's intentionally a stub](#whats-intentionally-a-stub)
- [Testing & CI](#testing--ci)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [License & attribution](#license--attribution)

---

## Why this exists

Build enough products solo and you notice you keep drawing the same diagram.
An owned record with a status. A stream of things that happened to it. A funnel
that pulls raw signal in and normalizes it. A retrieval layer over the user's
own text. A named AI assistant that feels like it *knows* the user because it
remembers.

Across three separate codebases, that diagram was implemented three times from
scratch. `archivist-stack` implements it once, cleanly, so the fourth product is
a weekend of domain logic instead of a quarter of plumbing.

Everything here is deliberately assembled from **standard, well-understood
techniques**. That is a feature: the mechanism is not the moat. The moat is the
tuning — and the tuning is kept out of this repo on purpose (see
[The calibration boundary](#the-calibration-boundary-your-ip)).

---

## The five layers

```
                          ┌───────────────────────────┐
   external sources  ───► │  4. INGEST FUNNEL          │
   (RSS, barcode,         │  source→normalize→upsert   │
    transcript, …)        └────────────┬──────────────┘
                                       │ writes
                          ┌────────────▼──────────────┐
                          │  1. ENTITY + EVENT TIMELINE│
                          │  entities + entity_events  │
                          └────────────┬──────────────┘
                                       │ governed by
                          ┌────────────▼──────────────┐
                          │  2. LIFECYCLE STATE MACHINE│
                          │  typed status transitions  │
                          └────────────────────────────┘

   documents ──► 3. RAG:  chunk → embed → match_chunks → retrieve
                                       │ grounds
                          ┌────────────▼──────────────┐
   user ◄────────────────►│  5. AI PERSONA            │
                          │  prompt + facts + memory   │
                          │  + tool registry           │
                          └────────────────────────────┘

   all tuning ──────────► src/config/calibration.ts  (git-ignored; YOUR edge)
```

| # | Layer | What it does | Where |
|---|-------|--------------|-------|
| 1 | **Entity + event timeline** | Every record is a thing plus an append-only stream of what happened to it. Status changes log themselves via a DB trigger. | `migrations 0002–0003`, `src/lib/db/` |
| 2 | **Lifecycle** | A data-driven state machine: declare states + legal transitions once, enforce them everywhere. | `src/lib/domain/lifecycle.ts` |
| 3 | **RAG** | Chunk any text, embed it, search by cosine similarity — scoped to the caller by RLS. | `migration 0005`, `src/lib/rag/` |
| 4 | **Ingestion funnel** | `source → normalize → upsert → event`, with pluggable adapters. | `migration 0007`, `src/lib/ingest/` |
| 5 | **AI persona** | A named assistant grounded in the user's own records: prompt, confidence-scored fact extraction, memory cache, tool registry. | `migration 0006`, `src/lib/persona/` |

On the spine all three products already shared: **Next.js + Supabase
(Postgres / Auth / Storage) + Row-Level Security + numbered migrations + Vitest**.

---

## Repository map

```
archivist-stack/
├── LICENSE                     Apache-2.0 (patent grant included)
├── NOTICE
├── README.md                   ← you are here
├── CONTRIBUTING.md
├── package.json                deps: next, react, supabase, anthropic; dev: vitest, ts
├── tsconfig.json               strict, noUncheckedIndexedAccess, @/* → src/*
├── next.config.ts
├── vitest.config.ts
├── .env.example
├── .gitignore                  ← ignores src/config/calibration.ts (the IP boundary)
├── .github/workflows/ci.yml    typecheck + test on push/PR
│
├── docs/
│   └── ARCHITECTURE.md         the five layers + the IP boundary, in depth
│
├── supabase/
│   ├── config.toml
│   └── migrations/
│       ├── 0001_extensions.sql       pgcrypto, pgvector
│       ├── 0002_entities.sql         entity table + status enum + RLS
│       ├── 0003_events_lifecycle.sql event timeline + status-change trigger
│       ├── 0004_documents.sql        documents/assets (extracted_text)
│       ├── 0005_rag.sql              chunks + embeddings + match_chunks RPC
│       ├── 0006_persona_memory.sql   persona_memory (facts) + conversations
│       └── 0007_ingest.sql           ingest_sources
│
└── src/
    ├── app/                    minimal Next.js entrypoint (layout + landing page)
    ├── config/
    │   └── calibration.example.ts    ← NEUTRAL STUB. Copy to calibration.ts and tune.
    └── lib/
        ├── supabase/           browser / server / service clients
        ├── db/                 entities.ts, events.ts
        ├── domain/             lifecycle.ts (+ lifecycle.test.ts)
        ├── rag/                chunker, embeddings (seam), retriever, ingest-on-write
        ├── persona/            prompt, fact-extract (+ test), memory, tools
        ├── ingest/             pipeline.ts + adapters/rss.example.ts
        └── ai/                 client.ts (the single model-call choke point)
```

---

## Quickstart

```bash
# 1. Clone into your new product's name
git clone <your-fork> my-product && cd my-product

# 2. Install
npm install

# 3. Wire config
cp .env.example .env.local                        # fill in Supabase + Anthropic keys
cp src/config/calibration.example.ts src/config/calibration.ts

# 4. Apply the schema (requires the Supabase CLI + a project)
supabase db push

# 5. Run
npm run dev            # http://localhost:3000
npm run test           # 9 tests, no network required
npm run typecheck
```

The repo typechecks clean and its tests pass out of the box with the stub
calibration — you can verify the substrate before writing a line of domain code.

---

## Environment variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key (browser + server clients) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key — **server only**, bypasses RLS. Used by trusted jobs (ingest, embedding writes). Never import into a client component. |
| `ANTHROPIC_API_KEY` | The persona layer's model calls, routed through `src/lib/ai/client.ts`. |

---

## Using each layer

### 1 — Entities & the event timeline

```ts
import { createEntity, listEntities } from "@/lib/db/entities";
import { timeline, addNote } from "@/lib/db/events";

const app = await createEntity(sb, { title: "Senior TSM @ Acme", kind: "application" });
await addNote(sb, app.id, "Recruiter reached out on LinkedIn");

// Move the status — the DB trigger records a 'status_change' event for free.
await sb.from("entities").update({ status: "active" }).eq("id", app.id);

const history = await timeline(sb, app.id); // newest first
```

### 2 — Lifecycle

```ts
import { Lifecycle } from "@/lib/domain/lifecycle";

type AppStatus = "interested" | "applied" | "interview" | "offer" | "rejected";

const pipeline = new Lifecycle<AppStatus>(
  {
    interested: ["applied", "rejected"],
    applied:    ["interview", "rejected"],
    interview:  ["offer", "rejected"],
    offer:      [],
    rejected:   [],
  },
  "interested",
);

pipeline.assert("applied", "interview"); // ok
pipeline.assert("interested", "offer");  // throws: illegal transition
```

### 3 — RAG

```ts
import { indexDocument } from "@/lib/rag/ingest-on-write";
import { retrieve } from "@/lib/rag";

await indexDocument(sb, doc.id, doc.extracted_text);       // chunk → embed → store
const hits = await retrieve(sb, "what did they say about comp?", { matchCount: 6 });
```

> Wire a real embedding provider in `src/lib/rag/embeddings.ts` first — the stub
> throws on purpose (see [stubs](#whats-intentionally-a-stub)).

### 4 — Ingestion

```ts
import { runIngest } from "@/lib/ingest/pipeline";
import { rssAdapter } from "@/lib/ingest/adapters/rss.example";

const result = await runIngest(sb, rssAdapter, { url: "https://example.com/feed" });
// { fetched, inserted, skipped } — dedup + 'ingested' events handled for you
```

Write a new adapter by implementing just two methods (`fetch`, `normalize`); the
pipeline handles persistence, dedup, and event logging identically for all of them.

### 5 — AI persona

```ts
import { callAI } from "@/lib/ai/client";
import { buildSystemPrompt, formatGrounding } from "@/lib/persona/prompt";
import { parseFacts } from "@/lib/persona/fact-extract";
import { appendFacts, loadMemory, formatMemoryForPrompt } from "@/lib/persona/memory";

const grounding = formatGrounding(await retrieve(sb, userQuestion));
const memory = formatMemoryForPrompt(await loadMemory(sb, userId));

const { text } = await callAI({
  task: "chat",
  system: buildSystemPrompt(),
  messages: [{ role: "user", content: `${memory}\n\n${grounding}\n\n${userQuestion}` }],
});

// Later: distill durable facts from the conversation
const facts = parseFacts(extractionJson, ["preference", "habit", "goal"]);
await appendFacts(sb, userId, facts, `conversation:${conversationId}`);
```

---

## Adapting the template to a new product

A rough order of operations, cheapest to most involved:

1. **Rename the entity noun.** In `0002_entities.sql`, `entities` → your noun
   (or keep it generic and use the `kind` column). Update `src/lib/db/entities.ts`
   types to match.
2. **Define your status values.** Replace the `entity_status` enum in `0002` and
   the `defaultLifecycle` transitions in `src/lib/domain/lifecycle.ts`.
3. **Wire an embedding provider.** Implement `Embedder.embed()` in
   `src/lib/rag/embeddings.ts`; set the vector dimension in `0005_rag.sql` to match.
4. **Write an ingest adapter** (if the product pulls external data). Copy
   `adapters/rss.example.ts`, implement `fetch` + `normalize`.
5. **Name and voice your persona.** Set `PERSONA.identity` / `PERSONA.style` and
   your fact types in `calibration.ts`. Register any agent tools via `ToolRegistry`.
6. **Tune the numbers.** Weights, thresholds, confidence floors, model routing —
   all in `calibration.ts`. This is where the product actually gets good.

Steps 1–5 are mechanical. Step 6 is the whole game.

---

## The calibration boundary (your IP)

This is the most important design decision in the repo, so read this part twice.

The template ships the **mechanism** — scoring engines, memory extraction,
retrieval, lifecycle. None of it is novel; it is assembled from standard
techniques on purpose, which also means **none of it is patentable** (known
methods, obvious combinations).

Your **calibration** — the tuned weights, verdict thresholds, persona voice,
confidence floors, and prompts that make recommendations actually feel right — is
a different thing entirely. It is:

- **not patentable** either, but
- **trade-secret-shaped**: valuable precisely because it is tuned, hard-won, and
  private.

So the two live apart:

- `src/config/calibration.example.ts` — neutral placeholder values. Committed.
  Bland by design (all weights `1.0`, generic persona voice) so the repo runs and
  its tests pass. **These are not good product values.**
- `src/config/calibration.ts` — your real values. **Git-ignored** (see
  `.gitignore`). The app imports from here; it never lands in a public fork.

The payoff: open-source the plumbing (not novel, nothing lost) and keep the
tuning closed inside your products (your actual edge). Your open-source instinct
and your protect-the-IP instinct point the same direction.

> If you fork this publicly, double-check `git status` before your first push:
> `src/config/calibration.ts` should never appear as tracked.

---

## What's intentionally a stub

Two things are deliberately non-functional so you can't ship them blind:

- **Embeddings** (`src/lib/rag/embeddings.ts`) — `embed()` throws until you wire a
  provider. This is a guardrail, not an omission: it forces a conscious choice of
  model + dimension rather than silently indexing nothing.
- **The RSS adapter** (`src/lib/ingest/adapters/rss.example.ts`) — parses XML
  naively to demonstrate the adapter seam. Swap in a real parser before relying on
  it. It is named `*.example.ts` for a reason.

Everything else — the migrations, the lifecycle engine, the fact-extraction
parser, the pipeline, the persona wiring — is functional.

---

## Testing & CI

```bash
npm run test        # Vitest, 9 tests, no network/DB required
npm run typecheck   # tsc --noEmit, strict
```

The pure logic (lifecycle transitions, fact-extraction parsing/validation) is
unit-tested with zero external dependencies. `.github/workflows/ci.yml` runs
typecheck + tests on every push and PR.

---

## Deployment

Standard Next.js + Supabase deployment; nothing exotic:

- **App** — any Next.js host (Vercel, a container, etc.).
- **Database** — a Supabase project. Apply migrations with `supabase db push`
  (or run the `supabase/migrations/*.sql` files in order against Postgres).
- **Secrets** — the four env vars above. Keep `SUPABASE_SERVICE_ROLE_KEY`
  server-side only.

---

## Roadmap

- [ ] `create-archivist-app` — a one-command generator that scaffolds a fork with
      the entity noun, status set, and persona name filled in interactively.
- [ ] A second reference ingest adapter (barcode / webhook) to show a non-RSS seam.
- [ ] Optional multi-tenancy migration set (for products that outgrow single-user).

---

## License & attribution

Apache License 2.0 — commercial use is fine and the patent grant is included.
See [LICENSE](LICENSE) and [NOTICE](NOTICE).

Built as the shared substrate behind three independent products. The mechanism is
open; the calibration is yours.
