



import { address, appendTransactionMessageInstructions, assertIsTransactionWithBlockhashLifetime, createKeyPairSignerFromBytes, createSolanaRpc, createSolanaRpcSubscriptions, createTransactionMessage, getSignatureFromTransaction, sendAndConfirmTransactionFactory, setTransactionMessageFeePayerSigner, setTransactionMessageLifetimeUsingBlockhash, signTransactionMessageWithSigners } from "@solana/kit";
import wallet from "../../wallet/wallet.json";
import { findAssociatedTokenPda, getCreateAssociatedTokenInstructionAsync, getMintToInstruction, TOKEN_PROGRAM_ADDRESS } from "@solana-program/token";

const rpc = createSolanaRpc("https://api.devnet.solana.com");

const rpcSub = createSolanaRpcSubscriptions("wss://api.devnet.solana.com");

const token_decimal = 9;

const mintAdress = address("7asmqSQQVhydjZYDAWJm2mNpEvVYt7e2cpJ6v5gPV2y7")
 
async function mintToken() {
   const uint8keypair = new Uint8Array(wallet);

   const signer = await createKeyPairSignerFromBytes(uint8keypair);

   const [ata] = await findAssociatedTokenPda({
      mint: mintAdress,
      owner: signer.address,
      tokenProgram: TOKEN_PROGRAM_ADDRESS
   });


   const createAtaTx = await getCreateAssociatedTokenInstructionAsync({
      payer: signer,
      mint: mintAdress,
      owner: signer.address
   });

   const mintToTx = getMintToInstruction({
      mint: mintAdress,
      token: ata,
      mintAuthority: signer.address,
      amount: 10 * 10**token_decimal
   })


   const {value: latestBlockhash} = await rpc.getLatestBlockhash().send()

   const msg = createTransactionMessage({ version: 0 });

   const msgWithPayer = setTransactionMessageFeePayerSigner(signer, msg);

   const msgWithLife = setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, msgWithPayer);

   const txMessage = appendTransactionMessageInstructions(
      [createAtaTx, mintToTx],
      msgWithLife
   );

   const signedTxxx = await signTransactionMessageWithSigners(txMessage);

   assertIsTransactionWithBlockhashLifetime(signedTxxx);

   const signature = getSignatureFromTransaction(signedTxxx);

   const sendAndConfirm = sendAndConfirmTransactionFactory({
      rpc, rpcSubscriptions: rpcSub
   });

   await sendAndConfirm(signedTxxx, { commitment: "confirmed" });


}

try {

   mintToken();

} catch(error){

   console.log(error);

}