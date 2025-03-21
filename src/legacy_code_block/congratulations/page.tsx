"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import ButtonV2 from '@/component/ui/buttonV2';

const Congratulations: React.FC = () => {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-[#000A19] text-white flex flex-col items-center justify-center">
            <div className="flex flex-col justify-between items-center h-screen py-32">
                <div className='flex flex-col justify-center items-center'>
                    <Image
                        src="/images/logo.svg"
                        alt="ZkSurfer Logo"
                        width={150}
                        height={150}
                    />
                    <h1 className="text-3xl mt-4 mb-2">Congrats!</h1>
                    <h1 className="text-3xl mb-8">Login Successful</h1>
                </div>
                <div>
                    <ButtonV2 func={() => router.push('/permissions')}>
                        GET STARTED
                    </ButtonV2>
                </div>
            </div>
        </div>
    );
};

export default Congratulations;
