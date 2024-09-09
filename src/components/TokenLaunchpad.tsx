import {
  createInitializeMint2Instruction,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
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
    const lamports = await getMinimumBalanceForRentExemptMint(connection);
    const payerPublicKey = wallet.publicKey;
    const mintKeyPair = Keypair.generate();

    if (!payerPublicKey) {
      alert("Wallet not connected!");
      return;
    }

    const transaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: payerPublicKey,
        newAccountPubkey: mintKeyPair.publicKey,
        space: MINT_SIZE,
        lamports,
        programId: TOKEN_PROGRAM_ID,
      }),
      createInitializeMint2Instruction(
        mintKeyPair.publicKey,
        9,
        payerPublicKey,
        payerPublicKey,
        TOKEN_PROGRAM_ID
      )
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
