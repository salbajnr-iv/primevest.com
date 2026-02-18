"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardHeader from '@/components/DashboardHeader';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface KycRequest {
  id: string;
  status: string;
  submitted_at: string;
  reviewed_at?: string | null;
  review_reason?: string | null;
}

interface StatusConfig {
  label: string;
  icon: string;
  bgColor: string;
  color: string;
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
  none: {
    label: 'Not Started',
    icon: '📋',
    bgColor: 'bg-gray-800',
    color: 'text-gray-300',
  },
  pending_review: {
    label: 'Pending Review',
    icon: '⏳',
    bgColor: 'bg-yellow-800',
    color: 'text-yellow-200',
  },
  approved: {
    label: 'Approved',
    icon: '✅',
    bgColor: 'bg-green-800',
    color: 'text-green-200',
  },
  rejected: {
    label: 'Rejected',
    icon: '❌',
    bgColor: 'bg-red-800',
    color: 'text-red-200',
  },
  resubmit_required: {
    label: 'Resubmit Required',
    icon: '🔄',
    bgColor: 'bg-orange-800',
    color: 'text-orange-200',
  },
};

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-green-800 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

function KycStatusContent() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>('none');
  const [requests, setRequests] = useState<KycRequest[]>([]);
  const [error, setError] = useState<string>('');
  const searchParams = useSearchParams();
  const supabase = createClient();
  const showSuccessMessage = searchParams.get('success') === 'true';

  useEffect(() => {
    const fetchKycStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setStatus('none');
          setLoading(false);
          return;
        }

        // Get current user's KYC requests
        const { data: kycRequests, error: fetchError } = await supabase
          .from('kyc_requests')
          .select('id, status, submitted_at, reviewed_at, review_reason')
          .eq('user_id', user.id)
          .order('submitted_at', { ascending: false })
          .limit(10);

        if (fetchError) {
          console.error('Error fetching KYC status:', fetchError);
          setError('Failed to load KYC status');
          setLoading(false);
          return;
        }

        setRequests(kycRequests || []);
        
        if (kycRequests && kycRequests.length > 0) {
          setStatus(kycRequests[0].status);
        } else {
          setStatus('none');
        }
      } catch (err) {
        console.error('Error:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchKycStatus();
  }, [supabase]);

  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.none;
  const canStartKyc = status === 'none' || status === 'rejected' || status === 'resubmit_required';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-800 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-app">
        <DashboardHeader userName="User" />

        <main className="page-card max-w-2xl mx-auto">
          {/* Success Message */}
          {showSuccessMessage && (
            <div className="mb-6 p-4 bg-green-950/50 border border-green-600 rounded-lg flex items-start gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <h3 className="text-white font-semibold">KYC Submitted Successfully</h3>
                <p className="text-sm text-green-200 mt-1">
                  Your documents have been submitted. We&apos;ll review them within 2-5 business days.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-950/50 border border-red-600 rounded-lg">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Current Status */}
          <div className={`p-6 rounded-lg ${statusConfig.bgColor} border border-gray-600 mb-6`}>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-5xl">{statusConfig.icon}</span>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {statusConfig.label}
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Current KYC Verification Status
                </p>
              </div>
            </div>

            {status === 'approved' && (
              <div className="mt-4 p-3 bg-green-950/50 border border-green-600 rounded text-sm text-green-200">
                Your identity has been verified. You can now use all platform features.
              </div>
            )}

            {status === 'pending_review' && (
              <div className="mt-4 p-3 bg-yellow-950/50 border border-yellow-600 rounded text-sm text-yellow-200">
                Your documents are being reviewed. Please be patient.
              </div>
            )}

            {status === 'rejected' && (
              <div className="mt-4 p-3 bg-red-950/50 border border-red-600 rounded text-sm text-red-200">
                Your KYC was rejected. Please review the documents and try again.
              </div>
            )}

            {status === 'resubmit_required' && (
              <div className="mt-4 p-3 bg-orange-950/50 border border-orange-600 rounded text-sm text-orange-200">
                We need updated documents. Please resubmit your KYC.
              </div>
            )}

            {status === 'none' && (
              <div className="mt-4 p-3 bg-blue-950/50 border border-blue-600 rounded text-sm text-blue-200">
                Start the verification process to unlock full platform access.
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            {canStartKyc && (
              <Link
                href="/profile/kyc/step-1"
                className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold text-center hover:from-green-700 hover:to-green-600 transition-all"
              >
                Start Verification
              </Link>
            )}

            <Link
              href="/profile"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-600 text-gray-300 font-semibold text-center hover:bg-gray-700 transition-colors"
            >
              Back to Profile
            </Link>
          </div>

          {/* Previous Submissions */}
          {requests.length > 0 && (
            <div className="border border-gray-600 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white">Submission History</h3>

              <div className="space-y-3">
                {requests.map((request, idx) => {
                  const requestStatus = STATUS_CONFIG[request.status] || STATUS_CONFIG.none;
                  return (
                    <div key={idx} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-white font-medium">{requestStatus.label}</h4>
                          <p className="text-sm text-gray-400">Submitted: {new Date(request.submitted_at).toLocaleDateString()}</p>
                          {request.reviewed_at && <p className="text-sm text-gray-400">Reviewed: {new Date(request.reviewed_at).toLocaleDateString()}</p>}
                          {request.review_reason && <p className="text-sm text-red-400">Reason: {request.review_reason}</p>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function KycStatusPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <KycStatusContent />
    </Suspense>
  );
}
