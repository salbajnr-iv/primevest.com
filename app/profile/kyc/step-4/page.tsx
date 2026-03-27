"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import KycStepLayout from "@/components/kyc/KycStepLayout";
import { createClient } from "@/lib/supabase/client";

interface PersonalInfo {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

interface UploadedFile {
  storage_path: string;
  file_name: string;
  mime_type?: string | null;
  size?: number | null;
  doc_type: string;
}

const DOCUMENT_LABELS: Record<string, string> = {
  id_card: "ID Card / Passport",
  proof_of_address: "Proof of Address",
  selfie: "Selfie with ID",
};

const STEPS = ["Personal Info", "Documents", "Upload", "Review"];

export default function KycStep4Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string>();
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const loadData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        router.push("/auth/signin");
        return;
      }
      setUserId(session.user.id);

      setLoading(true);
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("kyc_personal_info, kyc_uploaded_files")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          setPersonalInfo(profile.kyc_personal_info);
          setUploadedFiles(profile.kyc_uploaded_files || []);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [supabase, router]);

  const handleSubmit = async () => {
    if (!agreeTerms) {
      alert("Please agree to the terms and conditions");
      return;
    }

    setSubmitting(true);
    try {
      if (!userId) {
        throw new Error("User ID not found");
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        throw new Error("Session expired. Please sign in again.");
      }

      const response = await fetch("/api/kyc/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          metadata: personalInfo,
          documents: uploadedFiles,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Failed to submit KYC request");
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          kyc_personal_info: null,
          kyc_documents_selected: null,
          kyc_uploaded_files: null,
        })
        .eq("id", userId);

      if (updateError) {
        console.error("Error clearing KYC draft data:", updateError);
      }

      // Success - redirect to status page
      router.push("/profile/kyc/status?submitted=true");
    } catch (error) {
      console.error("KYC submission failed:", error);
      alert("Failed to submit KYC. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

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
    <KycStepLayout
      currentStep={4}
      totalSteps={4}
      steps={STEPS}
      title="Review & Submit"
      description="Please review your information before submitting"
      nextButtonText={submitting ? "Submitting..." : "Submit KYC"}
      nextDisabled={!agreeTerms || !personalInfo}
      isLoading={submitting}
      onNext={handleSubmit}
      onPrev={() => router.push("/profile/kyc/step-3")}
    >
      <div className="space-y-6">
        {/* Personal Information Summary */}
        {personalInfo && (
          <div className="border border-gray-600 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span>👤</span> Personal Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">
                  First Name
                </p>
                <p className="text-white font-medium">
                  {personalInfo.firstName}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">
                  Last Name
                </p>
                <p className="text-white font-medium">
                  {personalInfo.lastName}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">
                  Date of Birth
                </p>
                <p className="text-white font-medium">
                  {new Date(personalInfo.dateOfBirth).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">
                  Nationality
                </p>
                <p className="text-white font-medium">
                  {personalInfo.nationality}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-gray-400 uppercase tracking-wider">
                  Address
                </p>
                <p className="text-white font-medium">{personalInfo.address}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">
                  City
                </p>
                <p className="text-white font-medium">{personalInfo.city}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">
                  Postal Code
                </p>
                <p className="text-white font-medium">
                  {personalInfo.postalCode}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">
                  Country
                </p>
                <p className="text-white font-medium">{personalInfo.country}</p>
              </div>
            </div>
          </div>
        )}

        {/* Documents Summary */}
        {uploadedFiles.length > 0 && (
          <div className="border border-gray-600 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span>📄</span> Uploaded Documents ({uploadedFiles.length})
            </h3>

            <div className="space-y-2">
              {uploadedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">
                      {file.mime_type?.startsWith("image/") ? "🖼️" : "📄"}
                    </span>
                    <div>
                      <p className="text-white font-medium">{file.file_name}</p>
                      <p className="text-xs text-gray-400">
                        {DOCUMENT_LABELS[file.doc_type] || file.doc_type}
                        {file.size &&
                          ` • ${(file.size / 1024 / 1024).toFixed(2)} MB`}
                      </p>
                    </div>
                  </div>
                  <span className="text-green-400">✓</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Terms and Conditions */}
        <div className="border border-gray-600 rounded-lg p-6 space-y-4 bg-gray-800/30">
          <h3 className="text-lg font-semibold text-white">
            Terms & Conditions
          </h3>

          <div className="space-y-3 text-sm text-gray-300 max-h-48 overflow-y-auto">
            <p>
              By submitting this KYC (Know Your Customer) form, you confirm
              that:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>All information provided is true, accurate, and complete</li>
              <li>All documents are authentic and have not been altered</li>
              <li>You are the owner of the documents you are submitting</li>
              <li>You authorize us to verify your identity and information</li>
              <li>You comply with all applicable laws and regulations</li>
              <li>
                You understand that false information may result in account
                suspension
              </li>
            </ul>
            <p className="mt-3">
              Your personal information will be treated confidentially and only
              used for verification purposes in accordance with our Privacy
              Policy.
            </p>
          </div>

          <label className="flex items-start gap-3 p-3 bg-green-950/30 border border-green-600/50 rounded-lg">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-1 w-4 h-4 cursor-pointer"
            />
            <span className="text-sm text-green-200">
              I confirm that I have read and agree to the terms and conditions
              above
            </span>
          </label>
        </div>

        {/* Info Box */}
        <div className="p-4 bg-blue-950/30 border border-blue-600/50 rounded-lg">
          <p className="text-sm text-blue-200">
            ℹ️ Your application will be reviewed by our team within 2-5 business
            days. We will notify you via email once the review is complete.
          </p>
        </div>
      </div>
    </KycStepLayout>
  );
}
