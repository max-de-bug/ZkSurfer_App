"use client";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import {
    createNft,
    mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { generateSigner, percentAmount } from "@metaplex-foundation/umi";
import bs58 from 'bs58';
import { toast } from 'sonner';
import { publicKey as umiPublicKey } from "@metaplex-foundation/umi";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import { Connection, PublicKey } from "@solana/web3.js";
import { verifyCollectionV1, findMetadataPda } from "@metaplex-foundation/mpl-token-metadata";

const COLLECTION_NAME = "ZkAGI Community Mints";

const fetchCollectionNft = async (wallet: any) => {
    if (!wallet.publicKey) throw new Error("Wallet is not connected.");
    const connection = new Connection(process.env.NEXT_PUBLIC_RPC_ENDPOINT || "");
    const metaplex = Metaplex.make(connection).use(keypairIdentity(wallet));

    const nfts = await metaplex.nfts().findAllByOwner({ owner: new PublicKey(wallet.publicKey) });
    const collectionNft = nfts.find((nft: { name: string; collectionDetails: any; }) => nft.name === COLLECTION_NAME && nft.collectionDetails);
    if (collectionNft) {
        return {
            ...collectionNft,
            mint: collectionNft.address
        };
    }
    return collectionNft || null;
};

const createCollectionNft = async (umi: any, wallet: any) => {
    const collectionMint = generateSigner(umi);
    const { signature } = await createNft(umi, {
        mint: collectionMint,
        name: COLLECTION_NAME,
        uri: "https://gateway.pinata.cloud/ipfs/bafkreih66ep3bwfogf3qet7u7u3j5q7v5ci23qbxppvyjjegzmatn6vw4y",
        updateAuthority: umi.identity.publicKey,
        sellerFeeBasisPoints: percentAmount(0),
        isCollection: true,
        collectionDetails: { __kind: "V1", size: 0 },
        authority: umi.identity,
    }).sendAndConfirm(umi, { send: { commitment: "finalized" } });

    const collectionAddress = collectionMint.publicKey;
    console.log("Collection NFT created with address:", collectionAddress);
    return collectionAddress;
};


const uploadToPinata = async (base64Image: string, address: string) => {
    const pinataApiKey = process.env.NEXT_PUBLIC_NFT_PINATA_API_KEY;
    const pinataSecretApiKey = process.env.NEXT_PUBLIC_NFT_PINATA_API_SECRET;

    if (!pinataApiKey || !pinataSecretApiKey) {
        throw new Error("Pinata API keys are not defined. Please check your environment variables.");
    }

    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

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
            "attributes": [
                {
                    "trait_type": "NFT type",
                    "value": "ImageGenNft"
                },
                {
                    "trait_type": "Stamp",
                    "value": "ZkAGI"
                }

            ],
            "collection": {
                "name": "ZkAGI Community Mints",
                "family": "ImageGenNft",
            },
            "properties": {
                "files": [
                    {
                        "uri": imageUrl,
                        "type": "image/png",
                    },
                ],
                "category": "image",
                "maxSupply": 0,
                "creators": [
                    {
                        "address": address,
                        "share": 100,
                    },
                ],
            },
            "image": imageUrl,
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

        return metadataData.IpfsHash;
    } catch (error) {
        console.error('Error uploading to Pinata:', error);
    }
};


const CreateNft = async (base64Image: string, name: string, wallet: any) => {
    const handleMint = async () => {
        if (wallet.publicKey && wallet.connected) {
            const rpcEndpoint = process.env.NEXT_PUBLIC_RPC_ENDPOINT?.trim() || "";
            const umi = createUmi(rpcEndpoint);
            umi.use(walletAdapterIdentity(wallet)).use(mplTokenMetadata());

            try {
                // Check if the collection exists
                let collectionNft = await fetchCollectionNft(wallet);

                // Create the collection if it doesn't exist
                if (!collectionNft) {
                    console.log("Collection does not exist. Creating a new one...");
                    const collectionAddress = await createCollectionNft(umi, wallet);
                    collectionNft = { mint: collectionAddress };
                } else {
                    console.log("Existing collection found:", collectionNft);
                }

                // Upload image and metadata to Pinata
                const address = wallet.publicKey.toBase58();
                const uriHash = await uploadToPinata(base64Image, address);
                const uri = `https://gateway.pinata.cloud/ipfs/${uriHash}`;

                if (!collectionNft) {
                    throw new Error("No collection NFT found");
                }


                const umiPk = umiPublicKey(collectionNft.mint.toBytes());
                // Mint the new NFT and associate it with the collection
                const { signature, result } = await createNft(umi, {
                    mint: generateSigner(umi),
                    name: name,
                    uri: uri,
                    updateAuthority: umi.identity.publicKey,
                    sellerFeeBasisPoints: percentAmount(0),
                    collection: {
                        verified: false, // Set this to true if you verify the collection
                        key: umiPk
                    },
                }).sendAndConfirm(umi, { send: { commitment: "finalized" } });

                const txSignature = bs58.encode(signature);
                console.log("NFT minted with signature:", txSignature, "Result:", result);
                toast.success("NFT minted successfully!");
                return txSignature;
            } catch (error) {
                console.error("Error minting NFT:", error);
            }
        } else {
            alert("Please connect your wallet to mint an NFT.");
        }
    };

    await handleMint();
};


