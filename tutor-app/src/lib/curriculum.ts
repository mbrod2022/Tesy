export type Track = "JS_REACT" | "NODE_BACKEND" | "PYTHON" | "TOOLING";

export type TopicSeed = {
  slug: string;
  track: Track;
  title: string;
  summary: string;
  order: number;
};

export const TRACK_LABELS: Record<Track, string> = {
  JS_REACT: "JavaScript & React",
  NODE_BACKEND: "Node.js backend",
  PYTHON: "Python",
  TOOLING: "App-dev tooling",
};

export const TRACK_ORDER: Track[] = [
  "JS_REACT",
  "NODE_BACKEND",
  "PYTHON",
  "TOOLING",
];

export const CURRICULUM: TopicSeed[] = [
  // JavaScript & React
  {
    slug: "js-fundamentals",
    track: "JS_REACT",
    title: "JavaScript fundamentals",
    summary: "Variables, types, functions, scope, and control flow.",
    order: 1,
  },
  {
    slug: "js-arrays-objects",
    track: "JS_REACT",
    title: "Arrays, objects & destructuring",
    summary: "Working with structured data, spread/rest, and array methods.",
    order: 2,
  },
  {
    slug: "js-async",
    track: "JS_REACT",
    title: "Async JavaScript",
    summary: "Callbacks, promises, async/await, and the event loop.",
    order: 3,
  },
  {
    slug: "js-modules",
    track: "JS_REACT",
    title: "Modules & tooling basics",
    summary: "ES modules, npm, bundlers, and project structure.",
    order: 4,
  },
  {
    slug: "react-components",
    track: "JS_REACT",
    title: "React components & JSX",
    summary: "Function components, props, and composing UI.",
    order: 5,
  },
  {
    slug: "react-state-hooks",
    track: "JS_REACT",
    title: "State & hooks",
    summary: "useState, useEffect, and thinking in data flow.",
    order: 6,
  },
  {
    slug: "react-patterns",
    track: "JS_REACT",
    title: "Component patterns & forms",
    summary: "Lifting state, controlled forms, context, and custom hooks.",
    order: 7,
  },

  // Node.js backend
  {
    slug: "node-runtime",
    track: "NODE_BACKEND",
    title: "The Node.js runtime",
    summary: "Modules, the event loop, streams, and the filesystem API.",
    order: 1,
  },
  {
    slug: "node-http-apis",
    track: "NODE_BACKEND",
    title: "Building HTTP APIs",
    summary: "Routing, request/response handling, REST conventions.",
    order: 2,
  },
  {
    slug: "node-databases",
    track: "NODE_BACKEND",
    title: "Talking to databases",
    summary: "SQL basics, ORMs like Prisma, migrations, and queries.",
    order: 3,
  },
  {
    slug: "node-auth",
    track: "NODE_BACKEND",
    title: "Auth & sessions",
    summary: "Hashing passwords, sessions vs tokens, protecting routes.",
    order: 4,
  },
  {
    slug: "node-testing-errors",
    track: "NODE_BACKEND",
    title: "Error handling & testing",
    summary: "Defensive backend code and writing tests for it.",
    order: 5,
  },

  // Python
  {
    slug: "py-fundamentals",
    track: "PYTHON",
    title: "Python fundamentals",
    summary: "Syntax, types, control flow, functions.",
    order: 1,
  },
  {
    slug: "py-data-structures",
    track: "PYTHON",
    title: "Data structures",
    summary: "Lists, dicts, sets, comprehensions.",
    order: 2,
  },
  {
    slug: "py-oop",
    track: "PYTHON",
    title: "Object-oriented Python",
    summary: "Classes, dataclasses, and when to use them.",
    order: 3,
  },
  {
    slug: "py-files-apis",
    track: "PYTHON",
    title: "Files, APIs & scripting",
    summary: "Reading/writing files, making HTTP requests, small tools.",
    order: 4,
  },

  // General tooling
  {
    slug: "tool-git",
    track: "TOOLING",
    title: "Git & version control",
    summary: "Commits, branches, merges, and a sane workflow.",
    order: 1,
  },
  {
    slug: "tool-testing",
    track: "TOOLING",
    title: "Testing fundamentals",
    summary: "Unit vs integration tests, what's worth testing.",
    order: 2,
  },
  {
    slug: "tool-project-structure",
    track: "TOOLING",
    title: "Project structure & deployment",
    summary: "Organizing an app, environment config, shipping it.",
    order: 3,
  },
];

export function youtubeSearchUrl(query: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}
