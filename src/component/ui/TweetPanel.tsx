// import React, { useState, useEffect } from 'react';
// import { Card } from '@/components/ui/card';
// import { Check } from 'lucide-react';

// interface Tweet {
//     tweet: string;
//     tweet_img?: string | null;
// }

// interface TweetPanelProps {
//     tweets: Tweet[];
//     wallet: string | undefined;
//     ticker: string | null;
//     generatedTweet: Tweet[];
//     onClose: () => void;
// }

// const TweetPanel: React.FC<TweetPanelProps> = ({ tweets, wallet, ticker, generatedTweet, onClose }) => {
//     const [selectedTweets, setSelectedTweets] = useState<number[]>([]);
//     const [selectedGeneratedTweets, setSelectedGeneratedTweets] = useState<number[]>([]);
//     const [editedTweets, setEditedTweets] = useState<Record<number, string>>({});
//     const [generatedTweets, setTweets] = useState<Tweet[]>(generatedTweet);
//     const [isLoading, setIsLoading] = useState(false);
//     const [error, setError] = useState<string | null>(null);

//     useEffect(() => {
//         const fetchTweets = async () => {
//             if (!ticker) return;

//             setIsLoading(true);
//             setError(null);

//             try {
//                 const response = await fetch(`https://zynapse.zkagi.ai/contentengine_gettweets/${ticker}`, {
//                     headers: {
//                         'Accept': '/',
//                         'User-Agent': 'Thunder Client (https://www.thunderclient.com)',
//                         'api-key': 'zk-123321'
//                     }
//                 });

//                 if (!response.ok) {
//                     throw new Error('Failed to fetch tweets');
//                 }

//                 const data = await response.json();
//                 setTweets(prevTweets => [
//                     ...prevTweets,
//                     ...(Array.isArray(data.tweets) ? data.tweets.map((tweet: { tweet_text: any; }) => ({ tweet: tweet.tweet_text })) : [])
//                 ]);
//             } catch (err) {
//                 setError(err instanceof Error ? err.message : 'Failed to fetch tweets');
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//         fetchTweets();
//     }, [ticker]);

//     useEffect(() => {
//         const initialEdited: Record<number, string> = {};
//         tweets.forEach((tweet, index) => {
//             if (tweet.tweet) {
//                 initialEdited[index] = tweet.tweet;
//             }
//         });
//         setEditedTweets(initialEdited);
//     }, [tweets]);

//     const handleCheckboxChange = (index: number) => {
//         setSelectedTweets(prev => {
//             if (prev.includes(index)) {
//                 return prev.filter(i => i !== index);
//             }
//             return [...prev, index];
//         });
//     };

//     const handleGeneratedTweetCheckbox = (index: number) => {
//         setSelectedGeneratedTweets(prev => {
//             if (prev.includes(index)) {
//                 return prev.filter(i => i !== index);
//             }
//             return [...prev, index];
//         });
//     };

//     const handleTweetEdit = (index: number, value: string) => {
//         setEditedTweets(prev => ({
//             ...prev,
//             [index]: value
//         }));
//     };

//     const handleSave = async () => {
//         const selectedTweetData = selectedTweets.map(index => ({
//             tweet_text: editedTweets[index],
//             tweet_img: null
//         }));

//         try {
//             const response = await fetch('https://zynapse.zkagi.ai/contentengine_generatedtweet', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'api-key': 'zk-123321'
//                 },
//                 body: JSON.stringify({
//                     wallet_address: wallet,
//                     ticker: ticker,
//                     tweets: selectedTweetData
//                 })
//             });

//             if (response.ok) {
//                 onClose();
//             }
//         } catch (error) {
//             console.error('Error saving tweets:', error);
//         }
//     };

//     const handlePost = async () => {
//         // Implement post functionality here
//         console.log('Posting selected generated tweets:', selectedGeneratedTweets);
//     };

//     return (
//         <Card className="w-80 h-full bg-[#171D3D] text-white p-4 flex flex-col">
//             <div className="flex justify-between items-center mb-4">
//                 <h3 className="text-lg font-bold">Generated Tweets</h3>
//                 <button
//                     onClick={onClose}
//                     className="text-gray-400 hover:text-white"
//                 >
//                     ×
//                 </button>
//             </div>

