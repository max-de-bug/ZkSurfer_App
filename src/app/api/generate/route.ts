import { NextRequest, NextResponse } from "next/server";

interface UGCOption {
    name: string;
    apiUrl: any;
}

const availableUGCOptions: UGCOption[] = [
    { name: 'LandWolf', apiUrl: process.env.NEXT_PUBLIC_LANDWOLF },
    { name: 'Ponke', apiUrl: process.env.NEXT_PUBLIC_LANDWOLF }, // Ensure you have this env variable
];

export async function POST(req: NextRequest) {
    try {
        // Parse the incoming JSON request
        const { selectedOption, userPrompt } = await req.json();

        // Validate the input
        if (!selectedOption || !userPrompt) {
            return NextResponse.json(
                { error: "selectedOption and userPrompt are required" },
                { status: 400 }
            );
        }

        // Find the selected UGC option
        const option = availableUGCOptions.find(opt => opt.name === selectedOption);

        if (!option) {
            return NextResponse.json(
                { error: `Unknown option: ${selectedOption}. Available options: ${availableUGCOptions.map(opt => opt.name).join(', ')}` },
                { status: 400 }
            );
        }

        // Ensure apiUrl is defined
        if (!option.apiUrl) {
            return NextResponse.json(
                { error: `API URL for ${option.name} is not defined` },
                { status: 500 }
            );
        }

        // Prepare the payload
        const payload = {
            prompt: userPrompt,
            width: 512,
            height: 512,
            num_steps: 20,
            guidance: 4,
        };

        // Make the API call to the selected UGC option
        const response = await fetch(option.apiUrl, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: `Failed to generate content for ${option.name}` },
                { status: response.status }
            );
        }

        // Determine response content type
        const contentType = response.headers.get('Content-Type');

        if (contentType?.includes('image/')) {
            // If the response is an image (e.g., JPEG or PNG)
            const blob = await response.blob();
            const arrayBuffer = await blob.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            return new NextResponse(buffer, {
                status: 200,
                headers: {
                    'Content-Type': contentType,
                },
            });
        } else if (contentType?.includes('application/json')) {
            // If the response is JSON
            const result = await response.json();
            return NextResponse.json(result, { status: 200 });
        } else {
            return NextResponse.json(
                { error: 'Unsupported response type' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("Error in /generate route:", error);
        return NextResponse.json(
            { error: "Something went wrong while processing the request" },
            { status: 500 }
        );
    }
}
