import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import tools from './tools.json';
import { useModelStore } from '@/stores/useModel-store';

interface CustomResponse extends Omit<OpenAI.Chat.Completions.ChatCompletionMessage, 'content'> {
    generateImage?: string;
    proof?: string;
    content?: string | null;
    type?: 'img' | 'text';
    prompt?: string;
}

// Create a “default” client (if needed)
const client = new OpenAI({
    baseURL: process.env.NEXT_PUBLIC_OPENAI_BASE_URL,
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

async function getAIClient() {
    // Get the selected model from Zustand
    const { selectedModel } = useModelStore.getState();

    console.log('selectedModel route', selectedModel);

    // Ensure environment variables are defined
    const deepSeekBaseURL = process.env.NEXT_PUBLIC_DEEPSEEK_BASE_URL;
    const deepSeekModel = process.env.NEXT_PUBLIC_DEEPSEEK_MODEL;
    const mistralBaseURL = process.env.NEXT_PUBLIC_OPENAI_BASE_URL;
    const mistralModel = process.env.NEXT_PUBLIC_MISTRAL_MODEL;
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

    if (!deepSeekBaseURL || !deepSeekModel || !mistralBaseURL || !mistralModel || !apiKey) {
        throw new Error("Missing required environment variables for AI client.");
    }

    let baseURL = deepSeekBaseURL;
    let model = deepSeekModel;

    if (selectedModel === "Mistral") {
        baseURL = mistralBaseURL;
        model = mistralModel;
    }

    console.log(`Using AI Provider: ${selectedModel}`);
    console.log(`Base URL: ${baseURL}, Model: ${model}`);

    return new OpenAI({
        baseURL,
        apiKey,
    });
}

async function generateKeys() {
    console.log('Generating keys...');
    const response = await fetch('https://zynapse.zkagi.ai/api/generate-keys', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'api-key': `${process.env.API_KEY}`
        }
    });
    if (!response.ok) {
        throw new Error('Failed to generate keys');
    }
    const result = await response.json();
    console.log('Keys generated successfully:', result);
    return result;
}

async function generateProof(text: string) {
    const limitedText = text.substring(0, 500);
    const response = await fetch('https://zynapse.zkagi.ai/api/generate-proof', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'api-key': `${process.env.API_KEY}`
        },
        body: JSON.stringify({ text: limitedText }),
    });
    if (!response.ok) {
        throw new Error('Failed to generate proof');
    }
    const result = await response.json();
    console.log('Proof generated successfully:', result);
    return result;
}

async function verifyProof(proof: string) {
    console.log('Verifying proof:', proof);
    const response = await fetch('https://zynapse.zkagi.ai/api/verify-proof', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'api-key': `${process.env.API_KEY}`
        },
        body: JSON.stringify({ proof }),
    });
    if (!response.ok) {
        throw new Error('Failed to verify proof');
    }
    const result = await response.json();
    console.log('Proof verified successfully:', result);
    return result;
}

async function generate_image(prompt: string, seed?: number) {
    console.log('Generating image...', { prompt, seed });
    const fetchWithTimeout = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error('Request timed out after 120 seconds'));
        }, 120000);

        fetch('https://zynapse.zkagi.ai/generate-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': `${process.env.API_KEY}`
            },
            body: JSON.stringify({
                prompt,
                width: 512,
                height: 512,
                add_sampling_metadata: true,
                num_steps: 20,
                start_step: 0,
                guidance: 4,
                seed: seed ?? -1,
                id_weight: 1.0,
                neg_prompt: "bad quality, worst quality, text, signature, watermark, extra limbs",
                true_cfg: 1.0,
                timestep_to_start_cfg: 1,
                max_sequence_length: 128
            }),
        })
            .then(response => {
                clearTimeout(timeout);
                if (!response.ok) {
                    throw new Error(`Failed to generate image: ${response.statusText}`);
                }
                return response.json();
            })
            .then(result => resolve(result))
            .catch(err => reject(err));
    });

    try {
        const result: any = await fetchWithTimeout;
        console.log('result', result);
        return {
            image: result.image,
            seed: result.seed // Include seed in return value
        };
    } catch (error) {
        console.error(error);
        throw error;
    }
}

//
// ─── STREAMING API ENDPOINT ─────────────────────────────────────────────
//

