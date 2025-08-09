"use client";

import { useMemo, useState } from "react";
import { generateTags } from "@/lib/generateTags";

export default function Page() {
  const [title, setTitle] = useState("");
  const [count, setCount] = useState(18);
  const [hl, setHl] = useState("en");
  const [gl, setGl] = useState("US");
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const csv = useMemo(() => tags.join(", "), [tags]);

  async function handleGenerate(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    setLoading(true);
    setTags([]);
    try {
      const result = await generateTags({ title, count, hl, gl });
      setTags(result);
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function copy() {
    if (!tags.length) return;
    navigator.clipboard.writeText(csv);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-gradient-to-tr from-indigo-400/30 to-fuchsia-400/30 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-tr from-emerald-400/20 to-sky-400/20 blur-3xl" />
      </div>

      <main className="relative mx-auto max-w-5xl px-6 py-12">
        <header className="mb-10 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight md:text-5xl">
              <span className="bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-rose-600 bg-clip-text text-transparent">YouTube Tag Genie</span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
              Enter a video title. Get <span className="font-semibold">high-demand</span>,<span className="font-semibold"> relatable</span> tags — comma-separated.
            </p>
          </div>
          <a href="#footer" className="hidden rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-xs font-medium shadow-sm backdrop-blur hover:bg-white dark:border-slate-800 dark:bg-slate-900/60 md:inline-block">Powered by Foxside</a>
        </header>

        <form onSubmit={handleGenerate} className="relative rounded-3xl border border-slate-200/70 bg-white/70 p-6 shadow-xl backdrop-blur-lg dark:border-slate-800/70 dark:bg-slate-900/60">
          <div className="pointer-events-none absolute inset-x-0 -top-px mx-6 h-px bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />

          <label className="block">
            <span className="block text-sm font-medium text-slate-700 dark:text-slate-300">Video Title</span>
            <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-300 bg-white/90 px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900">
              <svg width="18" height="18" viewBox="0 0 24 24" className="opacity-60" aria-hidden>
                <path fill="currentColor" d="M10 18q-3.35 0-5.675-2.325T2 10t2.325-5.675T10 2t5.675 2.325T18 10t-2.325 5.675T10 18m0-2q2.5 0 4.25-1.75T16 10t-1.75-4.25T10 4T5.75 5.75T4 10t1.75 4.25T10 16m8.65 6L14.5 17.85q.625-.475 1.15-1.062T16.65 15l4.15 4.15z"/>
              </svg>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. iPhone 16 Pro Max vs Galaxy S25 Ultra camera test" className="w-full bg-transparent text-base outline-none placeholder:text-slate-400" />
            </div>
          </label>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            <label className="block">
              <span className="block text-sm font-medium text-slate-700 dark:text-slate-300">How many tags?</span>
              <input type="number" min={5} max={40} value={count} onChange={(e) => setCount(Math.max(5, Math.min(40, Number(e.target.value) || 18)))} className="mt-2 w-full rounded-2xl border border-slate-300 bg-white/90 px-4 py-2 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900" />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-slate-700 dark:text-slate-300">Language (hl)</span>
              <input value={hl} onChange={(e) => setHl(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-300 bg-white/90 px-4 py-2 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900" />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-slate-700 dark:text-slate-300">Region (gl)</span>
              <input value={gl} onChange={(e) => setGl(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-300 bg-white/90 px-4 py-2 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900" />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button type="submit" disabled={!title || loading} className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-5 py-2.5 text-white shadow-lg transition hover:brightness-110 disabled:opacity-50">
              {loading ? (<><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Generating…</>) : (<><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden><path fill="currentColor" d="M11 21q-.425 0-.712-.288T10 20v-6H6q-.425 0-.712-.288T5 13q0-.425.288-.712T6 12h4V6q0-.425.288-.712T11 5q.425 0 .713.288T12 6v6h4q.425 0 .713.288T17 13q0 .425-.288.713T16 14h-4v6q0 .425-.287.713T11 21"/></svg> Generate tags</>)}
            </button>
            <button type="button" onClick={copy} disabled={!tags.length} className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white/70 px-5 py-2.5 text-slate-700 shadow-sm transition hover:bg-white disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-900">
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden><path fill="currentColor" d="M8 21q-.825 0-1.412-.587T6 19V7q0-.825.588-1.412T8 5h8q.825 0 1.413.588T18 7v12q0 .825-.587 1.413T16 21zm-4-2q-.825 0-1.412-.587T2 17V5q0-.825.588-1.412T4 3h10q.425 0 .713.288T15 4t-.288.713T14 5H4v12q0 .425.288.713T5 18h9q.425 0 .713.288T15 19t-.288.713T14 20z"/></svg>
              Copy comma-separated
            </button>
          </div>

          {error && (<p className="mt-4 text-sm text-rose-600">{error}</p>)}

          {tags.length > 0 && (
            <div className="mt-6 rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-inner dark:border-slate-800/70 dark:bg-slate-900/50">
              <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Tags</div>
              <div className="flex flex-wrap gap-2">
                {tags.map((t, i) => (
                  <span key={i} className="group rounded-full bg-slate-100/90 px-3 py-1 text-sm text-slate-800 shadow-sm transition hover:shadow-md dark:bg-slate-800/80 dark:text-slate-100" title={t}>{t}</span>
                ))}
              </div>
              <textarea readOnly value={csv} className="mt-4 w-full rounded-xl border border-slate-300 bg-white/80 p-3 text-sm dark:border-slate-700 dark:bg-slate-900" rows={3} />
            </div>
          )}
        </form>

        <footer id="footer" className="mt-10 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
          <p className="text-xs text-slate-500">Pro tip: set <code>YT_API_KEY</code> to mine recent video tags in your region for extra relevance.</p>
          <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Powered by <span className="tracking-wide">Foxside</span></p>
        </footer>
      </main>
    </div>
  );
}
