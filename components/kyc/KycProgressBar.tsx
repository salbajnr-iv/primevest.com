"use client";

import React from 'react';

interface KycProgressBarProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

export default function KycProgressBar({ currentStep, totalSteps, steps }: KycProgressBarProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-600 to-green-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step indicators */}
      <div className="flex justify-between items-center">
        {steps.map((step, index) => {
          const stepNum = index + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <div key={index} className="flex flex-col items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                  isCompleted
                    ? 'bg-green-600 text-white'
                    : isCurrent
                    ? 'bg-green-500 text-white ring-2 ring-green-400'
                    : 'bg-gray-700 text-gray-400'
                }`}
              >
                {isCompleted ? '✓' : stepNum}
              </div>
              <span
                className={`text-xs text-center max-w-[80px] ${
                  isCurrent ? 'text-green-400 font-semibold' : 'text-gray-400'
                }`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step counter */}
      <div className="text-center text-sm text-gray-400">
        Step {currentStep} of {totalSteps}
      </div>
    </div>
  );
}
