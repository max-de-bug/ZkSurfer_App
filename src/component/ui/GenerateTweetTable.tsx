import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check } from 'lucide-react';

interface Tweet {
    tweet: string;
}

interface GeneratedTweetsTableProps {
    tweets: Tweet[];
    wallet: string;
    ticker: string;
}

const GeneratedTweetsTable: React.FC<GeneratedTweetsTableProps> = ({ tweets, wallet, ticker }) => {
    const [statusMessage, setStatusMessage] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleSaveTweets = async (tweetIds: number[]) => {
        setIsLoading(true);
        setStatusMessage('');

        const selectedTweetData = tweetIds.map(id => ({
            tweet_text: tweets[id - 1].tweet,
            tweet_img: null
        }));

        try {
            const response = await fetch('https://zynapse.zkagi.ai/contentengine_generatedtweet', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': 'zk-123321'
                },
                body: JSON.stringify({
                    wallet_address: wallet,
                    ticker: ticker,
                    tweets: selectedTweetData
                })
            });

            if (response.ok) {
                setStatusMessage(`Successfully saved tweet${tweetIds.length > 1 ? 's' : ''} ${tweetIds.join(', ')}`);
            } else {
                throw new Error('Failed to save tweets');
            }
        } catch (error: any) {
            setStatusMessage('Error saving tweets: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const processCommand = async (command: string) => {
        if (!command.startsWith('/save') && !command.startsWith('/saves')) {
            return;
        }

        const ids = command
            .replace(/^\/saves?/, '')
            .trim()
            .split(',')
            .map(id => parseInt(id.trim(), 10))
            .filter(id => !isNaN(id) && id > 0 && id <= tweets.length);

        if (ids.length === 0) {
            setStatusMessage('Please provide valid tweet ID(s)');
            return;
        }

        await handleSaveTweets(ids);
    };

    return (
        <div className="w-full max-w-4xl p-4 space-y-4">
            {statusMessage && (
                <Alert className={statusMessage.includes('Error') ? 'bg-red-100' : 'bg-green-100'}>
                    <AlertDescription>{statusMessage}</AlertDescription>
                </Alert>
            )}

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-20">ID</TableHead>
                        <TableHead>Generated Tweet</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tweets.map((tweet, index) => (
                        <TableRow key={index} className="hover:bg-gray-50">
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell>{tweet.tweet}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <div className="mt-4 text-sm text-gray-600">
                <p>Commands:</p>
                <ul className="list-disc list-inside">
                    <li>/save [id] - Save a single tweet (e.g., /save 1)</li>
                    <li>/saves [ids] - Save multiple tweets (e.g., /saves 1,3,4)</li>
                </ul>
            </div>

            {isLoading && (
                <div className="flex items-center justify-center py-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                </div>
            )}
        </div>
    );
};

export default GeneratedTweetsTable;