// const CreateNft = async (base64Image: string, name: string, wallet: any) => {
//     const handleMint = async () => {
//         if (!wallet.publicKey || !wallet.connected) {
//             toast.warning("Please connect your wallet first");
//             throw new Error("Wallet not connected");
//         }

//         const rpcEndpoint = process.env.NEXT_PUBLIC_RPC_ENDPOINT?.trim() || "";
//         const umi = createUmi(rpcEndpoint);
//         umi.use(walletAdapterIdentity(wallet)).use(mplTokenMetadata());

//         try {
//             // Step 1: Ensure collection exists
//             console.log("Checking for existing collection...");
//             let collectionNft = await fetchCollectionNft(wallet);

//             if (!collectionNft) {
//                 console.log("Creating new collection...");
//                 const collectionAddress = await createCollectionNft(umi, wallet);
//                 // Wait for collection creation to be fully confirmed
//                 await new Promise(resolve => setTimeout(resolve, 2000));

//                 collectionNft = {
//                     mint: collectionAddress,
//                     address: collectionAddress,
//                     name: COLLECTION_NAME
//                 };
//                 console.log("Collection created:", collectionNft.mint.toString());
//             }

//             if (!collectionNft) {
//                 throw new Error("Failed to create or find collection NFT");
//             }

//             // Step 2: Upload to Pinata
//             console.log("Uploading to Pinata...");
//             const address = wallet.publicKey.toBase58();
//             const uriHash = await uploadToPinata(base64Image, address);
//             const uri = `https://gateway.pinata.cloud/ipfs/${uriHash}`;

//             // Step 3: Create NFT
//             console.log("Creating NFT...");
//             const mint = generateSigner(umi);
//             const collectionKey = umiPublicKey(collectionNft.mint);

//             const { signature: createSignature } = await createNft(umi, {
//                 mint,
//                 name: name,
//                 uri: uri,
//                 sellerFeeBasisPoints: percentAmount(0),
//                 collection: {
//                     key: collectionKey,
//                     verified: false,
//                 },
//                 authority: umi.identity, // Explicitly set the authority
//             }).sendAndConfirm(umi, { send: { commitment: "finalized" } });

//             // Wait for NFT creation to be confirmed
//             console.log("Waiting for NFT creation confirmation...");
//             await new Promise(resolve => setTimeout(resolve, 3000));

//             // Step 4: Verify collection with retry logic
//             console.log("Starting collection verification...");
//             const maxRetries = 3;
//             let retryCount = 0;
//             let verificationSuccess = false;

//             while (retryCount < maxRetries && !verificationSuccess) {
//                 try {
//                     const metadataPda = findMetadataPda(umi, { mint: mint.publicKey });

//                     console.log("Verification attempt", retryCount + 1);
//                     console.log("NFT Mint:", mint.publicKey.toString());
//                     console.log("Collection Mint:", collectionKey.toString());
//                     console.log("Metadata PDA:", metadataPda.toString());

//                     const { signature: verifySignature } = await verifyCollectionV1(umi, {
//                         metadata: metadataPda,
//                         collectionMint: collectionKey,
//                         authority: umi.identity, // Use the same authority as the collection creator
//                         collectionAuthority: umi.identity.publicKey, // Add collection authority
//                     }).sendAndConfirm(umi, { send: { commitment: "finalized" } });

//                     console.log("Collection verification successful!");
//                     verificationSuccess = true;
//                     toast.success("NFT minted and added to collection successfully!");
//                 } catch (verifyError) {
//                     console.error(`Verification attempt ${retryCount + 1} failed:`, verifyError);
//                     retryCount++;
//                     if (retryCount < maxRetries) {
//                         // Wait longer between retries
//                         await new Promise(resolve => setTimeout(resolve, 3000 * (retryCount + 1)));
//                     } else {
//                         console.error("All verification attempts failed");
//                         toast.error("NFT minted but collection verification failed");
//                     }
//                 }
//             }

