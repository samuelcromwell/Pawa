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
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
      <section className="border border-slate-200 bg-white p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
          Pre-Screening Technical Assessment
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
          Study Sprint AI Assistant
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Ask learning and study-plan questions and receive structured, practical
          answers powered by DeepSeek through a FastAPI backend.
        </p>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="border border-slate-200 bg-white p-5 sm:p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <label htmlFor="query" className="block text-sm font-semibold text-slate-800">
              Your Question
            </label>
            <textarea
              id="query"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              rows={7}
              className="w-full resize-y border border-slate-300 bg-white p-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Type a study planning question..."
            />

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-3">
              <p className="text-xs text-slate-500" style={{ fontFamily: "var(--font-plex-mono)" }}>
                API: {apiBaseUrl}
              </p>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-400"
              >
                {isLoading ? "Generating answer..." : "Ask Assistant"}
              </button>
            </div>

            {error ? (
              <p className="border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </p>
            ) : null}
          </form>

          <div className="mt-6 border border-slate-200 bg-slate-50 p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
              Response
            </h2>
            {isLoading ? (
              <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                <span className="inline-block h-2 w-2 animate-pulse bg-blue-600" />
                <span className="inline-block h-2 w-2 animate-pulse bg-blue-500 [animation-delay:180ms]" />
                <span className="inline-block h-2 w-2 animate-pulse bg-blue-400 [animation-delay:320ms]" />
                Generating response...
              </div>
            ) : null}

            {!isLoading && result ? (
              <div className="prose-answer mt-3 text-sm leading-6 text-slate-800">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.answer}</ReactMarkdown>
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

        <aside className="border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
            Previous Queries
          </h2>
          {history.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600">
              Your query history will appear here after each submission.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {history.slice(0, 8).map((item) => (
                <li key={item.id} className="border border-slate-200 bg-slate-50 p-3">
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
