// import ApiKeysPage from "./ApiKeysPage";

// export default function Home() {
//     return <ApiKeysPage />;
// }


import React from 'react';
import { useDictionary } from '@/app/i18n/context';
import ApiKeysPage from "./ApiKeysPage";

export default function ApiKeyPage() {
    const dictionary = useDictionary();

    return (
        <div>
            <ApiKeysPage dictionary={dictionary} />
        </div>
    );
}
