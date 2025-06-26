// components/MobileTabLayout.tsx
import React, { ReactNode, useState } from 'react';

interface MobileTabLayoutProps {
    terminalContent: ReactNode;
    predictionContent: ReactNode;
}

const MobileTabLayout: React.FC<MobileTabLayoutProps> = ({
    terminalContent,
    predictionContent,
}) => {
    const [activeTab, setActiveTab] = useState<'terminal' | 'prediction'>('terminal');

    return (
        <div className="flex flex-col h-full">
            {/* main area */}
            <div className="flex-1 overflow-auto">
                {activeTab === 'terminal' ? terminalContent : predictionContent}
            </div>

            {/* bottom tabs */}
            <div className="flex border-t border-gray-700 bg-[#08121f]">
                <button
                    onClick={() => setActiveTab('terminal')}
                    className={`
            flex-1 py-2 text-center
            ${activeTab === 'terminal'
                            ? 'text-white font-semibold'
                            : 'text-gray-400'}
          `}
                >
                    ZkTerminal
                </button>
                <button
                    onClick={() => setActiveTab('prediction')}
                    className={`
            flex-1 py-2 text-center
            ${activeTab === 'prediction'
                            ? 'text-white font-semibold'
                            : 'text-gray-400'}
          `}
                >
                    Prediction
                </button>
            </div>
        </div>
    );
};

export default MobileTabLayout;
