// import { Connection, Keypair, VersionedTransaction } from '@solana/web3.js';
// import bs58 from 'bs58';

// // Separate TokenCreator function for pump.fun integration
// export const TokenCreator = async ({
//     name,
//     symbol,
//     description,
//     imageBase64,
//     wallet
// }: {
//     name: string;
//     symbol: string;
//     description: string;
//     imageBase64: string;
//     wallet: any;
// }) => {
//     try {
//         // Initialize connection
//         const RPC_ENDPOINT = "https://mainnet.helius-rpc.com/?api-key=c2c41dbf-5595-41fe-8a91-0aa78afba298".trim();

//         try {
//             const web3Connection = new Connection(RPC_ENDPOINT, { commitment: 'confirmed' });
//             console.log("Connected to:", RPC_ENDPOINT);
//             // Continue with token creation logic...
//         } catch (error) {
//             console.error("Connection error:", error);
//             throw error;
//         }

//         const web3Connection = new Connection(RPC_ENDPOINT, 'confirmed');

//         // Generate random keypair for token
//         const mintKeypair = Keypair.generate();

//         // Create form data for metadata
//         const ipfsFormData = new FormData();

//         if (imageBase64) {
//             // Convert base64 to blob
//             const base64Response = await fetch(imageBase64);
//             const imageBlob = await base64Response.blob();
//             ipfsFormData.append("file", imageBlob);
//         }

//         ipfsFormData.append("name", name);
//         ipfsFormData.append("symbol", symbol);
//         ipfsFormData.append("description", description);
//         ipfsFormData.append("showName", "true");

//         console.log('Uploading metadata to IPFS...');
//         // const metadataResponse = await fetch("https://pump.fun/api/ipfs", {
//         //     method: "POST",
//         //     body: ipfsFormData,
//         // });
//         const metadataResponse = await fetch("https://pump.fun/api/ipfs", {
//             method: "POST",
//             body: ipfsFormData,
//             mode: "no-cors",
//         });

//         console.log('metadataResponse', metadataResponse)


//         if (!metadataResponse.ok) {
//             throw new Error('Failed to upload metadata to IPFS');
//         }

//         const metadataResponseJSON = await metadataResponse.json();
//         console.log('IPFS Response:', metadataResponseJSON);

//         // Get the create transaction from pump.fun
//         const pumpResponse = await fetch(`https://pumpportal.fun/api/trade-local`, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json"
//             },
//             body: JSON.stringify({
//                 publicKey: wallet.publicKey?.toString(),
//                 action: "create",
//                 tokenMetadata: {
//                     name: metadataResponseJSON.metadata.name,
//                     symbol: metadataResponseJSON.metadata.symbol,
//                     uri: metadataResponseJSON.metadataUri
//                 },
//                 mint: mintKeypair.publicKey.toBase58(),
//                 denominatedInSol: "true",
//                 amount: 1,
//                 slippage: 10,
//                 priorityFee: 0.0005,
//                 pool: "pump"
//             })
//         });

//         if (pumpResponse.status === 200) {
//             const data = await pumpResponse.arrayBuffer();
//             const tx = VersionedTransaction.deserialize(new Uint8Array(data));

//             // Sign with mint keypair
//             tx.sign([mintKeypair]);

//             // Sign with wallet
//             if (wallet.signTransaction) {
//                 const signedTx = await wallet.signTransaction(tx);
//                 const signature = await web3Connection.sendTransaction(signedTx);
//                 console.log("Pump.fun Transaction:", signature);
//                 return {
//                     mintAddress: mintKeypair.publicKey.toString(),
//                     signature
//                 };
//             } else {
//                 throw new Error('Wallet does not support signing');
//             }
//         } else {
//             throw new Error(`Failed to create token: ${pumpResponse.statusText}`);
//         }
//     } catch (error) {
//         console.error('Error in TokenCreator:', error);
//         throw error;
//     }
// };

import { Connection, Keypair, VersionedTransaction } from '@solana/web3.js';
import bs58 from 'bs58';

