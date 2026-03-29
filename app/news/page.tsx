cimport { createClient } from "@/lib/supabase/server";
import Link from "next/link";

interface NewsItem {
  id?: string;
  title: string;
  url: string;
  source: string;
  published_at: string;
  sentiment?: string;
  updated_at: string;
}

export default async function NewsPage() {
  const supabase = await createClient();

  const { data: news, error } = await supabase
    .from("news_cache")
    .select("id, title, url, source, published_at, sentiment, updated_at")
    .order("published_at", { ascending: false })
    .limit(25);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white rounded-3xl shadow-2xl border border-green-200">
          <div className="w-24 h-24 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-3xl text-emerald-600">📰</span>
          </div>
          <h1 className="text-3xl font-bold text-emerald-800 mb-4">Error loading news</h1>
          <p className="text-lg text-emerald-700">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!news || news.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white rounded-3xl shadow-2xl border border-green-200">
          <div className="w-24 h-24 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-3xl text-emerald-600">📰</span>
          </div>
          <h1 className="text-3xl font-bold text-emerald-800 mb-4">No news available</h1>
          <p className="text-lg text-emerald-700">
            News feed is populating. Check back in a few minutes.
          </p>
        </div>
      </div>
    );
  }

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment?.toLowerCase()) {
      case "positive":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "negative":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment?.toLowerCase()) {
      case "positive": return "😊";
      case "negative": return "😟";
      default: return "😐";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold rounded-3xl shadow-2xl mb-8 text-lg">
            Crypto News Feed • Updated Every 10 Minutes
          </div>
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-emerald-700 via-green-700 to-emerald-800 bg-clip-text text-transparent mb-6">
            Latest Crypto News
          </h1>
          <p className="text-xl text-emerald-700 font-semibold max-w-2xl mx-auto">
            Stay ahead with real-time cryptocurrency news from trusted sources
          </p>
        </div>

        {/* Stats */}
        <div className="text-center mb-16 bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-emerald-200 shadow-xl">
          <h2 className="text-3xl font-black text-emerald-800 mb-2">News Feed</h2>
          <p className="text-emerald-600 font-bold">{news.length} latest articles loaded</p>
        </div>

        {/* News Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {news.map((item: NewsItem) => (
            <article
              key={item.id || item.url}
              className="group bg-white shadow-lg border border-emerald-100 rounded-3xl p-8 hover:shadow-emerald-300/50 hover:shadow-2xl hover:-translate-y-3 hover:border-emerald-300 transition-all duration-500 overflow-hidden relative"
            >
              {/* Decorative top gradient bar */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 to-green-400" />

              {/* Header: Source */}
              <header className="mb-6 pb-6 border-b border-emerald-100">
                <span className="inline-flex items-center px-4 py-2 bg-emerald-100 text-emerald-800 text-sm font-bold rounded-2xl border border-emerald-200 shadow-sm">
                  {item.source}
                </span>
              </header>

              {/* Sentiment Badge */}
              {item.sentiment && (
                <div className="mb-6">
                  <span className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-2xl border shadow-sm ${getSentimentColor(item.sentiment)}`}>
                    {getSentimentIcon(item.sentiment)} {item.sentiment.toUpperCase()}
                  </span>
                </div>
              )}

              {/* Title Link */}
              <div className="mb-8">
                <Link
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block font-black text-2xl text-emerald-900 group-hover:text-emerald-700 transition-colors hover:underline decoration-2 underline-offset-4"
                >
                  {item.title}
                </Link>
              </div>

              {/* Published Time */}
              <footer className="text-center pt-6">
                <div className="inline-block px-6 py-3 bg-emerald-50 border-2 border-dashed border-emerald-200 rounded-2xl text-emerald-700 font-mono text-sm shadow-inner">
                  {new Date(item.published_at).toLocaleString("en-GB", {
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
          <h3 className="text-2xl font-black text-emerald-800 mb-4">Crypto News Summary</h3>
          <p className="text-lg text-emerald-700">
            Displaying{" "}
            <strong className="text-2xl">{news.length}</strong> latest articles from trusted sources
          </p>
          <p className="text-sm text-emerald-600 mt-2">
            Powered by PrimeVest News Aggregator • Updates every 10 minutes
          </p>
        </div>
      </div>
    </div>
  );
}

