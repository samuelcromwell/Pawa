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
        headers: { "Content-Type": "application/json" },
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
    <div className="min-h-screen bg-stone-100">
      {/* ── Top navigation ── */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded bg-teal-700 text-sm font-bold text-white">
              S
            </span>
            <div>
              <p className="text-sm font-bold leading-none text-slate-900">Study Sprint</p>
              <p className="mt-0.5 text-xs leading-none text-slate-500">AI Study Assistant</p>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <a
              href={`${apiBaseUrl}/docs`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-slate-600 transition hover:text-teal-700"
            >
              API Docs
            </a>
            <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700">
              DeepSeek · Free tier
            </span>
          </nav>
        </div>
      </header>

      {/* ── Hero strip ── */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-700">
            Pre-Screening Technical Assessment
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-4xl">
            Study Sprint AI Assistant
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
            Ask a learning question, get a structured, practical study plan — powered
            by DeepSeek through a FastAPI backend.
          </p>
        </div>
      </div>

      {/* ── Main workspace ── */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">

          {/* Left column */}
          <div className="flex flex-col gap-6">

            {/* Input card */}
            <section className="rounded-md border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-sm font-semibold text-slate-800">Your Question</h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Describe your learning goal or topic in as much detail as you like.
                </p>
              </div>
              <form onSubmit={onSubmit} className="p-5">
                <textarea
                  id="query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  rows={6}
                  className="w-full resize-y rounded border border-stone-300 bg-stone-50 p-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-100"
                  placeholder="e.g. Create a 4-week Python study plan for a beginner with 1 hour daily."
                />
                {error ? (
                  <div className="mt-3 flex items-start gap-2 rounded border border-red-200 bg-red-50 px-3 py-2">
                    <span className="mt-px text-xs font-bold text-red-600">Error</span>
                    <p className="text-xs text-red-700">{error}</p>
                  </div>
                ) : null}
                <div className="mt-4 flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 rounded bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        Generating...
                      </>
                    ) : "Ask Assistant"}
                  </button>
                </div>
              </form>
            </section>

            {/* Response card */}
            <section className="rounded-md border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h2 className="text-sm font-semibold text-slate-800">Response</h2>
                {result && !isLoading ? (
                  <span
                    className="text-xs text-slate-400"
                    style={{ fontFamily: "var(--font-plex-mono)" }}
                  >
                    {result.model}
                  </span>
                ) : null}
              </div>
              <div className="min-h-[180px] p-5">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-12 text-slate-500">
                    <svg className="h-6 w-6 animate-spin text-teal-600" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    <p className="text-sm">Generating your study plan...</p>
                  </div>
                ) : result ? (
                  <div className="prose-answer text-sm leading-7 text-slate-800">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.answer}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="flex h-40 items-center justify-center">
                    <p className="text-center text-sm text-slate-400">
                      Your structured response will appear here.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right column — history sidebar */}
          <aside className="rounded-md border border-slate-200 bg-white shadow-sm lg:self-start">
            <div className="border-b border-slate-100 px-4 py-4">
              <h2 className="text-sm font-semibold text-slate-800">History</h2>
              <p className="mt-0.5 text-xs text-slate-500">Recent queries this session</p>
            </div>
            <div className="p-4">
              {history.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-400">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-xs text-slate-500">No queries yet</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {history.slice(0, 8).map((item, index) => (
                    <li
                      key={item.id}
                      className="rounded border border-stone-200 bg-stone-50 p-3 transition hover:border-teal-200 hover:bg-teal-50"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded-sm bg-slate-200 text-[10px] font-bold text-slate-600">
                          {index + 1}
                        </span>
                        <p className="line-clamp-2 flex-1 text-xs font-medium leading-5 text-slate-800">
                          {item.query}
                        </p>
                      </div>
                      <p
                        className="mt-1.5 text-right text-[10px] text-slate-400"
                        style={{ fontFamily: "var(--font-plex-mono)" }}
                      >
                        {item.timestamp}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="mt-8 border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <p className="text-xs text-slate-500">Study Sprint AI — Pre-Screening Technical Assessment</p>
          <p className="text-xs text-slate-400">FastAPI · Next.js · DeepSeek</p>
        </div>
      </footer>
    </div>
  );
}
