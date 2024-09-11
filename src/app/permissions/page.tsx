'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import ButtonV1New from '@/component/ui/buttonV1New';

const Permission: React.FC = () => {
    const router = useRouter();

    const handleContinue = () => {
        router.push('/home');
    };

    return (
        <div className="min-h-screen bg-[#010921]  text-white flex flex-col">
            {/* Header */}
            <header className="p-4 mt-2 ml-2">
                <button className="text-white font-sourceCode" onClick={() => router.back()}>
                    Back
                </button>
            </header>

            {/* Main Content */}
            <main className="flex-grow flex flex-col items-center justify-between p-6 mb-20 mr-10">
                <div>
                    <div className="text-left">
                        <h1 className="text-4xl font-bold mb-4 font-ttfirs">
                            Allow ZkSurfer to Automate Tasks
                        </h1>
                        <p className="mb-6 font-ttfirs text-[#A0AEC0]">
                            ZkSurfer requires the following permissions to function correctly. Please
                            grant these permissions to proceed.
                        </p>
                    </div>
                    <Image
                        src="images/Line.svg"
                        alt="Welcome Line"
                        width={550}
                        height={50}
                        className='my-2'
                    />

                    <div className=" mb-6 max-w-md w-full mt-5 font-sourceCode text-[#A0AEC0]">
                        <p className="text-md">
                            ZkSurfer requires the following permissions to function correctly. Please grant these
                            permissions to proceed.:
                        </p>
                        <ol className="list-decimal list-inside mt-2 text-md">
                            <li>Access to Web Contents: To interact with web pages.</li>
                            <li>Clipboard Access: To copy and paste text</li>
                            <li>Browser Control: To navigate and control browser actions.</li>
                        </ol>
                    </div>
                </div>

                <div className="w-full max-w-md flex justify-center items-center">
                    <ButtonV1New onClick={handleContinue}>
                        CONTINUE
                    </ButtonV1New>
                </div>
            </main>
        </div>
    );
};

export default Permission;