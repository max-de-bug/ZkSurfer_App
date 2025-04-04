import React from "react";

interface CircularCountdownProps {
    countdown: number;
    totalTime: number;
}

// Helper to format seconds as mm:ss
const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60)
        .toString()
        .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
};

const CircularCountdown: React.FC<CircularCountdownProps> = ({
    countdown,
    totalTime
}) => {
    // Radius of the circle
    const radius = 48;
    // Circumference = 2πr
    const circumference = 2 * Math.PI * radius;

    // progress is a value between 0 and 1
    // e.g. if countdown=450 and totalTime=900, progress=0.5
    const progress = countdown / totalTime;
    // We move the strokeDashoffset to match the remaining progress
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <svg width="120" height="120" className="relative">
            {/* Background circle (static, for the "track") */}
            <circle
                stroke="#555"         // lighter track color
                fill="transparent"
                strokeWidth="4"
                r={radius}
                cx="60"
                cy="60"
            />
            {/* Foreground circle (this one animates) */}
            <circle
                stroke="blue"         // color of the progress stroke
                fill="transparent"
                strokeWidth="4"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                r={radius}
                cx="60"
                cy="60"
                style={{
                    transition: "stroke-dashoffset 0.35s",
                    transform: "rotate(-90deg)",
                    transformOrigin: "center"
                }}
            />
            {/* Centered text */}
            <text
                x="50%"
                y="50%"
                dy=".3em"
                textAnchor="middle"
                fill="#fff"
                fontSize="20"
            >
                {formatTime(countdown)}
            </text>
        </svg>
    );
};

export default CircularCountdown;
