// import { NextRequest, NextResponse } from 'next/server';

// export const config = {
//     api: {
//         bodyParser: false,
//     },
// };

// export async function POST(request: NextRequest) {
//     try {
//         const formData = await request.formData();
//         const image = formData.get('image');
//         const prompt = formData.get('prompt');
//         const seed = formData.get('seed') || '-1';
//         const fps = formData.get('fps') || '24';
//         const width = formData.get('w') || '720';
//         const height = formData.get('h') || '720';
//         const videoLength = formData.get('video_length') || '120';
//         const imgEdgeRatio = formData.get('img_edge_ratio') || '1';

//         if (!image || !prompt) {
//             return NextResponse.json(
//                 { error: 'Image and prompt are required.' },
//                 { status: 400 }
//             );
//         }

//         const externalApiUrl = process.env.NEXT_PUBLIC_IMG_TO_VIDEO;
//         if (!externalApiUrl) {
//             throw new Error('NEXT_PUBLIC_IMG_TO_VIDEO environment variable is not set!');
//         }

//         const forwardFormData = new FormData();
//         forwardFormData.append('image', image); // pass along the file
//         forwardFormData.append('prompt', prompt.toString());
//         forwardFormData.append('seed', seed.toString());
//         forwardFormData.append('fps', fps.toString());
//         forwardFormData.append('w', width.toString());
//         forwardFormData.append('h', height.toString());
//         forwardFormData.append('video_length', videoLength.toString());
//         forwardFormData.append('img_edge_ratio', imgEdgeRatio.toString());

//         const externalResponse = await fetch(externalApiUrl, {
//             method: 'POST',
//             body: forwardFormData,
//         });

//         if (!externalResponse.ok) {
//             return NextResponse.json(
//                 { error: 'Failed to generate video from external API.' },
//                 { status: externalResponse.status }
//             );
//         }

//         const contentType = externalResponse.headers.get('Content-Type') || '';
//         if (!contentType.startsWith('video/')) {
//             const errorJson = await externalResponse.json().catch(() => null);
//             return NextResponse.json(
//                 {
//                     error: `Expected a video, got content-type: ${contentType}`,
//                     details: errorJson,
//                 },
//                 { status: 500 }
//             );
//         }

//         const arrayBuffer = await externalResponse.arrayBuffer();
//         const buffer = Buffer.from(arrayBuffer);
//         return new NextResponse(buffer, {
//             status: 200,
//             headers: { 'Content-Type': contentType },
//         });
//     } catch (error: any) {
//         console.error('Error in /api/imgToVideo route:', error);
//         return NextResponse.json(
//             { error: error.message || 'Something went wrong.' },
//             { status: 500 }
//         );
//     }
// }

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        // 1. Parse form data from the request
        const formData = await request.formData();

        // 2. Extract fields
        const image = formData.get('image');
        const prompt = formData.get('prompt');
        const seed = formData.get('seed') || '-1';
        const fps = formData.get('fps') || '24';
        const width = formData.get('w') || '720';
        const height = formData.get('h') || '720';
        const videoLength = formData.get('video_length') || '120';
        const imgEdgeRatio = formData.get('img_edge_ratio') || '1';

        // Validate
        if (!image || !prompt) {
            return NextResponse.json(
                { error: 'Image and prompt are required.' },
                { status: 400 }
            );
        }

        const externalApiUrl = process.env.NEXT_PUBLIC_IMG_TO_VIDEO;
        if (!externalApiUrl) {
            throw new Error('NEXT_PUBLIC_IMG_TO_VIDEO is not set!');
        }

        // Rebuild form data to forward to your external API
        const forwardFormData = new FormData();
        forwardFormData.append('image', image);
        forwardFormData.append('prompt', prompt.toString());
        forwardFormData.append('seed', seed.toString());
        forwardFormData.append('fps', fps.toString());
        forwardFormData.append('w', width.toString());
        forwardFormData.append('h', height.toString());
        forwardFormData.append('video_length', videoLength.toString());
        forwardFormData.append('img_edge_ratio', imgEdgeRatio.toString());

        // Forward it
        const externalResponse = await fetch(externalApiUrl, {
            method: 'POST',
            body: forwardFormData,
        });

        if (!externalResponse.ok) {
            return NextResponse.json(
                { error: 'Failed to generate video from external API.' },
                { status: externalResponse.status }
            );
        }

        const contentType = externalResponse.headers.get('Content-Type') || '';
        if (!contentType.startsWith('video/')) {
            const errorJson = await externalResponse.json().catch(() => null);
            return NextResponse.json(
                {
                    error: `Expected a video, got content-type: ${contentType}`,
                    details: errorJson,
                },
                { status: 500 }
            );
        }

        // Return video blob
        const arrayBuffer = await externalResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        return new NextResponse(buffer, {
            status: 200,
            headers: { 'Content-Type': contentType },
        });
    } catch (error: any) {
        console.error('Error in /api/imgToVideo route:', error);
        return NextResponse.json(
            { error: error.message || 'Something went wrong.' },
            { status: 500 }
        );
    }
}
