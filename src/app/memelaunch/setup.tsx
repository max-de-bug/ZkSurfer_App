// import { AnchorProvider, setProvider, Program, Idl } from "@coral-xyz/anchor";
// import { useAnchorWallet } from "@solana/wallet-adapter-react";
// import * as anchor from "@project-serum/anchor";
// import { Connection, PublicKey } from "@solana/web3.js";
// import idl from "./idl.json";

// interface TokenCreationData {
//   name: string;
//   ticker: string;
//   description: string;
//   imageBase64: string;
// }


// const uploadToPinata = async (base64Image: string, tokenData: TokenCreationData) => {
//   const pinataApiKey = 'd5e949a5faa656f9b0cb';
//   const pinataSecretApiKey = '68fec412fb311cec60dea2f12e97eadb6b9cc227d40796d6038d66800fd89992';
//   const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

//   const base64ToBlob = (base64: string, contentType: string) => {
//     const byteCharacters = atob(base64.split(',')[1]);
//     const byteArrays = [];
//     for (let i = 0; i < byteCharacters.length; i++) {
//       byteArrays.push(byteCharacters.charCodeAt(i));
//     }
//     return new Blob([new Uint8Array(byteArrays)], { type: contentType });
//   };
//   const contentType = base64Image.match(/data:(.*?);base64/)?.[1] || 'image/png';
//   const blob = base64ToBlob(base64Image, contentType);
//   const formData = new FormData();
//   formData.append('file', blob, 'image.png');
//   const options = {
//     method: 'POST',
//     headers: {
//       'pinata_api_key': pinataApiKey,
//       'pinata_secret_api_key': pinataSecretApiKey
//     },
//     body: formData
//   };

//   try {
//     const result = await fetch(url, options);
//     const imageData = await result.json();
//     console.log('Pinata image response:', imageData);

//     const imageUrl = `https://gateway.pinata.cloud/ipfs/${imageData.IpfsHash}`;
//     console.log("imageUrl is ", imageUrl);

//     const metadata = {
//       "name": tokenData.name,
//       "symbol": tokenData.ticker,
//       "description": tokenData.description,
//       "image": imageUrl

//     };

//     const metadataUrl = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
//     const metadataOptions = {
//       method: 'POST',
//       headers: {
//         'pinata_api_key': pinataApiKey,
//         'pinata_secret_api_key': pinataSecretApiKey,
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify(metadata)
//     };

//     const metadataResult = await fetch(metadataUrl, metadataOptions);
//     const metadataData = await metadataResult.json();
//     console.log('Pinata metadata response:', metadataData);

//     return metadataData.IpfsHash;
//   } catch (error) {
//     console.error('Error uploading to Pinata:', error);
//   }
// };




// const TokenCreator = (tokenData: TokenCreationData) => {
//   const wallet = useAnchorWallet();
//   console.log("Wallet is ", wallet);
//   const connection = new Connection("https://api.devnet.solana.com", "confirmed");
//   const programId = new PublicKey("ESxkgjA2FoZ3WrAt3aEewaaZ9nzZsaJfWe3DxffbED2Q");
//   const base64Imagee = tokenData.imageBase64


//   const createToken = async () => {
//     if (wallet) {
//       const metadataUri = await uploadToPinata(base64Imagee, tokenData);
//       const uri = `https://gateway.pinata.cloud/ipfs/${metadataUri}`;
//       console.log("URI is ", uri);
//       const provider = new AnchorProvider(connection, wallet, {
//         preflightCommitment: "confirmed",
//       });
//       console.log("Provider is ", provider.publicKey);

//       setProvider(provider);

//       const program = new Program(idl as Idl, programId, provider);

//       if (!program) {
//         console.error("program is undefined");
//         return;
//       }

//       console.log("Program ID:", program.programId.toString());
//       const tokenDetails = {
//         name: tokenData.name,
//         symbol: tokenData.ticker,
//         uri: uri,
//       };

//       const metadataTokenProgramPubkey = new anchor.web3.PublicKey(
//         "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
//       );
//       console.log("Metadata is ", metadataTokenProgramPubkey);

//       const platformKeypair = anchor.web3.PublicKey.findProgramAddressSync(
//         [Buffer.from("platform")],
//         program.programId
//       )[0];


