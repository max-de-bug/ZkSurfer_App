import React from 'react';
import { getServerSession } from "next-auth/next"
import { redirect } from 'next/navigation';
import Image from 'next/image';
import { authOptions } from '../api/auth/[...nextauth]/route'; // Adjust this import path as needed

const Gmail = async () => {
    const session = await getServerSession(authOptions);

    if (session) {
        redirect('/congratulations');
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
                <div>
                    <form action="/api/auth/signin/google" method="POST">
                        <button
                            type="submit"
                            className="bg-white text-black py-2 px-4 rounded-lg flex items-center"
                        >
                            <Image
                                src="/google-icon.png"
                                alt="Google"
                                width={20}
                                height={20}
                                className="mr-2"
                            />
                            Sign in with Google
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Gmail;