//             {/* Generated Tweets Section */}
//             <div className="mb-6">
//                 <h4 className="text-md font-semibold mb-2">Saved Posts</h4>
//                 {isLoading ? (
//                     <p>Loading tweets...</p>
//                 ) : (
//                     generatedTweets.map((tweet, index) => (
//                         <div key={index} className="mb-4">
//                             <div className="flex items-start gap-2">
//                                 <div
//                                     className={`w-5 h-5 border rounded cursor-pointer flex items-center justify-center
//                                     ${selectedGeneratedTweets.includes(index) ? 'bg-blue-500 border-blue-500' : 'border-gray-400'}`}
//                                     onClick={() => handleGeneratedTweetCheckbox(index)}
//                                 >
//                                     {selectedGeneratedTweets.includes(index) && <Check size={16} />}
//                                 </div>
//                                 <div className="flex-1">{tweet.tweet}</div>
//                             </div>
//                             {tweet.tweet_img && (
//                                 <img src={tweet.tweet_img} alt="Tweet image" className="mt-2 w-full h-auto rounded" />
//                             )}
//                         </div>
//                     ))
//                 )}
//                 {error && <p className="text-red-500">{error}</p>}
//             </div>

//             {/* Divider */}
//             <div className="border-t border-gray-600 my-4"></div>

//             {/* New Tweets Section */}
//             <h4 className="text-md font-semibold mb-2">Posts to Save</h4>
//             <div className="flex-grow overflow-y-scroll">
//                 {tweets.map((tweet, index) => (
//                     <div key={index} className="mb-4">
//                         <div className="flex items-start gap-2">
//                             <div
//                                 className={`w-5 h-5 border rounded cursor-pointer flex items-center justify-center
//                                 ${selectedTweets.includes(index) ? 'bg-blue-500 border-blue-500' : 'border-gray-400'}`}
//                                 onClick={() => handleCheckboxChange(index)}
//                             >
//                                 {selectedTweets.includes(index) && <Check size={16} />}
//                             </div>
//                             <textarea
//                                 value={editedTweets[index] || ''}
//                                 onChange={(e) => handleTweetEdit(index, e.target.value)}
//                                 className="w-full bg-[#24284E] text-white p-2 rounded resize-none"
//                                 rows={3}
//                             />
//                         </div>
//                     </div>
//                 ))}
//             </div>

//             {/* Action Buttons */}
//             <div className="mt-4 flex gap-2">
//                 <button
//                     onClick={handleSave}
//                     disabled={selectedTweets.length === 0 || selectedGeneratedTweets.length > 0}
//                     className={`w-1/2 py-2 rounded ${selectedTweets.length > 0 && selectedGeneratedTweets.length === 0
//                         ? 'bg-blue-500 hover:bg-blue-600'
//                         : 'bg-gray-500 cursor-not-allowed'
//                         }`}
//                 >
//                     Save
//                 </button>
//                 <button
//                     onClick={handlePost}
//                     disabled={selectedGeneratedTweets.length === 0 || selectedTweets.length > 0}
//                     className={`w-1/2 py-2 rounded ${selectedGeneratedTweets.length > 0 && selectedTweets.length === 0
//                         ? 'bg-green-500 hover:bg-green-600'
//                         : 'bg-gray-500 cursor-not-allowed'
//                         }`}
//                 >
//                     Post
//                 </button>
//             </div>
//         </Card>
//     );
// };

// export default TweetPanel;

// import React, { useState, useEffect } from 'react';
// import { Card } from '@/components/ui/card';
// import { Check } from 'lucide-react';

// interface Tweet {
//     tweet: string;
//     tweet_img?: string | null;
// }

// interface TweetPanelProps {
//     tweets: Tweet[];
//     wallet: string | undefined;
//     ticker: string | null;
//     generatedTweet: Tweet[];
//     onClose: () => void;
// }

