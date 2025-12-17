
import React from 'react';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = "w-10 h-10" }) => (
  <svg 
    viewBox="0 0 40 40" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    <rect width="40" height="40" rx="10" fill="url(#pdfxpert-gradient)" />
    {/* Stylized Document Shape */}
    <path 
      d="M10 12C10 10.8954 10.8954 10 12 10H22L30 18V28C30 29.1046 29.1046 30 28 30H12C10.8954 30 10 29.1046 10 28V12Z" 
      fill="white" 
      fillOpacity="0.2"
    />
    {/* Folded Corner */}
    <path 
      d="M22 10V18H30L22 10Z" 
      fill="white" 
      fillOpacity="0.4"
    />
    {/* The X symbol */}
    <path 
      d="M15 15L25 25M25 15L15 25" 
      stroke="white" 
      strokeWidth="3.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <defs>
      <linearGradient id="pdfxpert-gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F43F5E" />
        <stop offset="1" stopColor="#FB923C" />
      </linearGradient>
    </defs>
  </svg>
);

export default Logo;
