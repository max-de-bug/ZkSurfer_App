// lib/subscriptionApi.ts

const API_BASE_URL = 'https://zynapse.zkagi.ai/aarc';
const API_KEY = 'zk-123321';

export interface RecordSubscriptionPayload {
    walletAddress: string;
    subscription_type: string;
    createdAt: string;
    relayerTransactionId: string;
    requestId: string;
    depositAddress: string;
    transactionHash: string;
    transactionStatus: string;
}

export interface SubscriptionResponse {
    success: boolean;
    message?: string;
    data?: any;
}

export interface VerificationResponse {
    subscribed: boolean;
    subscription_type?: string;
    expiresAt?: string;
    createdAt?: string;
}

// Record subscription after successful payment
export const recordSubscription = async (payload: RecordSubscriptionPayload): Promise<SubscriptionResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/record_subscription`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': API_KEY,
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to record subscription');
        }

        console.log('✅ Subscription recorded successfully:', data);
        return { success: true, data };
    } catch (error) {
        console.error('❌ Error recording subscription:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};

// Verify user subscription status
export const verifySubscription = async (walletAddress: string): Promise<VerificationResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/verify/${walletAddress}`, {
            headers: {
                'api-key': API_KEY,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to verify subscription');
        }

        console.log('🔍 Subscription verification result:', data);
        return data;
    } catch (error) {
        console.error('❌ Error verifying subscription:', error);
        return { subscribed: false };
    }
};

// Map plan IDs to subscription types
export const getSubscriptionType = (planId: string): string => {
    const planMap: Record<string, string> = {
        'single-day': 'basic',
        'quarterly': 'monthly',
        'yearly': 'yearly',
    };

    return planMap[planId] || 'premium';
};