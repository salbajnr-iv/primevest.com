"use client";

import React from 'react';
import KycProgressBar from './KycProgressBar';

interface KycStepLayoutProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
  title: string;
  description?: string;
  children: React.ReactNode;
  onNext?: () => void;
  onPrev?: () => void;
  nextButtonText?: string;
  prevButtonText?: string;
  nextDisabled?: boolean;
  isLoading?: boolean;
}

export default function KycStepLayout({
  currentStep,
  totalSteps,
  steps,
  title,
  description,
  children,
  onNext,
  onPrev,
  nextButtonText = 'Next Step',
  prevButtonText = 'Back',
  nextDisabled = false,
  isLoading = false,
}: KycStepLayoutProps) {
  return (
    <div className="dashboard-container">
      <div className="dashboard-app">
        <main className="page-card max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <KycProgressBar currentStep={currentStep} totalSteps={totalSteps} steps={steps} />
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
            {description && <p className="text-gray-400">{description}</p>}
          </div>

          {/* Content */}
          <div className="mb-8">
            {children}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3 justify-between">
            <button
              onClick={onPrev}
              disabled={currentStep === 1 || isLoading}
              className="px-6 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {prevButtonText}
            </button>
            <button
              onClick={onNext}
              disabled={nextDisabled || isLoading}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold hover:from-green-700 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                nextButtonText
              )}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
