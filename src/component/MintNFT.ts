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
import { verifyCollectionV1, findMetadataPda, verifyCollection } from "@metaplex-foundation/mpl-token-metadata";

const COLLECTION_NAME = "ZkAGI Community Mints";

interface CollectionNFT {
    mint: PublicKey
    address?: PublicKey
    name?: string
    collectionDetails?: any
}

const fetchCollectionNft = async (wallet: any): Promise<CollectionNFT | null> => {
    if (!wallet.publicKey) throw new Error("Wallet is not connected.")
    const connection = new Connection(process.env.NEXT_PUBLIC_RPC_ENDPOINT || "")
    const metaplex = Metaplex.make(connection).use(keypairIdentity(wallet))

    const nfts = await metaplex.nfts().findAllByOwner({ owner: new PublicKey(wallet.publicKey) })
    const collectionNft = nfts.find(
        (nft: { name: string; collectionDetails: any }) => nft.name === COLLECTION_NAME && nft.collectionDetails,
    )
    if (collectionNft) {
        return {
            ...collectionNft,
            mint: collectionNft.address,
        }
    }
    return null
}

const createCollectionNft = async (umi: any, wallet: any): Promise<PublicKey> => {
    const collectionMint = generateSigner(umi)
    const { signature } = await createNft(umi, {
        mint: collectionMint,
        name: COLLECTION_NAME,
        uri: "https://gateway.pinata.cloud/ipfs/bafkreih66ep3bwfogf3qet7u7u3j5q7v5ci23qbxppvyjjegzmatn6vw4y",
        updateAuthority: umi.identity.publicKey,
        sellerFeeBasisPoints: percentAmount(0),
        isCollection: false,
        collectionDetails: { __kind: "V1", size: 0 },
        authority: umi.identity,
    }).sendAndConfirm(umi, { send: { commitment: "finalized" } })

    // Convert UMI public key to Solana PublicKey
    const collectionAddress = new PublicKey(collectionMint.publicKey.toString())
    console.log("Collection NFT created with address:", collectionAddress.toBase58())
    return collectionAddress
}

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

                // Convert Solana PublicKey to UMI public key
                const umiPk = umiPublicKey(collectionNft.mint.toBytes());

                // Mint the new NFT and associate it with the collection
                const { signature, result } = await createNft(umi, {
                    mint: generateSigner(umi),
                    name: name,
                    uri: uri,
                    updateAuthority: umi.identity.publicKey,
                    sellerFeeBasisPoints: percentAmount(0),
                    collection: {
                        verified: false,
                        key: umiPk,
                    },
                }).sendAndConfirm(umi, { send: { commitment: "finalized" } });

                const mint = generateSigner(umi);
                const collectionKey = umiPublicKey(collectionNft.mint);
                const metadataPda = findMetadataPda(umi, { mint: mint.publicKey });

                const { signature: verifySignature } = await verifyCollectionV1(umi, {
                    metadata: metadataPda,
                    collectionMint: collectionKey,
                    authority: umi.identity, // Use the same authority as the collection creator
                    //   collectionAuthority: umi.identity.publicKey, // Add collection authority
                }).sendAndConfirm(umi, { send: { commitment: "finalized" } });

                const txSignature = bs58.encode(signature);
                console.log(
                    "NFT minted with signature:",
                    txSignature,
                    "Result:",
                    result
                );
                toast.success("NFT minted successfully!");
                return txSignature;
            } catch (error) {
                console.error("Error minting NFT:", error);
                toast.error("Error minting NFT. Please try again later."); //Added toast error message
            }
        } else {
            alert("Please connect your wallet to mint an NFT.");
        }
    };

    await handleMint();
};

export default CreateNft;