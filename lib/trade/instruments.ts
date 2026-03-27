export interface TradeInstrumentMetadata {
  pair: string;
  pairId: string;
  base: string;
  quote: string;
  minAmount: number;
  maxAmount: number;
  priceDecimals: number;
  amountDecimals: number;
}

export const TRADE_INSTRUMENTS: TradeInstrumentMetadata[] = [
  { pair: "BTC/EUR", pairId: "BTC/EUR", base: "BTC", quote: "EUR", minAmount: 0.0001, maxAmount: 100, priceDecimals: 2, amountDecimals: 6 },
  { pair: "ETH/EUR", pairId: "ETH/EUR", base: "ETH", quote: "EUR", minAmount: 0.001, maxAmount: 1000, priceDecimals: 2, amountDecimals: 5 },
  { pair: "BNB/EUR", pairId: "BNB/EUR", base: "BNB", quote: "EUR", minAmount: 0.01, maxAmount: 10000, priceDecimals: 2, amountDecimals: 3 },
  { pair: "SOL/EUR", pairId: "SOL/EUR", base: "SOL", quote: "EUR", minAmount: 0.1, maxAmount: 100000, priceDecimals: 2, amountDecimals: 2 },
  { pair: "XRP/EUR", pairId: "XRP/EUR", base: "XRP", quote: "EUR", minAmount: 1, maxAmount: 10000000, priceDecimals: 4, amountDecimals: 0 },
  { pair: "ADA/EUR", pairId: "ADA/EUR", base: "ADA", quote: "EUR", minAmount: 1, maxAmount: 100000000, priceDecimals: 4, amountDecimals: 0 },
];