//             return {
//                 signature: bs58.encode(createSignature),
//                 mint: mint.publicKey.toString(),
//                 verified: verificationSuccess,
//                 collection: collectionKey.toString()
//             };

//         } catch (error) {
//             console.error("Error in NFT creation process:", error);
//             toast.error("Failed to create NFT");
//             throw error;
//         }
//     };

//     return await handleMint();
// };
export default CreateNft;


// "use client";
// import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
// import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
// import {
//     createNft,
//     mplTokenMetadata,
// } from "@metaplex-foundation/mpl-token-metadata";
// import { generateSigner, percentAmount } from "@metaplex-foundation/umi";
// import bs58 from 'bs58';
// import { toast } from 'sonner';

// const COLLECTION_NAME = "ZkAGI Community Mints";

// // Function to fetch the collection NFT
// const fetchCollectionNft = async (umi: any, wallet: any) => {
//     const nfts = await umi.rpc.getAssetsByOwner({ owner: wallet.publicKey });
//     const collectionNft = nfts.find((nft: any) => nft.name === COLLECTION_NAME && nft.collectionDetails);
//     return collectionNft || null;
// };

// // Function to create the collection NFT
// const createCollectionNft = async (umi: any, wallet: any) => {
//     const collectionMint = generateSigner(umi);
//     const { signature } = await createNft(umi, {
//         mint: collectionMint,
//         name: COLLECTION_NAME,
//         uri: "https://gateway.pinata.cloud/ipfs/bafkreih66ep3bwfogf3qet7u7u3j5q7v5ci23qbxppvyjjegzmatn6vw4y",
//         updateAuthority: umi.identity.publicKey,
//         sellerFeeBasisPoints: percentAmount(0),
//         isCollection: true,
//         collectionDetails: { __kind: "V1", size: 0 },
//     }).sendAndConfirm(umi, { send: { commitment: "finalized" } });

//     const collectionAddress = collectionMint.publicKey;
//     console.log("Collection NFT created with address:", collectionAddress);
//     return collectionAddress;
// };

// // Function to upload image and metadata to Pinata
// const uploadToPinata = async (base64Image: string, address: string) => {
//     const pinataApiKey = process.env.NEXT_PUBLIC_NFT_PINATA_API_KEY;
//     const pinataSecretApiKey = process.env.NEXT_PUBLIC_NFT_PINATA_API_SECRET;

//     if (!pinataApiKey || !pinataSecretApiKey) {
//         throw new Error("Pinata API keys are not defined. Please check your environment variables.");
//     }

//     const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

//     const base64ToBlob = (base64: string, contentType: string) => {
//         const byteCharacters = atob(base64.split(',')[1]);
//         const byteArrays = [];
//         for (let i = 0; i < byteCharacters.length; i++) {
//             byteArrays.push(byteCharacters.charCodeAt(i));
//         }
//         return new Blob([new Uint8Array(byteArrays)], { type: contentType });
//     };
//     const contentType = base64Image.match(/data:(.*?);base64/)?.[1] || 'image/png';
//     const blob = base64ToBlob(base64Image, contentType);
//     const formData = new FormData();
//     formData.append('file', blob, 'image.png');
//     const options = {
//         method: 'POST',
//         headers: {
//             'pinata_api_key': pinataApiKey,
//             'pinata_secret_api_key': pinataSecretApiKey
//         },
//         body: formData
//     };

//     try {
//         const result = await fetch(url, options);
//         const imageData = await result.json();
//         console.log('Pinata image response:', imageData);

//         const imageUrl = `https://gateway.pinata.cloud/ipfs/${imageData.IpfsHash}`;
//         console.log("imageUrl is ", imageUrl);

//         const metadata = {
//             "attributes": [
//                 {
//                     "trait_type": "NFT type",
//                     "value": "ImageGenNft"
//                 },
//                 {
//                     "trait_type": "Stamp",
//                     "value": "ZkAGI"
//                 }
//             ],
//             "collection": {
//                 "name": COLLECTION_NAME,
//                 "family": "ImageGenNft",
//             },
//             "properties": {
//                 "files": [
//                     {
//                         "uri": imageUrl,
//                         "type": "image/png",
//                     },
//                 ],
//                 "category": "image",
//                 "maxSupply": 0,
//                 "creators": [
//                     {
//                         "address": address,
//                         "share": 100,
//                     },
//                 ],
//             },
//             "image": imageUrl,
//         };

