// Runs student code fully client-side — nothing is sent to a server.
// JavaScript executes in a throwaway Web Worker; Python executes via
// Pyodide (WASM), loaded once from a CDN and cached for the session.

export function runJavaScript(code: string, timeoutMs = 5000): Promise<string> {
  return new Promise((resolve) => {
    const lines: string[] = [];
    const workerSrc = `
      const format = (a) => {
        try { return typeof a === "string" ? a : JSON.stringify(a); }
        catch { return String(a); }
      };
      const log = (...args) => postMessage({ type: "log", text: args.map(format).join(" ") });
      self.console = { log, error: log, warn: log, info: log };
      try {
        ${code}
      } catch (err) {
        postMessage({ type: "error", text: String((err && err.message) || err) });
      }
      postMessage({ type: "done" });
    `;
    const blob = new Blob([workerSrc], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);

    const finish = (result: string) => {
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve(result);
    };

    const timer = setTimeout(() => {
      lines.push("[timed out after 5s — check for an infinite loop]");
      finish(lines.join("\n"));
    }, timeoutMs);

    worker.onmessage = (e: MessageEvent) => {
      const data = e.data as { type: string; text?: string };
      if (data.type === "log" && data.text !== undefined) {
        lines.push(data.text);
      } else if (data.type === "error" && data.text !== undefined) {
        lines.push(`Error: ${data.text}`);
      } else if (data.type === "done") {
        finish(lines.join("\n") || "(no output)");
      }
    };
    worker.onerror = (e: ErrorEvent) => {
      lines.push(`Error: ${e.message}`);
      finish(lines.join("\n"));
    };
  });
}

type PyodideInterface = {
  setStdout: (opts: { batched: (s: string) => void }) => void;
  setStderr: (opts: { batched: (s: string) => void }) => void;
  runPythonAsync: (code: string) => Promise<unknown>;
};

declare global {
  interface Window {
    loadPyodide?: (opts?: Record<string, unknown>) => Promise<PyodideInterface>;
  }
}

const PYODIDE_VERSION = "0.26.4";
let scriptLoading: Promise<void> | null = null;
let pyodideLoading: Promise<PyodideInterface> | null = null;

function loadPyodideScript(): Promise<void> {
  if (typeof window !== "undefined" && window.loadPyodide) {
    return Promise.resolve();
  }
  if (!scriptLoading) {
    scriptLoading = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/pyodide.js`;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Pyodide from CDN"));
      document.head.appendChild(script);
    });
  }
  return scriptLoading;
}

export async function runPython(code: string): Promise<string> {
  await loadPyodideScript();
  if (!window.loadPyodide) {
    throw new Error("Pyodide failed to load");
  }
  if (!pyodideLoading) {
    pyodideLoading = window.loadPyodide({
      indexURL: `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`,
    });
  }
  const pyodide = await pyodideLoading;

  const outputs: string[] = [];
  pyodide.setStdout({ batched: (s: string) => outputs.push(s) });
  pyodide.setStderr({ batched: (s: string) => outputs.push(s) });

  try {
    await pyodide.runPythonAsync(code);
  } catch (err) {
    outputs.push(`Error: ${err instanceof Error ? err.message : String(err)}`);
  }

  return outputs.join("\n") || "(no output)";
}
