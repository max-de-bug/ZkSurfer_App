// components/CircularAvatar.tsx
import React from 'react';
import Image from 'next/image'

interface CircularAvatarProps {
  avatar: string;
  alt: string;
  percent: number;
  size?: number;
  strokeWidth?: number;
}

export const CircularAvatar: React.FC<CircularAvatarProps> = ({
  avatar, alt, percent, size = 48, strokeWidth = 4
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);

  return (
    <div style={{ width: size, height: size }} className="relative">
      <svg width={size} height={size} className="absolute inset-0">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#2d3748"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#4F46E5"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <Image
        src={avatar}
        alt={alt}
        width={size - strokeWidth * 2}
        height={size - strokeWidth * 2}
        className="rounded-full absolute top-[4px] left-[4px]"
      />
    </div>
  );
};
