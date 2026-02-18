"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import KycStepLayout from '@/components/kyc/KycStepLayout';
import { createClient } from '@/lib/supabase/client';

interface DocumentType {
  id: string;
  name: string;
  description: string;
  icon: string;
  required: boolean;
}

const DOCUMENT_TYPES: DocumentType[] = [
  {
    id: 'id_card',
    name: 'ID Card',
    description: 'National ID card, passport, or driver\'s license',
    icon: '🆔',
    required: true,
  },
  {
    id: 'proof_of_address',
    name: 'Proof of Address',
    description: 'Utility bill, bank statement, or official letter (dated within last 3 months)',
    icon: '🏠',
    required: true,
  },
  {
    id: 'selfie',
    name: 'Selfie with ID',
    description: 'Face clearly visible while holding your ID document',
    icon: '🤳',
    required: true,
  },
];

const STEPS = ['Personal Info', 'Documents', 'Upload', 'Review'];

export default function KycStep2Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string>();
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());

  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        router.push('/auth/signin');
        return;
      }
      setUserId(session.user.id);

      // Try to load existing selection
      const { data: profile } = await supabase
        .from('profiles')
        .select('kyc_documents_selected')
        .eq('id', session.user.id)
        .single();

      if (profile?.kyc_documents_selected) {
        setSelectedDocuments(new Set(profile.kyc_documents_selected));
      } else {
        // Default to all required documents
        setSelectedDocuments(new Set(DOCUMENT_TYPES.filter(d => d.required).map(d => d.id)));
      }
    };

    getUser();
  }, [supabase, router]);

  const toggleDocument = (docId: string) => {
    setSelectedDocuments((prev) => {
      const next = new Set(prev);
      if (next.has(docId)) {
        next.delete(docId);
      } else {
        next.add(docId);
      }
      return next;
    });
  };

  const handleNext = async () => {
    if (selectedDocuments.size === 0) {
      alert('Please select at least one document');
      return;
    }

    setLoading(true);
    try {
      if (userId) {
        const { error } = await supabase
          .from('profiles')
          .update({ kyc_documents_selected: Array.from(selectedDocuments) })
          .eq('id', userId);

        if (error) {
          console.error('Error saving document selection:', error);
          return;
        }
      }

      router.push('/profile/kyc/step-3');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KycStepLayout
      currentStep={2}
      totalSteps={4}
      steps={STEPS}
      title="Select Documents"
      description="Choose the documents you want to upload for verification"
      nextButtonText="Continue to Upload"
      nextDisabled={selectedDocuments.size === 0 || !userId}
      isLoading={loading}
      onNext={handleNext}
      onPrev={() => router.push('/profile/kyc/step-1')}
    >
      <div className="space-y-4">
        {/* Document Selection Cards */}
        {DOCUMENT_TYPES.map((doc) => (
          <div
            key={doc.id}
            onClick={() => toggleDocument(doc.id)}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              selectedDocuments.has(doc.id)
                ? 'border-green-500 bg-green-950/20'
                : 'border-gray-600 bg-gray-800/30 hover:border-gray-500'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl flex-shrink-0">{doc.icon}</div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-white">{doc.name}</h3>
                  {doc.required && (
                    <span className="text-xs bg-red-600/50 text-red-200 px-2 py-1 rounded">
                      Required
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400 mt-1">{doc.description}</p>
              </div>

              <div
                className={`flex-shrink-0 w-6 h-6 border-2 rounded flex items-center justify-center transition-all ${
                  selectedDocuments.has(doc.id)
                    ? 'border-green-500 bg-green-500'
                    : 'border-gray-600'
                }`}
              >
                {selectedDocuments.has(doc.id) && (
                  <span className="text-white font-bold">✓</span>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Info Box */}
        <div className="p-4 bg-blue-950/30 border border-blue-600/50 rounded-lg space-y-2 mt-6">
          <p className="text-sm text-blue-200 font-semibold">📋 Requirements:</p>
          <ul className="text-sm text-blue-200 space-y-1 ml-4 list-disc">
            <li>Documents must be clear and legible</li>
            <li>All four corners/edges must be visible</li>
            <li>No glare or shadows covering important details</li>
            <li>File format: JPG, PNG, WebP, or PDF</li>
            <li>Maximum file size: 15MB per document</li>
          </ul>
        </div>

        {/* Selected Count */}
        <div className="p-3 bg-gray-800 rounded-lg text-center">
          <p className="text-sm text-gray-400">
            You have selected{' '}
            <span className="text-green-400 font-semibold">{selectedDocuments.size}</span> document
            {selectedDocuments.size !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </KycStepLayout>
  );
}
