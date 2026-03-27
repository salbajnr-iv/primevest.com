
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { MarketAsset, MarketStats } from "@/lib/dashboard/market-data";

export function useMarketData() {
  const [assets, setAssets] = useState<MarketAsset[]>([]);
  const [stats, setStats] = useState<MarketStats>({
    totalMarketCap: "$0",
    totalMarketCapChange: "0%",
    volume24h: "$0",
    volumeChange: "0%",
    btcDominance: "0%",
    btcDominanceChange: "0%",
    fearGreedIndex: 50,
    fearGreedLabel: "Neutral",
  });
  const [lastTickSymbol, setLastTickSymbol] = useState<string | null>(null);
  const [tickDirection, setTickDirection] = useState<"up" | "down" | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  // Fetch market prices directly (no assets table)
  useEffect(() => {
    async function fetchMarketData() {
      try {
        setLoading(true);

        // Fetch recent live prices from market_prices (no asset join - column directly)
        const { data: pricesData, error } = await supabase
          .from('market_prices')
          .select('asset_id, price, status, captured_at, asset')
          .eq('status', 'live')
          .gte('captured_at', new Date(Date.now() - 24*60*60*1000).toISOString())  // Last 24h
          .order('captured_at', { ascending: false })
          .limit(50);

        if (error || !pricesData || pricesData.length === 0) {
          console.warn('No market prices found:', error);
          setLoading(false);
          return;
        }

        // Get latest price per asset
        const latestPricesMap: Record<string, any> = {};
        (pricesData as any[]).forEach(p => {
          const assetId = p.asset_id;
          if (!latestPricesMap[assetId] || new Date(p.captured_at) > new Date(latestPricesMap[assetId].captured_at)) {
            latestPricesMap[assetId] = p;
          }
        });

        const marketAssets: MarketAsset[] = Object.values(latestPricesMap).map((p: any) => ({
          id: p.asset.id,
          symbol: p.asset.symbol,
          name: p.asset.name || p.asset.symbol,
          category: 'Crypto' as any, // Fallback, extend DB later
          price: p.price,
          change24h: 0, // Can compute from earlier prices
          volume24h: 'N/A',
          marketCap: 'N/A',
          history: [], 
        }));

        setAssets(marketAssets);

        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch market data:', error);
        setLoading(false);
      }
    }

    fetchMarketData();
  }, [supabase]);

  // Realtime new prices
  useEffect(() => {
    const channel = supabase.channel('market_prices_realtime')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'market_prices',
          filter: 'status=eq.live'
        }, 
        (payload: any) => {
          const newPrice = payload.new as any;
          const symbol = newPrice.asset?.symbol || newPrice.asset;
          if (newPrice.price && symbol) {
            console.log('Live tick:', symbol, newPrice.price);
            setLastTickSymbol(symbol);
            // Direction vs previous (approx)
            const prevPrice = assets.find(a => a.symbol === symbol)?.price || newPrice.price;
            setTickDirection(newPrice.price > prevPrice ? 'up' : 'down');
            
            // Update price in list
            setAssets(prev => prev.map(a => 
              a.symbol === symbol ? { ...a, price: newPrice.price } : a
            ));

            setTimeout(() => { 
              setLastTickSymbol(null); 
              setTickDirection(null); 
            }, 2000);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase, assets]);

  return { 
    assets, 
    stats, 
    lastTickSymbol, 
    tickDirection
  };
}
