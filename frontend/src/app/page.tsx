"use client";

import { FormEvent, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type AskResponse = {
  query: string;
  answer: string;
  model: string;
  use_case: string;
};

type HistoryItem = {
  id: string;
  query: string;
  answer: string;
  timestamp: string;
};

const STARTER_PROMPT = "Create a 4-week Python study plan for a beginner with 1 hour daily.";

export default function Home() {
  const [query, setQuery] = useState(STARTER_PROMPT);
  const [result, setResult] = useState<AskResponse | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiBaseUrl = useMemo(
    () => process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000",
    []
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!query.trim()) {
      setError("Please enter a question before sending.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      const payload = (await response.json()) as AskResponse | { detail?: string };

      if (!response.ok) {
        const message = "detail" in payload ? payload.detail : "Request failed.";
        throw new Error(message || "Request failed.");
      }

      const askPayload = payload as AskResponse;
      setResult(askPayload);
      setHistory((current) => [
        {
          id: `${Date.now()}`,
          query: askPayload.query,
          answer: askPayload.answer,
          timestamp: new Date().toLocaleTimeString(),
        },
        ...current,
      ]);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Unexpected error while contacting API.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-8 lg:py-12">
      <section className="mb-8 rounded-3xl border border-white/50 bg-white/70 p-6 shadow-panel backdrop-blur lg:p-10">
        <p className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-700">
          Pre-screening technical assessment
        </p>
        <h1 className="mt-4 text-3xl font-bold leading-tight text-slate-900 sm:text-5xl">
          Study Sprint AI Assistant
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-700 sm:text-base">
          Ask learning and study-plan questions and get structured, practical answers
          powered by DeepSeek through a FastAPI backend.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-3xl border border-white/40 bg-white/75 p-5 shadow-panel backdrop-blur lg:p-7">
          <form onSubmit={onSubmit} className="space-y-4">
            <label htmlFor="query" className="text-sm font-semibold text-slate-800">
              Your Question
            </label>
            <textarea
              id="query"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              rows={7}
              className="w-full resize-y rounded-2xl border border-slate-300/80 bg-white p-4 text-sm leading-6 text-slate-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
              placeholder="Type a study planning question..."
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-slate-600" style={{ fontFamily: "var(--font-plex-mono)" }}>
                API: {apiBaseUrl}
              </p>
              <button
                type="submit"
                disabled={isLoading}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Generating answer..." : "Ask Assistant"}
              </button>
            </div>

            {error ? (
              <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </p>
            ) : null}
          </form>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Response
            </h2>
            {isLoading ? (
              <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-amber-500" />
                <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-amber-400 [animation-delay:180ms]" />
                <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-amber-300 [animation-delay:320ms]" />
                Thinking through requirements...
              </div>
            ) : null}

            {!isLoading && result ? (
              <div className="prose-answer mt-3 text-sm leading-6 text-slate-800">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {result.answer}
                </ReactMarkdown>
                <p
                  className="mt-4 border-t border-slate-200 pt-2 text-xs text-slate-500"
                  style={{ fontFamily: "var(--font-plex-mono)" }}
                >
                  Model: {result.model}
                </p>
              </div>
            ) : null}

            {!isLoading && !result ? (
              <p className="mt-3 text-sm text-slate-500">
                Submit a question to receive a structured response.
              </p>
            ) : null}
          </div>
        </article>

        <aside className="rounded-3xl border border-white/40 bg-white/70 p-5 shadow-panel backdrop-blur lg:p-7">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Previous Queries
          </h2>
          {history.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600">
              Your query history will appear here after each submission.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {history.slice(0, 8).map((item) => (
                <li
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-white p-3"
                >
                  <p className="line-clamp-2 text-sm font-medium text-slate-900">
                    {item.query}
                  </p>
                  <p
                    className="mt-1 text-xs text-slate-500"
                    style={{ fontFamily: "var(--font-plex-mono)" }}
                  >
                    {item.timestamp}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </section>
    </main>
  );
}
