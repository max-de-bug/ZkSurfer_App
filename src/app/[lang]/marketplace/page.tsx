import type { NextPage } from 'next';
import MarketplacePage from "./MemeMarketplace";
import { getDictionary } from '@/app/i18n/dictionaries';
import { Locale } from '@/app/i18n/settings';
import { MarketplacePageProps } from './MemeMarketplace';

interface ExplorePageProps {
    params: {
        lang: Locale;
    };
}

const MemeMarketplacePage: NextPage<ExplorePageProps> = async ({ params }) => {
    // Get the dictionary for the current locale
    const dictionary = await getDictionary(params.lang);
    const typedDictionary = dictionary as MarketplacePageProps['dictionary'];

    // Pass the dictionary to your ExploreAgentsPage component
    return <MarketplacePage dictionary={typedDictionary} />;
};

export default MemeMarketplacePage;
