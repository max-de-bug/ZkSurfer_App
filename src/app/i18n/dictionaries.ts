// import 'server-only';

// const dictionaries = {
//   en: () => import('./dictionaries/en.json').then(module => module.default),
//   ko: () => import('./dictionaries/ko.json').then(module => module.default),
// };

// export const getDictionary = async (locale: string) => {
//   // Fallback to English if the requested locale isn't available
//   return (dictionaries[locale as keyof typeof dictionaries] || dictionaries.en)();
// };


import 'server-only';

const dictionaries = {
  en: () => import('./dictionaries/en.json').then(module => module.default),
  ko: () => import('./dictionaries/ko.json').then(module => module.default),
  vi: () => import('./dictionaries/vi.json').then(module => module.default),
  zh: () => import('./dictionaries/zh.json').then(module => module.default),
  tr: () => import('./dictionaries/tr.json').then(module => module.default),
};

export const getDictionary = async (locale: string) => {
  // Fallback to English if the requested locale isn't available
  return (dictionaries[locale as keyof typeof dictionaries] || dictionaries.en)();
};