"use client";

export const dynamic = "force-dynamic";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
<<<<<<< HEAD
import { createClient } from "@supabase/supabase-js";
=======
>>>>>>> 815276c (`Updated various files across the application to enhance UI/UX, add new features, and improve functionality.`)
import DashboardHeader from "@/components/DashboardHeader";

export default function BuyReviewPage() {
  const router = useRouter();
  const [asset, setAsset] = React.useState("-");
  const [amount, setAmount] = React.useState("0");
<<<<<<< HEAD
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
=======
>>>>>>> 815276c (`Updated various files across the application to enhance UI/UX, add new features, and improve functionality.`)

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setAsset(params.get("asset") || "-");
    setAmount(params.get("amount") || "0");
  }, []);

<<<<<<< HEAD
  async function confirm() {
    setLoading(true);
    setError("");
    
    try {
      // Get the auth token from Supabase
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
      
      if (sessionErr || !session) {
        setError("Not authenticated");
        return;
      }

      const token = session.access_token;
      const price = 43250; // Example price, in real app this would come from form
      const total = parseFloat(amount) * price;

      // Call the orders API
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          side: "buy",
          asset,
          amount: parseFloat(amount),
          price,
          total,
          orderType: "market",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to create order");
        return;
      }

      const data = await response.json();
      const orderId = data.order.id;

      // Redirect to success with order id
      router.push(`/dashboard/buy/success?asset=${encodeURIComponent(asset)}&amount=${amount}&id=${orderId}`);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
=======
  function confirm() {
    // simulate an API call and then redirect to success with an id
    setTimeout(() => {
      router.push(`/dashboard/buy/success?asset=${encodeURIComponent(asset)}&amount=${amount}&id=ORD-${Date.now()}`);
    }, 700);
>>>>>>> 815276c (`Updated various files across the application to enhance UI/UX, add new features, and improve functionality.`)
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-app">
        <DashboardHeader userName={"User"} />

        <main className="page-card">
          <h2>Bestätigen</h2>
          <p><strong>Asset:</strong> {asset}</p>
          <p><strong>Betrag (EUR):</strong> {amount} €</p>
          <p><strong>Geschätzte Gebühren:</strong> 0,50 €</p>

<<<<<<< HEAD
          {error && (
            <div style={{ 
              color: "red", 
              marginTop: 8, 
              padding: 8, 
              backgroundColor: "#ffeeee", 
              borderRadius: 4 
            }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button 
              className="btn" 
              onClick={() => router.back()}
              disabled={loading}
            >
              Zurück
            </button>
            <button 
              className="btn btn-primary" 
              onClick={confirm}
              disabled={loading}
            >
              {loading ? "wird verarbeitet..." : "Kaufen"}
            </button>
=======
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button className="btn" onClick={() => router.back()}>Zurück</button>
            <button className="btn btn-primary" onClick={confirm}>Kaufen</button>
>>>>>>> 815276c (`Updated various files across the application to enhance UI/UX, add new features, and improve functionality.`)
          </div>
        </main>
      </div>
    </div>
  );
}