// const TweetPanel: React.FC<TweetPanelProps> = ({ tweets, wallet, ticker, generatedTweet, onClose }) => {
//     const [selectedTweets, setSelectedTweets] = useState<number[]>([]);
//     const [selectedGeneratedTweets, setSelectedGeneratedTweets] = useState<number[]>([]);
//     const [editedTweets, setEditedTweets] = useState<Record<number, string>>({});
//     const [generatedTweets, setTweets] = useState<Tweet[]>(generatedTweet);
//     const [isLoading, setIsLoading] = useState(false);
//     const [error, setError] = useState<string | null>(null);
//     const [isPosting, setIsPosting] = useState(false);

//     // Twitter API credentials - should be stored securely and passed as props or env variables
//     const apiKey = 'your_api_key';
//     const apiSecretKey = 'your_api_secret_key';
//     const accessToken = 'your_access_token';
//     const accessTokenSecret = 'your_access_token_secret';

//     useEffect(() => {
//         const fetchTweets = async () => {
//             if (!ticker) return;

//             setIsLoading(true);
//             setError(null);

//             try {
//                 const response = await fetch(`https://zynapse.zkagi.ai/contentengine_gettweets/${ticker}`, {
//                     headers: {
//                         'Accept': '/',
//                         'User-Agent': 'Thunder Client (https://www.thunderclient.com)',
//                         'api-key': 'zk-123321'
//                     }
//                 });

//                 if (!response.ok) {
//                     throw new Error('Failed to fetch tweets');
//                 }

//                 const data = await response.json();
//                 setTweets(prevTweets => [
//                     ...prevTweets,
//                     ...(Array.isArray(data.tweets) ? data.tweets.map((tweet: { tweet_text: any; }) => ({ tweet: tweet.tweet_text })) : [])
//                 ]);
//             } catch (err) {
//                 setError(err instanceof Error ? err.message : 'Failed to fetch tweets');
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//         fetchTweets();
//     }, [ticker]);

//     useEffect(() => {
//         const initialEdited: Record<number, string> = {};
//         tweets.forEach((tweet, index) => {
//             if (tweet.tweet) {
//                 initialEdited[index] = tweet.tweet;
//             }
//         });
//         setEditedTweets(initialEdited);
//     }, [tweets]);

//     const handleCheckboxChange = (index: number) => {
//         setSelectedTweets(prev => {
//             if (prev.includes(index)) {
//                 return prev.filter(i => i !== index);
//             }
//             return [...prev, index];
//         });
//     };

//     const handleGeneratedTweetCheckbox = (index: number) => {
//         setSelectedGeneratedTweets(prev => {
//             if (prev.includes(index)) {
//                 return prev.filter(i => i !== index);
//             }
//             return [...prev, index];
//         });
//     };

//     const handleTweetEdit = (index: number, value: string) => {
//         setEditedTweets(prev => ({
//             ...prev,
//             [index]: value
//         }));
//     };

//     const postTweet = async (text: string) => {
//         const url = 'http://65.20.68.31:4040/tweet/';
//         const data = {
//             api_key: "BGwmxuKTPgFsTocz01bHeuMtP",
//             api_secret_key: "QX2uE79GiP4qKsmoRHh3pWuEtjmsHRoUIpPl6lM14P0sM8vVNE",
//             access_token: "1839623566964432896-PugpWMrS8pMjvortGTGPMZgHYG4xWg",
//             access_token_secret: "jNebhXnL2NMXXdW5nu3QGNnlGAaPgHnRuQ718EI5596tb",
//             text: text
//         };

//         const response = await fetch(url, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(data)
//         });

//         if (!response.ok) {
//             throw new Error(`Error posting tweet: ${response.statusText}`);
//         }

//         const result = await response.json();
//         return result;
//     };

//     const handlePost = async () => {
//         setIsPosting(true);
//         setError(null);

//         try {
//             // Post each selected tweet sequentially
//             for (const index of selectedGeneratedTweets) {
//                 const tweetText = generatedTweets[index].tweet;
//                 await postTweet(tweetText);
//             }

//             // Clear selections after successful posting
//             setSelectedGeneratedTweets([]);

