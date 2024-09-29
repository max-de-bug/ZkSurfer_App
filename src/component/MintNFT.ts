import { create } from '@metaplex-foundation/mpl-core'
import {
    generateSigner,
    signerIdentity,
} from '@metaplex-foundation/umi'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { base58 } from '@metaplex-foundation/umi/serializers'
import { createSignerFromKeypair } from '@metaplex-foundation/umi'
import { useWallet, WalletContextState } from '@solana/wallet-adapter-react'
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters'


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
    }
};



const createNft = async (wallet: WalletContextState, base64Image: string, address: string) => {

    const umi = createUmi('https://api.devnet.solana.com')
    // const walletFile = [175, 230, 36, 155, 52, 81, 50, 94, 130, 15, 207, 244, 43, 223, 247, 105, 182, 18, 119, 230, 111, 53, 167, 88, 235, 155, 13, 32, 26, 42, 55, 91, 27, 117, 60, 107, 101, 234, 110, 105, 61, 210, 36, 112, 253, 252, 225, 116, 165, 122, 209, 92, 112, 54, 97, 200, 102, 208, 20, 100, 140, 183, 66, 116];


    // let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(walletFile));

    // const signer = createSignerFromKeypair(umi, keypair);

    // umi.use(signerIdentity(signer))

    umi.use(walletAdapterIdentity(wallet))

    const asset = generateSigner(umi)
    console.log(asset.publicKey)
    const assetPublicKey = asset.publicKey.toString();
    console.log("uploading to pinata.... ");
    //this base64 is hardcoded
    // const base64Imagee = base64Image.replace(/^data:image\/\w+;base64,/, '');
    const metadataUri = await uploadToPinata(base64Image, address);
    const uri = `https://gateway.pinata.cloud/ipfs/${metadataUri}`;
    console.log("uri is ", uri);


    console.log('Creating NFT...')
    const tx = await create(umi, {
        asset,
        name: "NFT",
        uri: uri,
    }).sendAndConfirm(umi)

    const signature = base58.deserialize(tx.signature)[0]

    console.log('\nNFT Created')
    console.log('View Transaction on Solana Explorer')
    console.log(`https://explorer.solana.com/tx/${signature}?cluster=devnet`)
    console.log('\n')
    console.log('View NFT on Metaplex Explorer')

    return { signature, assetPublicKey };
}

export default createNft;