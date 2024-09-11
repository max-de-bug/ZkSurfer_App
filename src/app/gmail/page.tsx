"use client";
import React from 'react';
import { signIn, useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import ButtonV1 from '@/component/ui/buttonV1';

const Gmail: React.FC = () => {
    const { data: session, status } = useSession();
    const router = useRouter();

    if (status === "loading") {
        return <div>Loading...</div>;
    }

    if (session) {
        router.push('/auth-callback');
        return null;
    }

    return (
        <div className="min-h-screen bg-[#000A19] text-white flex flex-col items-center justify-center">
            <div className="flex flex-col justify-between items-center h-screen py-32">
                <div className='flex flex-col justify-center items-center'>
                    <Image
                        src="images/logo.svg"
                        alt="ZkSurfer Logo"
                        width={150}
                        height={150}
                    />
                    <div className="text-3xl bg-gradient-to-r from-[#A4C8FF] via-[#A992ED] to-[#643ADE] bg-clip-text text-transparent mt-5">
                        <h1
                            style={{
                                textShadow: " #A992ED 5px 5px 40px",
                            }}
                        >
                            Welcome to ZkAGI
                        </h1>
                    </div>
                    <Image
                        src="images/Line.svg"
                        alt="Welcome Line"
                        width={550}
                        height={50}
                        className='mt-2'
                    />
                </div>
                <div className="flex flex-col justify-center items-center gap-5">
                    <h1 className="text-[#A0AEC0]">Sign in with Socials</h1>
                    <ButtonV1 onClick={() => signIn('google')}>
                        <div className="flex items-center justify-center">
                            <Image
                                src="/google-icon.png"
                                alt="Google"
                                width={20}
                                height={20}
                                className="mr-2"
                            />
                            G
                        </div>
                    </ButtonV1>
                </div>
            </div>
        </div>
    );
};

export default Gmail;

// "use client";
// import React, { useEffect, useState } from 'react';
// import { signIn, useSession } from 'next-auth/react';
// import Image from 'next/image';
// import { useRouter } from 'next/navigation';
// import ButtonV1 from '@/component/ui/buttonV1';
// import { useWallet } from "@solana/wallet-adapter-react";

// const Gmail: React.FC = () => {
//     const { data: session, status } = useSession();
//     const router = useRouter();
//     const { publicKey } = useWallet();
//     const [isLoading, setIsLoading] = useState(false);

//     useEffect(() => {
//         if (session?.user?.email && publicKey) {
//             setIsLoading(true);
//             sendCredentials(session.user.email, publicKey.toString());
//         }
//     }, [session, publicKey]);

//     const sendCredentials = async (email: string, walletAddress: string) => {
//         try {
//             const response = await fetch('https://zynapse.zkagi.ai/api/app-credentials', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({
//                     walletAddress: walletAddress,
//                     mailId: email,
//                 }),
//             });

//             if (response.ok) {
//                 console.log('Credentials sent successfully');
//                 router.push('/congratulations');
//             } else {
//                 console.error('Failed to send credentials');
//             }
//         } catch (error) {
//             console.error('Error sending credentials:', error);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     if (status === "loading" || isLoading) {
//         return <div>Loading...</div>;
//     }

//     return (
//         <div className="min-h-screen bg-[#000A19] text-white flex flex-col items-center justify-center">
//             <div className="flex flex-col justify-between items-center h-screen py-32">
//                 <div className='flex flex-col justify-center items-center'>
//                     <Image
//                         src="images/logo.svg"
//                         alt="ZkSurfer Logo"
//                         width={150}
//                         height={150}
//                     />
//                     <div className="text-3xl bg-gradient-to-r from-[#A4C8FF] via-[#A992ED] to-[#643ADE] bg-clip-text text-transparent mt-5">
//                         <h1
//                             style={{
//                                 textShadow: " #A992ED 5px 5px 40px",
//                             }}
//                         >
//                             Welcome to ZkAGI
//                         </h1>
//                     </div>
//                     <Image
//                         src="images/Line.svg"
//                         alt="Welcome Line"
//                         width={550}
//                         height={50}
//                         className='mt-2'
//                     />
//                 </div>
//                 <div className="flex flex-col justify-center items-center gap-5">
//                     <h1 className="text-[#A0AEC0]">Sign in with Socials</h1>
//                     <ButtonV1 onClick={() => signIn('google')}>
//                         <div className="flex items-center justify-center">
//                             <Image
//                                 src="/google-icon.png"
//                                 alt="Google"
//                                 width={20}
//                                 height={20}
//                                 className="mr-2"
//                             />
//                             G
//                         </div>
//                     </ButtonV1>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Gmail;

