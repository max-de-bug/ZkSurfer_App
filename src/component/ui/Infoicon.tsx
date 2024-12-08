import React from 'react';

interface InfoIconProps {
    className?: string;
}

const InfoIcon: React.FC<InfoIconProps> = ({ className }) => (
    <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        role="img"
        aria-label="Information"
    >
        <circle cx="12" cy="12" r="10" strokeWidth="2" />
        <path strokeWidth="2" d="M12 16v-4m0-4h.01" />
    </svg>
);

export default InfoIcon;