export async function POST(request: Request) {
    try {
        console.log('Received request to /api/chat');

        // Parse the request body once.
        const { messages, directCommand, selectedModel } = await request.json();
        console.log('Parsed messages:', messages);
        console.log('Received selectedModel from frontend:', selectedModel);

        if (!selectedModel) {
            throw new Error("No selected model provided in request.");
        }

        // Generate keys first.
        await generateKeys();

        // If this is a direct command (e.g. image generation), handle it without streaming chat.
        // if (directCommand) {
        //     // Generate image directly.
        //     const generatedImage = await generate_image(directCommand.prompt, directCommand.seed);
        //     // Generate and verify proof.
        //     const proof = await generateProof(directCommand.prompt);
        //     await verifyProof(proof);

        //     // For simplicity, stream out a single JSON payload.
        //     const payload = JSON.stringify({
        //         content: generatedImage.image,
        //         type: 'img',
        //         prompt: directCommand.prompt,
        //         seed: generatedImage.seed,
        //         proof
        //     });
        //     const encoder = new TextEncoder();
        //     const stream = new ReadableStream({
        //         start(controller) {
        //             controller.enqueue(encoder.encode(payload));
        //             controller.close();
        //         }
        //     });
        //     return new Response(stream, {
        //         headers: { "Content-Type": "application/json" }
        //     });
        // }

        if (directCommand) {
            // Call your image-generation service.
            const generatedImage = await generate_image(directCommand.prompt, directCommand.seed);

            // Generate and verify proof.
            const proof = await generateProof(directCommand.prompt);
            await verifyProof(proof);

            const encoder = new TextEncoder();

            const stream = new ReadableStream({
                async start(controller) {
                    // For example, send a progress update (you can send multiple progress events if available).
                    const progressEvent = JSON.stringify({ progress: 50 }); // 50% complete, for instance.
                    controller.enqueue(encoder.encode(`data: ${progressEvent}\n\n`));

                    // Optionally, you might wait a bit or send additional updates here...

                    // Now send the final payload.
                    const finalPayload = JSON.stringify({
                        content: generatedImage.image,
                        type: 'img',
                        prompt: directCommand.prompt,
                        seed: generatedImage.seed,
                        proof,
                    });
                    controller.enqueue(encoder.encode(`data: ${finalPayload}\n\n`));
                    controller.close();
                },
            });

            return new Response(stream, {
                headers: { "Content-Type": "text/event-stream" }
            });
        }


        // ─── NORMAL CHAT FLOW (STREAMED) ─────────────────────────────
        // Prepend a system prompt.
        const updatedMessages = [
            { role: "system", content: 'You are an advanced AI assistant named ZkTerminal made by ZkAGI' },
            ...messages
        ];

        // Select the correct base URL and model.
        const deepSeekBaseURL = process.env.NEXT_PUBLIC_DEEPSEEK_BASE_URL;
        const deepSeekModel = process.env.NEXT_PUBLIC_DEEPSEEK_MODEL;
        const mistralBaseURL = process.env.NEXT_PUBLIC_OPENAI_BASE_URL;
        const mistralModel = process.env.NEXT_PUBLIC_MISTRAL_MODEL;
        const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

        if (!deepSeekBaseURL || !deepSeekModel || !mistralBaseURL || !mistralModel || !apiKey) {
            throw new Error("Missing required environment variables for AI client.");
        }

        let baseURL = deepSeekBaseURL;
        let model = deepSeekModel;
        if (selectedModel === "Mistral") {
            baseURL = mistralBaseURL;
            model = mistralModel;
        }
        console.log(`Using AI Provider: ${selectedModel}`);
        console.log(`Base URL: ${baseURL}, Model: ${model}`);

        // Create a client using the selected provider.
        const aiClient = new OpenAI({ baseURL, apiKey });

        // Request a streaming completion from OpenAI (make sure your OpenAI client supports stream mode).
        const openAIStream = await aiClient.chat.completions.create({
            model,
            messages: updatedMessages,
            stream: true,
        });

        // Prepare a ReadableStream that will push SSE-formatted tokens to the client.
        const encoder = new TextEncoder();
        let accumulatedResponse = '';
        let buffer = '';

        const stream = new ReadableStream({
            async start(controller) {
                try {
                    // Loop over the stream of tokens.
                    for await (const chunk of openAIStream) {
                        const delta = chunk.choices[0].delta;
                        if (delta && delta.content) {
                            const token = delta.content;
                            accumulatedResponse += token;
                            buffer += token;

                            // Check if the buffer ends with a space or common punctuation,
                            // which we treat as a word (or sentence) boundary.
                            if (/[ \t\n\r.,!?]$/.test(buffer)) {
                                // Flush the complete word(s) from the buffer.
                                const message = `${buffer}`;
                                controller.enqueue(encoder.encode(message));
                                buffer = ''; // Reset the buffer after flushing.
                            }
                        }
                    }
                    // After the loop, if there is any remaining text in the buffer, flush it.
                    if (buffer.length > 0) {
                        controller.enqueue(encoder.encode(`${buffer}`));
                    }
                    // Once streaming is complete, generate and verify a proof.
                    if (accumulatedResponse.trim()) {
                        const proof = await generateProof(accumulatedResponse);
                        await verifyProof(proof);
                        // Send a final SSE event with the proof.
                        const proofMessage = `data: [PROOF] ${proof}\n\n`;
                        controller.enqueue(encoder.encode(proofMessage));
                    }
                } catch (error) {
                    // If an error occurs during streaming, send an SSE error event.
                    controller.enqueue(encoder.encode(`data: [ERROR] ${error}\n\n`));
                    controller.error(error);
                }
                controller.close();
            }
        });

        // Return the streaming response with headers appropriate for SSE.
        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache, no-transform"
            }
        });

    } catch (error) {
        console.error('Error in /api/chat:', error);
        return new Response(
            JSON.stringify({ error: 'An error occurred while processing your request' }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}