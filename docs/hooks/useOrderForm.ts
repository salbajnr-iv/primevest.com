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

export interface TradeInstrument {
  pair: string;
  pairId: string;
  base: string;
  quote: string;
  minAmount: number;
  maxAmount: number;
  priceDecimals: number;
  amountDecimals: number;
  price: number;
}

// Order fee structure
const takerFee = 0.0015; // 0.15%

export function useOrderForm(instrument: TradeInstrument, availableBalance: number = 10000, initialSide?: OrderSide) {
  const [formData, setFormData] = React.useState<OrderFormData>({
    side: initialSide || "buy",
    orderType: "limit",
    amount: "",
    price: instrument.price.toFixed(instrument.priceDecimals),
    total: "",
  });
  const [orderHistory, setOrderHistory] = React.useState<OrderFormData[]>([]);
  const [lastOrderTime, setLastOrderTime] = React.useState<Date | null>(null);

  React.useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      amount: "",
      total: "",
      price: instrument.price.toFixed(instrument.priceDecimals),
    }));
  }, [instrument.pairId, instrument.price, instrument.priceDecimals]);

  const calculateTotal = React.useCallback((amount: string, price: string): string => {
    const amountNum = parseFloat(amount);
    const priceNum = parseFloat(price);

    if (isNaN(amountNum) || isNaN(priceNum) || amountNum <= 0 || priceNum <= 0) {
      return "";
    }

    return (amountNum * priceNum).toFixed(2);
  }, []);

  React.useEffect(() => {
    if (!formData.amount) {
      setFormData((prev) => ({ ...prev, total: "" }));
      return;
    }

    if (formData.orderType === "limit") {
      const total = calculateTotal(formData.amount, formData.price);
      setFormData((prev) => ({ ...prev, total }));
      return;
    }

    const total = calculateTotal(formData.amount, instrument.price.toString());
    setFormData((prev) => ({
      ...prev,
      total,
      price: instrument.price.toFixed(instrument.priceDecimals),
    }));
  }, [formData.amount, formData.price, formData.orderType, instrument.price, instrument.priceDecimals, calculateTotal]);

  const validateOrder = React.useCallback((): OrderValidation => {
    const errors: string[] = [];
    const amountNum = parseFloat(formData.amount);
    const priceNum = parseFloat(formData.price);
    const totalNum = parseFloat(formData.total);

    if (!formData.amount || isNaN(amountNum)) {
      errors.push("Amount is required");
    } else if (amountNum < instrument.minAmount) {
      errors.push(`Minimum amount is ${instrument.minAmount} ${instrument.base}`);
    } else if (amountNum > instrument.maxAmount) {
      errors.push(`Maximum amount is ${instrument.maxAmount} ${instrument.base}`);
    }

    if (formData.orderType === "limit" && (!formData.price || isNaN(priceNum) || priceNum <= 0)) {
      errors.push("Price is required");
    }

    if (totalNum > availableBalance) {
      errors.push(`Insufficient balance. Available: €${availableBalance.toFixed(2)}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [formData, instrument, availableBalance]);

  const calculateFee = React.useCallback((total: number): OrderFee => {
    const fee = total * takerFee;
    return {
      fee,
      feePercent: takerFee * 100,
      totalWithFee: total + fee,
    };
  }, []);

  const submitOrder = React.useCallback(async () => {
    const validation = validateOrder();
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    try {
      const token = localStorage.getItem("supabase.auth.token");
      if (!token) {
        return { success: false, errors: ["Authentication required"] };
      }

      const authToken = JSON.parse(token).access_token;

      const orderData = {
        side: formData.side,
        asset: instrument.base,
        pair: instrument.pair,
        pairId: instrument.pairId,
        amount: parseFloat(formData.amount),
        price: formData.orderType === "limit" ? parseFloat(formData.price) : null,
        total: parseFloat(formData.total),
        orderType: formData.orderType,
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, errors: [result.error || result.message || "Failed to submit order"] };
      }

      const newOrder: OrderFormData = {
        ...formData,
        amount: parseFloat(formData.amount).toFixed(instrument.amountDecimals),
        total: parseFloat(formData.total).toFixed(2),
      };

      setOrderHistory((prev) => [newOrder, ...prev].slice(0, 10));
      setLastOrderTime(new Date());

      setFormData({
        side: formData.side,
        orderType: formData.orderType,
        amount: "",
        price: instrument.price.toFixed(instrument.priceDecimals),
        total: "",
      });

      return { success: true, order: result.order ?? result.data?.order };
    } catch (error) {
      console.error("Order submission error:", error);
      return { success: false, errors: ["Network error. Please try again."] };
    }
  }, [formData, instrument, validateOrder]);

  const updateField = React.useCallback((field: keyof OrderFormData, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      if (field === "amount" || field === "price") {
        newData.total = newData.orderType === "limit"
          ? calculateTotal(newData.amount, newData.price)
          : calculateTotal(newData.amount, instrument.price.toString());
      }
      return newData;
    });
  }, [instrument.price, calculateTotal]);

  const setMaxAmount = React.useCallback(() => {
    if (formData.side === "buy") {
      const price = formData.orderType === "limit" ? parseFloat(formData.price) : instrument.price;
      if (!Number.isFinite(price) || price <= 0) {
        return;
      }
      const maxAmount = Math.min((availableBalance * 0.99) / price, instrument.maxAmount);
      updateField("amount", maxAmount.toFixed(instrument.amountDecimals));
      return;
    }

    updateField("amount", instrument.maxAmount.toFixed(instrument.amountDecimals));
  }, [formData.side, formData.orderType, formData.price, instrument, availableBalance, updateField]);

  const setPercentage = React.useCallback((percent: number) => {
    const price = formData.orderType === "limit" ? parseFloat(formData.price) : instrument.price;
    if (!Number.isFinite(price) || price <= 0) {
      return;
    }
    const maxAmount = (availableBalance * percent) / price;
    const amount = Math.min(maxAmount, instrument.maxAmount);
    updateField("amount", amount.toFixed(instrument.amountDecimals));
  }, [formData.orderType, formData.price, instrument, availableBalance, updateField]);

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
    instrument,
    availableBalance,
  };
}

export function formatCurrency(value: number, currency: string = "EUR"): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number, decimals: number): string {
  return value.toFixed(decimals);
}
