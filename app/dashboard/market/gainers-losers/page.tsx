import Link from "next/link";
import { ROUTES } from "@/lib/routes";

const movers = [
  { symbol: "BTC", change: "+4.2%", direction: "up" },
  { symbol: "ETH", change: "+2.9%", direction: "up" },
  { symbol: "SOL", change: "-3.1%", direction: "down" },
  { symbol: "ADA", change: "-2.4%", direction: "down" },
];

export default function DashboardGainersLosersPage() {
  return (
    <main className="mx-auto w-full max-w-4xl p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Top Gainers and Losers</h1>
        <p className="text-sm text-slate-600">Daily movers snapshot for quick market scanning from the dashboard.</p>
      </header>

      <section className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Asset</th>
              <th className="px-4 py-3 font-medium">24h Change</th>
            </tr>
          </thead>
          <tbody>
            {movers.map((mover) => (
              <tr key={mover.symbol} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-900">{mover.symbol}</td>
                <td className={`px-4 py-3 ${mover.direction === "up" ? "text-emerald-700" : "text-rose-700"}`}>{mover.change}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <Link href={ROUTES.dashboard.market} className="inline-flex text-sm font-medium text-emerald-700 hover:text-emerald-800">
        ← Back to market overview
      </Link>
    </main>
  );
}
