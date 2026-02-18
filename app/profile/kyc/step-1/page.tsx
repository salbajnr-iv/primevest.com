"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import KycStepLayout from '@/components/kyc/KycStepLayout';
import { createClient } from '@/lib/supabase/client';

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

const STEPS = ['Personal Info', 'Documents', 'Upload', 'Review'];

export default function KycStep1Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<PersonalInfo>>({});
  const [userId, setUserId] = useState<string>();
  const [formData, setFormData] = useState<PersonalInfo>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationality: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });

  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        router.push('/auth/signin');
        return;
      }
      setUserId(session.user.id);

      // Try to load existing data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile?.kyc_personal_info) {
        setFormData(profile.kyc_personal_info);
      }
    };

    getUser();
  }, [supabase, router]);

  const validateForm = (): boolean => {
    const newErrors: Partial<PersonalInfo> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.nationality) newErrors.nationality = 'Nationality is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
    if (!formData.country) newErrors.country = 'Country is required';

    // Validate date of birth (must be at least 18 years old)
    const birthDate = new Date(formData.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 18) {
      newErrors.dateOfBirth = 'You must be at least 18 years old';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (userId) {
        const { error } = await supabase
          .from('profiles')
          .update({ kyc_personal_info: formData })
          .eq('id', userId);

        if (error) {
          console.error('Error saving personal info:', error);
          return;
        }
      }

      router.push('/profile/kyc/step-2');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof PersonalInfo, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const countries = [
    'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic',
    'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary',
    'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta',
    'Netherlands', 'Poland', 'Portugal', 'Romania', 'Slovakia', 'Slovenia',
    'Spain', 'Sweden', 'United Kingdom', 'United States', 'Canada', 'Australia',
  ];

  return (
    <KycStepLayout
      currentStep={1}
      totalSteps={4}
      steps={STEPS}
      title="Personal Information"
      description="Please provide your personal details for identity verification"
      nextButtonText="Continue to Documents"
      nextDisabled={!userId}
      isLoading={loading}
      onNext={handleNext}
      onPrev={() => router.push('/profile')}
    >
      <div className="space-y-6">
        {/* Name Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              First Name *
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
                errors.firstName ? 'border-red-600' : 'border-gray-600'
              }`}
              placeholder="John"
            />
            {errors.firstName && (
              <p className="text-xs text-red-400 mt-1">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
                errors.lastName ? 'border-red-600' : 'border-gray-600'
              }`}
              placeholder="Doe"
            />
            {errors.lastName && (
              <p className="text-xs text-red-400 mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Date of Birth *
          </label>
          <input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
            className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
              errors.dateOfBirth ? 'border-red-600' : 'border-gray-600'
            }`}
          />
          {errors.dateOfBirth && (
            <p className="text-xs text-red-400 mt-1">{errors.dateOfBirth}</p>
          )}
        </div>

        {/* Nationality and Country */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nationality *
            </label>
            <input
              type="text"
              value={formData.nationality}
              onChange={(e) => handleInputChange('nationality', e.target.value)}
              className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
                errors.nationality ? 'border-red-600' : 'border-gray-600'
              }`}
              placeholder="e.g., Austrian, British"
            />
            {errors.nationality && (
              <p className="text-xs text-red-400 mt-1">{errors.nationality}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Country of Residence *
            </label>
            <select
              value={formData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
                errors.country ? 'border-red-600' : 'border-gray-600'
              }`}
            >
              <option value="">Select a country</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
            {errors.country && (
              <p className="text-xs text-red-400 mt-1">{errors.country}</p>
            )}
          </div>
        </div>

        {/* Address Fields */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Street Address *
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
              errors.address ? 'border-red-600' : 'border-gray-600'
            }`}
            placeholder="123 Main Street"
          />
          {errors.address && (
            <p className="text-xs text-red-400 mt-1">{errors.address}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              City *
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
                errors.city ? 'border-red-600' : 'border-gray-600'
              }`}
              placeholder="Vienna"
            />
            {errors.city && <p className="text-xs text-red-400 mt-1">{errors.city}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Postal Code *
            </label>
            <input
              type="text"
              value={formData.postalCode}
              onChange={(e) => handleInputChange('postalCode', e.target.value)}
              className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
                errors.postalCode ? 'border-red-600' : 'border-gray-600'
              }`}
              placeholder="1010"
            />
            {errors.postalCode && (
              <p className="text-xs text-red-400 mt-1">{errors.postalCode}</p>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="p-4 bg-blue-950/30 border border-blue-600/50 rounded-lg">
          <p className="text-sm text-blue-200">
            ℹ️ Your information is securely stored and only used for identity verification purposes.
          </p>
        </div>
      </div>
    </KycStepLayout>
  );
}
