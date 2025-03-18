// export const defaultLocale = 'en';
// export const locales = ['en', 'ko'] as const;

// export type Locale = typeof locales[number];

// // Detect if we need to redirect based on locale
// export function getLocaleFromPathname(pathname: string): Locale {
//     const segments = pathname.split('/');
//     return (locales.find(locale => segments[1] === locale) || defaultLocale) as Locale;
// }

// export function isLocaleSupported(locale: string): boolean {
//     return locales.includes(locale as Locale);
// }

export const defaultLocale = 'en';
export const locales = ['en', 'ko', 'vi', 'zh', 'tr'] as const;

export type Locale = typeof locales[number];

export function getLocaleFromPathname(pathname: string): Locale {
    const segments = pathname.split('/');
    return (locales.find(locale => segments[1] === locale) || defaultLocale) as Locale;
}

export function isLocaleSupported(locale: string): boolean {
    return locales.includes(locale as Locale);
}