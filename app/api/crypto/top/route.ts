import { NextResponse } from "next/server";

type CoinGeckoCoin = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number | null;
  market_cap: number | null;
  price_change_percentage_24h: number | null;
};

type TopCrypto = {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  marketCap: number;
  image: string;
};

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h`,
      {
        next: { revalidate: 60 }, // Cache for 60 seconds
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const coins: CoinGeckoCoin[] = await response.json();

    // Format and filter valid data
    const topCryptos: TopCrypto[] = coins
      .filter(coin => coin.current_price && coin.market_cap && coin.price_change_percentage_24h !== null)
      .map(coin => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        price: coin.current_price!,
        change24h: coin.price_change_percentage_24h!,
        marketCap: coin.market_cap!,
        image: coin.image,
      }))
      .slice(0, 50); // Top 50 as requested

    return NextResponse.json({
      ok: true,
      data: topCryptos,
      timestamp: new Date().toISOString(),
      count: topCryptos.length,
    });
  } catch (error) {
    console.error('CoinGecko API Error:', error);
    return NextResponse.json(
      { 
        ok: false, 
        error: 'Failed to fetch top cryptocurrencies',
        fallback: [] 
      },
      { status: 500 }
    );
  }
}

