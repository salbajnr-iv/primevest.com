"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Wallet {
  id: string;
  asset: string;
  network: string;
}

interface BalanceAdjustmentModalProps {
  userId?: string;
  userName?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function BalanceAdjustmentModal({ userId: initialUserId, userName: initialUserName, onClose, onSuccess }: BalanceAdjustmentModalProps) {
  const [userId, setUserId] = useState(initialUserId || '');
  const [userName, setUserName] = useState(initialUserName || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{id: string, email: string, full_name: string | null}[]>([]);
  const [searching, setSearching] = useState(false);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'add' | 'subtract'>('add');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // Search users if no initial userId
  useEffect(() => {
    if (initialUserId) return;
    if (searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .or(`email.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
          .limit(5);
        setSearchResults(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, initialUserId, supabase]);

  useEffect(() => {
    async function fetchWallets() {
      try {
        const tokenRes = await supabase.auth.getSession();
        const token = tokenRes.data?.session?.access_token;
        
        if (!token) throw new Error('Not authenticated');

        const res = await fetch(`/api/admin/wallets?userId=${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.ok && data.wallets.length > 0) {
          setWallets(data.wallets);
          setSelectedWalletId(data.wallets[0].id);
        } else if (data.ok && data.wallets.length === 0) {
          setError('User has no wallets configured.');
        } else {
          throw new Error(data.error || 'Failed to fetch wallets');
        }
      } catch (err) {
        console.error(err);
        setError(String(err));
      } finally {
        setLoading(false);
      }
    }

    if (userId) fetchWallets();
  }, [userId, supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const tokenRes = await supabase.auth.getSession();
      const token = tokenRes.data?.session?.access_token;
      
      if (!token) throw new Error('Not authenticated');

      // System Wallet ID - This would usually be a fixed UUID for the platform/treasury
      const SYSTEM_WALLET_ID = '00000000-0000-0000-0000-000000000000'; 

      const payload = {
        from_wallet_id: type === 'add' ? SYSTEM_WALLET_ID : selectedWalletId,
        to_wallet_id: type === 'add' ? selectedWalletId : SYSTEM_WALLET_ID,
        asset: wallets.find(w => w.id === selectedWalletId)?.asset || 'EUR',
        network: wallets.find(w => w.id === selectedWalletId)?.network || 'mainnet',
        amount: amount,
        idempotency_key: crypto.randomUUID(),
        metadata: {
          reason,
          admin_action: true,
          adjustment_type: type,
          target_user_name: userName
        }
      };

      const res = await fetch('/api/ledger/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Transfer failed');

      alert('Balance adjusted successfully');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError(String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-700 flex items-center justify-between bg-gray-800/50">
          <div>
            <h2 className="text-xl font-bold text-white">Adjust Balance</h2>
            <p className="text-gray-400 text-sm">Target: {userName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6">
          {!userId ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Search User</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Email or Name..."
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {searching ? (
                  <p className="text-gray-400 text-xs text-center">Searching...</p>
                ) : searchResults.map(u => (
                  <button
                    key={u.id}
                    onClick={() => {
                      setUserId(u.id);
                      setUserName(u.full_name || u.email);
                    }}
                    className="w-full p-3 bg-gray-900/50 hover:bg-gray-700 rounded-lg text-left transition-colors border border-gray-700"
                  >
                    <p className="text-white text-sm font-medium">{u.full_name || 'No Name'}</p>
                    <p className="text-gray-400 text-xs">{u.email}</p>
                  </button>
                ))}
                {!searching && searchQuery.length >= 3 && searchResults.length === 0 && (
                  <p className="text-gray-400 text-xs text-center">No users found</p>
                )}
              </div>
            </div>
          ) : loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error && !wallets.length ? (
            <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-200 text-sm mb-4">
              {error}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-200 text-xs">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Adjustment Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('add')}
                    className={`py-2 px-4 rounded-lg border text-sm font-medium transition-all ${
                      type === 'add' 
                      ? 'bg-green-800/20 border-green-700 text-green-400' 
                      : 'bg-gray-700/50 border-gray-600 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    Add Funds (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('subtract')}
                    className={`py-2 px-4 rounded-lg border text-sm font-medium transition-all ${
                      type === 'subtract' 
                      ? 'bg-red-800/20 border-red-700 text-red-400' 
                      : 'bg-gray-700/50 border-gray-600 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    Subtract (-)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Select Wallet</label>
                <select
                  value={selectedWalletId}
                  onChange={(e) => setSelectedWalletId(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                  required
                >
                  {wallets.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.asset} ({w.network})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Amount</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-4 pr-12 py-2.5 text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                    required
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                    {wallets.find(w => w.id === selectedWalletId)?.asset || 'EUR'}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Reason / Note</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. KYC Bonus, Correction for transaction #123..."
                  rows={3}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none resize-none"
                  required
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${
                    type === 'add' 
                    ? 'bg-green-700 hover:bg-green-600 text-white' 
                    : 'bg-red-700 hover:bg-red-600 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {submitting ? 'Processing...' : `Confirm ${type === 'add' ? 'Credit' : 'Debit'}`}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