//       const mintKeypair = anchor.web3.PublicKey.findProgramAddressSync(
//         [Buffer.from("mint"), Buffer.from(tokenDetails.name)],
//         program.programId
//       )[0];

//       const metadataKeypair = anchor.web3.PublicKey.findProgramAddressSync(
//         [
//           Buffer.from("metadata"),
//           metadataTokenProgramPubkey.toBuffer(),
//           mintKeypair.toBuffer(),
//         ],
//         metadataTokenProgramPubkey
//       )[0];

//       const tokenInfoKeypair = anchor.web3.PublicKey.findProgramAddressSync(
//         [Buffer.from("token"), Buffer.from(tokenDetails.name)],
//         program.programId
//       )[0];

//       const escrowTokenAccountKeypair = anchor.web3.PublicKey.findProgramAddressSync(
//         [Buffer.from("token_account"), mintKeypair.toBuffer()],
//         program.programId
//       )[0];

//       try {
//         await program.methods.createToken(tokenDetails).accounts({
//           metadata: metadataKeypair.toBase58(),
//           platform: platformKeypair.toBase58(),
//           mint: mintKeypair.toBase58(),
//           tokenAccount: escrowTokenAccountKeypair.toBase58(),
//           tokenInfo: tokenInfoKeypair.toBase58(),
//           tokenMetadataProgram: metadataTokenProgramPubkey.toBase58(),
//         }).rpc();
//       } catch (error) {
//         console.error("Error creating token:", error);
//       }
//     }
//   };
//   return (
//     <div>
//       <button onClick={createToken}>Create Token</button>
//     </div>
//   )

// };

// export default TokenCreator;



import { AnchorProvider, setProvider, Program, Idl } from "@coral-xyz/anchor";
import { AnchorWallet, useAnchorWallet } from "@solana/wallet-adapter-react";
import * as anchor from "@project-serum/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import idl from "./idl.json";
import { Console } from "console";

interface TokenCreationData {
  name: string;
  ticker: string;
  description: string;
  imageBase64: string;
}

