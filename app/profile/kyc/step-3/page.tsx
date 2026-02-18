"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import KycStepLayout from '@/components/kyc/KycStepLayout';
import EnhancedKycUploader from '@/components/kyc/EnhancedKycUploader';
import { createClient } from '@/lib/supabase/client';

interface DocumentInfo {
  id: string;
  name: string;
  label: string;
  icon: string;
}

const DOCUMENTS: Record<string, DocumentInfo> = {
  id_card: {
    id: 'id_card',
    name: 'ID Card',
    label: 'National ID, Passport, or Driver\'s License',
    icon: '🆔',
  },
  proof_of_address: {
    id: 'proof_of_address',
    name: 'Proof of Address',
    label: 'Utility Bill, Bank Statement, or Official Letter',
    icon: '🏠',
  },
  selfie: {
    id: 'selfie',
    name: 'Selfie with ID',
    label: 'Your Face with ID Document',
    icon: '🤳',
  },
};

interface UploadedFile {
  storage_path: string;
  file_name: string;
  mime_type?: string | null;
  size?: number | null;
  doc_type: string;
}

const STEPS = ['Personal Info', 'Documents', 'Upload', 'Review'];

export default function KycStep3Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string>();
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [uploadedFiles, setUploadedFiles] = useState<Map<string, UploadedFile[]>>(new Map());
  const [currentStep, setCurrentStep] = useState(0);

  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        router.push('/auth/signin');
        return;
      }
      setUserId(session.user.id);

      // Load document selection from step 2
      const { data: profile } = await supabase
        .from('profiles')
        .select('kyc_documents_selected, kyc_uploaded_files')
        .eq('id', session.user.id)
        .single();

      if (profile?.kyc_documents_selected) {
        setSelectedDocuments(new Set(profile.kyc_documents_selected));
      }

      if (profile?.kyc_uploaded_files) {
        const filesMap = new Map();
        profile.kyc_uploaded_files.forEach((file: UploadedFile) => {
          if (!filesMap.has(file.doc_type)) {
            filesMap.set(file.doc_type, []);
          }
          filesMap.get(file.doc_type).push(file);
        });
        setUploadedFiles(filesMap);
      }
    };

    getUser();
  }, [supabase, router]);

  const handleFileUploaded = (docType: string, files: UploadedFile[]) => {
    setUploadedFiles((prev) => {
      const next = new Map(prev);
      if (!next.has(docType)) {
        next.set(docType, []);
      }
      next.set(docType, [...(next.get(docType) || []), ...files]);
      return next;
    });
  };

  const getDocumentIndex = (docType: string) => {
    const docArray = Array.from(selectedDocuments);
    return docArray.indexOf(docType) + 1;
  };

  const handleNext = async () => {
    // Check if all selected documents have been uploaded
    const allUploaded = Array.from(selectedDocuments).every(
      (docType) => uploadedFiles.has(docType) && uploadedFiles.get(docType)!.length > 0
    );

    if (!allUploaded) {
      alert('Please upload all selected documents before proceeding');
      return;
    }

    setLoading(true);
    try {
      if (userId) {
        const allFiles = Array.from(uploadedFiles.values()).flat();
        const { error } = await supabase
          .from('profiles')
          .update({ kyc_uploaded_files: allFiles })
          .eq('id', userId);

        if (error) {
          console.error('Error saving uploaded files:', error);
          return;
        }
      }

      router.push('/profile/kyc/step-4');
    } finally {
      setLoading(false);
    }
  };

  const isAllUploaded = Array.from(selectedDocuments).every(
    (docType) => uploadedFiles.has(docType) && uploadedFiles.get(docType)!.length > 0
  );

  const sortedDocuments = Array.from(selectedDocuments).sort();

  return (
    <KycStepLayout
      currentStep={3}
      totalSteps={4}
      steps={STEPS}
      title="Upload Documents"
      description="Upload the documents you selected in the previous step"
      nextButtonText="Continue to Review"
      nextDisabled={!isAllUploaded || !userId}
      isLoading={loading}
      onNext={handleNext}
      onPrev={() => router.push('/profile/kyc/step-2')}
    >
      <div className="space-y-8">
        {sortedDocuments.map((docType) => {
          const docInfo = DOCUMENTS[docType];
          const isUploaded =
            uploadedFiles.has(docType) && uploadedFiles.get(docType)!.length > 0;

          return (
            <div key={docType} className="border-l-4 border-green-500 pl-6 py-4">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{docInfo.icon}</span>
                <div>
                  <h3 className="text-lg font-semibold text-white">{docInfo.name}</h3>
                  <p className="text-sm text-gray-400">{docInfo.label}</p>
                </div>
                {isUploaded && (
                  <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-green-950/50 rounded-full border border-green-600">
                    <span className="text-green-400 text-lg">✓</span>
                    <span className="text-xs text-green-300">Uploaded</span>
                  </div>
                )}
              </div>

              <EnhancedKycUploader
                userId={userId || ''}
                docType={docType}
                docLabel={`Upload ${docInfo.name}`}
                onUploaded={(files) => handleFileUploaded(docType, files)}
                maxFiles={3}
              />

              {uploadedFiles.has(docType) && (
                <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-xs text-gray-400 mb-2">
                    {uploadedFiles.get(docType)!.length} file(s) uploaded:
                  </p>
                  <ul className="space-y-1">
                    {uploadedFiles.get(docType)!.map((file, idx) => (
                      <li key={idx} className="text-xs text-gray-300">
                        • {file.file_name}
                        {file.size && (
                          <span className="text-gray-500">
                            {' '}({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}

        {/* Progress Summary */}
        <div className="p-4 bg-gray-800/50 rounded-lg">
          <div className="space-y-2">
            {sortedDocuments.map((docType) => {
              const docInfo = DOCUMENTS[docType];
              const isUploaded =
                uploadedFiles.has(docType) && uploadedFiles.get(docType)!.length > 0;

              return (
                <div key={docType} className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">{docInfo.name}</span>
                  <span className={isUploaded ? 'text-green-400 font-semibold' : 'text-gray-500'}>
                    {isUploaded ? '✓ Ready' : '⊘ Pending'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </KycStepLayout>
  );
}
