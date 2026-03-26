"use client";

import * as React from "react";

import { useAuth } from "@/contexts/AuthContext";

const TradeWPositions: React.FC = () => {
  const { user } = useAuth();

  return (
    <section className="trade-positions-panel">
      <h3>Positions</h3>
      <p>{user ? "Your open positions will appear here." : "Sign in to view positions."}</p>
    </section>
  );
};

export default TradeWPositions;
