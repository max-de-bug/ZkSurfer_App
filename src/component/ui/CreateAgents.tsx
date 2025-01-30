"use client";

import React from "react";
import Image from "next/image";

interface CreateAgentsProps {
    // You could make this optional or pass your own handler signature
    onCreateAgent?: (agentType: "micro" | "super" | "secret") => void;
    processing?: boolean;
}

const CreateAgents: React.FC<CreateAgentsProps> = ({ onCreateAgent, processing }) => {
    return (
        <div className="flex flex-col md:flex-row md:space-x-4 space-y-6 md:space-y-0 mt-8">
            {/* MICRO AGENT CARD */}
            <div className="bg-gray-800 rounded-lg p-6 w-full md:w-1/3 flex flex-col justify-between">
                <div>
                    {/* Agent Image */}
                    <div className="relative w-full h-52 mb-4">
                        <Image
                            src="/images/micro-agent.png" // Replace with your actual Micro Agent image
                            alt="Micro Agent"
                            fill
                            className="object-contain"
                        />
                    </div>
                    {/* Title */}
                    <h2 className="text-white text-xl font-bold mb-2">MICRO AGENT</h2>
                    {/* Description */}
                    <p className="text-gray-400 text-sm mb-4">
                        Lorem ipsum dolor sit amet consectetur. Gravida metus sed in vitae et at.
                        Massa sed ipsum risus id interdum ut.
                    </p>
                    {/* Bullet Points */}
                    <ul className="space-y-2 text-sm">
                        <li className="flex items-center text-green-400">
                            <span className="mr-2">✔</span> Lorem ipsum
                        </li>
                        <li className="flex items-center text-green-400">
                            <span className="mr-2">✔</span> Lorem ipsum dolor
                        </li>
                        <li className="flex items-center text-green-400">
                            <span className="mr-2">✔</span> Lorem ipsum dolor
                        </li>
                        <li className="flex items-center text-gray-500 line-through">
                            <span className="mr-2">✘</span> Lorem ipsum dolor
                        </li>
                        <li className="flex items-center text-gray-500 line-through">
                            <span className="mr-2">✘</span> Gravida metus sed in vitae
                        </li>
                        <li className="flex items-center text-gray-500 line-through">
                            <span className="mr-2">✘</span> Lorem ipsum sed risus
                        </li>
                    </ul>
                </div>
                {/* Create Button */}
                <button
                    disabled={processing}
                    onClick={() => onCreateAgent?.("micro")}
                    className="mt-6 w-full py-2 bg-white text-gray-900 font-semibold rounded-md 
                     hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                    Create Micro Agent
                </button>
            </div>

            {/* SUPER AGENT CARD */}
            <div className="bg-gray-800 rounded-lg p-6 w-full md:w-1/3 flex flex-col justify-between">
                <div>
                    <div className="relative w-full h-52 mb-4">
                        <Image
                            src="/images/super-agent.png" // Replace with your actual Super Agent image
                            alt="Super Agent"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <h2 className="text-white text-xl font-bold mb-2">SUPER AGENT</h2>
                    <p className="text-gray-400 text-sm mb-4">
                        Lorem ipsum dolor sit amet consectetur. Gravida metus sed in vitae et at.
                        Massa sed ipsum risus id interdum ut.
                    </p>
                    <ul className="space-y-2 text-sm">
                        <li className="flex items-center text-green-400">
                            <span className="mr-2">✔</span> Lorem ipsum
                        </li>
                        <li className="flex items-center text-green-400">
                            <span className="mr-2">✔</span> Lorem ipsum dolor
                        </li>
                        <li className="flex items-center text-green-400">
                            <span className="mr-2">✔</span> Lorem ipsum dolor
                        </li>
                        <li className="flex items-center text-green-400">
                            <span className="mr-2">✔</span> Lorem ipsum dolor
                        </li>
                        <li className="flex items-center text-gray-500 line-through">
                            <span className="mr-2">✘</span> Gravida metus sed in vitae
                        </li>
                        <li className="flex items-center text-gray-500 line-through">
                            <span className="mr-2">✘</span> Lorem ipsum sed risus
                        </li>
                    </ul>
                </div>
                <button
                    disabled={processing}
                    onClick={() => onCreateAgent?.("super")}
                    className="mt-6 w-full py-2 bg-white text-gray-900 font-semibold rounded-md 
                     hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                    Create Super Agent
                </button>
            </div>

            {/* SECRET AGENT CARD */}
            <div className="bg-gray-800 rounded-lg p-6 w-full md:w-1/3 flex flex-col justify-between">
                <div>
                    <div className="relative w-full h-52 mb-4">
                        <Image
                            src="/images/secret-agent.png" // Replace with your actual Secret Agent image
                            alt="Secret Agent"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <h2 className="text-white text-xl font-bold mb-2">SECRET AGENT</h2>
                    <p className="text-gray-400 text-sm mb-4">
                        Lorem ipsum dolor sit amet consectetur. Gravida metus sed in vitae et at.
                        Massa sed ipsum risus id interdum ut.
                    </p>
                    <ul className="space-y-2 text-sm">
                        <li className="flex items-center text-green-400">
                            <span className="mr-2">✔</span> Lorem ipsum
                        </li>
                        <li className="flex items-center text-green-400">
                            <span className="mr-2">✔</span> Lorem ipsum
                        </li>
                        <li className="flex items-center text-green-400">
                            <span className="mr-2">✔</span> Lorem ipsum
                        </li>
                        <li className="flex items-center text-green-400">
                            <span className="mr-2">✔</span> Lorem ipsum dolor
                        </li>
                        <li className="flex items-center text-green-400">
                            <span className="mr-2">✔</span> Gravida metus sed in vitae
                        </li>
                        <li className="flex items-center text-gray-500 line-through">
                            <span className="mr-2">✘</span> Lorem ipsum sed risus
                        </li>
                    </ul>
                </div>
                <button
                    disabled={processing}
                    onClick={() => onCreateAgent?.("secret")}
                    className="mt-6 w-full py-2 bg-white text-gray-900 font-semibold rounded-md 
                     hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                    Create Secret Agent
                </button>
            </div>
        </div>
    );
};

export default CreateAgents;
