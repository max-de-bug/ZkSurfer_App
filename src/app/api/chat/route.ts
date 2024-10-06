import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import tools from './tools.json';

interface CustomResponse extends Omit<OpenAI.Chat.Completions.ChatCompletionMessage, 'content'> {
    generateImage?: string;
    proof?: string;
    content?: string | null;
    type?: 'img' | 'text';
    prompt?: string;
}

// const client = new OpenAI({
//     baseURL: process.env.OPENAI_BASE_URL || "https://leo.tektorch.info/v1",
//     apiKey: process.env.OPENAI_API_KEY || "zk-123321",
// });

const client = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: "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",
});

async function generateKeys() {
    console.log('Generating keys...');
    //http://164.52.213.234:8000/generate-keys/ 
    const response = await fetch('https://zynapse.zkagi.ai/api/generate-keys', { method: 'POST', headers: { 'Content-Type': 'application/json', 'api-key': `${process.env.API_KEY}` } });
    if (!response.ok) {
        throw new Error('Failed to generate keys');
    }
    const result = await response.json();
    console.log('Keys generated successfully:', result);
    return result;
}

async function generateProof(text: string) {
    console.log('Generating proof for text:', text);
    const response = await fetch('https://zynapse.zkagi.ai/api/generate-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'api-key': `${process.env.API_KEY}` },
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
    const response = await fetch('https://zynapse.zkagi.ai/api/verify-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'api-key': `${process.env.API_KEY}` },
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

    const fetchWithTimeout = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error('Request timed out after 60 seconds'));
        }, 120000);

        fetch('https://zynapse.zkagi.ai/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': `${process.env.API_KEY}`
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
        })
            .then(response => {
                clearTimeout(timeout); // Clear timeout if request is successful
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
        return result.image;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

function openAIWithTimeout(request: any, timeout = 120000): Promise<OpenAI.Chat.Completions.ChatCompletion> {
    return Promise.race([
        client.chat.completions.create(request),
        new Promise((_, reject) => setTimeout(() => reject(new Error('OpenAI request timed out')), timeout))
    ]) as Promise<OpenAI.Chat.Completions.ChatCompletion>;
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
        const tool_prompt = `You are an advanced AI assistant named ZKSurfer made by ZkAGI with access to external tools, but your primary capability is your own extensive knowledge and reasoning. Your goal is to provide helpful, accurate responses to user queries.

<tools>
${JSON.stringify(tools)}
</tools>

Guidelines for tool usage:

1. Rely primarily on your own knowledge and capabilities. This should be your default approach for answering queries.

2. Use tools only when absolutely necessary. Consider using a tool if:
   - The query explicitly requires real-time or external data you cannot access otherwise.
   - The task involves specialized computations or data processing beyond your built-in capabilities.
   - You need to verify critical information that you're unsure about.

3. Before using a tool, carefully evaluate:
   - Is the information truly essential to answer the query?
   - Is there any way to provide a satisfactory response without the tool?
   - Will the tool provide significant value beyond what you can offer directly?

4. If you determine a tool is necessary:
   - Verify the tool is listed in the provided <tools> section.
   - Use only the tools explicitly defined in the <tools> section. Do not create or invent new tools.
   - Use only the arguments required by the tool signature as defined in the <tools> section.
   - Call multiple tools in sequence if needed to gather all necessary information.

5. To use a tool, format your request as follows:
   <tool_call>
   {"name": "<function-name>", "arguments": <args-dict>}
   </tool_call>

6. After using a tool, integrate the results seamlessly into your response. Explain how the tool output contributes to answering the user's query.

Remember: 
- Your intelligence and knowledge are your primary assets. Tools are supplementary and should be used judiciously to enhance your capabilities, not replace them.
- Only use tools that are explicitly defined in the <tools> section. Do not create, invent, or assume the existence of any tools not listed there.
- Adhere strictly to the defined tool signatures and do not attempt to use arguments or functionalities not specified in the tool definitions.`;

        // Add system message to the beginning of the messages array
        const updatedMessages = [
            { role: "system", content: tool_prompt },
            ...messages
        ];

        // const response = await openAIWithTimeout({
        //     model: "microsoft/Phi-3-mini-4k-instruct",
        //     messages: updatedMessages,
        // });


        const response = await openAIWithTimeout({
            model: "meta-llama/llama-3.2-11b-vision-instruct:free",
            messages: updatedMessages,
        });


        console.log('resonse', response)
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
                            finalResponse.type = 'img';
                            finalResponse.prompt = responseMessage.content;
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
        // const lastMessage = messages[messages.length - 1].content;
        // const proof = await generateProof(lastMessage);

        // // Verify proof
        // await verifyProof(proof);

        // // Combine response message with proof
        // finalResponse.proof = proof;
        // console.log("Proof", proof)


        return NextResponse.json(finalResponse);
    } catch (error) {
        console.error('Error in /api/chat:', error);
        return NextResponse.json(
            { error: 'An error occurred while processing your request' },
            { status: 500 }
        );
    }
}