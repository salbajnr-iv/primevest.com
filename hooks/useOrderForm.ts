"use client";

import * as React from "react";

export type OrderSide = "buy" | "sell";
export type OrderType = "limit" | "market";

export interface OrderFormData {
  side: OrderSide;
  orderType: OrderType;
  amount: string;
  price: string;
  total: string;
}

export interface OrderValidation {
  isValid: boolean;
  errors: string[];
}

export interface OrderFee {
  fee: number;
  feePercent: number;
  totalWithFee: number;
}

// Trading pair type
export interface TradingPair {
  id: string;
  base: string;  // e.g., "BTC"
  quote: string; // e.g., "EUR"
  price: number;
  change24h: number;
  volume24h: number;
  minAmount: number;
  maxAmount: number;
  priceDecimals: number;
  amountDecimals: number;
}

// Mock trading pairs
export const tradingPairs: TradingPair[] = [
  { id: "btc-eur", base: "BTC", quote: "EUR", price: 43250.00, change24h: 2.45, volume24h: 2840000000, minAmount: 0.0001, maxAmount: 100, priceDecimals: 2, amountDecimals: 6 },
  { id: "eth-eur", base: "ETH", quote: "EUR", price: 2280.50, change24h: 1.82, volume24h: 1210000000, minAmount: 0.001, maxAmount: 1000, priceDecimals: 2, amountDecimals: 5 },
  { id: "bnb-eur", base: "BNB", quote: "EUR", price: 312.40, change24h: -0.54, volume24h: 145000000, minAmount: 0.01, maxAmount: 10000, priceDecimals: 2, amountDecimals: 3 },
  { id: "sol-eur", base: "SOL", quote: "EUR", price: 98.75, change24h: 4.21, volume24h: 890000000, minAmount: 0.1, maxAmount: 100000, priceDecimals: 2, amountDecimals: 2 },
  { id: "xrp-eur", base: "XRP", quote: "EUR", price: 0.62, change24h: 0.89, volume24h: 456000000, minAmount: 1, maxAmount: 10000000, priceDecimals: 4, amountDecimals: 0 },
  { id: "ada-eur", base: "ADA", quote: "EUR", price: 0.52, change24h: -1.23, volume24h: 234000000, minAmount: 1, maxAmount: 100000000, priceDecimals: 4, amountDecimals: 0 },
];

// Order fee structure
const makerFee = 0.001; // 0.1%
const takerFee = 0.0015; // 0.15%

