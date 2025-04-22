import React, { useState } from "react";
import CanvasAreaSelector from "./CanvasAreaSelector";

interface ImageSelectionModalProps {
    imageUrl: string;
    onClose: () => void;
}

export interface Selection {
    x: number;
    y: number;
    width: number;
    height: number;
}

const ImageSelectionModal: React.FC<ImageSelectionModalProps> = ({ imageUrl, onClose }) => {
    // Declare state with the type Selection[]
    const [selections, setSelections] = useState<Selection[]>([]);

    return (
        <div className="fixed inset-0 z-50 flex mt-10">
            {/* Left side: the area selection canvas */}
            <div className="w-1/2 bg-gray-900 p-4 flex flex-col items-center">
                <h2 className="text-white mb-4">Select Area</h2>

                <CanvasAreaSelector
                    imageSrc={imageUrl}
                    onSelectionChange={(rects: Selection[]) => setSelections(rects)}
                    width={400}
                    height={400}
                />

                <div className="text-sm text-gray-400 mt-2">
                    Current selections: {JSON.stringify(selections, null, 2)}
                </div>
            </div>

            {/* Right side: compressed chat/prompt area */}
            <div className="w-1/2 bg-gray-800 p-4 flex flex-col">
                <h2 className="text-white mb-2">Enter Prompt</h2>
                <textarea
                    className="mb-4 p-2 rounded bg-gray-700 text-white flex-1"
                    placeholder="Type your prompt or message here..."
                />
                <button className="bg-green-600 text-white py-2 px-4 rounded mb-2">
                    Submit
                </button>
                <button
                    onClick={onClose}
                    className="bg-red-600 text-white py-2 px-4 rounded"
                >
                    Cancel
                </button>
                <p className="text-xs text-gray-400 mt-2">
                    (The prompt and selected areas would be sent as the payload.)
                </p>
            </div>
        </div>
    );
};

export default ImageSelectionModal;
