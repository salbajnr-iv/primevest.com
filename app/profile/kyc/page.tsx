"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/components/DashboardHeader';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function KycPage() {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const checkStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        router.push('/auth/signin');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('kyc_status')
        .eq('id', session.user.id)
        .single();

      setStatus(profile?.kyc_status || 'none');
      setLoading(false);
    };

    checkStatus();
  }, [supabase, router]);

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-app flex items-center justify-center min-h-screen">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-app">
        <DashboardHeader userName="User" />

        <main className="page-card max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Identity Verification</h1>
            <p className="text-gray-400">Verify your identity to unlock full platform access</p>
          </div>

          {/* Status Card */}
          {status && status !== 'none' && (
            <div className="mb-8 p-6 rounded-lg bg-gradient-to-r from-green-950/50 to-green-900/20 border border-green-600/50">
              <div className="flex items-center gap-4">
                <span className="text-4xl">✅</span>
                <div>
                  <h3 className="text-lg font-semibold text-green-200">
                    {status === 'pending_review' && 'Verification in Progress'}
                    {status === 'approved' && 'Verification Complete'}
                    {status === 'rejected' && 'Resubmission Required'}
                  </h3>
                  <p className="text-sm text-green-300 mt-1">
                    {status === 'pending_review' && 'Your documents are under review'}
                    {status === 'approved' && 'Your account is fully verified'}
                    {status === 'rejected' && 'Please update and resubmit your documents'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {/* Start Verification Card */}
            <Link
              href="/profile/kyc/step-1"
              className="p-6 rounded-lg border border-green-600/50 bg-green-950/20 hover:bg-green-950/40 transition-colors group cursor-pointer"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                🚀
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">
                {status && status !== 'none' ? 'Resubmit' : 'Start Verification'}
              </h3>
              <p className="text-sm text-gray-400">
                {status && status !== 'none'
                  ? 'Update and resubmit your documents'
                  : 'Complete the verification process'}
              </p>
            </Link>

            {/* Check Status Card */}
            <Link
              href="/profile/kyc/status"
              className="p-6 rounded-lg border border-blue-600/50 bg-blue-950/20 hover:bg-blue-950/40 transition-colors group cursor-pointer"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                📊
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">
                View Status
              </h3>
              <p className="text-sm text-gray-400">
                Check your verification status and history
              </p>
            </Link>
          </div>

          {/* Requirements */}
          <div className="border border-gray-600 rounded-lg p-6 mb-8 space-y-4">
            <h3 className="text-lg font-semibold text-white">What You'll Need</h3>

            <div className="space-y-3">
              {[
                {
                  icon: '🆔',
                  title: 'Valid ID',
                  desc: 'Passport, National ID Card, or Driver\'s License',
                },
                {
                  icon: '🏠',
                  title: 'Proof of Address',
                  desc: 'Utility bill or Bank statement (dated within 3 months)',
                },
                {
                  icon: '🤳',
                  title: 'Selfie with ID',
                  desc: 'Your face clearly visible while holding your ID',
                },
              ].map((req, idx) => (
                <div key={idx} className="flex gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <span className="text-2xl flex-shrink-0">{req.icon}</span>
                  <div>
                    <p className="font-medium text-white">{req.title}</p>
                    <p className="text-xs text-gray-400">{req.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="border border-gray-600 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">Verification Timeline</h3>

            <div className="space-y-4">
              {[
                { step: 'Submit', time: '5 min', icon: '📝' },
                { step: 'Processing', time: '2-5 days', icon: '⏳' },
                { step: 'Approved', time: 'Instant', icon: '✅' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="text-2xl">{item.icon}</div>
                  <div className="flex-1">
                    <p className="font-medium text-white">{item.step}</p>
                    <p className="text-xs text-gray-400">{item.time}</p>
                  </div>
                  {idx < 2 && (
                    <div className="text-green-400 text-xl">→</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Back Button */}
          <div className="mt-8 flex gap-3">
            <Link
              href="/profile"
              className="flex-1 px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 text-center transition-colors"
            >
              Back to Profile
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