//         const metadataUrl = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
//         const metadataOptions = {
//             method: 'POST',
//             headers: {
//                 'pinata_api_key': pinataApiKey,
//                 'pinata_secret_api_key': pinataSecretApiKey,
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(metadata)
//         };

//         const metadataResult = await fetch(metadataUrl, metadataOptions);
//         const metadataData = await metadataResult.json();
//         console.log('Pinata metadata response:', metadataData);

//         return metadataData.IpfsHash;
//     } catch (error) {
//         console.error('Error uploading to Pinata:', error);
//     }
// };

// // Function to mint NFTs and add them to the collection
// const CreateNft = async (base64Image: any, name: string, wallet: any) => {
//     const handleMint = async () => {
//         if (wallet.publicKey && wallet.connected) {
//             const rpcEndpoint = process.env.NEXT_PUBLIC_RPC_ENDPOINT?.trim() || "";
//             const umi = createUmi(rpcEndpoint);
//             umi.use(walletAdapterIdentity(wallet)).use(mplTokenMetadata());

//             try {
//                 // Check if the collection exists
//                 let collectionNft = await fetchCollectionNft(umi, wallet);

//                 // Create the collection if it doesn't exist
//                 if (!collectionNft) {
//                     console.log("Collection does not exist. Creating a new one...");
//                     const collectionAddress = await createCollectionNft(umi, wallet);
//                     collectionNft = { mint: collectionAddress };
//                 } else {
//                     console.log("Existing collection found:", collectionNft);
//                 }

//                 // Upload image and metadata to Pinata
//                 const address = wallet.publicKey.toBase58();
//                 const uriHash = await uploadToPinata(base64Image, address);
//                 const uri = `https://gateway.pinata.cloud/ipfs/${uriHash}`;

//                 // Mint the new NFT and associate it with the collection
//                 const { signature, result } = await createNft(umi, {
//                     mint: generateSigner(umi),
//                     name: name,
//                     uri: uri,
//                     updateAuthority: umi.identity.publicKey,
//                     sellerFeeBasisPoints: percentAmount(0),
//                     collection: {
//                         verified: false, // Set this to true if you verify the collection
//                         key: collectionNft.mint,
//                     },
//                 }).sendAndConfirm(umi, { send: { commitment: "finalized" } });

//                 const txSignature = bs58.encode(signature);
//                 console.log("NFT minted with signature:", txSignature, "Result:", result);
//                 toast.success("NFT minted successfully!");
//                 return txSignature;
//             } catch (error) {
//                 console.error("Error minting NFT:", error);
//             }
//         } else {
//             alert("Please connect your wallet to mint an NFT.");
//         }
//     };

//     await handleMint();
// };

// export default CreateNft;

// "use client";
// import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
// import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
// import {
//     createNft,
//     mplTokenMetadata,
// } from "@metaplex-foundation/mpl-token-metadata";
// import {
//     generateSigner,
//     percentAmount,
//     publicKey,
// } from "@metaplex-foundation/umi";
// import bs58 from "bs58";
// import { toast } from "sonner";
// import { WalletContextState } from "@solana/wallet-adapter-react";

// /**
//  * Pinata: Upload JSON metadata (for the collection NFT) to IPFS
//  */
// async function uploadCollectionMetadataToPinata(
//     name: string,
//     description: string,
//     collectionImageUrl: string
// ) {
//     const pinataApiKey = process.env.NEXT_PUBLIC_NFT_PINATA_API_KEY;
//     const pinataSecretApiKey = process.env.NEXT_PUBLIC_NFT_PINATA_API_SECRET;

//     if (!pinataApiKey || !pinataSecretApiKey) {
//         throw new Error(
//             "Pinata API keys are not defined. Please check your environment variables."
//         );
//     }

//     const collectionMetadata = {
//         name,
//         symbol: "ZkAGI",
//         description,
//         image: collectionImageUrl,
//         attributes: [],
//     };

//     const pinUrl = "https://api.pinata.cloud/pinning/pinJSONToIPFS";
//     const options = {
//         method: "POST",
//         headers: {
//             pinata_api_key: pinataApiKey,
//             pinata_secret_api_key: pinataSecretApiKey,
//             "Content-Type": "application/json",
//         },
//         body: JSON.stringify(collectionMetadata),
//     };

//     try {
//         const response = await fetch(pinUrl, options);
//         const data = await response.json();
//         return `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
//     } catch (err) {
//         console.error("Error uploading collection metadata:", err);
//         throw err;
//     }
// }

