// import { NextRequest, NextResponse } from 'next/server';
// import { locales, defaultLocale } from './app/i18n/settings';

// function getPreferredLocale(request: NextRequest): string {
//   // Get the Accept-Language header
//   const acceptLanguage = request.headers.get('accept-language') || '';
//   console.log('Raw Accept-Language header:', acceptLanguage);

//   // Parse the Accept-Language header to get language preferences with their quality values
//   const languages = acceptLanguage.split(',')
//     .map(lang => {
//       const [language, quality = 'q=1.0'] = lang.trim().split(';');
//       const q = parseFloat(quality.split('=')[1]);
//       return { language: language.trim(), q };
//     })
//     .sort((a, b) => b.q - a.q); // Sort by quality value (highest first)

//   // Log entire parsed languages array for debugging
//   console.log('Parsed languages array:', JSON.stringify(languages));

//   // Explicitly check for Korean first (temporary for debugging)
//   const koreanEntry = languages.find(lang => lang.language.toLowerCase().startsWith('ko'));
//   console.log('Found Korean entry:', koreanEntry || 'None');

//   // Look for any supported locale in the user's preferences
//   for (const lang of languages) {
//     // Check if any of our supported locales match the beginning of the language code
//     // e.g., 'ko-KR' should match 'ko'
//     console.log(`Checking language: ${lang.language}`);

//     for (const locale of locales) {
//       console.log(`Comparing with locale: ${locale}`);
//       if (lang.language.toLowerCase().startsWith(locale.toLowerCase())) {
//         console.log(`✅ MATCH FOUND: ${lang.language} matches ${locale}`);
//         return locale;
//       }
//     }
//   }

//   // If no match is found, return default locale
//   console.log(`❌ No locale match found in Accept-Language, using default: ${defaultLocale}`);
//   return defaultLocale;
// }

// export function middleware(request: NextRequest) {
//   console.log('\n--------- MIDDLEWARE EXECUTION START ---------');
//   console.log('Request URL:', request.url);
//   console.log('Request pathname:', request.nextUrl.pathname);

//   const pathname = request.nextUrl.pathname;

//   // Check if pathname has a locale prefix
//   const pathnameHasLocale = locales.some(
//     locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
//   );

//   console.log('Pathname has locale prefix:', pathnameHasLocale);
//   console.log('Supported locales:', locales);

//   // If pathname doesn't have locale, redirect
//   if (!pathnameHasLocale) {
//     console.log('No locale in pathname, determining preferred locale...');

//     // Determine the locale to use
//     const preferredLocale = getPreferredLocale(request);
//     console.log('Selected preferred locale:', preferredLocale);

//     // Create new URL with locale prefix
//     const newUrl = new URL(request.url);
//     newUrl.pathname = `/${preferredLocale}${pathname === '/' ? '' : pathname}`;

//     console.log(`Redirecting to: ${newUrl.toString()}`);

//     // Return redirect response
//     console.log('--------- MIDDLEWARE EXECUTION END ---------\n');
//     return NextResponse.redirect(newUrl);
//   }

//   console.log('Proceeding without redirect');
//   console.log('--------- MIDDLEWARE EXECUTION END ---------\n');
//   return NextResponse.next();
// }

// // Make sure to include ALL paths (including root) in the matcher
// export const config = {
//   matcher: [
//     // Match the root path
//     '/',
//     // Match all paths that don't start with excluded prefixes
//     '/((?!api|_next/static|_next/image|favicon.ico|images|fonts).*)'
//   ]
// };

import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from './app/i18n/settings';

function getPreferredLocale(request: NextRequest): string {
  // Get the Accept-Language header
  const acceptLanguage = request.headers.get('accept-language') || '';
  console.log('Raw Accept-Language header:', acceptLanguage);

  // Parse the Accept-Language header to get language preferences with their quality values
  const languages = acceptLanguage.split(',')
    .map(lang => {
      const [language, quality = 'q=1.0'] = lang.trim().split(';');
      const q = parseFloat(quality.split('=')[1]);
      return { language: language.trim(), q };
    })
    .sort((a, b) => b.q - a.q); // Sort by quality value (highest first)

  // Log entire parsed languages array for debugging
  console.log('Parsed languages array:', JSON.stringify(languages));

  // Explicitly check for Korean first (temporary for debugging)
  const koreanEntry = languages.find(lang => lang.language.toLowerCase().startsWith('ko'));
  console.log('Found Korean entry:', koreanEntry || 'None');

  // Look for any supported locale in the user's preferences
  for (const lang of languages) {
    console.log(`Checking language: ${lang.language}`);
    for (const locale of locales) {
      console.log(`Comparing with locale: ${locale}`);
      if (lang.language.toLowerCase().startsWith(locale.toLowerCase())) {
        console.log(`✅ MATCH FOUND: ${lang.language} matches ${locale}`);
        return locale;
      }
    }
  }

  console.log(`❌ No locale match found in Accept-Language, using default: ${defaultLocale}`);
  return defaultLocale;
}

export function middleware(request: NextRequest) {
  console.log('\n--------- MIDDLEWARE EXECUTION START ---------');
  console.log('Request URL:', request.url);
  console.log('Request pathname:', request.nextUrl.pathname);

  const pathname = request.nextUrl.pathname;

  // Check if pathname already has a locale prefix
  const pathnameHasLocale = locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  console.log('Pathname has locale prefix:', pathnameHasLocale);
  console.log('Supported locales:', locales);

  if (!pathnameHasLocale) {
    console.log('No locale in pathname, determining preferred locale...');
    const preferredLocale = getPreferredLocale(request);
    console.log('Selected preferred locale:', preferredLocale);

    const newUrl = new URL(request.url);

    // Special case for API key pages: append locale instead of prepending.
    if (pathname.startsWith('/api-key')) {
      newUrl.pathname = `${pathname}/${preferredLocale}`;
    } else {
      newUrl.pathname = `/${preferredLocale}${pathname === '/' ? '' : pathname}`;
    }

    console.log(`Redirecting to: ${newUrl.toString()}`);
    console.log('--------- MIDDLEWARE EXECUTION END ---------\n');
    return NextResponse.redirect(newUrl);
  }

  console.log('Proceeding without redirect');
  console.log('--------- MIDDLEWARE EXECUTION END ---------\n');
  return NextResponse.next();
}

// Matcher remains the same to exclude specific static assets etc.
export const config = {
  matcher: [
    '/',
    '/((?!api|_next/static|_next/image|favicon.ico|images|fonts).*)'
  ]
};
