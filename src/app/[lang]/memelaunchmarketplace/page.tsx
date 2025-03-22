import { getDictionary } from '@/app/i18n/dictionaries';
import { Locale } from '@/app/i18n/settings';
import MemeLaunchPage from '../memelaunch/page';
import { MemeLaunchPageProps } from '../memelaunch/page';

interface MemeLaunchPageServerProps {
  params: {
    lang: Locale;
  };
}

const MemeLaunchPageServer = async ({ params }: MemeLaunchPageServerProps) => {
  const dictionary = await getDictionary(params.lang);
  const typedDictionary = dictionary as MemeLaunchPageProps['dictionary'];
  return <MemeLaunchPage dictionary={typedDictionary} />;
};

export default MemeLaunchPageServer;