export function useOrderForm(pair: TradingPair, availableBalance: number = 10000) {
  const [formData, setFormData] = React.useState<OrderFormData>({
    side: "buy",
    orderType: "limit",
    amount: "",
    price: pair.price.toFixed(pair.priceDecimals),
    total: "",
  });
  const [orderHistory, setOrderHistory] = React.useState<OrderFormData[]>([]);
  const [lastOrderTime, setLastOrderTime] = React.useState<Date | null>(null);

  // Calculate order total
  const calculateTotal = React.useCallback((amount: string, price: string, orderType: OrderType): string => {
    const amountNum = parseFloat(amount);
    const priceNum = parseFloat(price);
    
    if (isNaN(amountNum) || isNaN(priceNum) || amountNum <= 0) {
      return "";
    }

    const total = amountNum * priceNum;
    return total.toFixed(2);
  }, []);

  // Update total when amount or price changes
  React.useEffect(() => {
    if (formData.amount && formData.orderType === "limit") {
      const total = calculateTotal(formData.amount, formData.price, "limit");
      setFormData(prev => ({ ...prev, total }));
    } else if (formData.amount && formData.orderType === "market") {
      const total = calculateTotal(formData.amount, pair.price.toString(), "market");
      setFormData(prev => ({ ...prev, total, price: pair.price.toFixed(pair.priceDecimals) }));
    }
  }, [formData.amount, formData.price, formData.orderType, pair.price, pair.priceDecimals, calculateTotal]);

  // Validate order
  const validateOrder = React.useCallback((): OrderValidation => {
    const errors: string[] = [];
    const amountNum = parseFloat(formData.amount);
    const priceNum = parseFloat(formData.price);
    const totalNum = parseFloat(formData.total);

    // Check amount
    if (!formData.amount || isNaN(amountNum)) {
      errors.push("Amount is required");
    } else if (amountNum < pair.minAmount) {
      errors.push(`Minimum amount is ${pair.minAmount} ${pair.base}`);
    } else if (amountNum > pair.maxAmount) {
      errors.push(`Maximum amount is ${pair.maxAmount} ${pair.base}`);
    }

    // Check price for limit orders
    if (formData.orderType === "limit") {
      if (!formData.price || isNaN(priceNum) || priceNum <= 0) {
        errors.push("Price is required");
      }
    }

    // Check balance
    if (totalNum > availableBalance) {
      errors.push(`Insufficient balance. Available: €${availableBalance.toFixed(2)}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [formData, pair, availableBalance]);

  // Calculate fees
  const calculateFee = React.useCallback((total: number): OrderFee => {
    const fee = total * takerFee;
    return {
      fee,
      feePercent: takerFee * 100,
      totalWithFee: total + fee,
    };
  }, []);

  // Submit order
  const submitOrder = React.useCallback(() => {
    const validation = validateOrder();
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    // Add to order history
    const newOrder: OrderFormData = {
      ...formData,
      amount: parseFloat(formData.amount).toFixed(pair.amountDecimals),
      total: parseFloat(formData.total).toFixed(2),
    };

    setOrderHistory(prev => [newOrder, ...prev].slice(0, 10)); // Keep last 10 orders
    setLastOrderTime(new Date());

    // Reset form
    setFormData({
      side: formData.side,
      orderType: formData.orderType,
      amount: "",
      price: pair.price.toFixed(pair.priceDecimals),
      total: "",
    });

    return { success: true, order: newOrder };
  }, [formData, pair, validateOrder]);

  // Update form data
  const updateField = React.useCallback((field: keyof OrderFormData, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Recalculate total if amount or price changes
      if (field === "amount" || field === "price") {
        if (newData.orderType === "limit") {
          newData.total = calculateTotal(newData.amount, newData.price, "limit");
        } else {
          newData.total = calculateTotal(newData.amount, pair.price.toString(), "market");
        }
      }
      
      return newData;
    });
  }, [pair.price, pair.priceDecimals, calculateTotal]);

  // Set max amount
  const setMaxAmount = React.useCallback(() => {
    if (formData.side === "buy") {
      // Calculate max amount based on balance
      const price = formData.orderType === "limit" ? parseFloat(formData.price) : pair.price;
      const maxAmount = Math.min((availableBalance * 0.99) / price, pair.maxAmount);
      updateField("amount", maxAmount.toFixed(pair.amountDecimals));
    } else {
      // Sell max - would be actual balance
      updateField("amount", pair.maxAmount.toFixed(pair.amountDecimals));
    }
  }, [formData.side, formData.orderType, formData.price, pair, availableBalance, updateField]);

  // Quick percentage buttons
  const setPercentage = React.useCallback((percent: number) => {
    const price = formData.orderType === "limit" ? parseFloat(formData.price) : pair.price;
    const maxAmount = (availableBalance * percent) / price;
    const amount = Math.min(maxAmount, pair.maxAmount);
    updateField("amount", amount.toFixed(pair.amountDecimals));
  }, [formData.orderType, formData.price, pair, availableBalance, updateField]);

  return {
    formData,
    updateField,
    setMaxAmount,
    setPercentage,
    validateOrder,
    calculateFee,
    submitOrder,
    orderHistory,
    lastOrderTime,
    pair,
    availableBalance,
  };
}

// Format currency
export function formatCurrency(value: number, currency: string = "EUR"): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// Format number with decimals
export function formatNumber(value: number, decimals: number): string {
  return value.toFixed(decimals);
}

