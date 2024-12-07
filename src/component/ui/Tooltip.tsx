import React, { useState, useRef, useEffect, ReactNode } from 'react';

interface TooltipProps {
    children: ReactNode;
    content: ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ children, content }) => {
    const [isHovered, setIsHovered] = useState<boolean>(false);
    const [isClicked, setIsClicked] = useState<boolean>(false);
    const tooltipRef = useRef<HTMLDivElement>(null);

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    const handleClick = () => {
        setIsClicked((prev) => !prev);
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (
            tooltipRef.current &&
            !tooltipRef.current.contains(event.target as Node)
        ) {
            setIsClicked(false);
        }
    };

    useEffect(() => {
        if (isClicked) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isClicked]);

    const isVisible = isHovered || isClicked;

    return (
        <div
            className="relative inline-block"
            ref={tooltipRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div onClick={handleClick} className="cursor-pointer">
                {children}
            </div>
            {isVisible && (
                <div className="absolute top-full right-0 mt-2 w-64 p-4 bg-gray-800 text-white text-sm rounded-md shadow-lg z-10">
                    {content}
                </div>
            )}
        </div>
    );
};

export default Tooltip;
