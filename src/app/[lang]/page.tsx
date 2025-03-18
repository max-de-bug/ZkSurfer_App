// // app/[lang]/page.tsx
// import { getDictionary } from '../i18n/dictionaries';
// import { Locale } from '../i18n/settings';

// interface PageProps {
//     params: {
//         lang: Locale;
//     };
// }

// export default async function Home({ params }: PageProps) {
//     const dict = await getDictionary(params.lang);

//     return (
//         <main>
//             <h1>{dict.home.title}</h1>
//             <p>{dict.home.description}</p>
//         </main>
//     );
// }

import type { NextPage } from 'next';
import HomeContent from '../home/HomeContent';
import { getDictionary } from '../i18n/dictionaries';
import { Locale } from '../i18n/settings';

interface HomePageProps {
  params: {
    lang: Locale;
  };
}

const Home: NextPage<HomePageProps> = async ({ params }) => {
  // Get the dictionary for the current locale
  const dictionary = await getDictionary(params.lang);

  // Pass the dictionary to your HomeContent component
  return <HomeContent dictionary={dictionary} />;
};

export default Home;