//             // Optional: Show success message
//             alert('Tweets posted successfully!');
//         } catch (err) {
//             setError(err instanceof Error ? err.message : 'Failed to post tweets');
//         } finally {
//             setIsPosting(false);
//         }
//     };

//     const handleSave = async () => {
//         const selectedTweetData = selectedTweets.map(index => ({
//             tweet_text: editedTweets[index],
//             tweet_img: null
//         }));

//         try {
//             const response = await fetch('https://zynapse.zkagi.ai/contentengine_generatedtweet', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'api-key': 'zk-123321'
//                 },
//                 body: JSON.stringify({
//                     wallet_address: wallet,
//                     ticker: ticker,
//                     tweets: selectedTweetData
//                 })
//             });

//             if (response.ok) {
//                 onClose();
//             }
//         } catch (error) {
//             console.error('Error saving tweets:', error);
//         }
//     };

//     return (
//         <Card className="w-80 h-full bg-[#171D3D] text-white p-4 flex flex-col">
//             <div className="flex justify-between items-center mb-4">
//                 <h3 className="text-lg font-bold">Generated Tweets</h3>
//                 <button
//                     onClick={onClose}
//                     className="text-gray-400 hover:text-white"
//                 >
//                     ×
//                 </button>
//             </div>

//             {/* Error display */}
//             {error && (
//                 <div className="mb-4 p-2 bg-red-500 bg-opacity-20 text-red-300 rounded">
//                     {error}
//                 </div>
//             )}

//             {/* Generated Tweets Section */}
//             <div className="mb-6">
//                 <h4 className="text-md font-semibold mb-2">Saved Posts</h4>
//                 {isLoading ? (
//                     <p>Loading tweets...</p>
//                 ) : (
//                     generatedTweets.map((tweet, index) => (
//                         <div key={index} className="mb-4">
//                             <div className="flex items-start gap-2">
//                                 <div
//                                     className={`w-5 h-5 border rounded cursor-pointer flex items-center justify-center
//                                     ${selectedGeneratedTweets.includes(index) ? 'bg-blue-500 border-blue-500' : 'border-gray-400'}`}
//                                     onClick={() => handleGeneratedTweetCheckbox(index)}
//                                 >
//                                     {selectedGeneratedTweets.includes(index) && <Check size={16} />}
//                                 </div>
//                                 <div className="flex-1">{tweet.tweet}</div>
//                             </div>
//                             {tweet.tweet_img && (
//                                 <img src={tweet.tweet_img} alt="Tweet image" className="mt-2 w-full h-auto rounded" />
//                             )}
//                         </div>
//                     ))
//                 )}
//             </div>

//             {/* Divider */}
//             <div className="border-t border-gray-600 my-4"></div>

//             {/* New Tweets Section */}
//             <h4 className="text-md font-semibold mb-2">Posts to Save</h4>
//             <div className="flex-grow overflow-y-auto">
//                 {tweets.map((tweet, index) => (
//                     <div key={index} className="mb-4">
//                         <div className="flex items-start gap-2">
//                             <div
//                                 className={`w-5 h-5 border rounded cursor-pointer flex items-center justify-center
//                                 ${selectedTweets.includes(index) ? 'bg-blue-500 border-blue-500' : 'border-gray-400'}`}
//                                 onClick={() => handleCheckboxChange(index)}
//                             >
//                                 {selectedTweets.includes(index) && <Check size={16} />}
//                             </div>
//                             <textarea
//                                 value={editedTweets[index] || ''}
//                                 onChange={(e) => handleTweetEdit(index, e.target.value)}
//                                 className="w-full bg-[#24284E] text-white p-2 rounded resize-none"
//                                 rows={3}
//                             />
//                         </div>
//                     </div>
//                 ))}
//             </div>

