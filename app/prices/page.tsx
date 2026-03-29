import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

interface Price {
  id: string;           // make sure you return `id` from DB
  asset_type: string;
  asset_id: string;
  base: string;
  price: string;       // Supabase returns as text → parse to number at render
  updated_at: string;
}

type AssetType =
  | "all"
  | "crypto"
  | "metals"
  | "commodities"
  | "stocks"
  | "etfs"
  | "indices";

export default async function PricesPage({
  searchParams,
}: {
  searchParams: { type?: string };
}) {
  const supabase = await createClient();

  // Build query: start generic, add filter only if type !== 'all'
  let query = supabase
    .from("prices")
    .select("id, asset_type, asset_id, base, price, updated_at") // include id
    .order("updated_at", { ascending: false })
    .limit(50);

  const resolvedParams = await searchParams;
  const type = (resolvedParams.type || "crypto") as AssetType;

  if (type !== "all") {
    query = query.eq("asset_type", type);
  }

  const { data: prices, error } = await query;

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white rounded-3xl shadow-2xl border border-green-200">
          <div className="w-24 h-24 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-3xl text-emerald-600">⚠️</span>
          </div>
          <h1 className="text-3xl font-bold text-emerald-800 mb-4">Error loading prices</h1>
          <p className="text-lg text-emerald-700">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!prices || prices.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white rounded-3xl shadow-2xl border border-green-200">
          <div className="w-24 h-24 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-3xl text-emerald-600">📊</span>
          </div>
          <h1 className="text-3xl font-bold text-emerald-800 mb-4">No prices found</h1>
          <p className="text-lg text-emerald-700">
            No price data available for this filter.
          </p>
        </div>
      </div>
    );
  }

  const tabs: { label: string; value: AssetType; icon: string }[] = [
    { label: "All", value: "all", icon: "🌐" },
    { label: "Crypto", value: "crypto", icon: "₿" },
    { label: "Metals", value: "metals", icon: "🥇" },
    { label: "Commodities", value: "commodities", icon: "🌾" },
    { label: "Stocks", value: "stocks", icon: "📈" },
    { label: "ETFs", value: "etfs", icon: "🏦" },
    { label: "Indices", value: "indices", icon: "📊" },
  ];

  const getIcon = (assetType: string) => {
    const icons: Record<string, string> = {
      crypto: "₿",
      metals: "🥇",
      commodities: "🌾",
      stocks: "📈",
      etfs: "🏦",
      indices: "📊",
    };
    return icons[assetType] || "💎";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold rounded-3xl shadow-2xl mb-8 text-lg">
            Live Market Prices • Updated Now
          </div>
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-emerald-700 via-green-700 to-emerald-800 bg-clip-text text-transparent mb-6">
            Asset Prices
          </h1>
          <p className="text-xl text-emerald-700 font-semibold max-w-2xl mx-auto">
            Filter live prices across all asset classes with real‑time data
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white/80 backdrop-blur-xl border border-emerald-200 rounded-3xl p-4 shadow-2xl mb-12 max-w-5xl mx-auto">
          <div className="flex flex-wrap justify-center -space-x-2 gap-3">
            {tabs.map((tab) => {
              const isActive = type === tab.value;
              return (
                <Link
                  key={tab.value}
                  href={`?type=${tab.value}`}
                  className={`
                    flex items-center px-8 py-4 rounded-2xl font-bold text-sm transition-all duration-300 min-w-[140px] text-center relative group
                    border-2 shadow-lg
                    ${
                      isActive
                        ? "bg-emerald-500 text-white border-emerald-500 shadow-emerald-300/50 scale-[1.02] shadow-2xl"
                        : "bg-white text-emerald-700 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-emerald-200/50 hover:scale-[1.02]"
                    }
                  `}
                >
                  <span className="text-2xl mr-3">{tab.icon}</span>
                  {tab.label}
                  {isActive && (
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-green-400 blur opacity-75 animate-pulse rounded-2xl -z-10" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="text-center mb-16 bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-emerald-200 shadow-xl">
          <h2 className="text-3xl font-black text-emerald-800 mb-2">
            {type === "all" ? "All Assets" : type.toUpperCase()}
          </h2>
          <p className="text-emerald-600 font-bold">{prices.length} live prices loaded</p>
        </div>

        {/* Price Cards Grid */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 mb-20">\n          {prices.map((price: Price) => (
<article
              key={price.id} // stable unique key, use id not timestamps
              className="group bg-white shadow-lg border border-emerald-100 rounded-3xl p-8 hover:shadow-emerald-300/50 hover:shadow-2xl hover:-translate-y-3 hover:border-emerald-300 transition-all duration-500 overflow-hidden relative"
            >
              {/* Decorative top gradient bar */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 to-green-400" />

              {/* Header */}
              <header className="flex items-start justify-between mb-6 pb-6 border-b border-emerald-100">
                <div className="flex items-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center shadow-xl mr-4 shadow-emerald-200/50 flex-shrink-0">
                    <span className="text-2xl font-black text-white drop-shadow-lg">
                      {getIcon(price.asset_type)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-black text-2xl text-emerald-900 group-hover:text-emerald-700 transition-colors">
                      {price.asset_id.toUpperCase()}
                    </h3>
                    <span className="inline-flex mt-2 px-4 py-2 bg-emerald-100 text-emerald-800 text-sm font-bold rounded-2xl border border-emerald-200 shadow-sm">
                      {price.asset_type.toUpperCase()}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-100/80 px-3 py-1.5 rounded-xl shadow-sm uppercase tracking-wide">
                  {price.base.toUpperCase()}
                </span>
              </header>

              {/* Price */}
              <div className="text-center mb-8">
                <div className="text-5xl lg:text-6xl font-black bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 bg-clip-text text-transparent mb-4 tracking-tight drop-shadow-lg">
                  €{Number(price.price).toLocaleString()}
                </div>
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-white shadow-lg border border-emerald-200 rounded-2xl text-emerald-700 font-bold text-lg backdrop-blur-sm hover:bg-emerald-50 group-hover:scale-105 transition-all duration-300">
                  <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  LIVE PRICE
                </div>
              </div>

              {/* Timestamp */}
              <footer className="text-center pt-6">
                <div className="inline-block px-6 py-3 bg-emerald-50 border-2 border-dashed border-emerald-200 rounded-2xl text-emerald-700 font-mono text-sm shadow-inner">
                  {new Date(price.updated_at).toLocaleString("en-GB", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </footer>

              {/* Hover shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-40 group-hover:translate-x-40 transition-transform duration-1000 opacity-0 group-hover:opacity-100" />
            </article>
          ))}
        </div>

        {/* Footer Stats */}
        <div className="text-center bg-white/60 backdrop-blur-sm rounded-3xl p-12 border border-emerald-200 shadow-2xl">
          <h3 className="text-2xl font-black text-emerald-800 mb-4">Market Summary</h3>
          <p className="text-lg text-emerald-700">
            Displaying{" "}
            <strong className="text-2xl">{prices.length}</strong> live prices for{" "}
            <strong className="text-2xl font-bold">{type.toUpperCase()}</strong> assets
          </p>
          <p className="text-sm text-emerald-600 mt-2">
            Powered by PrimeVest Real‑Time Market Feed
          </p>
        </div>
      </div>
    </div>
  );
}