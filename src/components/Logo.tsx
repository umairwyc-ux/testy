import React from 'react';

interface LogoProps {
  className?: string;
}

export const MarketyLogo: React.FC<LogoProps> = ({ className = 'w-8 h-8' }) => {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="1.5"
        y="1.5"
        width="37"
        height="37"
        rx="9.5"
        className="fill-[#111522] stroke-blue-500/40"
        strokeWidth="1.5"
      />
      {/* Original Geometric M Monogram */}
      <path
        d="M9.5 29V11.5L16.5 21.5L20 16.5L23.5 21.5L30.5 11.5V29"
        stroke="url(#markety_grad_primary)"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.5 29L20 24L23.5 29"
        stroke="#06B6D4"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient
          id="markety_grad_primary"
          x1="9.5"
          y1="11.5"
          x2="30.5"
          y2="29"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFFFFF" />
          <stop offset="0.55" stopColor="#60A5FA" />
          <stop offset="1" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
    </svg>
  );
};
