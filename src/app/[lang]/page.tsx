// import type { NextPage } from 'next';
// import HomeContent from '../home/HomeContent';
// import { getDictionary } from '../i18n/dictionaries';
// import { Locale } from '../i18n/settings';

// interface HomePageProps {
//   params: {
//     lang: Locale;
//   };
// }

// const Home: NextPage<HomePageProps> = async ({ params }) => {
//   // Get the dictionary for the current locale
//   const dictionary = await getDictionary(params.lang);

//   // Pass the dictionary to your HomeContent component
//   return <HomeContent dictionary={dictionary} />;
// };

// export default Home;


import type { NextPage } from 'next';
import HomeContent, { HomeContentProps } from './home/HomeContent';
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

  // Cast the dictionary to the expected type
  // This assumes that the actual structure is compatible
  const typedDictionary = dictionary as HomeContentProps['dictionary'];

  // Pass the typed dictionary to your HomeContent component
  return <HomeContent dictionary={typedDictionary} />;
};

export default Home;