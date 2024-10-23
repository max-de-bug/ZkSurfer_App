// import { create } from '@metaplex-foundation/mpl-core'
// import {
//     generateSigner,
//     signerIdentity,
// } from '@metaplex-foundation/umi'
// import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
// import { base58 } from '@metaplex-foundation/umi/serializers'
// import { createSignerFromKeypair } from '@metaplex-foundation/umi'
// import { useWallet, WalletContextState } from '@solana/wallet-adapter-react'
// import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters'


// const uploadToPinata = async (base64Image: string, address: string) => {
//     const pinataApiKey = '8f7f7d87831f45117aef';
//     const pinataSecretApiKey = '5d66d6828028374510429f6247b4191d5678e3c4a9ac8b920af64f74711cb174';
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
//                     "value": "Custom"
//                 }
//             ],
//             "collection": {
//                 "name": "ZKagiColection",
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



// const createNft = async (wallet: WalletContextState, base64Image: string, address: string) => {

//     const umi = createUmi('https://api.devnet.solana.com')

//     umi.use(walletAdapterIdentity(wallet))

//     const asset = generateSigner(umi)
//     console.log(asset.publicKey)
//     const assetPublicKey = asset.publicKey.toString();
//     console.log("uploading to pinata.... ");
//     //this base64 is hardcoded
//     // const base64Imagee = base64Image.replace(/^data:image\/\w+;base64,/, '');
//     const metadataUri = await uploadToPinata(base64Image, address);
//     const uri = `https://gateway.pinata.cloud/ipfs/${metadataUri}`;
//     console.log("uri is ", uri);


//     console.log('Creating NFT...')
//     const tx = await create(umi, {
//         asset,
//         name: "NFT",
//         uri: uri,
//     }).sendAndConfirm(umi)

//     const signature = base58.deserialize(tx.signature)[0]

//     console.log('\nNFT Created')
//     console.log('View Transaction on Solana Explorer')
//     console.log(`https://explorer.solana.com/tx/${signature}?cluster=devnet`)
//     console.log('\n')
//     console.log('View NFT on Metaplex Explorer')

//     return { signature, assetPublicKey };
// }

// export default createNft;

import { useAccount } from 'wagmi'
import { PublicClient, WalletClient, Hash } from 'viem'

const uploadToPinata = async (base64Image: string, address: string) => {
    const pinataApiKey = '8f7f7d87831f45117aef';
    const pinataSecretApiKey = '5d66d6828028374510429f6247b4191d5678e3c4a9ac8b920af64f74711cb174';
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
                    "value": "Custom"
                }
            ],
            "collection": {
                "name": "ZKagiColection",
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
        throw error;
    }
};

const mintNftAbi = [{
    name: 'mintNFT',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
        { name: 'recipient', type: 'address' },
        { name: 'tokenURI', type: 'string' }
    ],
    outputs: [{ type: 'uint256' }]
}] as const;

interface CreateNftParams {
    walletClient: WalletClient
    publicClient: PublicClient
    base64Image: string
    contractAddress: `0x${string}` // Proper type for Ethereum address
}

interface CreateNftResult {
    hash: Hash
    uri: string
}

const createNft = async ({
    walletClient,
    publicClient,
    base64Image,
    contractAddress
}: CreateNftParams): Promise<CreateNftResult> => {
    if (!walletClient.account?.address) {
        throw new Error('No wallet connected');
    }

    const address = walletClient.account.address;
    console.log("Uploading to pinata....");

    const metadataUri = await uploadToPinata(base64Image, address);
    const uri = `https://gateway.pinata.cloud/ipfs/${metadataUri}`;
    console.log("uri is ", uri);

    try {
        console.log('Creating NFT...');

        const { request } = await publicClient.simulateContract({
            account: address,
            address: contractAddress,
            abi: mintNftAbi,
            functionName: 'mintNFT',
            args: [address, uri]
        });

        const hash = await walletClient.writeContract(request);

        console.log('\nNFT Created');
        console.log('Transaction Hash:', hash);
        console.log(`View Transaction on Block Explorer:`);
        console.log(`https://etherscan.io/tx/${hash}`);

        return { hash, uri };
    } catch (error) {
        console.error('Error creating NFT:', error);
        throw error;
    }
};

export const useCreateNft = () => {
    const { address } = useAccount();

    const create = async (params: CreateNftParams) => {
        if (!address) throw new Error('No wallet connected');
        return createNft(params);
    };

    return { create };
};

export default createNft;