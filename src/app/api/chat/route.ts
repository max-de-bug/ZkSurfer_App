import { NextResponse } from 'next/server';
import OpenAI from 'openai';


const client = new OpenAI({
    baseURL: process.env.OPENAI_BASE_URL || "https://leo.tektorch.info/v1",
    apiKey: process.env.OPENAI_API_KEY || "zk-123321",
});

export async function POST(request: Request) {
    try {
        console.log('Received request to /api/chat');
        const { messages } = await request.json();
        console.log('Parsed messages:', messages);

        if (!client.apiKey) {
            console.error('OPENAI_API_KEY is not set');
            throw new Error('API configuration is incomplete');
        }

        console.log('Sending request to OpenAI API');
        const response = await client.chat.completions.create({
            model: "microsoft/Phi-3-mini-4k-instruct",
            messages: messages,
        });

        console.log('Received response from OpenAI API');
        const responseMessage = response.choices[0].message;

        return NextResponse.json(responseMessage);
    } catch (error) {
        console.error('Error in /api/chat:', error);
        return NextResponse.json(
            { error: 'An error occurred while processing your request' },
            { status: 500 }
        );
    }
}