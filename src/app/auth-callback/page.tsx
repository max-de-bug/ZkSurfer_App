"use client";
import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useWallet } from "@solana/wallet-adapter-react";

const AuthCallback: React.FC = () => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { publicKey } = useWallet();

    useEffect(() => {
        const sendCredentials = async () => {
            console.log('session?.user?.email', session?.user?.email)
            if (session?.user?.email && publicKey) {
                try {
                    const response = await fetch('https://zynapse.zkagi.ai/api/app-credentials', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'api-key': `${process.env.API_KEY}`,
                        },
                        body: JSON.stringify({
                            walletAddress: publicKey.toString(),
                            mailId: session.user.email,
                        }),
                    });

                    if (response.ok) {
                        console.log('Credentials sent successfully');
                        router.push('/congratulations');
                    } else {
                        console.error('Failed to send credentials');
                        router.push('/error');
                    }
                } catch (error) {
                    console.error('Error sending credentials:', error);
                    router.push('/error1');
                }
            } else if (status !== "loading") {
                router.push('/error2');
            }
        };

        sendCredentials();
    }, [session, publicKey, status, router]);

    return <div>Processing your authentication...</div>;
};

export default AuthCallback;