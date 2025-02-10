'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
// Solana web3 dependencies
import {
    Transaction,
    SystemProgram,
    PublicKey,
    LAMPORTS_PER_SOL,
    Connection,
    clusterApiUrl,
} from '@solana/web3.js';
import ButtonV1Sale from "@/component/ui/buttonV1Sale";

import { useRouter } from 'next/navigation';


// Reusable style for the container “cut out” look.
const outerContainerStyle = {
    clipPath:
        "polygon(0% 0%, calc(100% - 15px) 0%, 100% 15px, 100% 100%, 15px 100%, 0% calc(100% - 15px), 0% 100%, 0% 0%)",
};

interface PreSalePageProps {
    initialRaised?: number; // amount raised so far in Stage 1
}

const Countdown: React.FC = () => {
    const [timeLeft, setTimeLeft] = useState(48 * 60 * 60);
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const days = Math.floor(timeLeft / (3600 * 24));
    const hours = Math.floor((timeLeft % (3600 * 24)) / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;

    // Use an array to simplify mapping over each time unit.
    const labels = ['Days', 'Hours', 'Mins', 'Secs'];
    const values = [days, hours, minutes, seconds];

    return (
        <div className="flex space-x-2 md:space-x-4">
            {labels.map((label, idx) => (
                <div
                    key={label}
                    className="flex flex-col items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-black rounded-md border border-[#A992ED]"
                    style={{
                        clipPath:
                            "polygon(0% 0%, calc(100% - 15px) 0%, 100% 15px, 100% 100%, 15px 100%, 0% calc(100% - 15px), 0% 100%, 0% 0%)",
                        background: "#A992ED",
                    }}
                >
                    <div
                        className="w-full h-full rounded-md bg-[#000] flex flex-col items-center justify-center"
                        style={outerContainerStyle}
                    >
                        <span className="text-[0.6rem] md:text-xs uppercase tracking-widest font-thin">
                            {label}
                        </span>
                        <span className="font-bold text-sm md:text-xl text-[#643ADE]">
                            {values[idx]}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};

const PreSalePage: React.FC<PreSalePageProps> = ({ initialRaised = 0 }) => {
    // STATE for new investment
    const [solAmount, setSolAmount] = useState('');
    const [tokens, setTokens] = useState('0');

    // STATE for investment details (if already invested)
    const [alreadyInvested, setAlreadyInvested] = useState(false);
    const [investmentDetails, setInvestmentDetails] = useState<any>(null);

    // STATE for additional purchase ("Buy More")
    const [isBuyMore, setIsBuyMore] = useState(false);
    const [additionalSolAmount, setAdditionalSolAmount] = useState('');
    const [additionalTokens, setAdditionalTokens] = useState('0');

    // Transaction status
    const [status, setStatus] = useState('');

    // Overall stage info
    const [stageOneRaised, setStageOneRaised] = useState(initialRaised);
    const priceStageOne = 0.005; // Stage 1 price
    const priceStageTwo = 0.0075; // Stage 2 price

    const [refreshTrigger, setRefreshTrigger] = useState(0)

    // ------------------------------ Investment Check ------------------------------

    useEffect(() => {
        async function checkInvestment() {
            if (window.solana && window.solana.isPhantom) {
                const walletAddress = window.solana.publicKey?.toString();
                if (!walletAddress) return;
                try {
                    const checkResponse = await fetch("/api/check-investment", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ wallet: walletAddress }),
                    });

                    const investData = await checkResponse.json();
                    if (investData.alreadyInvested) {
                        setStatus('You have already invested.');
                        setAlreadyInvested(true);
                        const headersList = {
                            Accept: '/',
                            'User-Agent': 'Thunder Client (https://www.thunderclient.com)',
                            'Content-Type': 'application/json',
                        };
                        const bodyContent = JSON.stringify({ wallet: walletAddress });
                        const getInvResponse = await fetch("/api/get-investment", {
                            method: 'POST',
                            headers: headersList,
                            body: bodyContent,
                        });
                        const invData = await getInvResponse.json();
                        console.log('Investment details:', invData);
                        setInvestmentDetails(invData);
                    }
                } catch (error) {
                    console.error('Error checking investment:', error);
                }
            }
        }
        checkInvestment();
    }, [refreshTrigger]);



    const router = useRouter();

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            // Standard way to prompt the user, though the exact message is ignored by modern browsers
            e.preventDefault();
            e.returnValue = ''; // This triggers the confirmation dialog
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            // Check for F5 or Ctrl+R (both lowercase 'r' and uppercase 'R')
            if (e.key === 'F5' || ((e.key === 'r' || e.key === 'R') && e.ctrlKey)) {
                e.preventDefault();
                toast.error('Page refresh is disabled on this page.');
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);


    // ------------------------------ Fetch Stage Info ------------------------------
    useEffect(() => {
        async function fetchTotalUsdAmount() {
            const headersList = {
                Accept: '/',
                'User-Agent': 'Thunder Client (https://www.thunderclient.com)',
            };
            try {
                const response = await fetch('/api/total-usd-amount', {
                    method: 'GET',
                    headers: headersList,
                });
                const textData = await response.text();
                console.log('Fetched total USD amount:', textData);
                const totalUsd = parseFloat(textData);
                if (!isNaN(totalUsd)) {
                    setStageOneRaised(totalUsd);
                }
            } catch (error) {
                console.error('Error fetching total USD amount:', error);
            }
        }
        fetchTotalUsdAmount();
    }, []);

    // ------------------------------ Stage Logic ------------------------------
    const stageOneLive = stageOneRaised < 25000;
    const stageOneBadge = stageOneLive ? 'LIVE' : 'CLOSED';

    // ------------------------------ NEW INVESTMENT Handlers ------------------------------
    const handleSolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === '') {
            setSolAmount('');
            setTokens('0');
            return;
        }
        const numberValue = parseFloat(value);
        if (numberValue < 1) {
            toast.error('Minimum investment amount is 1 SOL');
            setSolAmount('1');
        } else if (numberValue > 10) {
            toast.error('Maximum investment amount allowed is 10 SOL');
            setSolAmount('10');
        } else {
            setSolAmount(value);
        }
    };

    useEffect(() => {
        const investAmount = parseFloat(solAmount);
        if (!isNaN(investAmount) && investAmount >= 1 && investAmount <= 10) {
            async function fetchSolPriceAndCalculateTokens() {
                try {
                    const solPriceResponse = await fetch('/api/sol-price');
                    const solPriceData = await solPriceResponse.json();
                    const usdAmount = investAmount * solPriceData.usdc;
                    const currentPrice = stageOneLive ? priceStageOne : priceStageTwo;
                    const computedTokens = usdAmount / currentPrice;
                    setTokens(computedTokens.toFixed(2));
                } catch (err) {
                    console.error('Error fetching SOL price:', err);
                }
            }
            fetchSolPriceAndCalculateTokens();
        } else {
            setTokens('0');
        }
    }, [solAmount, stageOneLive]);

    // ------------------------------ ADDITIONAL INVESTMENT Handlers ------------------------------
    const handleAdditionalSolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === '') {
            setAdditionalSolAmount('');
            setAdditionalTokens('0');
            return;
        }
        const numberValue = parseFloat(value);
        const alreadyInvestedAmount = investmentDetails ? parseFloat(investmentDetails.amount) : 0;
        const maxAdditional = 10 - alreadyInvestedAmount;
        if (numberValue < 1) {
            toast.error('Minimum additional investment is 1 SOL');
            setAdditionalSolAmount('1');
        } else if (numberValue > maxAdditional) {
            toast.error(`Cannot exceed ${maxAdditional} SOL additional`);
            setAdditionalSolAmount(maxAdditional.toString());
        } else {
            setAdditionalSolAmount(value);
        }
    };

    useEffect(() => {
        const addAmount = parseFloat(additionalSolAmount);
        if (!isNaN(addAmount) && addAmount >= 1 && investmentDetails) {
            async function fetchSolPriceForAdditional() {
                try {
                    const solPriceResponse = await fetch('/api/sol-price');
                    const solPriceData = await solPriceResponse.json();
                    const usdAdditional = addAmount * solPriceData.usdc;
                    const currentPrice = stageOneLive ? priceStageOne : priceStageTwo;
                    const computedAdditionalTokens = usdAdditional / currentPrice;
                    setAdditionalTokens(computedAdditionalTokens.toFixed(2));
                } catch (err) {
                    console.error('Error fetching SOL price for additional purchase:', err);
                }
            }
            fetchSolPriceForAdditional();
        } else {
            setAdditionalTokens('0');
        }
    }, [additionalSolAmount, stageOneLive, investmentDetails]);

    const handleBuy = async () => {
        const investAmount = parseFloat(solAmount);
        if (isNaN(investAmount) || investAmount < 1 || investAmount > 10) {
            toast.error('Invalid investment amount');
            return;
        }
        let usdAmount;
        try {
            const solPriceResponse = await fetch('/api/sol-price');
            const solPriceData = await solPriceResponse.json();
            usdAmount = investAmount * solPriceData.usdc;
        } catch (err) {
            console.error('Error fetching SOL price:', err);
            toast.error('Failed to fetch SOL price');
            return;
        }
        const currentPrice = stageOneLive ? priceStageOne : priceStageTwo;
        const computedTokens = usdAmount / currentPrice;
        if (!window.solana || !window.solana.isPhantom) {
            toast.error('Phantom wallet not found');
            return;
        }
        const wallet = window.solana.publicKey.toString();
        const connection = new Connection(clusterApiUrl('devnet'), 'confirmed'); //devnet for testing
        const treasuryAddress = process.env.NEXT_PUBLIC_TREASURY;
        if (!treasuryAddress) {
            throw new Error("Environment variable NEXT_PUBLIC_TREASURY is not defined.");
        }
        const treasuryPublicKey = new PublicKey(treasuryAddress);
        try {
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: new PublicKey(wallet),
                    toPubkey: treasuryPublicKey,
                    lamports: investAmount * LAMPORTS_PER_SOL,
                })
            );
            transaction.feePayer = new PublicKey(wallet);
            const { blockhash } = await connection.getRecentBlockhash();
            transaction.recentBlockhash = blockhash;
            const signedTransaction = await window.solana.signTransaction(transaction);
            const signature = await connection.sendRawTransaction(signedTransaction.serialize());
            setStatus(`Transaction sent: ${signature}. Waiting for confirmation...`);
            await connection.confirmTransaction(signature, 'confirmed');
            setStatus(`Transaction confirmed! Signature: ${signature}`);

            // Call update-investment API.
            const updateResponse = await fetch('/api/update-investment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    wallet: wallet,
                    amount: investAmount,
                    usd_amount: usdAmount,
                    timestamp: Date.now(),
                    txSignature: signature,
                    zkagi_token: computedTokens,
                }),
            });
            const updateResult = await updateResponse.json();
            console.log('Update investment response:', updateResult);

            // Check if update was successful.
            if (updateResult && updateResult.success === true) {
                toast.success('Investment successfully registered!');
                setRefreshTrigger((prev) => prev + 1)

                // Now call the /api/get-investment endpoint to get updated details.
                const headersList = {
                    Accept: '/',
                    'Content-Type': 'application/json',
                };
                const bodyContent = JSON.stringify({ wallet: wallet });
                const getInvResponse = await fetch("/api/get-investment", {
                    method: 'POST',
                    headers: headersList,
                    body: bodyContent,
                });
                const invData = await getInvResponse.json();
                console.log('Fetched investment details:', invData);
                setInvestmentDetails(invData);
                setAlreadyInvested(true);
            } else {
                toast.error('Failed to register investment');
            }
        } catch (err) {
            console.error('Error during transaction', err);
            toast.error('Transaction failed');
        }
    };


    const handleBuyMore = async () => {
        const addInvestAmount = parseFloat(additionalSolAmount);
        if (isNaN(addInvestAmount) || addInvestAmount < 1) {
            toast.error('Invalid additional investment amount');
            return;
        }
        const alreadyInvestedAmount = investmentDetails ? parseFloat(investmentDetails.amount) : 0;
        const maxAdditional = 10 - alreadyInvestedAmount;
        if (addInvestAmount > maxAdditional) {
            toast.error(`Cannot exceed ${maxAdditional} SOL additional`);
            return;
        }
        let usdAdditional;
        try {
            const solPriceResponse = await fetch('/api/sol-price');
            const solPriceData = await solPriceResponse.json();
            usdAdditional = addInvestAmount * solPriceData.usdc;
        } catch (err) {
            console.error('Error fetching SOL price:', err);
            toast.error('Failed to fetch SOL price');
            return;
        }
        const currentPrice = stageOneLive ? priceStageOne : priceStageTwo;
        const additionalComputedTokens = usdAdditional / currentPrice;
        if (!window.solana || !window.solana.isPhantom) {
            toast.error('Phantom wallet not found');
            return;
        }
        const wallet = window.solana.publicKey.toString();
        const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
        const treasuryAddress = 'FXu1nzsLMgJhYYhCaTxPc96Aawenp5vLe8jMYDubYfA7';
        const treasuryPublicKey = new PublicKey(treasuryAddress);
        try {
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: new PublicKey(wallet),
                    toPubkey: treasuryPublicKey,
                    lamports: addInvestAmount * LAMPORTS_PER_SOL,
                })
            );
            transaction.feePayer = new PublicKey(wallet);
            const { blockhash } = await connection.getRecentBlockhash();
            transaction.recentBlockhash = blockhash;
            const signedTransaction = await window.solana.signTransaction(transaction);
            const signature = await connection.sendRawTransaction(signedTransaction.serialize());
            setStatus(`Transaction sent: ${signature}. Waiting for confirmation...`);
            await connection.confirmTransaction(signature, 'confirmed');
            setStatus(`Transaction confirmed! Signature: ${signature}`);
            const updateResponse = await fetch('/api/update-investment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    wallet: wallet,
                    amount: addInvestAmount,
                    usd_amount: usdAdditional,
                    timestamp: Date.now(),
                    txSignature: signature,
                    zkagi_token: additionalComputedTokens,
                }),
            });
            const updateResult = await updateResponse.json();
            console.log('Update additional investment response:', updateResult);
            toast.success('Additional investment successfully updated!');
            // Update investment details locally.
            const newInvestedAmount = alreadyInvestedAmount + addInvestAmount;
            const newUsdAmount = parseFloat(investmentDetails.usd_amount) + usdAdditional;
            const newZkagiToken = parseFloat(investmentDetails.zkagi_token) + additionalComputedTokens;
            setInvestmentDetails({
                ...investmentDetails,
                amount: newInvestedAmount.toString(),
                usd_amount: newUsdAmount.toFixed(2),
                zkagi_token: newZkagiToken.toFixed(2),
            });
            setAdditionalSolAmount('');
            setAdditionalTokens('0');
            setIsBuyMore(false);
        } catch (err) {
            console.error('Error during additional transaction', err);
            toast.error('Additional transaction failed');
        }
    };

    // ------------------------------ RENDERING ------------------------------
    return (
        <div className="bg-gradient-to-br from-[#000D33] via-[#24284E] to-[#643ADE] text-white p-4 sm:px-8 md:px-12 lg:px-20">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center">
                    <Image src="/images/tiger.svg" alt="logo" width={30} height={30} />
                    <div className="font-ttfirs text-xl pl-2">ZkTerminal</div>
                </div>
                {/* Uncomment below if you want a wallet button */}
                {/* <CustomWalletButton /> */}
            </div>

            {/* Main Content */}
            <div className="flex flex-col md:flex-row items-center justify-center min-h-screen">
                {/* Left Side */}
                <div className="w-full md:w-1/2 p-4 md:p-8">
                    <div className="text-3xl md:text-5xl font-bold mb-3">
                        Zkagi Token Pre-Sale is{' '}
                        <span className="text-[8rem] md:text-[15rem] text-[#643ADE] text-9xl"> LIVE</span>
                    </div>
                    <div className="text-sm md:text-base mb-6">
                        {alreadyInvested ? (
                            <p className="text-lg text-[#A0AEC0]">
                                Congratulations, you&apos;ve already invested in the first round!
                            </p>
                        ) : (
                            <>
                                <p className="text-[#A0AEC0]">
                                    Join the next big revolution in web3. Be among the first to acquire $ZKAGI at
                                    exclusive early-bird prices! Only 48 hours remain in our pre-sale —
                                </p>
                                <p className="text-3xl mt-5 font-semibold text-white">
                                    Secure your spot now!
                                </p>
                            </>
                        )}
                    </div>
                    {alreadyInvested && isBuyMore && (
                        <p className="mb-4">
                            You have already invested {investmentDetails?.amount || 0} SOL. Please enter additional
                            SOL (maximum additional:{' '}
                            {investmentDetails
                                ? (10 - parseFloat(investmentDetails.amount)).toFixed(2)
                                : '10'}
                            ).
                        </p>
                    )}
                </div>

                {/* Right Side */}
                <div className="w-full md:w-1/2 p-4 md:p-8">
                    <div
                        className="transition-all ease-out duration-250 group w-full overflow-hidden text-white m-1"
                        style={outerContainerStyle}
                    >
                        <div
                            className="transition-all ease-out duration-250 w-full overflow-hidden bg-gradient-to-br from-[#c4c4c4] via-[#643ADE] to-[#c4c4c4] group-active:brightness-90"
                            style={outerContainerStyle}
                        >
                            <div className="bg-[#0f132c] m-0.5" style={outerContainerStyle}>
                                <div className="transition-all ease-out duration-250 p-4 sm:p-5 md:px-7 md:py-5 text-xs lg:text-base text-center">
                                    {alreadyInvested && !isBuyMore ? (
                                        // Investment details view with "Buy More" button
                                        <div className="w-full">
                                            <h2 className="text-2xl font-bold mb-4">Your Investment Details</h2>
                                            {investmentDetails ? (
                                                <div className="space-y-2 mb-5">
                                                    <p>
                                                        <span className="font-semibold">Amount (SOL):</span>{' '}
                                                        {investmentDetails.amount}
                                                    </p>
                                                    <p>
                                                        <span className="font-semibold">USD Amount:</span> $
                                                        {investmentDetails.usd_amount}
                                                    </p>
                                                    <p>
                                                        <span className="font-semibold">$ZKAGI Tokens:</span>{' '}
                                                        {investmentDetails.zkagi_token}
                                                    </p>
                                                </div>
                                            ) : (
                                                <p>Loading your investment details...</p>
                                            )}
                                            {/* {investmentDetails &&
                                                parseFloat(investmentDetails.amount) < 10 && (
                                                    <ButtonV1Sale onClick={() => setIsBuyMore(true)}>
                                                        BUY MORE
                                                    </ButtonV1Sale>
                                                )} */}
                                        </div>
                                    ) : (
                                        // New investment or additional purchase form
                                        <>
                                            {!alreadyInvested && (
                                                <div className="flex flex-col items-center text-center rounded-lg w-full mb-4 space-y-2">
                                                    <div className="bg-gradient-to-r from-[#A4C8FF] via-[#A992ED] to-[#643ADE] bg-clip-text text-transparent font-bold text-2xl font-ttfirs">
                                                        BUY $ZKAGI
                                                    </div>
                                                    <div className="font-ttfirs font-thin">
                                                        1 $ZKAGI = $
                                                        {stageOneLive
                                                            ? priceStageOne.toFixed(3)
                                                            : priceStageTwo.toFixed(3)}
                                                    </div>
                                                    <Countdown />
                                                </div>
                                            )}
                                            {alreadyInvested ? (
                                                // Additional purchase form
                                                <>
                                                    <label className="mb-2 font-semibold">
                                                        Additional Amount in SOL:
                                                    </label>
                                                    <input
                                                        type="number"
                                                        placeholder="Enter additional SOL amount"
                                                        value={additionalSolAmount}
                                                        onChange={handleAdditionalSolChange}
                                                        min="1"
                                                        max={
                                                            investmentDetails
                                                                ? (10 - parseFloat(investmentDetails.amount)).toString()
                                                                : '10'
                                                        }
                                                        className="rounded-md p-2 mb-4 text-black w-full"
                                                    />
                                                    <div className="rounded-md p-2 mb-4 text-black text-center font-extrabold">
                                                        Additional Investment = {additionalTokens} $ZKAGI tokens
                                                    </div>
                                                    <button
                                                        onClick={handleBuyMore}
                                                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-md mt-4 transition-colors w-full"
                                                    >
                                                        Buy $ZKAGI
                                                    </button>
                                                </>
                                            ) : (
                                                // New investment form
                                                <>
                                                    <div className="w-full sm:w-3/4 p-1 flex flex-col items-center mx-auto mb-5">
                                                        <div className="flex w-full justify-center gap-2">
                                                            {/* Stage 1 Box */}
                                                            <div
                                                                className="flex flex-col items-center justify-center gap-2 p-2 rounded w-32 h-20"
                                                                style={{
                                                                    clipPath:
                                                                        "polygon(0% 0%, calc(100% - 15px) 0%, 100% 15px, 100% 100%, 15px 100%, 0% calc(100% - 15px), 0% 100%, 0% 0%)",
                                                                    background: "#0f203a",
                                                                }}
                                                            >
                                                                <div className="font-bold text-[#643ADE]">Stage 1:</div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-lg">${priceStageOne.toFixed(3)}</span>
                                                                    <span
                                                                        className={`text-xs px-2 py-1 rounded-full ${stageOneLive ? 'bg-green-600' : 'bg-gray-400'
                                                                            }`}
                                                                    >
                                                                        {stageOneBadge}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            {/* Stage 2 Box */}
                                                            <div
                                                                className="flex flex-col items-center justify-center gap-2 p-2 rounded w-32 h-20"
                                                                style={{
                                                                    clipPath:
                                                                        "polygon(0% 0%, calc(100% - 15px) 0%, 100% 15px, 100% 100%, 15px 100%, 0% calc(100% - 15px), 0% 100%, 0% 0%)",
                                                                    background: "#0f203a",
                                                                }}
                                                            >
                                                                <div className="font-bold text-[#643ADE]">Stage 2:</div>
                                                                <div className="flex items-center gap-2">
                                                                    {stageOneLive ? (
                                                                        <span className="text-xs">NEXT STAGE LOADING...</span>
                                                                    ) : (
                                                                        <>
                                                                            <span className="text-lg">${priceStageTwo.toFixed(4)}</span>
                                                                            <span className="text-xs px-2 py-1 rounded-full bg-green-600">
                                                                                LIVE
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <label className="mb-2 font-ttfirs text-start">Amount in SOL:</label>
                                                        <div className="border p-1 flex items-center justify-center rounded-md mb-4">
                                                            <input
                                                                type="number"
                                                                placeholder="Enter SOL amount"
                                                                value={solAmount}
                                                                onChange={handleSolChange}
                                                                min="1"
                                                                max="10"
                                                                className="w-full rounded-md p-2 text-black"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="rounded-md p-2 mb-4 text-center font-extrabold font-ttfirs">
                                                        Investment Amount = {tokens} $ZKAGI tokens
                                                    </div>
                                                    <ButtonV1Sale onClick={handleBuy}>
                                                        BUY $ZKAGI
                                                    </ButtonV1Sale>
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    {status && (
                        <div className="mt-4 p-2 bg-gray-700 rounded text-center">{status}</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PreSalePage;