import type { NextApiRequest, NextApiResponse } from 'next';
import { pipeline } from '@xenova/transformers';

// Define an interface for the expected translation output.
interface TranslationOutput {
    translation_text: string;
}

// Define modelNames with explicit keys.
const modelNames: { [key in 'ko' | 'zh' | 'vi' | 'tr']: string } = {
    ko: 'Helsinki-NLP/opus-mt-en-ko',
    zh: 'Helsinki-NLP/opus-mt-en-zh',
    vi: 'Helsinki-NLP/opus-mt-en-vi',
    tr: 'Helsinki-NLP/opus-mt-en-tr',
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    // Cast the body to the expected shape.
    const { text, targetLang } = req.body as { text: string; targetLang: keyof typeof modelNames };
    const modelName = modelNames[targetLang];

    if (!text || !modelName) {
        res.status(400).json({ error: 'Missing text or unsupported language' });
        return;
    }

    try {
        // Initialize the translation pipeline for the chosen model.
        const translator = await pipeline('translation', modelName);
        // Cast the result as an array of TranslationOutput.
        const result = (await translator(text)) as TranslationOutput[];

        res.status(200).json({ translation: result[0].translation_text });
    } catch (error) {
        console.error('Translation error:', error);
        res.status(500).json({ error: 'Translation failed' });
    }
}
