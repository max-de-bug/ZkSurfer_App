import { TransakUser } from '@/hooks/useTransak';

export interface UserDataInput {
    firstName?: string;
    lastName?: string;
    email?: string;
    mobileNumber?: string;
    dob?: string; // Format: YYYY-MM-DD
    address?: {
        addressLine1?: string;
        addressLine2?: string;
        city?: string;
        state?: string;
        postCode?: string;
        countryCode?: string; // ISO 3166-1 alpha-2 country code
    };
}

export const createTransakUserData = (input: UserDataInput): TransakUser | undefined => {
    // Return undefined if critical fields are missing - let Transak handle KYC
    if (!input.firstName || !input.lastName || !input.email) {
        return undefined;
    }

    // Build the complete TransakUser object with all required fields
    const userData: TransakUser = {
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        mobileNumber: input.mobileNumber || '', // Provide empty string if not provided
        dob: input.dob || '', // Provide empty string if not provided
        address: {
            addressLine1: input.address?.addressLine1 || '',
            addressLine2: input.address?.addressLine2 || '',
            city: input.address?.city || '',
            state: input.address?.state || '',
            postCode: input.address?.postCode || '',
            countryCode: input.address?.countryCode || '', // Empty string for unknown
        },
    };

    return userData;
};

// Helper function to validate if user data is complete enough for Transak
export const isUserDataComplete = (input: UserDataInput): boolean => {
    return !!(input.firstName && input.lastName && input.email);
};

// Helper function to create minimal user data
export const createMinimalUserData = (
    firstName: string,
    lastName: string,
    email: string
): TransakUser => {
    return {
        firstName,
        lastName,
        email,
        mobileNumber: '',
        dob: '',
        address: {
            addressLine1: '',
            addressLine2: '',
            city: '',
            state: '',
            postCode: '',
            countryCode: '',
        },
    };
};