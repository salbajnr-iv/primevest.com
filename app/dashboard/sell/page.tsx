"use client";

import React from "react";
import DashboardHeader from "@/components/DashboardHeader";
import { useRouter } from "next/navigation";

type Asset = {
  symbol: string;
  name: string;
  price: number;
  balance: number;
};

const assets: Asset[] = [
  { symbol: "BTC", name: "Bitcoin", price: 45234.50, balance: 0.0021 },
  { symbol: "ETH", name: "Ethereum", price: 2845.30, balance: 0.030 },
];

export default function SellSelectPage() {
  const router = useRouter();
  const [asset, setAsset] = React.useState(assets[0]);
  const [amount, setAmount] = React.useState("");
  const [showDropdown, setShowDropdown] = React.useState(false);
  
  var estimatedValue = amount ? (parseFloat(amount) * asset.price).toFixed(2) : "0.00";
  var fee = amount ? (parseFloat(estimatedValue) * 0.01).toFixed(2) : "0.00";
  var total = amount ? (parseFloat(estimatedValue) - parseFloat(fee)).toFixed(2) : "0.00";

  function next() {
    if (!amount || parseFloat(amount) <= 0) return;
    router.push("/dashboard/sell/review?asset=" + encodeURIComponent(asset.name + " (" + asset.symbol + ")") + "&amount=" + amount + "&estimated=" + estimatedValue + "&fee=" + fee + "&total=" + total);
  }

  return (
    React.createElement("div", { className: "dashboard-container" },
      React.createElement("div", { className: "dashboard-app" },
        React.createElement(DashboardHeader, { userName: "User" }),
        React.createElement("main", { className: "page-card" },
          React.createElement("h2", null, "Verkaufen"),
          React.createElement("div", { className: "form-row" },
            React.createElement("label", null, "Asset"),
            React.createElement("select", { 
              value: asset.symbol,
              onChange: function(e) {
                var selected = assets.find(function(a) { return a.symbol === (e.target as HTMLSelectElement).value; });
                if (selected) setAsset(selected);
              }
            },
              assets.map(function(a) {
                return React.createElement("option", { key: a.symbol, value: a.symbol }, a.name + " (" + a.symbol + ")");
              })
            )
          ),
          React.createElement("div", { className: "form-row" },
            React.createElement("label", null, "Menge (" + asset.symbol + ")"),
            React.createElement("input", {
              type: "number",
              value: amount,
              onChange: function(e) { setAmount((e.target as HTMLInputElement).value); },
              placeholder: "0.001"
            })
          ),
          React.createElement("div", { className: "price-estimate" },
            React.createElement("div", { className: "price-estimate-row" },
              React.createElement("span", { className: "price-estimate-label" }, "Preis"),
              React.createElement("span", { className: "price-estimate-value" }, asset.price.toLocaleString("de-DE", { style: "currency", currency: "EUR" }))
            ),
            React.createElement("div", { className: "price-estimate-row" },
              React.createElement("span", { className: "price-estimate-label" }, "Erhalt"),
              React.createElement("span", { className: "price-estimate-value highlight" }, estimatedValue + " EUR")
            )
          ),
          React.createElement("div", { style: { display: "flex", gap: "8px", marginTop: "16px" } },
            React.createElement("button", { className: "btn", onClick: function() { router.push("/dashboard/portfolio"); } }, "Abbrechen"),
            React.createElement("button", { className: "btn-primary", onClick: next, disabled: !amount }, "Weiter")
          )
        )
      )
    )
  );
}
