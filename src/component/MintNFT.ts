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

const uploadToPinata = async (base64Image: string, address: string) => {
    const pinataApiKey = '687b32db4856209f2275';
    const pinataSecretApiKey = '542f2768d67cd63fc4d2fb5f383d887717e6a05e9150fe0a941ae98e4a7e888a';
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

const CreateNft = async (base64Image: any, name: string, wallet: any) => {

    const handleMint = async () => {

        if (wallet.publicKey && wallet.connected) {
            const umi = createUmi("https://devnet.helius-rpc.com/?api-key=daee1b98-f564-4352-b8aa-d41654bc0e02");
            umi.use(walletAdapterIdentity(wallet)).use(mplTokenMetadata());
            const address = wallet.publicKey?.toBase58();
            console.log("address", address);
            if (!address) {
                alert("Please connect your wallet to mint an NFT.");
            }

            try {
                const uriHash = await uploadToPinata(base64Image, address);
                const uri = `https://gateway.pinata.cloud/ipfs/${uriHash}`;
                const { signature, result } = await createNft(umi, {
                    mint: generateSigner(umi),
                    name: name,
                    uri: uri,
                    updateAuthority: umi.identity.publicKey,
                    sellerFeeBasisPoints: percentAmount(0),
                }).sendAndConfirm(umi, { send: { commitment: "finalized" } });

                const txSignature = bs58.encode(signature)
                console.log("NFT minted with signature:", txSignature, "Result:", result);
                toast.success('NFT minted successfully!')
                return txSignature
            } catch (error) {
                console.error("Error minting NFT:", error);
            }
        } else {
            alert("Please connect your wallet to mint an NFT.");
        }
    };

    await handleMint();
};


export default CreateNft;