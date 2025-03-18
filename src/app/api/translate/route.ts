// import { NextResponse } from 'next/server';

// export async function POST(request: Request) {
//     try {
//         const { pipeline } = await import('@xenova/transformers');
//         const { text, targetLang } = await request.json() as { text: string; targetLang: 'ko' | 'zh' | 'vi' | 'tr' };

//         const modelNames: { [key in 'ko' | 'zh' | 'vi' | 'tr']: string } = {
//             ko: 'Helsinki-NLP/opus-mt-en-ko',
//             zh: 'Helsinki-NLP/opus-mt-en-zh',
//             vi: 'Helsinki-NLP/opus-mt-en-vi',
//             tr: 'Helsinki-NLP/opus-mt-en-tr',
//         };

//         const modelName = modelNames[targetLang];

//         if (!text || !modelName) {
//             return NextResponse.json({ error: 'Missing text or unsupported language' }, { status: 400 });
//         }

//         const translator = await pipeline('translation', modelName);
//         const result = await translator(text) as { translation_text: string }[];

//         return NextResponse.json({ translation: result[0].translation_text });
//     } catch (error) {
//         console.error('Translation error:', error);
//         return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
//     }
// }

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { pipeline } = await import('@xenova/transformers');
        const { text, targetLang } = await request.json() as { text: string; targetLang: 'ko' | 'zh' | 'vi' | 'tr' | 'ru' };

        const modelNames: { [key in 'ko' | 'zh' | 'vi' | 'tr' | 'ru']: string } = {
            ko: 'Helsinki-NLP/opus-mt-en-ko',
            zh: 'Helsinki-NLP/opus-mt-en-zh',
            vi: 'Helsinki-NLP/opus-mt-en-vi',
            tr: 'Helsinki-NLP/opus-mt-en-tr',
            ru: 'Helsinki-NLP/opus-mt-en-ru',
        };

        const modelName = modelNames[targetLang];

        if (!text || !modelName) {
            return NextResponse.json({ error: 'Missing text or unsupported language' }, { status: 400 });
        }

        const translator = await pipeline('translation', modelName);
        const result = await translator(text) as { translation_text: string }[];

        return NextResponse.json({ translation: result[0].translation_text });
    } catch (error) {
        console.error('Translation error:', error);
        return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
    }
}
