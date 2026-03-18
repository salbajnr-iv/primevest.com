import Link from "next/link";
import { ROUTES } from "@/lib/routes";

const strategyCards = [
  {
    title: "Trend Following",
    description: "Focuses on directional momentum and risk-managed entries based on breakouts.",
  },
  {
    title: "Mean Reversion",
    description: "Targets overextended markets by combining volatility bands with strict stop-losses.",
  },
  {
    title: "Event-Driven",
    description: "Builds setups around key macro releases, earnings windows, and liquidity shifts.",
  },
];

export default function DashboardStrategiesPage() {
  return (
    <main className="mx-auto w-full max-w-5xl p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Trading Strategies</h1>
        <p className="text-sm text-slate-600">A starter library of strategy archetypes used by active portfolio managers.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {strategyCards.map((strategy) => (
          <article key={strategy.title} className="rounded-xl border border-slate-200 p-4">
            <h2 className="text-base font-medium">{strategy.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{strategy.description}</p>
          </article>
        ))}
      </section>

      <p className="text-sm text-slate-600">
        Need more depth? Continue to the complete learning hub in{" "}
        <Link href={ROUTES.markets.tutorials} className="font-medium text-emerald-700 hover:text-emerald-800">
          Tutorials
        </Link>
        .
      </p>
    </main>
  );
}