//             {/* Action Buttons */}
//             <div className="mt-4 flex gap-2">
//                 <button
//                     onClick={handleSave}
//                     disabled={selectedTweets.length === 0 || selectedGeneratedTweets.length > 0}
//                     className={`w-1/2 py-2 rounded ${selectedTweets.length > 0 && selectedGeneratedTweets.length === 0
//                         ? 'bg-blue-500 hover:bg-blue-600'
//                         : 'bg-gray-500 cursor-not-allowed'
//                         }`}
//                 >
//                     Save
//                 </button>
//                 <button
//                     onClick={handlePost}
//                     disabled={selectedGeneratedTweets.length === 0 || selectedTweets.length > 0 || isPosting}
//                     className={`w-1/2 py-2 rounded ${selectedGeneratedTweets.length > 0 && selectedTweets.length === 0 && !isPosting
//                         ? 'bg-green-500 hover:bg-green-600'
//                         : 'bg-gray-500 cursor-not-allowed'
//                         }`}
//                 >
//                     {isPosting ? 'Posting...' : 'Post'}
//                 </button>
//             </div>
//         </Card>
//     );
// };

// export default TweetPanel;

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Check } from 'lucide-react';

interface Tweet {
    tweet: string;
    tweet_img?: string | null;
}

interface TweetPanelProps {
    tweets: Tweet[];
    wallet: string | undefined;
    ticker: string | null;
    generatedTweet: Tweet[];
    onClose: () => void;
}

