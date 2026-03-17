"use client";

import React from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/DashboardHeader";
import { TransactionActionFooter, TransactionPageHeader } from "@/components/ui/transactional-page";
import styles from "@/components/ui/transactional-pages.module.css";

type QuoteErrorCode = "quote_expired" | "insufficient_liquidity" | "amount_bounds" | "invalid_quote" | "invalid_pair" | "slippage_out_of_range" | "invalid_slippage_tolerance" | "missing_quote_timestamp" | "missing_expected_rate" | "missing_min_received" | "quote_stale" | "min_received_violation";

type ReviewState = {
  from: string;
  to: string;
  amount: number;
  slippageTolerance: number;
  quoteId: string;
  quoteTimestamp: number;
  expectedRate: number;
  rate: number;
  fee: number;
  slippageEstimate: number;
  minReceived: number;
  expectedReceive: number;
  expiresAt: number;
};

function errorText(code?: QuoteErrorCode) {
  switch (code) {
    case "quote_expired":
      return "This quote has expired. Go back and request a fresh quote.";
    case "insufficient_liquidity":
      return "Insufficient liquidity at execution time. Try a lower amount.";
    case "amount_bounds":
      return "Amount no longer satisfies the allowed range.";
    case "slippage_out_of_range":
    case "invalid_slippage_tolerance":
      return "Slippage tolerance is invalid. Return and set a value between 0.10% and 5.00%.";
    case "quote_stale":
      return "Quote is stale. Please go back and request a fresh quote.";
    case "min_received_violation":
      return "Current market output is below your minimum received amount.";
    case "missing_quote_timestamp":
    case "missing_expected_rate":
    case "missing_min_received":
    case "invalid_quote":
    case "invalid_pair":
    default:
      return "Quote validation failed. Please restart the swap flow.";
  }
}

export default function SwapReviewPage() {
  const router = useRouter();
  const [review, setReview] = React.useState<ReviewState | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [timeLeft, setTimeLeft] = React.useState(0);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nextReview: ReviewState = {
      from: params.get("from") || "",
      to: params.get("to") || "",
      amount: Number(params.get("amount") || "0"),
      slippageTolerance: Number(params.get("slippageTolerance") || "0"),
      quoteId: params.get("quoteId") || "",
      quoteTimestamp: Number(params.get("quoteTimestamp") || "0"),
      expectedRate: Number(params.get("expectedRate") || "0"),
      rate: Number(params.get("rate") || "0"),
      fee: Number(params.get("fee") || "0"),
      slippageEstimate: Number(params.get("slippageEstimate") || "0"),
      minReceived: Number(params.get("minReceived") || "0"),
      expectedReceive: Number(params.get("expectedReceive") || "0"),
      expiresAt: Number(params.get("expiresAt") || "0"),
    };

    const invalid =
      !nextReview.from ||
      !nextReview.to ||
      nextReview.from === nextReview.to ||
      !Number.isFinite(nextReview.amount) ||
      nextReview.amount <= 0 ||
      !Number.isFinite(nextReview.slippageTolerance) ||
      nextReview.slippageTolerance < 0.1 ||
      nextReview.slippageTolerance > 5 ||
      !nextReview.quoteId ||
      !Number.isFinite(nextReview.quoteTimestamp) ||
      !Number.isFinite(nextReview.expectedRate) ||
      !Number.isFinite(nextReview.expiresAt) ||
      !Number.isFinite(nextReview.rate) ||
      !Number.isFinite(nextReview.fee) ||
      !Number.isFinite(nextReview.minReceived) ||
      !Number.isFinite(nextReview.expectedReceive);

    if (invalid) {
      setError("Missing or invalid quote metadata. Please restart swap.");
      return;
    }

    if (nextReview.expiresAt <= Date.now()) {
      setError(errorText("quote_expired"));
      setReview(nextReview);
      return;
    }

    setReview(nextReview);
  }, []);

  React.useEffect(() => {
    if (!review) return;

    const timer = setInterval(() => {
      const seconds = Math.max(0, Math.floor((review.expiresAt - Date.now()) / 1000));
      setTimeLeft(seconds);
      if (seconds === 0) {
        setError(errorText("quote_expired"));
      }
    }, 500);

    return () => clearInterval(timer);
  }, [review]);

  async function confirm() {
    if (!review || isSubmitting) return;
    if (review.expiresAt <= Date.now()) {
      setError(errorText("quote_expired"));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/swap/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(review),
      });
      const data = await response.json();

      if (!response.ok || !data?.ok) {
        setError(errorText(data?.code));
        return;
      }

      router.push(`/dashboard/swap/success?from=${review.from}&to=${review.to}&amount=${review.amount}&received=${data.settledAmount}&id=${data.executionId}`);
    } catch {
      setError("Failed to submit swap. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const isExpired = review ? review.expiresAt <= Date.now() : true;

  return (
    <div className="dashboard-container">
      <div className="dashboard-app">
        <DashboardHeader userName="User" />

        <main className="page-card">
          <TransactionPageHeader title="Confirm swap" subtitle="Please review quote and execution limits before submitting." />

          {review && (
            <div className={styles.reviewList}>
              <p><strong>From:</strong> {review.amount} {review.from}</p>
              <p><strong>To (estimated):</strong> {review.expectedReceive} {review.to}</p>
              <p><strong>Rate:</strong> 1 {review.from} = {review.expectedRate} {review.to}</p>
              <p><strong>Fee:</strong> {review.fee} {review.to}</p>
              <p><strong>Slippage estimate:</strong> {review.slippageEstimate}%</p>
              <p><strong>Your slippage tolerance:</strong> {review.slippageTolerance}%</p>
              <p><strong>Minimum received:</strong> {review.minReceived} {review.to}</p>
              <p><strong>Quote ID:</strong> {review.quoteId}</p>
              <p><strong>Quote expires in:</strong> {timeLeft}s</p>
            </div>
          )}

          {error && <div className={styles.errorTextTight}>{error}</div>}

          <TransactionActionFooter
            compact
            secondary={<button className="btn" onClick={() => router.back()}>Back</button>}
            primary={<button className="btn btn-primary" onClick={confirm} disabled={!review || isSubmitting || isExpired}>{isSubmitting ? "Submitting..." : "Submit Swap"}</button>}
          />
        </main>
      </div>
    </div>
  );
}
