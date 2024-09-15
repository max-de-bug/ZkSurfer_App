import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import tools from './tools.json';

interface CustomResponse extends OpenAI.Chat.Completions.ChatCompletionMessage {
    generateImage?: string;
    proof?: string;
}

const client = new OpenAI({
    baseURL: process.env.OPENAI_BASE_URL || "https://leo.tektorch.info/v1",
    apiKey: process.env.OPENAI_API_KEY || "zk-123321",
});

async function generateKeys() {
    console.log('Generating keys...');
    const response = await fetch('http://164.52.213.234:8000/generate-keys/', { method: 'POST' });
    if (!response.ok) {
        throw new Error('Failed to generate keys');
    }
    const result = await response.json();
    console.log('Keys generated successfully:', result);
    return result;
}

async function generateProof(text: string) {
    console.log('Generating proof for text:', text);
    const response = await fetch('http://164.52.213.234:8000/generate-proof/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
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
    const response = await fetch('http://164.52.213.234:8000/verify-proof/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proof }),
    });
    if (!response.ok) {
        throw new Error('Failed to verify proof');
    }
    const result = await response.json();
    console.log('Proof verified successfully:', result);
    return result;
}

async function generate_image(prompt: string) {
    console.log('Generating image...');
    const response = await fetch('http://172.81.127.5:32257/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt,
            width: 512,
            height: 512,
            num_steps: 4,
            guidance: 3.5,
            seed: -1,
            add_sampling_metadata: true
        }),
    });

    if (!response.ok) {
        throw new Error(`Failed to generate image: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('result', result);
    return 'Image generated successfully';
}

export async function POST(request: Request) {
    try {
        console.log('Received request to /api/chat');
        const { messages } = await request.json();
        console.log('Parsed messages:', messages);

        if (!client.apiKey) {
            console.error('OPENAI_API_KEY is not set');
            throw new Error('API configuration is incomplete');
        }

        // Generate keys
        await generateKeys();

        // Add system prompt
        const tool_prompt = `You are an AI model with function calling capabilities. You are provided with function signatures within <tools></tools> XML tags. Your primary goal is to respond directly to user queries using your own knowledge and capabilities.

        Only call functions when it is absolutely necessary to respond accurately to the user's query or when the function would provide critical information that you don't have access to. If you can answer the query directly without calling a function, always do so.
        
        Before considering a function call, carefully evaluate if the information is truly needed and not already within your knowledge base. Function calls should be a last resort, not a default action.
        
        When a function call is deemed necessary:
        1. Verify that the function is listed within the provided tools.
        2. Do not make assumptions about function argument values.
        3. Call multiple functions in series if needed to gather all necessary information.
        
        For each required function call, return a JSON object with the function name and arguments within <tool_call></tool_call> XML tags as follows:
        <tool_call>
        {"name": "<function-name>", "arguments": <args-dict>}
        </tool_call>
        
        Here are the available tools, to be used only when absolutely necessary:
        <tools>
        ${JSON.stringify(tools)}
        </tools>
        
        Remember, your primary mode of operation is to use your own knowledge and capabilities. Only use these tools when it's truly required to provide an accurate and complete response to the user's query.`;


        // Add system message to the beginning of the messages array
        const updatedMessages = [
            { role: "system", content: tool_prompt },
            ...messages
        ];

        console.log('Sending request to OpenAI API');
        const response = await client.chat.completions.create({
            model: "microsoft/Phi-3-mini-4k-instruct",
            messages: updatedMessages,
        });

        console.log('Received response from OpenAI API');
        const responseMessage = response.choices[0].message;

        let finalResponse: CustomResponse = { ...responseMessage };

        // Check for tool calls
        if (responseMessage.content) {
            const toolCallMatch = responseMessage.content.match(/<tool_call>([^]*?)<\/tool_call>/);
            if (toolCallMatch) {
                const toolCallContent = toolCallMatch[1];
                try {
                    const toolCall = JSON.parse(toolCallContent);
                    console.log('Tool call detected:', toolCall);

                    // Handle the tool call
                    switch (toolCall.name) {
                        case 'generate_image':
                            const generatedImage = await generate_image(toolCall.arguments.prompt);
                            finalResponse.content = generatedImage;
                            console.log('finalResponse', finalResponse)
                            break;
                        // Add cases for other tool calls as needed
                        default:
                            console.log('Unknown tool call:', toolCall.name);
                    }
                } catch (error) {
                    console.error('Error parsing or executing tool call:', error);
                }
            }
        }

        // Generate proof
        const lastMessage = messages[messages.length - 1].content;
        const proof = await generateProof(lastMessage);

        // Verify proof
        await verifyProof(proof);

        // Combine response message with proof
        finalResponse.proof = proof;
        console.log("Proof", proof)


        return NextResponse.json(finalResponse);
    } catch (error) {
        console.error('Error in /api/chat:', error);
        return NextResponse.json(
            { error: 'An error occurred while processing your request' },
            { status: 500 }
        );
    }
}