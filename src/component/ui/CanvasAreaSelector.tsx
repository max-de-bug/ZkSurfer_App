import React, { useState, useEffect } from "react";
import { Stage, Layer, Image as KonvaImage, Rect } from "react-konva";

interface Selection {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface CanvasAreaSelectorProps {
    imageSrc: string;
    // Called whenever the user completes a selection.
    // Could be used to pass rectangles to your parent or backend.
    onSelectionChange?: (rects: Selection[]) => void;
    width?: number;   // optional: limit canvas width
    height?: number;  // optional: limit canvas height
}

const CanvasAreaSelector: React.FC<CanvasAreaSelectorProps> = ({
    imageSrc,
    onSelectionChange,
    width = 500,
    height = 500,
}) => {
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [rects, setRects] = useState<Selection[]>([]);
    const [newRect, setNewRect] = useState<Selection | null>(null);

    // Load the image into Konva
    useEffect(() => {
        const img = new window.Image();
        img.src = imageSrc;
        img.onload = () => {
            setImage(img);
        };
    }, [imageSrc]);

    // Start drawing
    const handleMouseDown = (e: any) => {
        if (!image) return; // Wait for the image to be loaded

        const stage = e.target.getStage();
        const pointerPos = stage.getPointerPosition();
        if (!pointerPos) return;

        setIsDrawing(true);
        setStartPos({ x: pointerPos.x, y: pointerPos.y });
        setNewRect({ x: pointerPos.x, y: pointerPos.y, width: 0, height: 0 });
    };

    // Update rectangle while dragging
    const handleMouseMove = (e: any) => {
        if (!isDrawing || !newRect) return;

        const stage = e.target.getStage();
        const pointerPos = stage.getPointerPosition();
        if (!pointerPos) return;

        const updatedWidth = pointerPos.x - startPos.x;
        const updatedHeight = pointerPos.y - startPos.y;

        setNewRect({
            x: startPos.x,
            y: startPos.y,
            width: updatedWidth,
            height: updatedHeight,
        });
    };

    // Finish drawing
    const handleMouseUp = () => {
        if (!isDrawing || !newRect) return;

        setIsDrawing(false);
        setRects((prev) => {
            const updated = [...prev, newRect];
            // If you want the parent to know about current selections:
            onSelectionChange?.(updated);
            return updated;
        });
        setNewRect(null);
    };

    return (
        <Stage
            width={width}
            height={height}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{ border: "1px solid #ccc", background: "#222" }}
        >
            <Layer>
                {/* The main image */}
                {image && (
                    <KonvaImage
                        image={image}
                        x={0}
                        y={0}
                        // Optionally scale to the stage size
                        width={width}
                        height={height}
                    />
                )}

                {/* Already-drawn rectangles */}
                {rects.map((r, i) => (
                    <Rect
                        key={i}
                        x={r.x}
                        y={r.y}
                        width={r.width}
                        height={r.height}
                        fill="rgba(0,255,0,0.2)"
                        stroke="lime"
                        strokeWidth={2}
                    />
                ))}

                {/* The rectangle we're currently drawing */}
                {newRect && (
                    <Rect
                        x={newRect.x}
                        y={newRect.y}
                        width={newRect.width}
                        height={newRect.height}
                        fill="rgba(0,255,0,0.2)"
                        stroke="lime"
                        strokeWidth={2}
                    />
                )}
            </Layer>
        </Stage>
    );
};

export default CanvasAreaSelector;
