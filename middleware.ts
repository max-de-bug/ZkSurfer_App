import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { nextUrl, headers } = request;

    // Skip API, static files, etc.
    if (nextUrl.pathname.startsWith('/_next') || nextUrl.pathname.includes('.')) {
        return NextResponse.next();
    }

    // Check the Accept-Language header for target language hints.
    const acceptLanguage = headers.get('accept-language')?.toLowerCase() || '';
    let detectedLocale = 'en';

    if (acceptLanguage.includes('ko')) {
        detectedLocale = 'ko';
    } else if (acceptLanguage.includes('zh')) {
        detectedLocale = 'zh';
    } else if (acceptLanguage.includes('vi')) {
        detectedLocale = 'vi';
    } else if (acceptLanguage.includes('tr')) {
        detectedLocale = 'tr';
    }

    // If the URL does not include the detected locale, redirect.
    if (nextUrl.locale !== detectedLocale) {
        const url = new URL(`/${detectedLocale}${nextUrl.pathname}`, request.url);
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
