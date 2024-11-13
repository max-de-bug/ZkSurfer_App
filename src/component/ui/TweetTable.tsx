import React from 'react';

interface Tweet {
    id: number;
    tweet_text: string;
}

interface TweetTableProps {
    tweets: Tweet[];
    ticker: string;
}

const TweetTable: React.FC<TweetTableProps> = ({ tweets, ticker }) => {
    return (
        <div className="w-full max-w-3xl bg-[#171D3D] rounded-lg p-4 shadow-lg">
            <p className="mb-4 text-white font-semibold">Available tweets for {ticker}:</p>
            <table className="w-full border-collapse">
                <thead>
                    <tr className="text-left text-gray-400">
                        <th className="p-2">ID</th>
                        <th className="p-2">Tweet Content</th>
                    </tr>
                </thead>
                <tbody>
                    {tweets.map((tweet, index) => (
                        <tr
                            key={index}
                            className="border-t border-gray-700 hover:bg-[#24284E] cursor-pointer"
                        >
                            <td className="p-2 text-gray-400">{tweet.id}</td>
                            <td className="p-2 text-white">{tweet.tweet_text}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <p className="mt-4 text-gray-400 text-sm">
                Use <code>/tweet [id]</code> to post a single tweet or <code>/tweets [id1,id2,id3]</code> to post multiple tweets.
            </p>
        </div>
    );
};

export default TweetTable;
