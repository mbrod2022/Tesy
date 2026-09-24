# Tutor

A local, private AI teaching assistant for app development — JavaScript,
React, Node.js, Python, and general tooling (git, testing, project
structure). It teaches, gives advice, quizzes you, sets coding exercises,
and reviews your own code, running entirely against a model on your own
machine.

Nothing here calls out to a cloud AI API. The only thing it talks to is a
local, OpenAI-compatible model server (LM Studio by default), and code
exercises run fully in your browser (JavaScript in a Web Worker, Python via
Pyodide/WASM) — no server-side sandbox.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, TypeScript)
- [Prisma](https://www.prisma.io) + SQLite — persists conversations, quiz
  results, exercise attempts, and per-topic progress on disk, so the tutor
  remembers you across restarts.
- [LM Studio](https://lmstudio.ai) (or any OpenAI-compatible local server)
  for inference.
- Tailwind CSS.

## Getting started

### 1. Set up a local model with LM Studio

1. Install [LM Studio](https://lmstudio.ai) and download a coding-capable
   model (e.g. a Qwen2.5-Coder or DeepSeek-Coder instruct variant — pick one
   that fits your machine's RAM/VRAM).
2. In LM Studio's **Developer** tab, load the model and click **Start
   Server** (default `http://localhost:1234`).

Any other OpenAI-compatible local server (LM Studio, llama.cpp's server,
Ollama's `/v1` endpoint, etc.) works too — just point `LLM_BASE_URL` at it.

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

`DATABASE_URL` defaults to a local SQLite file (`./dev.db`) — no external
database needed. Set `LLM_BASE_URL` / `LLM_MODEL` to match your local server
and loaded model.

### 4. Set up the database

```bash
npx prisma migrate dev
npm run db:seed
```

This creates the local SQLite file and seeds the curriculum topics (the
quiz/exercise/chat data itself accumulates as you use the app — there's
nothing else to seed).

### 5. Run the app

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

## How it's organized

- **Chat** (`/`) — open-ended conversation with the tutor, optionally
  focused on a curriculum topic. Every conversation is saved and reloadable
  from the sidebar.
- **Curriculum** (`/curriculum`) — topics grouped into JS & React, Node.js
  backend, Python, and general tooling, each with a progress badge and
  quick links to discuss, quiz, or do an exercise on that topic.
- **Quiz** (`/quiz/[topicId]`) — the model generates short-answer questions
  for a topic and grades your answers, updating your progress.
- **Coding exercise** (`/exercise`) — the model proposes a small challenge;
  you write and run real code in the browser (JS or Python) and submit it
  for review.
- **Code review** (`/review`) — paste code from your own projects for a
  genuine review (bugs first, then design, then style).

## Project structure

```
prisma/schema.prisma         Data model (topics, progress, conversations, attempts)
prisma/seed.ts                Seeds curriculum topics from src/lib/curriculum.ts
src/lib/llm.ts                 Client for the local OpenAI-compatible model server
src/lib/systemPrompts.ts       Tutor persona + per-mode prompts
src/lib/curriculum.ts          Curriculum topic definitions
src/lib/sandbox.ts             In-browser JS (Web Worker) / Python (Pyodide) execution
src/app/                       Chat, curriculum, quiz, exercise, review pages
src/app/api/                   Chat streaming, conversations, quiz, exercise, topics
```

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — lint the codebase
- `npm run db:seed` — (re-)seed curriculum topics
- `npx prisma studio` — browse/edit the local database
- `npx prisma migrate dev` — create/apply a migration after changing `prisma/schema.prisma`
