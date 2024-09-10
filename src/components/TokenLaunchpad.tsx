import {
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  ExtensionType,
  getMintLen,
  LENGTH_SIZE,
  TOKEN_2022_PROGRAM_ID,
  TYPE_SIZE,
} from "@solana/spl-token";
import { createInitializeInstruction, pack } from "@solana/spl-token-metadata";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { useState } from "react";

export function TokenLaunchpad() {
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenImage, setTokenImage] = useState("");
  const [tokenInitialSupply, setTokenInitialSupply] = useState("");
  const { connection } = useConnection();
  const wallet = useWallet();

  const createToken = async () => {
    const payerPublicKey = wallet.publicKey;
    const mintKeyPair = Keypair.generate();
    const decimals = 9;

    if (!payerPublicKey) {
      alert("Wallet not connected!");
      return;
    }

    const metadata = {
      mint: mintKeyPair.publicKey,
      name: "Meow100x",
      symbol: "M100x",
      uri: "https://virendrapatil24.github.io/metadata/metadata1/metadata.json",
      additionalMetadata: [],
    };

    const mintLen = getMintLen([ExtensionType.MetadataPointer]);

    const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

    const lamports = await connection.getMinimumBalanceForRentExemption(
      mintLen + metadataLen
    );

    const transaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: payerPublicKey,
        newAccountPubkey: mintKeyPair.publicKey,
        space: mintLen,
        lamports,
        programId: TOKEN_2022_PROGRAM_ID,
      }),
      createInitializeMetadataPointerInstruction(
        mintKeyPair.publicKey,
        payerPublicKey,
        mintKeyPair.publicKey,
        TOKEN_2022_PROGRAM_ID
      ),
      createInitializeMintInstruction(
        mintKeyPair.publicKey,
        decimals,
        payerPublicKey,
        null,
        TOKEN_2022_PROGRAM_ID
      ),
      createInitializeInstruction({
        programId: TOKEN_2022_PROGRAM_ID,
        mint: mintKeyPair.publicKey,
        metadata: mintKeyPair.publicKey,
        name: metadata.name,
        symbol: metadata.symbol,
        uri: metadata.uri,
        mintAuthority: payerPublicKey,
        updateAuthority: payerPublicKey,
      })
    );

    transaction.feePayer = payerPublicKey;
    transaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;
    transaction.partialSign(mintKeyPair);

    await wallet.sendTransaction(transaction, connection);
    console.log(`Token mint created at ${mintKeyPair.publicKey.toBase58()}`);
    alert(`Token mint created at ${mintKeyPair.publicKey.toBase58()}`);
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <h1>Solana Token Launchpad</h1>
      <input
        className="inputText"
        type="text"
        placeholder="Name"
        value={tokenName}
        onChange={(e) => setTokenName(e.target.value)}
      ></input>{" "}
      <br />
      <input
        className="inputText"
        type="text"
        placeholder="Symbol"
        value={tokenSymbol}
        onChange={(e) => setTokenSymbol(e.target.value)}
      ></input>{" "}
      <br />
      <input
        className="inputText"
        type="text"
        placeholder="Image URL"
        value={tokenImage}
        onChange={(e) => setTokenImage(e.target.value)}
      ></input>{" "}
      <br />
      <input
        className="inputText"
        type="text"
        placeholder="Initial Supply"
        value={tokenInitialSupply}
        onChange={(e) => setTokenInitialSupply(e.target.value)}
      ></input>{" "}
      <br />
      <button className="btn" onClick={createToken}>
        Create a token
      </button>
    </div>
  );
}
