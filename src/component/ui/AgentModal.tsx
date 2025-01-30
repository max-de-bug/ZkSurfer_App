"use client";
import React, { FC } from "react";
import Image from "next/image";
import { FaCheckCircle } from "react-icons/fa";
import { toast } from "sonner";

interface CreateAgentModalProps {
    visible: boolean;
    onClose: () => void;
    onAgentTypeSelect: (type: string) => void;
}

export const CreateAgentModal: FC<CreateAgentModalProps> = ({ visible, onClose, onAgentTypeSelect, }) => {
    if (!visible) return null; // If modal is not visible, render nothing

    const handleSuperAgentClick = () => {
        toast('Coming Soon..', {
            description: 'This feature is under development.',
            // Additional customization options
        });
    };


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            {/* The "container" for the modal content */}
            <div className="bg-[#171D3D] p-6 rounded-lg w-full max-w-5xl shadow-lg relative">
                {/* Close button in top-right corner (optional) */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-200"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        className="w-6 h-6"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Heading */}
                <h2 className="text-2xl text-white mb-6 text-center font-bold uppercase tracking-wide">
                    Choose Your Agent
                </h2>

                {/* Cards Layout: 3 columns on medium screens, 1 column on mobile */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* --- Micro Agent Card --- */}
                    <div className="bg-[#0A1426] rounded-lg p-4 border border-gray-600 flex flex-col items-center">
                        <div className="w-full h-40 relative mb-2">

                            <div className="relative w-full h-[70px] md:h-[129px] overflow-hidden">
                                <img
                                    src="/images/globe/Container.svg"
                                    alt="Container Background"
                                    className="w-full h-full object-contain"
                                />
                                <img
                                    src="/images/globe/MicroAgent.png"
                                    alt="micro"
                                    className="absolute inset-0 w-full h-full object-contain pointer-events-none p-2"
                                />
                            </div>
                        </div>
                        <h3 className="text-xl text-white font-semibold mb-2">MICRO AGENT</h3>
                        <p className="text-sm text-gray-200 text-center mb-4">
                            Lorem ipsum dolor sit amet consectetur. Gravida metus sed in vitae et at.
                            Massa sed ipsum risus id interdum ut.
                        </p>
                        {/* Checklist */}
                        <ul className="text-sm text-gray-300 space-y-2 mb-6">
                            <li>
                                <FaCheckCircle className="inline-block text-green-500 mr-2" />
                                Lorem ipsum
                            </li>
                            <li>
                                <FaCheckCircle className="inline-block text-green-500 mr-2" />
                                Lorem ipsum dolor
                            </li>
                            <li>
                                <FaCheckCircle className="inline-block text-green-500 mr-2" />
                                Lorem ipsum dolor
                            </li>
                            <li className="opacity-70">
                                <FaCheckCircle className="inline-block text-green-500 mr-2" />
                                Gravida metus sed in vitae
                            </li>
                            <li className="opacity-70">
                                <FaCheckCircle className="inline-block text-green-500 mr-2" />
                                Lorem ipsum sed risus
                            </li>
                        </ul>
                        {/* Bottom button */}
                        <button
                            onClick={() => {
                                onAgentTypeSelect("micro-agent");
                                onClose();
                            }}
                            className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200 transition-colors"
                        >
                            Create Micro Agent
                        </button>
                    </div>

                    {/* --- Super Agent Card --- */}
                    <div className="bg-[#0A1426] rounded-lg p-4 border border-gray-600 flex flex-col items-center">
                        <div className="w-full h-40 relative mb-2">
                            <div className="relative w-full h-[70px] md:h-[129px] overflow-hidden">
                                <img
                                    src="/images/globe/Container.svg"
                                    alt="Container Background"
                                    className="w-full h-full object-contain"
                                />
                                <img
                                    src="/images/globe/SuperAgent.png"
                                    alt="micro"
                                    className="absolute inset-0 w-full h-full object-contain pointer-events-none p-2"
                                />
                            </div>
                        </div>
                        <h3 className="text-xl text-white font-semibold mb-2">SUPER AGENT</h3>
                        <p className="text-sm text-gray-200 text-center mb-4">
                            Lorem ipsum dolor sit amet consectetur. Gravida metus sed in vitae et at.
                            Massa sed ipsum risus id interdum ut.
                        </p>
                        <ul className="text-sm text-gray-300 space-y-2 mb-6">
                            <li>
                                <FaCheckCircle className="inline-block text-green-500 mr-2" />
                                Lorem ipsum
                            </li>
                            <li>
                                <FaCheckCircle className="inline-block text-green-500 mr-2" />
                                Lorem ipsum dolor
                            </li>
                            <li>
                                <FaCheckCircle className="inline-block text-green-500 mr-2" />
                                Lorem ipsum dolor
                            </li>
                            <li>
                                <FaCheckCircle className="inline-block text-green-500 mr-2" />
                                Gravida metus sed in vitae
                            </li>
                            <li className="opacity-70">
                                <FaCheckCircle className="inline-block text-green-500 mr-2" />
                                Lorem ipsum sed risus
                            </li>
                        </ul>
                        {/* <button
                            onClick={() => {
                                onAgentTypeSelect("super-agent");
                                onClose();
                            }}
                            className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200 transition-colors"
                        >
                            Create Super Agent
                        </button> */}
                        <button
                            onClick={handleSuperAgentClick}
                            className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200 transition-colors"
                        >
                            Create Super Agent
                        </button>
                    </div>

                    {/* --- Secret Agent Card --- */}
                    <div className="bg-[#0A1426] rounded-lg p-4 border border-gray-600 flex flex-col items-center">
                        <div className="w-full h-40 relative mb-2">
                            <div className="relative w-full h-[70px] md:h-[129px] overflow-hidden">
                                <img
                                    src="/images/globe/Container.svg"
                                    alt="Container Background"
                                    className="w-full h-full object-contain"
                                />
                                <img
                                    src="/images/globe/SecretAgent.png"
                                    alt="micro"
                                    className="absolute inset-0 w-full h-full object-contain pointer-events-none p-2"
                                />
                            </div>
                        </div>
                        <h3 className="text-xl text-white font-semibold mb-2">SECRET AGENT</h3>
                        <p className="text-sm text-gray-200 text-center mb-4">
                            Lorem ipsum dolor sit amet consectetur. Gravida metus sed in vitae et at.
                            Massa sed ipsum risus id interdum ut.
                        </p>
                        <ul className="text-sm text-gray-300 space-y-2 mb-6">
                            <li>
                                <FaCheckCircle className="inline-block text-green-500 mr-2" />
                                Lorem ipsum
                            </li>
                            <li>
                                <FaCheckCircle className="inline-block text-green-500 mr-2" />
                                Lorem ipsum dolor
                            </li>
                            <li>
                                <FaCheckCircle className="inline-block text-green-500 mr-2" />
                                Lorem ipsum dolor
                            </li>
                            <li>
                                <FaCheckCircle className="inline-block text-green-500 mr-2" />
                                Gravida metus sed in vitae
                            </li>
                            <li>
                                <FaCheckCircle className="inline-block text-green-500 mr-2" />
                                Lorem ipsum sed risus
                            </li>
                        </ul>
                        {/* <button
                            onClick={() => {
                                onAgentTypeSelect("secret-agent");
                                onClose();
                            }}
                            className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200 transition-colors"
                        >
                            Create Secret Agent
                        </button> */}
                        <button
                            onClick={() => {
                                onAgentTypeSelect("secret-agent");
                                onClose();
                                window.location.href = "https://tidycal.com/zkagi/discussion";
                            }}
                            className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200 transition-colors"
                        >
                            Create Secret Agent
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
};
