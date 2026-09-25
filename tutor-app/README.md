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

## Using it from your phone

The app itself has to run on a computer (that's what talks to LM Studio and
to Pyodide/the JS sandbox needs a real browser, so a phone browser works
fine as the *client* — it just can't be the machine hosting the server and
the model). The UI is responsive, so it works on both the Fold's narrow
cover screen and its larger inner screen.

1. **Same Wi-Fi.** Your phone and the computer running this app need to be
   on the same network.

2. **Find your computer's LAN IP:**
   - macOS: System Settings → Wi-Fi → Details (or `ipconfig getifaddr en0`)
   - Windows: `ipconfig` in a terminal, look for "IPv4 Address"
   - Linux: `hostname -I` or `ip addr`

   It'll look like `192.168.x.x` or `10.x.x.x`.

3. **Run in production mode** (simplest — no extra config needed):

   ```bash
   npm run build
   npm run start:lan
   ```

   (`start:lan` just binds the server to `0.0.0.0` instead of only
   `localhost`, so other devices on the network can reach it.)

   If you'd rather keep hot-reload during development, use `npm run
   dev:lan` instead, but first set `ALLOWED_DEV_ORIGINS` in `.env` to your
   computer's LAN IP (Next.js blocks cross-origin dev requests by default) —
   see the comment in `.env.example`.

4. **Allow the port through your firewall** if prompted (Windows Defender
   will usually ask the first time; macOS/Linux firewalls may need a manual
   rule for port 3000).

5. **On your Fold**, open a browser and go to `http://<that-IP>:3000` —
   e.g. `http://192.168.1.42:3000`.

You only need to expose *this* app's port. LM Studio itself stays on
`localhost` on your computer — the Next.js server is the only thing your
phone talks to, and it relays to LM Studio locally.

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
- `npm run dev:lan` — dev server reachable from other devices on your Wi-Fi
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run start:lan` — production build reachable from other devices on your Wi-Fi
- `npm run lint` — lint the codebase
- `npm run db:seed` — (re-)seed curriculum topics
- `npx prisma studio` — browse/edit the local database
- `npx prisma migrate dev` — create/apply a migration after changing `prisma/schema.prisma`
