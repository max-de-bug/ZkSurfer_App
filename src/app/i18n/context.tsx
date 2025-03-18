// src/app/i18n/context.tsx
'use client';

import React, { createContext, useContext } from 'react';
import { Dictionary } from './types';

const DictionaryContext = createContext<Dictionary | null>(null);

export const DictionaryProvider: React.FC<{
    children: React.ReactNode;
    dictionary: Dictionary;
}> = ({ children, dictionary }) => {
    return (
        <DictionaryContext.Provider value={dictionary} >
            {children}
        </DictionaryContext.Provider>
    );
};

export const useDictionary = () => {
    const dictionary = useContext(DictionaryContext);
    if (!dictionary) {
        throw new Error('useDictionary must be used within a DictionaryProvider');
    }
    return dictionary;
};