const TweetPanel: React.FC<TweetPanelProps> = ({ tweets, wallet, ticker, generatedTweet, onClose }) => {
    const [selectedTweets, setSelectedTweets] = useState<number[]>([]);
    const [selectedGeneratedTweets, setSelectedGeneratedTweets] = useState<number[]>([]);
    const [editedTweets, setEditedTweets] = useState<Record<number, string>>({});
    const [generatedTweets, setTweets] = useState<Tweet[]>(generatedTweet);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPosting, setIsPosting] = useState(false);

    // Twitter API credentials
    const apiKey = 'BGwmxuKTPgFsTocz01bHeuMtP';
    const apiSecretKey = 'QX2uE79GiP4qKsmoRHh3pWuEtjmsHRoUIpPl6lM14P0sM8vVNE';
    const accessToken = '1839623566964432896-PugpWMrS8pMjvortGTGPMZgHYG4xWg';
    const accessTokenSecret = 'jNebhXnL2NMXXdW5nu3QGNnlGAaPgHnRuQ718EI5596tb';

    const postTweet = async (text: string) => {
        const url = `http://65.20.68.31:4040/tweet/?api_key=${apiKey}&api_secret_key=${apiSecretKey}&access_token=${accessToken}&access_token_secret=${accessTokenSecret}&text=${encodeURIComponent(text)}`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Error posting tweet: ${response.statusText}`);
            }

            const result = await response.json();
            console.log(result.message);
            return result;
        } catch (error) {
            console.error('Error posting tweet:', error);
            throw error;
        }
    };

    useEffect(() => {
        const fetchTweets = async () => {
            if (!ticker) return;

            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch(`https://zynapse.zkagi.ai/contentengine_gettweets/${ticker}`, {
                    headers: {
                        'Accept': '/',
                        'User-Agent': 'Thunder Client (https://www.thunderclient.com)',
                        'api-key': 'zk-123321'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch tweets');
                }

                const data = await response.json();
                setTweets(prevTweets => [
                    ...prevTweets,
                    ...(Array.isArray(data.tweets) ? data.tweets.map((tweet: { tweet_text: any; }) => ({ tweet: tweet.tweet_text })) : [])
                ]);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch tweets');
            } finally {
                setIsLoading(false);
            }
        };

        fetchTweets();
    }, [ticker]);

    useEffect(() => {
        const initialEdited: Record<number, string> = {};
        tweets.forEach((tweet, index) => {
            if (tweet.tweet) {
                initialEdited[index] = tweet.tweet;
            }
        });
        setEditedTweets(initialEdited);
    }, [tweets]);

    const handleCheckboxChange = (index: number) => {
        setSelectedTweets(prev => {
            if (prev.includes(index)) {
                return prev.filter(i => i !== index);
            }
            return [...prev, index];
        });
    };

    const handleGeneratedTweetCheckbox = (index: number) => {
        setSelectedGeneratedTweets(prev => {
            if (prev.includes(index)) {
                return prev.filter(i => i !== index);
            }
            return [...prev, index];
        });
    };

    const handleTweetEdit = (index: number, value: string) => {
        setEditedTweets(prev => ({
            ...prev,
            [index]: value
        }));
    };

    const handlePost = async () => {
        setIsPosting(true);
        setError(null);

        try {
            // Post each selected tweet sequentially
            for (const index of selectedGeneratedTweets) {
                const tweetText = generatedTweets[index].tweet;
                await postTweet(tweetText);
            }

            // Clear selections after successful posting
            setSelectedGeneratedTweets([]);

            // Show success message
            alert('Tweets posted successfully!');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to post tweets');
        } finally {
            setIsPosting(false);
        }
    };

    const handleSave = async () => {
        const selectedTweetData = selectedTweets.map(index => ({
            tweet_text: editedTweets[index],
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
                onClose();
            }
        } catch (error) {
            console.error('Error saving tweets:', error);
        }
    };

    return (
        <Card className="w-80 h-full bg-[#171D3D] text-white p-4 flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Generated Tweets</h3>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white"
                >
                    ×
                </button>
            </div>

            {/* Error display */}
            {error && (
                <div className="mb-4 p-2 bg-red-500 bg-opacity-20 text-red-300 rounded">
                    {error}
                </div>
            )}

            {/* Generated Tweets Section */}
            <div className="mb-6">
                <h4 className="text-md font-semibold mb-2">Saved Posts</h4>
                {isLoading ? (
                    <p>Loading tweets...</p>
                ) : (
                    generatedTweets.map((tweet, index) => (
                        <div key={index} className="mb-4">
                            <div className="flex items-start gap-2">
                                <div
                                    className={`w-5 h-5 border rounded cursor-pointer flex items-center justify-center
                                    ${selectedGeneratedTweets.includes(index) ? 'bg-blue-500 border-blue-500' : 'border-gray-400'}`}
                                    onClick={() => handleGeneratedTweetCheckbox(index)}
                                >
                                    {selectedGeneratedTweets.includes(index) && <Check size={16} />}
                                </div>
                                <div className="flex-1">{tweet.tweet}</div>
                            </div>
                            {tweet.tweet_img && (
                                <img src={tweet.tweet_img} alt="Tweet image" className="mt-2 w-full h-auto rounded" />
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-600 my-4"></div>

            {/* New Tweets Section */}
            <h4 className="text-md font-semibold mb-2">Posts to Save</h4>
            <div className="flex-grow overflow-y-auto">
                {tweets.map((tweet, index) => (
                    <div key={index} className="mb-4">
                        <div className="flex items-start gap-2">
                            <div
                                className={`w-5 h-5 border rounded cursor-pointer flex items-center justify-center
                                ${selectedTweets.includes(index) ? 'bg-blue-500 border-blue-500' : 'border-gray-400'}`}
                                onClick={() => handleCheckboxChange(index)}
                            >
                                {selectedTweets.includes(index) && <Check size={16} />}
                            </div>
                            <textarea
                                value={editedTweets[index] || ''}
                                onChange={(e) => handleTweetEdit(index, e.target.value)}
                                className="w-full bg-[#24284E] text-white p-2 rounded resize-none"
                                rows={3}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex gap-2">
                <button
                    onClick={handleSave}
                    disabled={selectedTweets.length === 0 || selectedGeneratedTweets.length > 0}
                    className={`w-1/2 py-2 rounded ${selectedTweets.length > 0 && selectedGeneratedTweets.length === 0
                            ? 'bg-blue-500 hover:bg-blue-600'
                            : 'bg-gray-500 cursor-not-allowed'
                        }`}
                >
                    Save
                </button>
                <button
                    onClick={handlePost}
                    disabled={selectedGeneratedTweets.length === 0 || selectedTweets.length > 0 || isPosting}
                    className={`w-1/2 py-2 rounded ${selectedGeneratedTweets.length > 0 && selectedTweets.length === 0 && !isPosting
                            ? 'bg-green-500 hover:bg-green-600'
                            : 'bg-gray-500 cursor-not-allowed'
                        }`}
                >
                    {isPosting ? 'Posting...' : 'Post'}
                </button>
            </div>
        </Card>
    );
};

export default TweetPanel;