const uploadToPinata = async (base64Image: string, tokenData: TokenCreationData) => {
  const pinataApiKey = 'd5e949a5faa656f9b0cb';
  const pinataSecretApiKey = '68fec412fb311cec60dea2f12e97eadb6b9cc227d40796d6038d66800fd89992';
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

  try {
    const result = await fetch(url, {
      method: 'POST',
      headers: {
        'pinata_api_key': pinataApiKey,
        'pinata_secret_api_key': pinataSecretApiKey
      },
      body: formData
    });

    const imageData = await result.json();
    const imageUrl = `https://gateway.pinata.cloud/ipfs/${imageData.IpfsHash}`;

    const metadata = {
      "name": tokenData.name,
      "symbol": tokenData.ticker,
      "description": tokenData.description,
      "image": imageUrl
    };

    const metadataResult = await fetch(`https://api.pinata.cloud/pinning/pinJSONToIPFS`, {
      method: 'POST',
      headers: {
        'pinata_api_key': pinataApiKey,
        'pinata_secret_api_key': pinataSecretApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(metadata)
    });

    const metadataData = await metadataResult.json();
    return metadataData.IpfsHash;
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    throw error;
  }
};
// const TokenCreator = ({ tokenData }: { tokenData: TokenCreationData }) => {
//   const wallet = useAnchorWallet();
//   const connection = new Connection("https://api.devnet.solana.com", "confirmed");
//   const programId = new PublicKey("ESxkgjA2FoZ3WrAt3aEewaaZ9nzZsaJfWe3DxffbED2Q");

//   const createToken = async () => {
//     if (!wallet) {
//       throw new Error("Wallet not connected");
//     }

//     const metadataUri = await uploadToPinata(tokenData.imageBase64, tokenData);
//     const uri = `https://gateway.pinata.cloud/ipfs/${metadataUri}`;

//     const provider = new AnchorProvider(connection, wallet, {
//       preflightCommitment: "confirmed",
//     });

//     setProvider(provider);

//     const program = new Program(idl as unknown as Idl, programId, provider);

//     if (!program) {
//       throw new Error("Program is undefined");
//     }

//     const tokenDetails = {
//       name: tokenData.name,
//       symbol: tokenData.ticker,
//       uri: uri,
//     };

//     const metadataTokenProgramPubkey = new anchor.web3.PublicKey(
//       "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
//     );

//     const platformKeypair = anchor.web3.PublicKey.findProgramAddressSync(
//       [Buffer.from("platform")],
//       program.programId
//     )[0];

//     const mintKeypair = anchor.web3.PublicKey.findProgramAddressSync(
//       [Buffer.from("mint"), Buffer.from(tokenDetails.name)],
//       program.programId
//     )[0];

//     const metadataKeypair = anchor.web3.PublicKey.findProgramAddressSync(
//       [
//         Buffer.from("metadata"),
//         metadataTokenProgramPubkey.toBuffer(),
//         mintKeypair.toBuffer(),
//       ],
//       metadataTokenProgramPubkey
//     )[0];

//     const tokenInfoKeypair = anchor.web3.PublicKey.findProgramAddressSync(
//       [Buffer.from("token"), Buffer.from(tokenDetails.name)],
//       program.programId
//     )[0];

//     const escrowTokenAccountKeypair = anchor.web3.PublicKey.findProgramAddressSync(
//       [Buffer.from("token_account"), mintKeypair.toBuffer()],
//       program.programId
//     )[0];

//     try {
//       await program.methods.createToken(tokenDetails).accounts({
//         metadata: metadataKeypair.toBase58(),
//         platform: platformKeypair.toBase58(),
//         mint: mintKeypair.toBase58(),
//         tokenAccount: escrowTokenAccountKeypair.toBase58(),
//         tokenInfo: tokenInfoKeypair.toBase58(),
//         tokenMetadataProgram: metadataTokenProgramPubkey.toBase58(),
//       }).rpc();
//     } catch (error) {
//       console.error("Error creating token:", error);
//       throw error;
//     }
//   };

//   return {
//     createToken
//   };
const TokenCreator = async ({ wallet, tokenData }: { wallet: AnchorWallet; tokenData: TokenCreationData }) => {
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  const programId = new PublicKey("ESxkgjA2FoZ3WrAt3aEewaaZ9nzZsaJfWe3DxffbED2Q");

  const createToken = async () => {
    if (!wallet) {
      throw new Error("Wallet not connected");
    }

    const metadataUri = await uploadToPinata(tokenData.imageBase64, tokenData);
    const uri = `https://gateway.pinata.cloud/ipfs/${metadataUri}`;
    console.log('uri', uri)

    const provider = new AnchorProvider(connection, wallet, {
      preflightCommitment: "confirmed",
    });
    setProvider(provider);

    const program = new Program(idl as unknown as Idl, programId, provider);
    console.log('program', program)
    if (!program) {
      throw new Error("Program is undefined");
    }

    const tokenDetails = {
      name: tokenData.name,
      symbol: tokenData.ticker,
      uri: uri,
    };

    const metadataTokenProgramPubkey = new anchor.web3.PublicKey(
      "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
    );

    const platformKeypair = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("platform")],
      program.programId
    )[0];

    const mintKeypair = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("mint"), Buffer.from(tokenDetails.name)],
      program.programId
    )[0];

    const metadataKeypair = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        metadataTokenProgramPubkey.toBuffer(),
        mintKeypair.toBuffer(),
      ],
      metadataTokenProgramPubkey
    )[0];

    const tokenInfoKeypair = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("token"), Buffer.from(tokenDetails.name)],
      program.programId
    )[0];

    const escrowTokenAccountKeypair = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("token_account"), mintKeypair.toBuffer()],
      program.programId
    )[0];

    try {
      await program.methods.createToken(tokenDetails).accounts({
        metadata: metadataKeypair.toBase58(),
        platform: platformKeypair.toBase58(),
        mint: mintKeypair.toBase58(),
        tokenAccount: escrowTokenAccountKeypair.toBase58(),
        tokenInfo: tokenInfoKeypair.toBase58(),
        tokenMetadataProgram: metadataTokenProgramPubkey.toBase58(),
      }).rpc();
    } catch (error) {
      console.error("Error creating token:", error);
      throw error;
    }
  };

  return {
    createToken
  };
};


export default TokenCreator;