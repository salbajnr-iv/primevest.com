import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type Currency = "EUR" | "BTC" | "ETH" | "USDT";

const networkFee: Record<Currency, number> = {
  EUR: 1,
  BTC: 0.0002,
  ETH: 0.003,
  USDT: 2,
};

const amountPrecision: Record<Currency, number> = {
  EUR: 2,
  USDT: 2,
  BTC: 6,
  ETH: 6,
};

const destinationValidators: Record<Currency, RegExp> = {
  EUR: /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/,
  BTC: /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/,
  ETH: /^0x[a-fA-F0-9]{40}$/,
  USDT: /^(T[1-9A-HJ-NP-Za-km-z]{33}|0x[a-fA-F0-9]{40})$/,
};

function hasValidPrecision(value: number, currency: Currency) {
  const precision = amountPrecision[currency];
  return Number(value.toFixed(precision)) === value;
}

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRole) {
      return NextResponse.json({ error: "Withdrawals are unavailable right now." }, { status: 503 });
    }

    const token = (req.headers.get("authorization") || "").replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Missing authorization token" }, { status: 401 });
    }

    const body = await req.json();
    const currency = String(body.currency || "") as Currency;
    const destination = String(body.destination || "").trim();
    const amount = Number(body.amount);
    const fee = Number(body.fee);

    if (!Object.keys(networkFee).includes(currency)) {
      return NextResponse.json({ error: "Unsupported currency" }, { status: 400 });
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Amount must be greater than zero" }, { status: 400 });
    }

    if (!hasValidPrecision(amount, currency)) {
      return NextResponse.json({ error: `Amount exceeds ${amountPrecision[currency]} decimal places` }, { status: 400 });
    }

    const expectedFee = networkFee[currency];
    if (!Number.isFinite(fee) || Math.abs(fee - expectedFee) > 1e-9) {
      return NextResponse.json({ error: "Invalid fee for selected currency" }, { status: 400 });
    }

    if (!destinationValidators[currency].test(destination)) {
      return NextResponse.json({ error: "Invalid destination format" }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, serviceRole);
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);

    if (userErr || !userData?.user) {
      return NextResponse.json({ error: "Invalid auth token" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("account_balance")
      .eq("id", userData.user.id)
      .maybeSingle();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (amount > Number(profile.account_balance ?? 0)) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    const payout = Number((amount - fee).toFixed(amountPrecision[currency]));
    if (payout <= 0) {
      return NextResponse.json({ error: "Amount must be greater than fee" }, { status: 400 });
    }

    const { data: tx, error: insertErr } = await supabase
      .from("transactions")
      .insert([
        {
          user_id: userData.user.id,
          type: "withdrawal",
          asset: currency,
          amount: `${amount} ${currency}`,
          value: `${payout} ${currency}`,
          status: "pending",
          date: new Date().toLocaleString(),
          created_at: new Date().toISOString(),
        },
      ])
      .select("id,status,created_at")
      .single();

    if (insertErr || !tx) {
      return NextResponse.json({ error: "Failed to create withdrawal request" }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      reference: `WDR-${tx.id}`,
      withdrawal: {
        id: tx.id,
        status: tx.status,
        createdAt: tx.created_at,
        currency,
        payout,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Unexpected error", details: String(error) }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRole) {
    return NextResponse.json({ error: "Withdrawals are unavailable right now." }, { status: 503 });
  }

  try {
    const token = (req.headers.get("authorization") || "").replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Missing authorization token" }, { status: 401 });
    }

    const reference = new URL(req.url).searchParams.get("reference") || "";
    const txId = Number(reference.replace("WDR-", ""));
    if (!Number.isInteger(txId) || txId <= 0) {
      return NextResponse.json({ error: "Invalid withdrawal reference" }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, serviceRole);
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);

    if (userErr || !userData?.user) {
      return NextResponse.json({ error: "Invalid auth token" }, { status: 401 });
    }

    const { data: tx, error } = await supabase
      .from("transactions")
      .select("id,status,created_at")
      .eq("id", txId)
      .eq("user_id", userData.user.id)
      .eq("type", "withdrawal")
      .maybeSingle();

    if (error || !tx) {
      return NextResponse.json({ error: "Withdrawal request not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, reference: `WDR-${tx.id}`, status: tx.status, createdAt: tx.created_at });
  } catch (error) {
    return NextResponse.json({ error: "Unexpected error", details: String(error) }, { status: 500 });
  }
}
