import * as React from 'react'

interface AuthLogoProps {
  className?: string
}

export default function AuthLogo({ className = 'w-16 h-16 mx-auto mb-4' }: AuthLogoProps) {
  return (
    <div className={className} aria-label="PrimeVest logo" role="img">
      <svg viewBox="0 0 256 256" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="primevestLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1CC5D8" />
            <stop offset="100%" stopColor="#9FDF4D" />
          </linearGradient>
        </defs>
        <rect width="256" height="256" rx="22" fill="#000000" />
        <path
          d="M58 57h108c44 0 79 35 79 79v63a9 9 0 0 1-9 9h-71a9 9 0 0 1-9-9v-30c0-6 4-10 10-10h39v-23c0-22-18-40-39-40H58a9 9 0 0 1-9-9V66a9 9 0 0 1 9-9Z"
          fill="url(#primevestLogoGradient)"
        />
        <path
          d="M58 121h99c11 0 20 9 20 20s-9 20-20 20H96v38a9 9 0 0 1-9 9H58a9 9 0 0 1-9-9v-69a9 9 0 0 1 9-9Z"
          fill="url(#primevestLogoGradient)"
        />
      </svg>
    </div>
  )
}
