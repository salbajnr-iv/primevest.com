import Link from "next/link";
import { ROUTES } from "@/lib/routes";

export default function DashboardMarketPage() {
  return (
    <main className="mx-auto w-full max-w-5xl p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Market Overview</h1>
        <p className="text-sm text-slate-600">Track broad market sentiment and jump into deeper market movers data.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-xl border border-slate-200 p-4">
          <h2 className="text-base font-medium">Market News</h2>
          <p className="mt-2 text-sm text-slate-600">Read the latest curated headlines affecting crypto and macro conditions.</p>
          <Link href={ROUTES.markets.news} className="mt-4 inline-flex text-sm font-medium text-emerald-700 hover:text-emerald-800">
            Open market news →
          </Link>
        </article>

        <article className="rounded-xl border border-slate-200 p-4">
          <h2 className="text-base font-medium">Top Gainers and Losers</h2>
          <p className="mt-2 text-sm text-slate-600">Review daily leaders and laggards from the in-app markets feed.</p>
          <Link
            href={ROUTES.dashboard.gainersLosers}
            className="mt-4 inline-flex text-sm font-medium text-emerald-700 hover:text-emerald-800"
          >
            View movers →
          </Link>
        </article>
      </section>
    </main>
  );
}