type PinataResponse = {
    metadata: {
        name: string;
        symbol: string;
        description: string;
        image: string;
    };
    metadataUri: string;
};
const uploadToPinata = async (base64Image: string, name: string, symbol: string, description: string) => {

    const pinataApiKey = 'd5e949a5faa656f9b0cb';
    const pinataSecretApiKey = '68fec412fb311cec60dea2f12e97eadb6b9cc227d40796d6038d66800fd89992';
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

    try {
        console.log('base64Image', base64Image)
        const base64ToBlob = (base64: string, contentType: string) => {
            const byteCharacters = atob(base64.split(',')[1]);
            const byteArrays = [];
            for (let i = 0; i < byteCharacters.length; i++) {
                byteArrays.push(byteCharacters.charCodeAt(i));
            }
            return new Blob([new Uint8Array(byteArrays)], { type: contentType });
        };
        const contentType = base64Image.match(/data:(.*?);base64/)?.[1] || 'image/png';
        const blob = base64ToBlob(base64Image, contentType);
        const formData = new FormData();
        formData.append('file', blob, 'image.png');
        const options = {
            method: 'POST',
            headers: {
                'pinata_api_key': pinataApiKey,
                'pinata_secret_api_key': pinataSecretApiKey
            },
            body: formData
        };

        try {
            const result = await fetch(url, options);
            const imageData = await result.json();
            console.log('Pinata image response:', imageData);

            const imageUrl = `https://gateway.pinata.cloud/ipfs/${imageData.IpfsHash}`;
            console.log("imageUrl is ", imageUrl);

            const metadata = {
                "name": name,
                "symbol": symbol,
                "description": description,
                "image": imageUrl

            };

            const metadataUrl = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
            const metadataOptions = {
                method: 'POST',
                headers: {
                    'pinata_api_key': pinataApiKey,
                    'pinata_secret_api_key': pinataSecretApiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(metadata)
            };

            const metadataResult = await fetch(metadataUrl, metadataOptions);
            const metadataData = await metadataResult.json();
            console.log('Pinata metadata response:', metadataData);
            return {
                metadata,
                metadataUri: `https://gateway.pinata.cloud/ipfs/${metadataData.IpfsHash}`,
            };
        }
        catch (error) {
            console.error('Error uploading to Pinata:', error);
        }
    } catch (error) {
        console.error('Error uploading to Pinata:', error);
    }
};
// Separate TokenCreator function for pump.fun integration
export const TokenCreator = async ({
    name,
    symbol,
    description,
    imageBase64,
    wallet
}: {
    name: string;
    symbol: string;
    description: string;
    imageBase64: string;
    wallet: any;
}) => {
    try {
        // Initialize connection
        const RPC_ENDPOINT = "https://mainnet.helius-rpc.com/?api-key=c2c41dbf-5595-41fe-8a91-0aa78afba298".trim();

        try {
            const web3Connection = new Connection(RPC_ENDPOINT, { commitment: 'confirmed' });
            console.log("Connected to:", RPC_ENDPOINT);
            // Continue with token creation logic...
        } catch (error) {
            console.error("Connection error:", error);
            throw error;
        }

        const web3Connection = new Connection(RPC_ENDPOINT, 'confirmed');

        // Generate random keypair for token
        const mintKeypair = Keypair.generate();

        // Create form data for metadata
        const ipfsFormData = new FormData();

        if (imageBase64) {
            // Convert base64 to blob
            const base64Response = await fetch(imageBase64);
            const imageBlob = await base64Response.blob();
            ipfsFormData.append("file", imageBlob);
        }

        ipfsFormData.append("name", name);
        ipfsFormData.append("symbol", symbol);
        ipfsFormData.append("description", description);
        ipfsFormData.append("showName", "true");

        console.log('Uploading metadata to IPFS...');
        // const metadataResponse = await fetch("https://pump.fun/api/ipfs", {
        //     method: "POST",
        //     body: ipfsFormData,
        // });

        const metadataResponseRaw = await uploadToPinata(imageBase64, name, symbol, description);
        const metadataResponse = metadataResponseRaw?.metadata;
        const metadataUri = metadataResponseRaw?.metadataUri;

        console.log('Metadata Response:', metadataResponse);

        if (!metadataUri) {
            throw new Error('Failed to upload metadata to IPFS');
        }


        console.log('IPFS Response:', metadataResponse);

        // Get the create transaction from pump.fun
        const pumpResponse = await fetch(`https://pumpportal.fun/api/trade-local`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                publicKey: wallet.publicKey?.toString(),
                action: "create",
                tokenMetadata: {
                    name: metadataResponse?.name,
                    symbol: metadataResponse?.symbol,
                    uri: metadataUri
                },
                mint: mintKeypair.publicKey.toBase58(),
                denominatedInSol: "true",
                amount: 0.01,
                slippage: 10,
                priorityFee: 0.0005,
                pool: "pump"
            })
        });

        if (pumpResponse.status === 200) {
            const data = await pumpResponse.arrayBuffer();
            const tx = VersionedTransaction.deserialize(new Uint8Array(data));

            // Sign with mint keypair
            tx.sign([mintKeypair]);

            // Sign with wallet
            if (wallet.signTransaction) {
                const signedTx = await wallet.signTransaction(tx);
                const signature = await web3Connection.sendTransaction(signedTx);
                console.log("Pump.fun Transaction:", signature);
                console.log("Token Mint Address", mintKeypair.publicKey.toString())
                localStorage.setItem("tokenMintAddress", mintKeypair.publicKey.toString());
                return {
                    mintAddress: mintKeypair.publicKey.toString(),

                    signature
                };
            } else {
                throw new Error('Wallet does not support signing');
            }
        } else {
            throw new Error(`Failed to create token: ${pumpResponse.statusText}`);
        }
    } catch (error) {
        console.error('Error in TokenCreator:', error);
        throw error;
    }
};