// /**
//  * Pinata: Upload the NFT’s image and metadata to IPFS
//  */
// async function uploadNftToPinata(base64Image: { match: (arg0: RegExp) => string[]; }, address: any) {
//     const pinataApiKey = process.env.NEXT_PUBLIC_NFT_PINATA_API_KEY;
//     const pinataSecretApiKey = process.env.NEXT_PUBLIC_NFT_PINATA_API_SECRET;

//     if (!pinataApiKey || !pinataSecretApiKey) {
//         throw new Error("Pinata API keys are not defined.");
//     }

//     const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
//     const base64ToBlob = (base64: string, contentType: string) => {
//         const byteCharacters = atob(base64.split(",")[1]);
//         const byteArrays = byteCharacters.split("").map((char) => char.charCodeAt(0));
//         return new Blob([new Uint8Array(byteArrays)], { type: contentType });
//     };

//     const contentType = base64Image.match(/data:(.*?);base64/)?.[1] || "image/png";
//     const blob = base64ToBlob(base64Image, contentType);
//     const formData = new FormData();
//     formData.append("file", blob, "image.png");

//     try {
//         const result = await fetch(url, {
//             method: "POST",
//             headers: {
//                 pinata_api_key: pinataApiKey,
//                 pinata_secret_api_key: pinataSecretApiKey,
//             },
//             body: formData,
//         });
//         const imageData = await result.json();
//         const imageUrl = `https://gateway.pinata.cloud/ipfs/${imageData.IpfsHash}`;

//         const metadata = {
//             attributes: [
//                 { trait_type: "NFT type", value: "ImageGenNft" },
//                 { trait_type: "Stamp", value: "ZkAGI" },
//             ],
//             properties: {
//                 files: [{ uri: imageUrl, type: "image/png" }],
//                 category: "image",
//                 maxSupply: 0,
//                 creators: [{ address, share: 100 }],
//             },
//             image: imageUrl,
//         };

//         const metadataUrl = "https://api.pinata.cloud/pinning/pinJSONToIPFS";
//         const metadataResult = await fetch(metadataUrl, {
//             method: "POST",
//             headers: {
//                 pinata_api_key: pinataApiKey,
//                 pinata_secret_api_key: pinataSecretApiKey,
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify(metadata),
//         });

//         const metadataData = await metadataResult.json();
//         return `https://gateway.pinata.cloud/ipfs/${metadataData.IpfsHash}`;
//     } catch (error) {
//         console.error("Error uploading to Pinata:", error);
//         throw error;
//     }
// }

// const createCollectionThenMintNft = async (base64Image: string, name: string, wallet: WalletContextState) => {
//     if (!wallet.publicKey || !wallet.connected) {
//         alert("Please connect your wallet to mint an NFT.");
//         return;
//     }

//     const rpcEndpoint = process.env.NEXT_PUBLIC_RPC_ENDPOINT?.trim() || "";
//     const umi = createUmi(rpcEndpoint);
//     umi.use(walletAdapterIdentity(wallet)).use(mplTokenMetadata());

//     try {
//         const collectionUri = await uploadCollectionMetadataToPinata(
//             "ZkAGI collection",
//             "This is my brand-new ZkAGI collection.",
//             "https://placehold.co/400x400.png"
//         );

//         const { nft: collectionNft, signature: collectionSignature } = await createNft(umi, {
//             isCollection: true,
//             name: "ZkAGI collection",
//             symbol: "ZkAGI",
//             uri: collectionUri,
//             sellerFeeBasisPoints: percentAmount(0),
//             updateAuthority: umi.identity.publicKey,
//             mint: generateSigner(umi),
//         }).sendAndConfirm(umi, { send: { commitment: "finalized" } });

//         console.log("Collection NFT created with signature:", bs58.encode(collectionSignature));

//         const nftUri = await uploadNftToPinata(base64Image, wallet.publicKey.toBase58());

//         const { signature, nft: mintedNft } = await createNft(umi, {
//             mint: generateSigner(umi),
//             name,
//             uri: nftUri,
//             sellerFeeBasisPoints: percentAmount(0),
//             updateAuthority: umi.identity.publicKey,
//             collection: { verified: true, key: collectionNft.mint },
//             //   collectionAuthority: umi.identity,
//         }).sendAndConfirm(umi, { send: { commitment: "finalized" } });

//         console.log("NFT minted with signature:", bs58.encode(signature));
//         toast.success("NFT minted successfully into ZkAGI collection!");
//     } catch (error) {
//         console.error("Error minting NFT:", error);
//         toast.error("Error minting NFT");
//     }
// };

// export default createCollectionThenMintNft;
