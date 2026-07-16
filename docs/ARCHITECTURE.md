# Architecture

`archivist-stack` is one architecture extracted from three shipped products.
It is intentionally small: five layers on a Next.js + Supabase spine.

## The five layers

### 1. Entity + event timeline
`entities` is the owned record; `entity_events` is its append-only history.
State is never mutated silently — a status change writes an event via a DB
trigger. This gives you audit, history views, and "what happened to this" for
free. (`migrations 0002–0003`, `src/lib/db`)

### 2. Lifecycle
A data-driven state machine (`src/lib/domain/lifecycle.ts`). Define states and
legal transitions once; the engine enforces them everywhere. This is what let
the same code back an application pipeline, a build backlog, and an outcome
tracker.

### 3. Ingestion funnel
`source → normalize → upsert → event` (`src/lib/ingest`). Adapters implement
only `fetch` + `normalize`; the pipeline handles persistence, dedup, and event
logging uniformly. RSS, barcode, and transcript ingestion are all just adapters.

### 4. RAG
Chunk (`chunker.ts`) → embed (`embeddings.ts`, provider seam) → store + search
(`match_chunks` RPC, `retriever.ts`). RLS scopes every search to the caller.

### 5. AI persona
A named assistant grounded in the user's own records: system prompt
(`persona/prompt.ts`), confidence-scored fact extraction (`fact-extract.ts`),
a memory cache (`memory.ts`), and a tool registry (`tools.ts`). All model calls
go through one choke point (`ai/client.ts`).

## The IP boundary

The template ships the **mechanism** — none of which is novel; it's assembled
from standard techniques on purpose. Your **calibration** — the tuned weights,
thresholds, persona voice, and prompts — is the actual edge, and it is:

- **not patentable** (known techniques, obvious combinations), and
- **trade-secret-shaped** — valuable precisely because it's tuned and private.

So it lives in `src/config/calibration.ts`, which is **git-ignored**. The repo
runs on `calibration.example.ts` (neutral placeholders). Open-source the
plumbing; keep the numbers. The two instincts point the same way.
