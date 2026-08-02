import React from 'react';

interface FamilyLogoProps {
  className?: string;
  size?: number;
  animated?: boolean;
}

export const FamilyLogo: React.FC<FamilyLogoProps> = ({ 
  className = "w-12 h-12", 
  size,
  animated = false 
}) => {
  const sizeStyle = size ? { width: `${size}px`, height: `${size}px` } : {};

  return (
    <div 
      className={`relative inline-flex items-center justify-center shrink-0 ${animated ? 'animate-pulse' : ''} ${className}`}
      style={sizeStyle}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        <defs>
          {/* Main Badge Gradient */}
          <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="50%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#E11D48" />
          </linearGradient>

          {/* Left Heart Gradient (Rose to Pink) */}
          <linearGradient id="heart1Grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FB7185" />
            <stop offset="100%" stopColor="#F43F5E" />
          </linearGradient>

          {/* Right Heart Gradient (Warm Amber to Coral) */}
          <linearGradient id="heart2Grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#F97316" />
          </linearGradient>

          {/* Subtle Inner Glow */}
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Circular Container Badge */}
        <circle cx="50" cy="50" r="46" fill="url(#badgeGrad)" />
        
        {/* Soft Inner Ring Accent */}
        <circle cx="50" cy="50" r="42" stroke="white" strokeOpacity="0.25" strokeWidth="2" fill="none" />

        {/* Roof/Home Shelter Arc Line above hearts symbolizing home protection */}
        <path
          d="M 30 38 Q 50 24 70 38"
          stroke="white"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.9"
        />

        {/* Left Intertwined Heart */}
        <path
          d="M 40 46 C 33 37, 21 44, 25 54 C 29 64, 40 73, 44 76 C 45 77, 47 75, 47 73 C 44 67, 34 57, 40 46 Z"
          fill="url(#heart1Grad)"
          filter="url(#softGlow)"
        />

        {/* Right Intertwined Heart overlapping seamlessly */}
        <path
          d="M 60 46 C 67 37, 79 44, 75 54 C 71 64, 60 73, 56 76 C 55 77, 53 75, 53 73 C 56 67, 66 57, 60 46 Z"
          fill="url(#heart2Grad)"
          filter="url(#softGlow)"
        />

        {/* Center Interlocking Heart Core */}
        <path
          d="M 50 48 C 45 40, 36 46, 41 55 C 45 62, 50 68, 50 68 C 50 68, 55 62, 59 55 C 64 46, 55 40, 50 48 Z"
          fill="#FFFFFF"
          opacity="0.95"
        />
        
        {/* Center Sparkle Accent for Family Warmth */}
        <circle cx="50" cy="49" r="2.5" fill="#F43F5E" />
      </svg>
    </div>
  );
};
